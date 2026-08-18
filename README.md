# KREEK Connected Web

This version changes the dashboard from Firestore to Firebase Realtime Database and adds a realtime remote app-password control.

## Firebase setup

1. In Firebase project `kreek-4aa08`, create Realtime Database.
2. Copy the exact Database URL into `firebase-config.js` as `databaseURL`.
3. Enable Authentication > Email/Password.
4. Create an admin user in Firebase Authentication.
5. Import `database.rules.json` into Realtime Database Rules.
6. Deploy this folder to Vercel.

## Database layout

- `/auth/password` — password consumed by the patched APK.
- `/auth/enabled` — password gate enabled/disabled.
- `/keys/{id}` — license keys.
- `/notifications/{id}` — realtime notification events.
- `/update/{id}` — existing APK update channel (`new`, `link`).

The Firebase Web API key is not a server secret. Never put a Firebase service-account private key in this frontend.
