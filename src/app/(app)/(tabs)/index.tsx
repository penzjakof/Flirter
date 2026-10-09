import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Хелпер для додавання прозорості до HEX кольорів
function getGradientColors(hexColor: string): readonly [string, string, string] {
  const hex = hexColor.replace('#', '');
  return [`#${hex}00`, `#${hex}66`, `#${hex}B3`] as const;
}

const WEB_TOP_BLUR = Platform.select<any>({
  web: {
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
  },
  default: {},
});

const WEB_BOTTOM_BLUR = Platform.select<any>({
  web: {
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
  },
  default: {},
});

import { BrandMark } from '@/components/brand-mark';
import { CharacterGridCard } from '@/components/discover/character-grid-card';
import { FilterSheet } from '@/components/discover/filter-sheet';
import { InterestChips } from '@/components/discover/interest-chips';
import { useFloatingTabBarInset } from '@/components/layout/glass-tab-bar';
import { AppHeader } from '@/components/layout/app-header';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { CHARACTERS } from '@/data/characters';
import { countAdvancedFilters, filterCharacters } from '@/lib/character-filters';
import type { Character } from '@/models/types';
import { useChatsStore } from '@/store/chats-store';
import { useCharacterFilters, useFiltersStore } from '@/store/filters-store';
import { useSessionStore } from '@/store/session-store';
import { colors, radius, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const GRID_COLUMNS = 2;
const GRID_PADDING = spacing.lg;
const GRID_GAP = spacing.md;

/** Ширина картки: колонка застосунку обмежена maxContentWidth на desktop. */
function useGridCardWidth(): number {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, sizes.maxContentWidth);
  return Math.floor((contentWidth - GRID_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS);
}

/** S08. Знайомства: сітка персонажів + фільтри на сторінці. */
export default function DiscoverScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const filters = useCharacterFilters();
  const toggleInterest = useFiltersStore((state) => state.toggleInterest);
  const applyFilters = useFiltersStore((state) => state.applyFilters);
  const resetFilters = useFiltersStore((state) => state.resetFilters);
  const preference = useSessionStore((state) => state.preference);
  const conversations = useChatsStore((state) => state.conversations);
  const createMatch = useChatsStore((state) => state.createMatch);
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(130);
  const cardWidth = useGridCardWidth();
  const tabBarInset = useFloatingTabBarInset();

  const conversationIds = new Set(Object.keys(conversations));
  const visibleCharacters = filterCharacters(CHARACTERS, filters, conversationIds);
  const advancedCount = countAdvancedFilters(filters);
  const gradientColors = getGradientColors(colors.background);

  const openProfile = (characterId: string) => router.push({ pathname: '/character/[id]', params: { id: characterId } });

  const handlePrimaryAction = (characterId: string) => {
    // Like безкоштовний: створює розмову (ідемпотентно) зі стікером симпатії й одразу веде в чат (F03).
    if (!conversations[characterId]) createMatch(characterId, 'like');
    router.push({ pathname: '/chat/[id]', params: { id: characterId } });
  };

  const renderItem = ({ item }: { item: Character }) => (
    <CharacterGridCard
      character={item}
      width={cardWidth}
      hasConversation={Boolean(conversations[item.id])}
      onOpenProfile={openProfile}
      onPrimaryAction={handlePrimaryAction}
    />
  );

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FlatList
        data={visibleCharacters}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={GRID_COLUMNS}
        columnWrapperStyle={styles.column}
        contentContainerStyle={[styles.grid, visibleCharacters.length === 0 && styles.gridEmpty]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View style={{ height: headerHeight + spacing.md }} />}
        ListFooterComponent={<View style={{ height: tabBarInset + spacing.md }} />}
        ListEmptyComponent={<EmptyFilterResult onReset={resetFilters} />}
      />

      {/* Верхній градієнт з хедером */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]} pointerEvents="box-none">
        <View style={[StyleSheet.absoluteFill, WEB_TOP_BLUR]} pointerEvents="none" />
        <LinearGradient
          colors={[gradientColors[2], gradientColors[1], gradientColors[0]]}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height + insets.top)} pointerEvents="box-none">
          <AppHeader
            leading={<BrandMark size={30} />}
            trailing={
              <IconButton
                icon="options-outline"
                onPress={() => setFilterSheetOpen(true)}
                accessibilityLabel={advancedCount > 0 ? `Фільтри, активних: ${advancedCount}` : 'Фільтри'}
                badgeCount={advancedCount}
                testID="filter-open"
                variant="glass"
              />
            }
          />
          <InterestChips selected={filters.interests} onToggle={toggleInterest} />
        </View>
      </View>

      {/* Нижній градієнт для Tab Bar */}
      <View style={[styles.bottomOverlay, { height: tabBarInset + spacing.md }]} pointerEvents="none">
        <View style={[StyleSheet.absoluteFill, WEB_BOTTOM_BLUR]} />
        <LinearGradient
          colors={gradientColors}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {isFilterSheetOpen && (
        <FilterSheet
          initialFilters={filters}
          defaultGender={preference ?? 'everyone'}
          conversationIds={conversationIds}
          onApply={applyFilters}
          onClose={() => setFilterSheetOpen(false)}
        />
      )}
    </View>
  );
}

/** Чесний empty state: профілі не вигадуємо, пропонуємо послабити фільтри. */
function EmptyFilterResult({ onReset }: { onReset: () => void }) {
  const { colors } = useTheme();

  return (
    <View style={styles.empty} accessibilityLiveRegion="polite">
      <View style={[styles.emptyIcon, { backgroundColor: colors.brandSubtle }]}>
        <Ionicons name="search-outline" size={32} color={colors.brand} />
      </View>
      <AppText variant="heading" align="center">
        Немає персонажів за цими фільтрами
      </AppText>
      <AppText variant="body" color="textSecondary" align="center">
        Спробуй прибрати частину фільтрів — нові персонажі також з’являтимуться згодом.
      </AppText>
      <Button label="Скинути фільтри" variant="secondary" onPress={onReset} style={styles.emptyButton} testID="discover-reset-filters" />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: spacing.xl,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: spacing.xl,
  },
  grid: {
    paddingHorizontal: GRID_PADDING,
    gap: GRID_GAP,
  },
  gridEmpty: {
    flexGrow: 1,
  },
  column: {
    gap: GRID_GAP,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyButton: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
});
