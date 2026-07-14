import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen } from './Screen';
import { Toast } from './Toast';
import { colors } from '@/theme/colors';
import { useQuickDrop } from '@/hooks/useQuickDrop';

export function AuthScreen() {
  const { isAuthLoading, signIn, createAccount, signInGuest, setMessage } = useQuickDrop();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setMessage('Email and password are required.');
      return;
    }

    setIsSubmitting(true);
    if (mode === 'login') {
      await signIn(email, password);
    } else {
      await createAccount(email, password);
    }
    setIsSubmitting(false);
  };

  if (isAuthLoading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.wrap}
      >
        <View style={styles.hero}>
          <Text style={styles.logo}>Q</Text>
          <Text style={styles.title}>QuickDrop</Text>
          <Text style={styles.subtitle}>Save links, notes, tasks and reusable ideas across phone and Chrome.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={email}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <Pressable disabled={isSubmitting} onPress={submit} style={styles.primaryButton}>
            <Text style={styles.primaryText}>
              {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create and Login'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMode(mode === 'login' ? 'create' : 'login')}
            style={styles.textButton}
          >
            <Text style={styles.textButtonLabel}>
              {mode === 'login' ? 'Create account first' : 'I already have an account'}
            </Text>
          </Pressable>

          <Pressable onPress={signInGuest} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Continue as guest</Text>
          </Pressable>

          <Pressable onPress={() => setMessage('Google login coming soon.')} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Google login coming soon</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <Toast />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrap: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    height: 64,
    lineHeight: 64,
    overflow: 'hidden',
    textAlign: 'center',
    width: 64,
  },
  title: {
    color: colors.primaryDark,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 14,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 320,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#f8fbff',
    borderColor: '#d8e3ef',
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 4,
    paddingVertical: 14,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  textButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  textButtonLabel: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    paddingVertical: 12,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '800',
  },
});
