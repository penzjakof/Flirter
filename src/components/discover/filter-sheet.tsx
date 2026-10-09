import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { GenderSelector } from '@/components/discover/gender-selector';
import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { SelectableChip } from '@/components/ui/selectable-chip';
import { CHARACTERS } from '@/data/characters';
import {
  AGE_RANGE_OPTIONS,
  COMMUNICATION_STYLE_OPTIONS,
  ETHNICITY_OPTIONS,
  INTEREST_OPTIONS,
  type FilterOption,
} from '@/data/filter-options';
import {
  DEFAULT_FILTERS,
  filterCharacters,
  pluralizeCharacters,
  toggleValue,
  type CharacterFilters,
} from '@/lib/character-filters';
import type { GenderFilter } from '@/models/types';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface FilterSheetProps {
  initialFilters: CharacterFilters;
  /** Гендер, до якого повертає «Скинути» (preference з онбордингу або «Усі»). */
  defaultGender: GenderFilter;
  conversationIds: ReadonlySet<string>;
  onApply: (filters: CharacterFilters) => void;
  onClose: () => void;
}

/**
 * S09. Фільтри. Працюють з чернеткою: зміни не застосовуються,
 * доки користувач не натисне «Показати…». Кількість результатів видно заздалегідь.
 * Компонент монтується лише коли відкритий — чернетка щоразу береться з актуальних фільтрів.
 */
export function FilterSheet({ initialFilters, defaultGender, conversationIds, onApply, onClose }: FilterSheetProps) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState<CharacterFilters>(initialFilters);
  const resultCount = filterCharacters(CHARACTERS, draft, conversationIds).length;

  const updateDraft = (patch: Partial<CharacterFilters>) => setDraft((current) => ({ ...current, ...patch }));

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <BottomSheet visible onClose={onClose} title="Фільтри">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FilterSection title="Кого показувати">
          <GenderSelector value={draft.gender} onChange={(gender) => updateDraft({ gender })} />
        </FilterSection>
        <MultiSelectSection
          title="Вік"
          options={AGE_RANGE_OPTIONS}
          selected={draft.ageRanges}
          onToggle={(value) => updateDraft({ ageRanges: toggleValue(draft.ageRanges, value) })}
          testIDPrefix="sheet-age"
        />
        <MultiSelectSection
          title="Раса"
          options={ETHNICITY_OPTIONS}
          selected={draft.ethnicities}
          onToggle={(value) => updateDraft({ ethnicities: toggleValue(draft.ethnicities, value) })}
          testIDPrefix="sheet-ethnicity"
        />
        <MultiSelectSection
          title="Інтереси"
          options={INTEREST_OPTIONS}
          selected={draft.interests}
          onToggle={(value) => updateDraft({ interests: toggleValue(draft.interests, value) })}
          testIDPrefix="sheet-interest"
        />
        <MultiSelectSection
          title="Стиль спілкування"
          options={COMMUNICATION_STYLE_OPTIONS}
          selected={draft.styles}
          onToggle={(value) => updateDraft({ styles: toggleValue(draft.styles, value) })}
          testIDPrefix="sheet-style"
        />

        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <AppText variant="bodyStrong">Лише нові</AppText>
            <AppText variant="secondary" color="textSecondary">
              Сховати персонажів, з якими вже є розмова
            </AppText>
          </View>
          <Switch
            testID="sheet-only-new"
            value={draft.onlyNew}
            onValueChange={(onlyNew) => updateDraft({ onlyNew })}
            trackColor={{ true: colors.brand, false: colors.border }}
            accessibilityLabel="Лише нові"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Скинути"
          variant="secondary"
          onPress={() => setDraft({ ...DEFAULT_FILTERS, gender: defaultGender })}
          style={styles.resetButton}
          testID="sheet-reset"
        />
        <Button
          label={resultCount > 0 ? `Показати ${pluralizeCharacters(resultCount)}` : 'Немає збігів'}
          onPress={handleApply}
          disabled={resultCount === 0}
          style={styles.applyButton}
          testID="sheet-apply"
        />
      </View>
    </BottomSheet>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="bodyStrong">{title}</AppText>
      {children}
    </View>
  );
}

interface MultiSelectSectionProps<TValue extends string> {
  title: string;
  options: readonly FilterOption<TValue>[];
  selected: readonly TValue[];
  onToggle: (value: TValue) => void;
  testIDPrefix: string;
}

function MultiSelectSection<TValue extends string>({ title, options, selected, onToggle, testIDPrefix }: MultiSelectSectionProps<TValue>) {
  return (
    <FilterSection title={title}>
      <View style={styles.chips}>
        {options.map((option) => (
          <SelectableChip
            key={option.value}
            label={option.label}
            icon={option.icon}
            selected={selected.includes(option.value)}
            onPress={() => onToggle(option.value)}
            testID={`${testIDPrefix}-${option.value}`}
          />
        ))}
      </View>
    </FilterSection>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexShrink: 1,
  },
  content: {
    gap: spacing.xl,
    paddingBottom: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  switchText: {
    flex: 1,
    gap: spacing.xxs,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});
