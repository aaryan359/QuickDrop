import { Stack } from "expo-router";
import { QuickDropProvider } from "@/contexts/QuickDropContext";

export default function RootLayout() {
  return (
    <QuickDropProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </QuickDropProvider>
  );
}
