import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app=initializeApp(firebaseConfig), db=getFirestore(app);
const $=id=>document.getElementById(id);
let keys=[], generated=[];

const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomPart(n){let s="";crypto.getRandomValues(new Uint32Array(n)).forEach(x=>s+=alphabet[x%alphabet.length]);return s}
function expiry(){const custom=$("customExpiry").value;if(custom)return new Date(custom);const d=+$("expiration").value;if(!d)return null;return new Date(Date.now()+d*86400000)}
function toast(x){$("toast").textContent=x;$("toast").style.display="block";setTimeout(()=>$("toast").style.display="none",2200)}
function fmt(x){return x?new Date(x).toLocaleString("id-ID"):"Never"}

window.showPage=p=>{document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));$(""+p).classList.add("active");document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===p));$("pageTitle").textContent=document.querySelector(`[data-page="${p}"]`).textContent};
document.querySelectorAll(".nav").forEach(x=>x.onclick=()=>showPage(x.dataset.page));

$("generateBtn").onclick=async()=>{
 const n=Math.min(500,Math.max(1,+$("amount").value||1)), mode=$("keyMode").value, prefix=$("prefix").value.trim()||"KREEK", len=Math.max(8,Math.min(64,+$("length").value||20)), exp=expiry();
 generated=[];
 for(let i=0;i<n;i++){
   const key=mode==="custom"?`${prefix}-${randomPart(len)}`:randomPart(len);
   const data={key,status:"active",createdAt:serverTimestamp(),expiresAt:exp?exp.toISOString():null,deviceId:null};
   await addDoc(collection(db,"keys"),data); generated.push(key);
 }
 $("generated").textContent=generated.join("\n"); toast(`${n} key berhasil dibuat`);
};

$("copyGenerated").onclick=async()=>{if(generated.length){await navigator.clipboard.writeText(generated.join("\n"));toast("Keys copied")}};
$("sendNotif").onclick=async()=>{const title=$("notifTitle").value.trim(),body=$("notifBody").value.trim();if(!title||!body)return toast("Title dan message wajib diisi");await addDoc(collection(db,"notifications"),{title,body,target:$("notifTarget").value,createdAt:serverTimestamp()});toast("Notification sent")};

onSnapshot(query(collection(db,"keys"),orderBy("createdAt","desc")),snap=>{
 keys=snap.docs.map(d=>({id:d.id,...d.data()}));render();});
function render(){
 const now=Date.now(), active=keys.filter(k=>k.status==="active"&&(!k.expiresAt||new Date(k.expiresAt)>now)), bound=keys.filter(k=>k.deviceId);
 $("totalKeys").textContent=keys.length;$("activeKeys").textContent=active.length;$("boundDevices").textContent=bound.length;$("expiredKeys").textContent=keys.filter(k=>k.expiresAt&&new Date(k.expiresAt)<=now).length;
 const q=$("search").value.toLowerCase();
 $("keyRows").innerHTML=keys.filter(k=>k.key.toLowerCase().includes(q)).map(k=>`<tr><td>${k.key}</td><td><span class="badge">${k.status}</span></td><td>${fmt(k.expiresAt)}</td><td>${k.deviceId?"BOUND":"UNBOUND"}</td><td><button class="danger" data-id="${k.id}">Revoke</button></td></tr>`).join("");
 document.querySelectorAll(".danger").forEach(b=>b.onclick=async()=>{await updateDoc(doc(db,"keys",b.dataset.id),{status:"revoked"});toast("Key revoked")});
}
$("search").oninput=render;
onSnapshot(query(collection(db,"notifications"),orderBy("createdAt","desc")),snap=>{
 const events=snap.docs.slice(0,8).map(d=>d.data());
 $("activity").innerHTML=events.length?events.map(e=>`<div class="event"><b>${e.title}</b><br>${e.body}</div>`).join(""):`<div class="empty">No activity yet.</div>`;
});
