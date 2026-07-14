import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { ItemCard } from '@/components/ItemCard';
import { Screen } from '@/components/Screen';
import { useQuickDrop } from '@/hooks/useQuickDrop';
import { colors } from '@/theme/colors';
import type { QuickDropItem } from '@/types/quickdrop';

type Filter = 'all' | 'files' | 'snippets' | 'notes';

const filterItems = (items: QuickDropItem[], filter: Filter) => {
  if (filter === 'files') return items.filter((item) => ['image', 'pdf', 'file'].includes(item.type));
  if (filter === 'snippets') return items.filter((item) => ['url', 'text'].includes(item.type));
  if (filter === 'notes') return items.filter((item) => item.type === 'note');
  return items;
};

export default function FeedScreen() {
  const { items, isDataLoading, removeItem } = useQuickDrop();
  const [filter, setFilter] = useState<Filter>('all');
  const visibleItems = useMemo(() => filterItems(items, filter), [filter, items]);

  return (
    <Screen>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headingRow}>
          <View>
            <Text style={styles.title}>Feed & History</Text>
            <Text style={styles.count}>{items.length} saved items</Text>
          </View>
        </View>

        <View style={styles.filters}>
          {(['all', 'files', 'snippets', 'notes'] as Filter[]).map((nextFilter) => (
            <Pressable
              key={nextFilter}
              onPress={() => setFilter(nextFilter)}
              style={[styles.filter, filter === nextFilter && styles.activeFilter]}
            >
              <Text style={[styles.filterText, filter === nextFilter && styles.activeFilterText]}>
                {nextFilter[0].toUpperCase() + nextFilter.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {isDataLoading ? <ActivityIndicator color={colors.primary} /> : null}
        {!isDataLoading && visibleItems.length === 0 ? (
          <EmptyState title="Nothing here yet" text="Save a link, snippet, note, or file and it will appear here." />
        ) : null}
        {visibleItems.map((item) => (
          <ItemCard key={item.id} item={item} onDelete={removeItem} />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 110,
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  count: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  filter: {
    backgroundColor: '#eef5fb',
    borderColor: '#d6e2ef',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  activeFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  activeFilterText: {
    color: '#ffffff',
  },
});
