import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  text: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
