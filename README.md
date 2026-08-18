# KREEK Key Manager

Web dashboard untuk mengelola license key berbasis Firebase Firestore.

## Setup

1. Buat project Firebase.
2. Aktifkan Firestore Database.
3. Aktifkan Authentication dan pilih provider yang ingin dipakai, minimal Email/Password.
4. Buat Firebase Web App.
5. Salin config Web App ke `firebase-config.js` berdasarkan `firebase-config.example.js`.
6. Tambahkan autentikasi admin pada aplikasi sebelum production. Starter UI ini sengaja memisahkan credential Firebase dari source.
7. Deploy folder ini ke Vercel atau hosting static lain.

## Struktur data

`keys/{id}`
- `key`: string
- `status`: active/revoked
- `createdAt`: Firestore timestamp
- `expiresAt`: ISO string atau null
- `deviceId`: null sampai aplikasi pertama kali mengaktifkan key

`notifications/{id}`
- `title`
- `body`
- `target`
- `createdAt`

## One-device enforcement

Binding device HARUS dilakukan oleh aplikasi client melalui transaksi Firestore/Cloud Function agar dua device tidak bisa memenangkan race condition. Jangan mempercayai `deviceId` yang dikirim client sebagai bukti identitas absolut.

## Realtime

Client Android dapat memakai Firestore listener (`addSnapshotListener`) pada:
- `keys/{id}` untuk status/expiry/device binding
- `notifications` untuk pesan realtime

Untuk production, gunakan Firebase Authentication + custom claims untuk admin dan Firestore Rules yang membatasi admin write.
