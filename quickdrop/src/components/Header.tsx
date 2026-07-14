import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuickDrop } from '@/hooks/useQuickDrop';
import { colors } from '@/theme/colors';

export function Header() {
  const { user, signOut } = useQuickDrop();
  const initial = user?.name?.trim()[0]?.toUpperCase() ?? 'Q';

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>QuickDrop</Text>
        <Text style={styles.subtle}>Wed, Jul 15, 2026</Text>
      </View>

      <Pressable style={styles.profile} onPress={signOut}>
        {user?.photoUrl ? (
          <Image source={{ uri: user.photoUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{initial}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 4,
  },
  brand: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: '900',
  },
  subtle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  profile: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarImage: {
    borderRadius: 16,
    height: 44,
    width: 44,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});
