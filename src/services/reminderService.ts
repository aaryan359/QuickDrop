import type { FileItem, NoteItem } from '../types';

type ChromeRuntimeApi = {
  runtime?: {
    sendMessage: (
      message: unknown,
      callback?: (response?: { success?: boolean; message?: string }) => void
    ) => void;
    lastError?: { message?: string };
  };
};

declare const chrome: ChromeRuntimeApi | undefined;

export const scheduleReminderNotifications = async (
  files: FileItem[],
  notes: NoteItem[]
): Promise<void> => {
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    return;
  }

  await new Promise<void>((resolve) => {
    chrome.runtime?.sendMessage(
      {
        type: 'SCHEDULE_REMINDERS',
        data: { files, notes },
      },
      () => resolve()
    );
  });
};
