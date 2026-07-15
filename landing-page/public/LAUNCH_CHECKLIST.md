# QuickDrop Launch Checklist

Use this before sharing QuickDrop publicly on LinkedIn or with beta users.

## Verified In Code

- Extension Firestore item path: `users/{uid}/items`
- App Firestore item path: `users/{uid}/items`
- App uses realtime Firestore updates with `onSnapshot`.
- Extension saves, loads, updates, and deletes through the Firebase backend adapter when signed in.
- App supports empty states for Feed, Notes, and Tasks.
- App shows loading state while Feed data loads.
- App shows saving, deleting, and upload progress feedback.
- App uses configured icon, adaptive icon, favicon, and splash image paths.
- Privacy policy and terms files exist in the repo.

## Must Verify In Firebase Console

- Publish Firestore rules from `firestore.rules`.
- Confirm Email/Password auth is enabled.
- Confirm Anonymous auth is enabled only if you want guest beta users.
- Confirm Google auth is disabled or clearly marked coming soon until redirect/client setup is complete.
- Confirm Cloudinary unsigned preset restrictions are acceptable for beta.

## Manual Beta Test

- Create a real account in the app.
- Save a link in the app, then confirm it appears in the extension.
- Save a link in the extension, then confirm it appears in the app.
- Edit a note in the app and confirm the update syncs.
- Delete an item in the app and confirm it disappears from the extension.
- Delete an item in the extension and confirm it disappears from the app.
- Upload one image and one PDF, then confirm the saved item opens.
- Sign out and sign back in, then confirm saved items return.

## Known Beta Limitations

- Real background mobile notifications need a development/production build.
- Uploaded file deletion from Cloudinary is not implemented yet.
- Google sign-in needs production redirect/client setup before public release.
- AI grouping and summaries are planned later.
