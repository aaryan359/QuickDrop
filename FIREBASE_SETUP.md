# QuickDrop Firebase Setup

QuickDrop is now structured so Firebase is a backend adapter, not a permanent lock-in. The extension can keep using local Chrome storage, and the same service boundary can later point to Cloudinary, S3, or a custom backend.

## Current Backend Modes

Use `.env` to choose the backend:

```env
VITE_QUICKDROP_BACKEND=local
```

Supported values:

- `local`: use Chrome/localStorage only.
- `firebase`: use Firebase Auth and Firestore when a user is signed in.
- `custom`: reserved for a future API backend.

## Required Firebase Env

Copy `.env.example` to `.env` and fill:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_VAPID_KEY=
VITE_FIREBASE_WEB_CLIENT_ID=
```

Do not put Firebase Admin SDK JSON keys in frontend env files.

## Firestore Rules

Your current rule blocks all access. Use this when you are ready to test authenticated sync:

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Data Layout

The Firebase adapter stores user-owned data like this:

```text
users/{userId}/items/{itemId}
users/{userId}/groups/{groupId}
```

Items can represent links, notes, text, images, PDFs, and documents. File bytes should live outside Firestore; Firestore stores metadata and the final file URL.

## File Upload Plan

Firebase Storage is not required by the frontend structure. The app uses `storageService.ts`, which supports:

- local data URL fallback for now
- unsigned Cloudinary uploads when a safe unsigned preset is configured
- signed upload URLs from a future private backend
- Cloudinary, S3, Firebase Storage, or another provider later

For unsigned Cloudinary uploads, set:

```env
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=quickDropUpload
```

Do not add `CLOUDINARY_API_SECRET` or any provider secret to a `VITE_` variable. Unsigned presets are public by design, so restrict the preset in Cloudinary with allowed formats, max file size, and a folder.

There is no upload server in this repo right now. If you later need signed uploads, create a private backend endpoint and set:

```env
VITE_FILE_API_BASE_URL=https://your-api.example.com
```

The existing frontend utility expects:

```text
POST /uploads/sign
```

Request:

```json
{
  "fileName": "resume.pdf",
  "contentType": "application/pdf",
  "size": 12345
}
```

Response:

```json
{
  "uploadUrl": "https://signed-upload-url",
  "fileUrl": "https://final-public-or-authenticated-file-url",
  "method": "PUT"
}
```

For providers like Cloudinary that need form fields, return:

```json
{
  "uploadUrl": "https://api.cloudinary.com/v1_1/cloud/upload",
  "fileUrl": "https://final-file-url",
  "fields": {
    "api_key": "...",
    "timestamp": "...",
    "signature": "..."
  }
}
```

## Notifications

The notification skeleton supports:

- browser notification permission
- Firebase Cloud Messaging token retrieval
- foreground FCM messages
- Chrome extension notifications

For production background web push, add a proper Firebase Messaging service worker once the web app/PWA path is active.

## Security Notes

- Revoke any Firebase Admin SDK private key that was pasted or committed.
- Keep Admin SDK keys only on a private server.
- Keep Firestore user data under `users/{userId}`.
- Store file bytes in a file backend, not directly in Firestore.
