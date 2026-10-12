import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { colors, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** S45 (404): конкретне пояснення та релевантна дія. */
export default function NotFoundScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppText variant="title" align="center">
        {t('not_found.title')}
      </AppText>
      <AppText variant="body" color="textSecondary" align="center">
        {t('not_found.description')}
      </AppText>
      <Button label={t('not_found.button')} onPress={() => router.replace('/')} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  button: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
});
