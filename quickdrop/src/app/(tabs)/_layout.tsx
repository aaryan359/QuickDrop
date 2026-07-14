import { Tabs } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AuthScreen } from '@/components/AuthScreen';
import { Toast } from '@/components/Toast';
import { useQuickDrop } from '@/hooks/useQuickDrop';
import { colors } from '@/theme/colors';

const tabIcon = (label: string, focused: boolean) => (
  <Text style={[styles.tabIcon, focused && styles.activeTabIcon]}>{label}</Text>
);

export default function TabsLayout() {
  const { user, isAuthLoading } = useQuickDrop();

  if (isAuthLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primaryDark,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tabs.Screen
          name="drop"
          options={{
            title: 'Drop',
            tabBarIcon: ({ focused }) => tabIcon('+', focused),
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            title: 'Feed',
            tabBarIcon: ({ focused }) => tabIcon('□', focused),
          }}
        />
        <Tabs.Screen
          name="notes"
          options={{
            title: 'Notes',
            tabBarIcon: ({ focused }) => tabIcon('N', focused),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ focused }) => tabIcon('✓', focused),
          }}
        />
      </Tabs>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabIcon: {
    color: colors.muted,
    fontSize: 17,
    fontWeight: '900',
  },
  activeTabIcon: {
    color: colors.primaryDark,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
});
