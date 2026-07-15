# QuickDrop Development Rules

These rules keep the QuickDrop codebase simple, consistent, and ready for Firebase sync, storage, notifications, and a future app experience.

## Product Direction

- QuickDrop should feel frictionless: save once, use anywhere.
- The Chrome extension and future app should share the same data model.
- Firebase will be the first backend layer for auth, sync, and notifications.
- File storage should use a storage service abstraction so Cloudinary, signed URLs, Firebase Storage, or a custom backend can be used later.
- AI features should be added later, after the core save, organize, sync, and reuse flows are stable.

## Firebase-Ready Rules

- Keep Firebase code inside a dedicated service layer.
- Do not call Firebase directly from UI components unless the component is only a tiny wiring component.
- Use clear service files for backend work:
  - `src/services/authService.ts` for authentication.
  - `src/services/itemService.ts` for saved links, notes, images, PDFs, and documents.
  - `src/services/groupService.ts` for groups and subgroups.
  - `src/services/storageService.ts` for local fallback, signed uploads, storage providers, and file URLs.
  - `src/services/notificationService.ts` for reminders and push notifications.
- Keep Firebase config in one place, such as `src/services/firebase.ts`.
- Never hard-code Firebase keys, project IDs, or secrets inside components.
- Store only metadata in Firestore. Store files such as images, PDFs, and documents in a file storage provider and save the final URL in Firestore.
- Every saved item should be designed for sync from the start.

## Suggested Data Shape

Saved items should support multiple resource types without needing separate UI systems for each one.

Recommended item fields:

```ts
type QuickDropItem = {
  id: string;
  userId: string;
  type: "link" | "note" | "image" | "pdf" | "document" | "text";
  title: string;
  url?: string;
  fileUrl?: string;
  note?: string;
  groupId?: string;
  subgroupId?: string;
  tags: string[];
  isStarred: boolean;
  isArchived: boolean;
  reminderAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

## Folder Structure Rules

Keep the structure simple and predictable.

Recommended structure:

```text
src/
  components/
    common/
    layout/
    items/
    groups/
    upload/
  hooks/
  services/
  types/
  utils/
  App.tsx
  main.tsx
```

- `components/common/`: reusable UI such as buttons, inputs, modals, empty states, and badges.
- `components/layout/`: app shell, header, tabs, sidebar, and navigation.
- `components/items/`: saved item cards, item lists, previews, and item actions.
- `components/groups/`: group and subgroup UI.
- `components/upload/`: drag-drop upload, file picker upload, and upload progress UI.
- `hooks/`: reusable React logic such as saved items, upload state, auth state, and reminders.
- `services/`: Firebase, Chrome storage, browser APIs, and data access.
- `types/`: shared TypeScript types.
- `utils/`: small pure helper functions.

## File Size Rules

- Keep files small and focused.
- Aim for under 150 lines per component file.
- If a file grows past 200 lines, look for a natural split.
- A file should usually do one main thing.
- Large UI files should be split into smaller child components.
- Large logic blocks should move into hooks, services, or utility functions.

## Component Rules

- If the same UI or logic is needed two times, create a reusable component or helper.
- If a reusable component already exists, use it instead of creating a new one.
- Make components general enough to be reused, but not so abstract that they become hard to understand.
- Keep data loading and backend calls out of display components.
- Prefer props for display components and hooks for stateful behavior.
- Components should have clear names based on what they show or do.

Good examples:

- `ItemCard`
- `ItemList`
- `UploadDropzone`
- `FilePickerButton`
- `GroupSelector`
- `ReminderButton`
- `EmptyState`

## Hook Rules

- Move reusable stateful logic into hooks.
- Hooks should be named by behavior, such as `useSavedItems`, `useUploadFile`, or `useReminder`.
- Hooks can call services, but services should not call hooks.
- Keep hooks focused. Avoid one hook that controls the whole app.

## Service Rules

- Services should contain backend, storage, browser API, and data access logic.
- UI components should call hooks or services through clear functions, not duplicate backend code.
- Services should return predictable data and throw useful errors.
- Keep service functions small and named by action.

Good examples:

- `createItem`
- `updateItem`
- `archiveItem`
- `uploadFile`
- `createReminder`
- `getUserGroups`

## Upload and File Rules

- Support both drag and drop upload and normal file picker upload.
- Do not assume drag and drop is available on every device or website.
- Store images, PDFs, and documents in Firebase Storage.
- Store searchable metadata in Firestore.
- Let users organize files into groups and subgroups.
- File upload UI should show progress, success, and error states.
- Saved files should be easy to preview, open, copy, or reuse.

## Sync Rules

- Chrome extension and app data should stay uniform.
- A saved item created on phone should appear in the Chrome extension.
- A saved item created in the extension should appear in the app.
- The data model should not depend on a single device or browser.
- Use `userId` on all user-owned data.

## Reminder and Notification Rules

- Reminders should be attached to saved items.
- Notification logic should live in a notification service, not inside item UI.
- Keep reminder fields simple at first, such as `reminderAt`.
- Add advanced repeat reminders only after one-time reminders work well.

## Naming Rules

- Use clear, boring names over clever names.
- Use `PascalCase` for React components.
- Use `camelCase` for functions, variables, hooks, and service methods.
- Use `useSomething` for hooks.
- Use `SomethingService` only when a service object is needed. Prefer named functions for simple services.

## Change Rules

- Keep changes scoped to the feature being built.
- Do not mix large refactors with feature work unless the refactor is necessary.
- Before adding new code, check whether a component, hook, service, type, or helper already exists.
- Prefer improving an existing reusable piece over creating duplicate behavior.
- Keep the app usable after every feature step.
