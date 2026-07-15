import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { useQuickDrop } from '@/hooks/useQuickDrop';
import { colors } from '@/theme/colors';
import type { QuickDropItem } from '@/types/quickdrop';

const cleanText = (value = '') => {
  return value
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/?ul>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

export default function NotesScreen() {
  const { items, addItem, editItem, removeItem, setMessage } = useQuickDrop();
  const notes = useMemo(() => items.filter((item) => item.type === 'note'), [items]);
  const [editingNote, setEditingNote] = useState<QuickDropItem | null>(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const startNew = () => {
    setEditingNote(null);
    setTitle('');
    setNote('');
  };

  const startEdit = (item: QuickDropItem) => {
    setEditingNote(item);
    setTitle(item.title);
    setNote(item.note || item.content || '');
  };

  const save = async () => {
    if (!title.trim() && !note.trim()) {
      setMessage('Write something first.');
      return;
    }

    if (editingNote) {
      await editItem(editingNote.id, {
        title: title.trim() || 'Untitled note',
        note: note.trim(),
        type: 'note',
      });
    } else {
      await addItem({
        type: 'note',
        title: title.trim() || 'Untitled note',
        note: note.trim(),
        tags: [],
        isStarred: false,
        isArchived: false,
      });
    }

    startNew();
  };

  const confirmDelete = (item: QuickDropItem) => {
    Alert.alert('Delete note?', item.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeItem(item.id) },
    ]);
  };

  return (
    <Screen>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.editor}>
          <View style={styles.editorHeader}>
            <Text style={styles.title}>{editingNote ? 'Edit Note' : 'New Note'}</Text>
            {editingNote ? (
              <Pressable onPress={startNew}>
                <Text style={styles.linkText}>Cancel</Text>
              </Pressable>
            ) : null}
          </View>
          <TextInput
            onChangeText={setTitle}
            placeholder="Note title"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={title}
          />
          <TextInput
            multiline
            onChangeText={setNote}
            placeholder="Write the note here..."
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.textarea]}
            value={note}
          />
          <Pressable onPress={save} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{editingNote ? 'Update Note' : 'Save Note'}</Text>
          </Pressable>
        </View>

        <Text style={styles.listTitle}>Saved Notes</Text>
        {notes.length === 0 ? (
          <EmptyState title="No notes yet" text="Create notes for reusable thoughts, form text, and research details." />
        ) : null}
        {notes.map((item) => (
          <View key={item.id} style={styles.noteCard}>
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteText} numberOfLines={5}>{cleanText(item.note || item.content)}</Text>
            <View style={styles.actions}>
              <Pressable onPress={() => startEdit(item)} style={styles.smallButton}>
                <Text style={styles.smallButtonText}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => confirmDelete(item)} style={[styles.smallButton, styles.deleteButton]}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}
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
  editor: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
  },
  editorHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  linkText: {
    color: colors.primaryDark,
    fontWeight: '900',
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
    minHeight: 150,
    textAlignVertical: 'top',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  listTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  noteCard: {
    backgroundColor: colors.surface,
    borderColor: '#b9d3e8',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  noteTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  noteText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  smallButton: {
    backgroundColor: colors.blueSoft,
    borderColor: '#bfd4ff',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallButtonText: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '900',
  },
  deleteButton: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#ffc4c4',
  },
  deleteText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '900',
  },
});
