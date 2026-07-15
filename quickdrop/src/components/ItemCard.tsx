import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import type { QuickDropItem } from '@/types/quickdrop';
import { confirmAction } from '@/utils/confirmAction';

const typeLabel: Record<QuickDropItem['type'], string> = {
  url: 'LINK',
  text: 'SNIPPET',
  note: 'NOTE',
  image: 'IMAGE',
  pdf: 'PDF',
  file: 'FILE',
  task: 'TASK',
};

const cleanText = (value: string) => {
  return value
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/?ul>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

export function ItemCard({
  item,
  onDelete,
  onToggleTask,
}: {
  item: QuickDropItem;
  onDelete: (itemId: string) => Promise<boolean>;
  onToggleTask?: (item: QuickDropItem) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const body = cleanText(item.content || item.note || item.url || item.fileUrl || '');
  const canOpen = Boolean(item.url || item.fileUrl);
  const tags = item.tags.filter(Boolean);

  const openItem = () => {
    const target = item.url || item.fileUrl;
    if (target) Linking.openURL(target);
  };

  const confirmDelete = () => {
    confirmAction({
      title: 'Delete item?',
      message: 'This will remove it from QuickDrop.',
      confirmText: 'Delete',
      onConfirm: async () => {
        setIsDeleting(true);
        const didDelete = await onDelete(item.id);
        if (!didDelete) setIsDeleting(false);
      },
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.badge}>{typeLabel[item.type]}</Text>
        {item.reminderAt ? <Text style={styles.reminder}>Reminder set</Text> : null}
      </View>

      <Text style={[styles.title, item.isCompleted && styles.done]} numberOfLines={2}>
        {item.title}
      </Text>
      {body ? <Text style={styles.body} numberOfLines={3}>{body}</Text> : null}
      {tags.length > 0 ? (
        <View style={styles.tags}>
          {tags.map((tag) => (
            <Text key={tag} style={styles.tag}>{tag}</Text>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        {item.type === 'task' && onToggleTask ? (
          <Pressable style={styles.actionButton} onPress={() => onToggleTask(item)}>
            <Text style={styles.actionText}>{item.isCompleted ? 'Undo' : 'Done'}</Text>
          </Pressable>
        ) : null}
        {canOpen ? (
          <Pressable style={styles.actionButton} onPress={openItem}>
            <Text style={styles.actionText}>Open</Text>
          </Pressable>
        ) : null}
        <Pressable
          disabled={isDeleting}
          style={[styles.actionButton, styles.deleteButton, isDeleting && styles.disabledButton]}
          onPress={confirmDelete}
        >
          <Text style={styles.deleteText}>{isDeleting ? 'Deleting...' : 'Delete'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: '#b9d3e8',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 6,
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reminder: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  done: {
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tag: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionButton: {
    backgroundColor: colors.blueSoft,
    borderColor: '#bfd4ff',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '900',
  },
  deleteButton: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#ffc4c4',
  },
  disabledButton: {
    opacity: 0.6,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '900',
  },
});
