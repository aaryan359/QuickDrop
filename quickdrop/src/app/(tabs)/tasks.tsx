import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { ItemCard } from '@/components/ItemCard';
import { Screen } from '@/components/Screen';
import { useQuickDrop } from '@/hooks/useQuickDrop';
import { colors } from '@/theme/colors';
import type { QuickDropItem } from '@/types/quickdrop';

export default function TasksScreen() {
  const { items, addItem, editItem, removeItem, setMessage } = useQuickDrop();
  const tasks = useMemo(() => items.filter((item) => item.type === 'task'), [items]);
  const [title, setTitle] = useState('');

  const saveTask = async () => {
    if (!title.trim()) {
      setMessage('Add a task title first.');
      return;
    }

    await addItem({
      type: 'task',
      title: title.trim(),
      tags: [],
      isStarred: false,
      isArchived: false,
      isCompleted: false,
    });
    setTitle('');
  };

  const toggleTask = async (item: QuickDropItem) => {
    await editItem(item.id, {
      isCompleted: !item.isCompleted,
      type: 'task',
    });
  };

  return (
    <Screen>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Add Task</Text>
          <TextInput
            onChangeText={setTitle}
            onSubmitEditing={saveTask}
            placeholder="What should you revisit or finish?"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={title}
          />
          <Pressable onPress={saveTask} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Task</Text>
          </Pressable>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>{tasks.filter((task) => !task.isCompleted).length} open</Text>
          <Text style={styles.summaryText}>{tasks.filter((task) => task.isCompleted).length} done</Text>
        </View>

        {tasks.length === 0 ? (
          <EmptyState title="No tasks yet" text="Use tasks for links or ideas you need to come back to." />
        ) : null}

        {tasks.map((item) => (
          <ItemCard key={item.id} item={item} onDelete={removeItem} onToggleTask={toggleTask} />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    padding: 18,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 20,
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
  summary: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryText: {
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    color: colors.primaryDark,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
