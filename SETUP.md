# STAR Sensi Control Center Setup

## Firebase Authentication

1. Firebase Console -> Authentication -> Sign-in method -> Email/Password.
2. Create the administrator account.
3. Do not store the administrator password in this file or in the website source.
4. The login page has a password-reset action.

## Realtime Database

Create this node:

```json
{
  "config": {
    "password": "your-password"
  }
}
```

Deploy `database.rules.json` from the Firebase Realtime Database Rules tab.

## Admin panel

Open `index.html` from a web server. The Firebase Web SDK configuration is already set to the new project.

The administrator must authenticate before the panel can write `config/password`.

## Android

The Android source already contains `google-services.json` for project `star-sensi-control` and listens to `config/password` with a realtime ValueEventListener.
