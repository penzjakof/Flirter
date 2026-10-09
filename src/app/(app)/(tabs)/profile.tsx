import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFloatingTabBarInset } from '@/components/layout/glass-tab-bar';
import { AppHeader } from '@/components/layout/app-header';
import { InstallSheet } from '@/components/pwa/install-sheet';
import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { usePwaInstall } from '@/lib/pwa-install';
import { maskEmail } from '@/lib/validation';
import { useChatsStore } from '@/store/chats-store';
import { useFiltersStore } from '@/store/filters-store';
import { useEnergyStore } from '@/store/energy-store';
import { useSessionStore } from '@/store/session-store';
import { radius, sizes, spacing, type ThemeColors, type ThemeMode } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface SettingsRowProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  value?: string;
  testID?: string;
}

function SettingsRow({ icon, label, onPress, value, testID }: SettingsRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}: ${value}` : label}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceMuted }]}>
      <Ionicons name={icon} size={sizes.icon} color={colors.textPrimary} />
      <AppText variant="body" style={styles.rowLabel}>
        {label}
      </AppText>
      {value && (
        <AppText variant="secondary" color="textSecondary">
          {value}
        </AppText>
      )}
      <Ionicons name="chevron-forward" size={sizes.iconSm} color={colors.textSecondary} />
    </Pressable>
  );
}

interface ThemeOptionRowProps {
  icon: IconName;
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
  testID?: string;
}

function ThemeOptionRow({ icon, label, selected, onPress, colors, testID }: ThemeOptionRowProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected, checked: selected }}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceMuted }]}>
      <Ionicons name={icon} size={sizes.icon} color={selected ? colors.brand : colors.textPrimary} />
      <AppText
        variant="body"
        color={selected ? 'brand' : 'textPrimary'}
        style={[styles.rowLabel, selected && styles.selectedRowLabel]}>
        {label}
      </AppText>
      {selected && <Ionicons name="checkmark-circle" size={sizes.icon} color={colors.brand} />}
    </Pressable>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();

  return (
    <View style={styles.group}>
      <AppText variant="secondary" color="textSecondary" style={styles.groupTitle}>
        {title}
      </AppText>
      <View style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

/** Повне скидання локального демо-стану (лише для прототипу без бекенду). */
function resetAllLocalState() {
  useChatsStore.getState().resetForDemo();
  useFiltersStore.getState().resetFilters();
  useEnergyStore.getState().resetForDemo();
  useSessionStore.getState().logout();
}

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: IconName }[] = [
  { mode: 'system', label: 'Як у системі', icon: 'phone-portrait-outline' },
  { mode: 'light', label: 'Світла', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Темна', icon: 'moon-outline' },
];

/** S26. Мій профіль / Settings. */
export default function ProfileScreen() {
  const tabBarInset = useFloatingTabBarInset();
  const nickname = useSessionStore((state) => state.nickname) ?? '';
  const email = useSessionStore((state) => state.email) ?? '';
  const logout = useSessionStore((state) => state.logout);
  const { isStandalone } = usePwaInstall();
  const { mode, setMode, colors } = useTheme();

  const [isInstallSheetVisible, setIsInstallSheetVisible] = useState(false);
  const [isLogoutSheetVisible, setIsLogoutSheetVisible] = useState(false);

  const openLegal = (href: Href) => router.push(href);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <AppHeader title="Профіль" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}>
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.brand }]}>
            <AppText variant="title" color="textOnBrand">
              {nickname.charAt(0).toUpperCase()}
            </AppText>
          </View>
          <View style={styles.profileText}>
            <AppText variant="heading" numberOfLines={1}>
              {nickname}
            </AppText>
            <AppText variant="secondary" color="textSecondary" numberOfLines={1}>
              {maskEmail(email)}
            </AppText>
          </View>
        </View>

        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
          <AppText variant="secondary" color="textSecondary" style={styles.flex}>
            Це приватні налаштування. Твій профіль не показується реальним людям.
          </AppText>
        </View>

        <SettingsGroup title="Тема оформлення">
          {THEME_OPTIONS.map((opt, index) => (
            <View key={opt.mode}>
              {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <ThemeOptionRow
                icon={opt.icon}
                label={opt.label}
                selected={mode === opt.mode}
                onPress={() => setMode(opt.mode)}
                colors={colors}
                testID={`settings-theme-${opt.mode}`}
              />
            </View>
          ))}
        </SettingsGroup>

        {!isStandalone && (
          <SettingsGroup title="Застосунок">
            <SettingsRow
              icon="phone-portrait-outline"
              label="Додати на головний екран"
              onPress={() => setIsInstallSheetVisible(true)}
              testID="settings-install"
            />
          </SettingsGroup>
        )}

        <SettingsGroup title="Енергія та покупки">
          <SettingsRow icon="flash-outline" label="Баланс і поповнення" onPress={() => router.navigate('/energy')} />
        </SettingsGroup>

        <SettingsGroup title="Допомога та правила">
          <SettingsRow icon="sparkles-outline" label="Про AI-персонажів" onPress={() => openLegal('/legal/ai')} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow icon="document-text-outline" label="Умови використання" onPress={() => openLegal('/legal/terms')} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow icon="shield-checkmark-outline" label="Політика приватності" onPress={() => openLegal('/legal/privacy')} />
        </SettingsGroup>

        <View style={styles.footerActions}>
          <Button label="Вийти" variant="secondary" icon="log-out-outline" onPress={() => setIsLogoutSheetVisible(true)} testID="settings-logout" />
          <Button label="Скинути демо-дані" variant="danger" onPress={resetAllLocalState} testID="settings-reset" />
        </View>
      </ScrollView>

      <InstallSheet visible={isInstallSheetVisible} onClose={() => setIsInstallSheetVisible(false)} />

      <BottomSheet visible={isLogoutSheetVisible} onClose={() => setIsLogoutSheetVisible(false)} title="Вийти з акаунту?">
        <AppText variant="body" color="textSecondary">
          Розмови та енергія збережуться в акаунті. Щоб повернутися, увійди з тим самим email.
        </AppText>
        <Button
          label="Вийти"
          variant="danger"
          onPress={() => {
            setIsLogoutSheetVisible(false);
            logout();
          }}
          testID="logout-confirm"
        />
        <Button label="Скасувати" variant="secondary" onPress={() => setIsLogoutSheetVisible(false)} />
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    flex: 1,
    gap: spacing.xxs,
  },
  privacyNote: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: -spacing.md,
    paddingHorizontal: spacing.xs,
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    paddingHorizontal: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  rowLabel: {
    flex: 1,
  },
  selectedRowLabel: {
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginLeft: spacing.lg + sizes.icon + spacing.md,
  },
  footerActions: {
    gap: spacing.md,
  },
});

