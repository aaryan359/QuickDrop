import { Stack } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { QuickDropProvider } from "@/contexts/QuickDropContext";
import { colors } from "@/theme/colors";

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={styles.errorScreen}>
      <Text style={styles.errorTitle}>QuickDrop could not start</Text>
      <Text style={styles.errorText}>{error.message}</Text>
      <Pressable style={styles.retryButton} onPress={retry}>
        <Text style={styles.retryText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  return (
    <QuickDropProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </QuickDropProvider>
  );
}

const styles = StyleSheet.create({
  errorScreen: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
  },
  errorText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "900",
  },
});
