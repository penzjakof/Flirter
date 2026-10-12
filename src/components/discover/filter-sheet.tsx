import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
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
  toggleValue,
  type CharacterFilters,
} from '@/lib/character-filters';
import type { GenderFilter } from '@/models/types';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface FilterSheetProps {
  visible: boolean;
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
 * На кожному відкритті чернетка береться з актуальних фільтрів; під час закриття зберігаємо анімацію.
 */
export function FilterSheet({ visible, initialFilters, defaultGender, conversationIds, onApply, onClose }: FilterSheetProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [draft, setDraft] = useState<CharacterFilters>(initialFilters);
  const [previousVisible, setPreviousVisible] = useState(visible);
  if (visible !== previousVisible) {
    setPreviousVisible(visible);
    if (visible) setDraft(initialFilters);
  }
  const resultCount = filterCharacters(CHARACTERS, draft, conversationIds).length;

  const updateDraft = (patch: Partial<CharacterFilters>) => setDraft((current) => ({ ...current, ...patch }));

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('discover.sheet.title')} scrollable={false}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FilterSection title={t('discover.sheet.who_to_show')}>
          <GenderSelector value={draft.gender} onChange={(gender) => updateDraft({ gender })} />
        </FilterSection>
        <MultiSelectSection
          title={t('discover.sheet.age')}
          options={AGE_RANGE_OPTIONS}
          selected={draft.ageRanges}
          onToggle={(value) => updateDraft({ ageRanges: toggleValue(draft.ageRanges, value) })}
          renderLabel={(opt) =>
            t(
              `discover.filter_options.age_ranges.${opt.value === '18-24' ? '18_24' : opt.value === '25-29' ? '25_29' : '30_plus'}` as const,
              { defaultValue: opt.label },
            )
          }
          testIDPrefix="sheet-age"
        />
        <MultiSelectSection
          title={t('discover.sheet.ethnicity')}
          options={ETHNICITY_OPTIONS}
          selected={draft.ethnicities}
          onToggle={(value) => updateDraft({ ethnicities: toggleValue(draft.ethnicities, value) })}
          renderLabel={(opt) =>
            t(
              `discover.filter_options.ethnicities.${opt.value === 'middle-eastern' ? 'middle_eastern' : opt.value}` as const,
              { defaultValue: opt.label },
            )
          }
          testIDPrefix="sheet-ethnicity"
        />
        <MultiSelectSection
          title={t('discover.sheet.interests')}
          options={INTEREST_OPTIONS}
          selected={draft.interests}
          onToggle={(value) => updateDraft({ interests: toggleValue(draft.interests, value) })}
          renderLabel={(opt) =>
            t(`discover.filter_options.interests.${opt.value}` as const, { defaultValue: opt.label })
          }
          testIDPrefix="sheet-interest"
        />
        <MultiSelectSection
          title={t('discover.sheet.communication_style')}
          options={COMMUNICATION_STYLE_OPTIONS}
          selected={draft.styles}
          onToggle={(value) => updateDraft({ styles: toggleValue(draft.styles, value) })}
          renderLabel={(opt) =>
            t(`discover.filter_options.styles.${opt.value}` as const, { defaultValue: opt.label })
          }
          testIDPrefix="sheet-style"
        />

        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <AppText variant="bodyStrong">{t('discover.sheet.only_new_title')}</AppText>
            <AppText variant="secondary" color="textSecondary">
              {t('discover.sheet.only_new_subtitle')}
            </AppText>
          </View>
          <Switch
            testID="sheet-only-new"
            value={draft.onlyNew}
            onValueChange={(onlyNew) => updateDraft({ onlyNew })}
            trackColor={{ true: colors.brand, false: colors.border }}
            accessibilityLabel={t('discover.sheet.only_new_title')}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={t('discover.sheet.reset')}
          variant="secondary"
          onPress={() => setDraft({ ...DEFAULT_FILTERS, gender: defaultGender })}
          style={styles.resetButton}
          testID="sheet-reset"
        />
        <Button
          label={resultCount > 0 ? t('discover.sheet.show_results', { count: resultCount }) : t('discover.sheet.no_matches')}
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
  renderLabel?: (option: FilterOption<TValue>) => string;
  testIDPrefix: string;
}

function MultiSelectSection<TValue extends string>({
  title,
  options,
  selected,
  onToggle,
  renderLabel,
  testIDPrefix,
}: MultiSelectSectionProps<TValue>) {
  return (
    <FilterSection title={title}>
      <View style={styles.chips}>
        {options.map((option) => (
          <SelectableChip
            key={option.value}
            label={renderLabel ? renderLabel(option) : option.label}
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
