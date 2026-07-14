import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { useQuickDrop } from '@/hooks/useQuickDrop';
import { colors } from '@/theme/colors';

const looksLikeUrl = (value: string) => /^https?:\/\/\S+$/i.test(value.trim());

export default function DropScreen() {
  const { addItem, setMessage } = useQuickDrop();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reminderAt, setReminderAt] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    const trimmedContent = content.trim();
    const trimmedTitle = title.trim();

    if (!trimmedContent && !trimmedTitle) {
      setMessage('Add a title or some content first.');
      return;
    }

    setIsSaving(true);
    const isUrl = looksLikeUrl(trimmedContent);
    await addItem({
      type: isUrl ? 'url' : 'text',
      title: trimmedTitle || (isUrl ? trimmedContent : 'Saved snippet'),
      url: isUrl ? trimmedContent : undefined,
      content: isUrl ? undefined : trimmedContent,
      tags: [],
      isStarred: false,
      isArchived: false,
      reminderAt,
    });
    setTitle('');
    setContent('');
    setReminderAt(undefined);
    setIsSaving(false);
  };

  const remindTomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);
    setReminderAt(date.toISOString());
    setMessage('Reminder set for tomorrow morning.');
  };

  return (
    <Screen>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.uploadBox}>
          <Text style={styles.uploadTitle}>Image and PDF upload</Text>
          <Text style={styles.uploadText}>Cloudinary upload will plug in here when credentials are ready.</Text>
          <Pressable onPress={() => setMessage('Cloudinary upload coming next.')} style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Add File Soon</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add Link / Snippet</Text>
          <TextInput
            onChangeText={setTitle}
            placeholder="Title or description..."
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={title}
          />
          <TextInput
            multiline
            onChangeText={setContent}
            placeholder="Paste link, command, note, or copied text..."
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.textarea]}
            value={content}
          />
          <View style={styles.quickRow}>
            <Pressable onPress={remindTomorrow} style={styles.smallButton}>
              <Text style={styles.smallButtonText}>Remind Tomorrow</Text>
            </Pressable>
            <Pressable onPress={() => setReminderAt(undefined)} style={styles.smallButton}>
              <Text style={styles.smallButtonText}>No Reminder</Text>
            </Pressable>
          </View>
          {reminderAt ? <Text style={styles.reminder}>Reminder: {new Date(reminderAt).toLocaleString()}</Text> : null}
          <Pressable disabled={isSaving} onPress={save} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save to QuickDrop'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    padding: 18,
    paddingBottom: 110,
  },
  uploadBox: {
    alignItems: 'center',
    borderColor: '#8ee8bd',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 2,
    backgroundColor: colors.surface,
    padding: 26,
  },
  uploadTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  uploadText: {
    color: colors.muted,
    lineHeight: 20,
    marginTop: 6,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  uploadButtonText: {
    color: colors.primaryDark,
    fontWeight: '900',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
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
  textarea: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  smallButton: {
    backgroundColor: '#f5f9ff',
    borderColor: '#c9d8e8',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  smallButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  reminder: {
    color: colors.warning,
    fontWeight: '800',
    marginTop: 10,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 14,
    paddingVertical: 14,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '900',
  },
});
