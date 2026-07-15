import { Alert, Platform } from 'react-native';

type ConfirmActionInput = {
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void | Promise<void>;
};

export const confirmAction = ({ title, message, confirmText, onConfirm }: ConfirmActionInput) => {
  if (Platform.OS === 'web') {
    const confirmed = globalThis.confirm(`${title}\n\n${message}`);
    if (confirmed) void onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: confirmText,
      style: 'destructive',
      onPress: () => {
        void onConfirm();
      },
    },
  ]);
};
