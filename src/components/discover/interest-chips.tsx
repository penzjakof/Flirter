import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { SelectableChip } from '@/components/ui/selectable-chip';
import { INTEREST_OPTIONS } from '@/data/filter-options';
import type { InterestCategory } from '@/models/types';
import { spacing } from '@/theme/tokens';

interface InterestChipsProps {
  selected: readonly InterestCategory[];
  onToggle: (interest: InterestCategory) => void;
}

/** Один тонкий рядок швидких фільтрів за інтересами під хедером S08. */
export function InterestChips({ selected, onToggle }: InterestChipsProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      accessibilityLabel={t('discover.sheet.interests')}>
      {INTEREST_OPTIONS.map((option) => (
        <SelectableChip
          key={option.value}
          label={t(`discover.filter_options.interests.${option.value}` as any)}
          selected={selected.includes(option.value)}
          onPress={() => onToggle(option.value)}
          testID={`filter-interest-${option.value}`}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  content: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
