import { ref, push, set, update, remove, onValue, serverTimestamp as rtdbServerTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { db } from "./firebase-config.js";

const $ = id => document.getElementById(id);
let keys = [];
let generated = [];
let stopKeys = null;
let stopNotifs = null;
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomPart(n) {
  let s = "";
  crypto.getRandomValues(new Uint32Array(n)).forEach(x => s += alphabet[x % alphabet.length]);
  return s;
}
function expiry() {
  const custom = $("customExpiry").value;
  if (custom) return new Date(custom).toISOString();
  const d = +$("expiration").value;
  return d ? new Date(Date.now() + d * 86400000).toISOString() : null;
}
function toast(x) {
  $("toast").textContent = x;
  $("toast").style.display = "block";
  setTimeout(() => $("toast").style.display = "none", 2200);
}
function fmt(x) { return x ? new Date(x).toLocaleString("id-ID") : "Never"; }
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
}

window.showPage = p => {
  document.querySelectorAll(".page").forEach(x => x.classList.remove("active"));
  $(p).classList.add("active");
  document.querySelectorAll(".nav").forEach(x => x.classList.toggle("active", x.dataset.page === p));
  $("pageTitle").textContent = document.querySelector(`[data-page="${p}"]`).textContent;
};

document.querySelectorAll(".nav").forEach(x => x.onclick = () => showPage(x.dataset.page));

async function loadRealtime() {
  if (stopKeys) stopKeys();
  if (stopNotifs) stopNotifs();

  stopKeys = onValue(ref(db, "keys"), snap => {
    const data = snap.val() || {};
    keys = Object.entries(data).map(([id, value]) => ({ id, ...value }))
      .sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
    render();
  }, err => toast(`Keys listener: ${err.message}`));

  stopNotifs = onValue(ref(db, "notifications"), snap => {
    const data = snap.val() || {};
    const events = Object.values(data).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 8);
    $("activity").innerHTML = events.length
      ? events.map(e => `<div class="event"><b>${escapeHtml(e.title)}</b><br>${escapeHtml(e.body)}</div>`).join("")
      : `<div class="empty">No activity yet.</div>`;
  });

  onValue(ref(db, "auth"), snap => {
    const data = snap.val() || {};
    $("remotePasswordStatus").textContent = data.password ? "REMOTE PASSWORD ACTIVE" : "REMOTE PASSWORD NOT SET";
    $("remoteEnabled").checked = data.enabled !== false;
    $("currentPasswordHint").textContent = data.password ? `Password length: ${String(data.password).length}` : "No password configured";
  });
}


$("generateBtn").onclick = async () => {
  const n = Math.min(500, Math.max(1, +$("amount").value || 1));
  const mode = $("keyMode").value;
  const prefix = $("prefix").value.trim() || "KREEK";
  const len = Math.max(8, Math.min(64, +$("length").value || 20));
  const exp = expiry();
  generated = [];
  for (let i = 0; i < n; i++) {
    const key = mode === "custom" ? `${prefix}-${randomPart(len)}` : randomPart(len);
    const keyRef = push(ref(db, "keys"));
    await set(keyRef, { key, status: "active", createdAt: Date.now(), expiresAt: exp, deviceId: null });
    generated.push(key);
  }
  $("generated").textContent = generated.join("\n");
  toast(`${n} key berhasil dibuat`);
};

$("copyGenerated").onclick = async () => {
  if (generated.length) { await navigator.clipboard.writeText(generated.join("\n")); toast("Keys copied"); }
};

$("sendNotif").onclick = async () => {
  const title = $("notifTitle").value.trim();
  const body = $("notifBody").value.trim();
  if (!title || !body) return toast("Title dan message wajib diisi");
  const r = push(ref(db, "notifications"));
  await set(r, { title, body, target: $("notifTarget").value, type: "general", createdAt: Date.now() });
  toast("Notification sent realtime");
};

$("saveRemotePassword").onclick = async () => {
  const password = $("remotePassword").value;
  if (password.length < 4) return toast("Password minimal 4 karakter");
  await update(ref(db, "auth"), { password, enabled: $("remoteEnabled").checked, updatedAt: Date.now() });

  const r = push(ref(db, "notifications"));
  await set(r, {
    title: "Password Updated",
    body: "App password has been updated in realtime.",
    target: "all",
    type: "auth_changed",
    createdAt: Date.now()
  });

  $("remotePassword").value = "";
  toast("Password updated + notification sent realtime");
};

$("remoteEnabled").onchange = async () => {
  await update(ref(db, "auth"), { enabled: $("remoteEnabled").checked, updatedAt: Date.now() });
  toast($("remoteEnabled").checked ? "Password enabled" : "Password disabled");
};

function render() {
  const now = Date.now();
  const active = keys.filter(k => k.status === "active" && (!k.expiresAt || new Date(k.expiresAt) > now));
  const bound = keys.filter(k => k.deviceId);
  $("totalKeys").textContent = keys.length;
  $("activeKeys").textContent = active.length;
  $("boundDevices").textContent = bound.length;
  $("expiredKeys").textContent = keys.filter(k => k.expiresAt && new Date(k.expiresAt) <= now).length;
  const q = $("search").value.toLowerCase();
  $("keyRows").innerHTML = keys.filter(k => String(k.key).toLowerCase().includes(q)).map(k =>
    `<tr><td>${escapeHtml(k.key)}</td><td><span class="badge">${escapeHtml(k.status)}</span></td><td>${fmt(k.expiresAt)}</td><td>${k.deviceId ? "BOUND" : "UNBOUND"}</td><td><button class="danger" data-id="${escapeHtml(k.id)}">Revoke</button></td></tr>`
  ).join("");
  document.querySelectorAll(".danger").forEach(b => b.onclick = async () => {
    await update(ref(db, `keys/${b.dataset.id}`), { status: "revoked", updatedAt: Date.now() });
    toast("Key revoked realtime");
  });
}
$("search").oninput = render;

loadRealtime();
