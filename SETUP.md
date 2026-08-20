# STAR Sensi Control Center — Multi-user Keys

Enable Firebase Authentication > Email/Password and create an administrator.

Deploy `database.rules.json`.

Database shape:
```json
{
  "config": {
    "keys": {
      "USER-AbC123": {
        "enabled": true,
        "label": "USER",
        "createdAt": 0
      }
    }
  }
}
```

The dashboard can generate 1–50 keys per batch, enable/disable individual keys, disable all, and delete keys. The APK listens to `config/keys` in realtime.

Security note: this APK reads `config/keys` without Firebase Auth, so the registry is client-readable. For production-grade authentication, verify credentials on a trusted backend/Cloud Function and store only salted/hashed credentials server-side.
