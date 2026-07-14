import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { useQuickDrop } from '@/hooks/useQuickDrop';

export function Toast() {
  const { message, setMessage } = useQuickDrop();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 2600);
    return () => clearTimeout(timer);
  }, [message, setMessage]);

  if (!message) return null;

  return <Text style={styles.toast}>{message}</Text>;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 92,
    zIndex: 20,
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: colors.text,
    color: '#ffffff',
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: 'center',
  },
});
