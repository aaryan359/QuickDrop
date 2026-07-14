import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';

export function Screen({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return <SafeAreaView style={[styles.screen, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
