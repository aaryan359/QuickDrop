# QuickDrop Privacy Policy

Last updated: July 15, 2026

QuickDrop helps users save links, snippets, notes, images, PDFs, and other file references so they can find them again across the browser extension and mobile app.

## Data We Store

QuickDrop stores the following user-created data:

- Account details from Firebase Authentication, such as user ID, email address, display name, and profile photo when available.
- Saved item metadata, such as title, URL, note text, tags, item type, reminder time, created time, and updated time.
- Uploaded file URLs, such as Cloudinary URLs for images, PDFs, documents, and other files.

QuickDrop does not store Firebase Admin SDK keys, Cloudinary API secrets, or payment information in the app.

## Where Data Is Stored

- Authentication is handled by Firebase Authentication.
- Saved item metadata is stored in Firebase Firestore under `users/{userId}/items`.
- Uploaded files are stored by the configured file provider, currently Cloudinary for uploads.

## How Data Is Used

QuickDrop uses saved data to:

- Show saved items in the extension and app.
- Sync saved items across devices for the signed-in user.
- Open saved links and uploaded file URLs.
- Show reminders when reminder support is available.

## Data Access

Firestore security rules should only allow a signed-in user to read and write their own data under `users/{userId}`.

## Data Deletion

Users can delete saved items from QuickDrop. Deleting an item removes the Firestore metadata. Uploaded files stored by an external file provider may need separate deletion support in a future backend.

## Contact

For questions or deletion requests, contact the QuickDrop owner or support address used in the app.
