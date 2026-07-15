import { Alert, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useQuickDrop } from '@/hooks/useQuickDrop';
import { colors } from '@/theme/colors';

export function Header() {
  const { user, signOut, setMessage } = useQuickDrop();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const initial = user?.name?.trim()[0]?.toUpperCase() ?? 'Q';

  const confirmLogout = () => {
    Alert.alert('Logout?', 'You will need to sign in again on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setIsProfileOpen(false);
          await signOut();
        },
      },
    ]);
  };

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>QuickDrop</Text>
        <Text style={styles.subtle}>Wed, Jul 15, 2026</Text>
      </View>

      <Pressable style={styles.profile} onPress={() => setIsProfileOpen(true)}>
        {user?.photoUrl ? (
          <Image source={{ uri: user.photoUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{initial}</Text>
        )}
      </Pressable>

      <Modal transparent visible={isProfileOpen} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.profileCard}>
            <View style={styles.profileTop}>
              <View style={styles.largeAvatar}>
                <Text style={styles.largeAvatarText}>{initial}</Text>
              </View>
              <View style={styles.profileCopy}>
                <Text style={styles.profileName}>{user?.name ?? 'QuickDrop user'}</Text>
                <Text style={styles.profileEmail}>{user?.email ?? 'Guest account'}</Text>
              </View>
            </View>

            <Pressable
              style={styles.menuButton}
              onPress={() => setMessage('Theme settings coming soon.')}
            >
              <Text style={styles.menuText}>Theme</Text>
            </Pressable>
            <Pressable
              style={styles.menuButton}
              onPress={() => setMessage('Contact: support@quickdrop.app')}
            >
              <Text style={styles.menuText}>Contact details</Text>
            </Pressable>
            <Pressable
              style={styles.menuButton}
              onPress={() => setMessage('Synced with Firebase Firestore.')}
            >
              <Text style={styles.menuText}>Sync status</Text>
            </Pressable>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setIsProfileOpen(false)}>
                <Text style={styles.cancelText}>Close</Text>
              </Pressable>
              <Pressable style={styles.logoutButton} onPress={confirmLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(16, 32, 51, 0.32)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    width: '100%',
  },
  profileTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  largeAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 22,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  largeAvatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  profileCopy: {
    flex: 1,
  },
  profileName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  profileEmail: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  menuButton: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  menuText: {
    color: colors.text,
    fontWeight: '900',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#eef5fb',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
  },
  cancelText: {
    color: colors.text,
    fontWeight: '900',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '900',
  },
});
