import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { colors, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** S45 (404): конкретне пояснення та релевантна дія. */
export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppText variant="title" align="center">
        Сторінку не знайдено
      </AppText>
      <AppText variant="body" color="textSecondary" align="center">
        Можливо, посилання застаріло.
      </AppText>
      <Button label="На головну" onPress={() => router.replace('/')} style={styles.button} />
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
