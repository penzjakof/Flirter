import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFloatingTabBarInset } from '@/components/layout/glass-tab-bar';
import { AppHeader } from '@/components/layout/app-header';
import { LanguageSelectionSheet } from '@/components/profile/language-selection-sheet';
import { InstallSheet } from '@/components/pwa/install-sheet';
import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { LANGUAGE_REGISTRY } from '@/i18n/types';
import { usePwaInstall } from '@/lib/pwa-install';
import { maskEmail } from '@/lib/validation';
import { useChatsStore } from '@/store/chats-store';
import { useDraftsStore } from '@/store/drafts-store';
import { useFiltersStore } from '@/store/filters-store';
import { useEnergyStore } from '@/store/energy-store';
import { useLanguageStore } from '@/store/language-store';
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
        <AppText variant="secondary" color="textSecondary" style={styles.rowValue} numberOfLines={2}>
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
      aria-checked={selected}
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
  useDraftsStore.getState().reset();
  useChatsStore.getState().resetForDemo();
  useFiltersStore.getState().resetFilters();
  useEnergyStore.getState().resetForDemo();
  useSessionStore.getState().logout();
}

/** S26. Мій профіль / Settings. */
export default function ProfileScreen() {
  const { t } = useTranslation();
  const tabBarInset = useFloatingTabBarInset();
  const nickname = useSessionStore((state) => state.nickname) ?? '';
  const email = useSessionStore((state) => state.email) ?? '';
  const { isStandalone } = usePwaInstall();
  const { mode, setMode, colors } = useTheme();

  const languageMode = useLanguageStore((state) => state.mode);
  const resolvedLanguage = useLanguageStore((state) => state.resolvedLanguage);

  const [isInstallSheetVisible, setIsInstallSheetVisible] = useState(false);
  const [isLanguageSheetVisible, setIsLanguageSheetVisible] = useState(false);
  const [isLogoutSheetVisible, setIsLogoutSheetVisible] = useState(false);

  const openLegal = (href: Href) => router.push(href);

  const currentLanguageName =
    languageMode === 'system'
      ? `${t('profile.theme_options.system')} (${LANGUAGE_REGISTRY[resolvedLanguage]?.nativeName ?? ''})`
      : LANGUAGE_REGISTRY[languageMode]?.nativeName ?? '';

  const themeOptions: { mode: ThemeMode; label: string; icon: IconName }[] = [
    { mode: 'system', label: t('profile.theme_options.system'), icon: 'phone-portrait-outline' },
    { mode: 'light', label: t('profile.theme_options.light'), icon: 'sunny-outline' },
    { mode: 'dark', label: t('profile.theme_options.dark'), icon: 'moon-outline' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <AppHeader title={t('profile.header_title')} />
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
            {t('profile.privacy_note')}
          </AppText>
        </View>

        <SettingsGroup title={t('profile.groups.theme')}>
          {themeOptions.map((opt, index) => (
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

        <SettingsGroup title={t('profile.groups.app')}>
          <SettingsRow
            icon="globe-outline"
            label={t('profile.rows.language')}
            value={currentLanguageName}
            onPress={() => setIsLanguageSheetVisible(true)}
            testID="settings-language"
          />
          {!isStandalone && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingsRow
                icon="phone-portrait-outline"
                label={t('profile.rows.install_pwa')}
                onPress={() => setIsInstallSheetVisible(true)}
                testID="settings-install"
              />
            </>
          )}
        </SettingsGroup>

        <SettingsGroup title={t('profile.groups.energy_and_purchases')}>
          <SettingsRow
            icon="flash-outline"
            label={t('profile.rows.balance_and_topup')}
            onPress={() => router.navigate('/energy')}
          />
        </SettingsGroup>

        <SettingsGroup title={t('profile.groups.help_and_rules')}>
          <SettingsRow icon="sparkles-outline" label={t('profile.rows.about_ai')} onPress={() => openLegal('/legal/ai')} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow icon="document-text-outline" label={t('profile.rows.terms')} onPress={() => openLegal('/legal/terms')} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsRow icon="shield-checkmark-outline" label={t('profile.rows.privacy_policy')} onPress={() => openLegal('/legal/privacy')} />
        </SettingsGroup>

        <View style={styles.footerActions}>
          <Button
            label={t('profile.buttons.logout')}
            variant="secondary"
            icon="log-out-outline"
            onPress={() => setIsLogoutSheetVisible(true)}
            testID="settings-logout"
          />
          <Button
            label={t('profile.buttons.reset_demo')}
            variant="danger"
            onPress={resetAllLocalState}
            testID="settings-reset"
          />
        </View>
      </ScrollView>

      <InstallSheet visible={isInstallSheetVisible} onClose={() => setIsInstallSheetVisible(false)} />

      <LanguageSelectionSheet
        visible={isLanguageSheetVisible}
        onClose={() => setIsLanguageSheetVisible(false)}
      />

      <BottomSheet
        visible={isLogoutSheetVisible}
        onClose={() => setIsLogoutSheetVisible(false)}
        title={t('profile.logout_modal.title')}>
        <AppText variant="body" color="textSecondary">
          {t('profile.logout_modal.description')}
        </AppText>
        <Button
          label={t('profile.logout_modal.confirm')}
          variant="danger"
          onPress={() => {
            setIsLogoutSheetVisible(false);
            resetAllLocalState();
          }}
          testID="logout-confirm"
        />
        <Button label={t('profile.logout_modal.cancel')} variant="secondary" onPress={() => setIsLogoutSheetVisible(false)} />
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
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    flex: 1,
  },
  rowValue: { maxWidth: '42%', flexShrink: 1 },
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

