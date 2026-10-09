import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { IconButton } from '@/components/ui/icon-button';
import { LEGAL_VERSIONS } from '@/store/session-store';
import { colors, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type LegalDocId = 'terms' | 'privacy' | 'ai';

interface LegalDocument {
  title: string;
  version: string;
  sections: { heading: string; body: string }[];
}

/**
 * S40. Legal reader. Доступний без входу й балансу.
 * Тексти — ЧЕРНЕТКА-заглушка; фінальні документи готує юрист.
 */
const DOCUMENTS: Record<LegalDocId, LegalDocument> = {
  terms: {
    title: 'Умови використання',
    version: LEGAL_VERSIONS.terms,
    sections: [
      { heading: 'Чернетка', body: 'Фінальний текст Умов буде надано після юридичного узгодження. Цей екран — місце для документа.' },
      { heading: 'Природа сервісу', body: 'Flirter — розважальний симулятор знайомств. Усі профілі є вигаданими AI-персонажами.' },
      { heading: 'Вік', body: 'Сервіс доступний лише особам, яким виповнилося 18 років.' },
    ],
  },
  privacy: {
    title: 'Політика приватності',
    version: LEGAL_VERSIONS.privacy,
    sections: [
      { heading: 'Чернетка', body: 'Фінальний текст Політики буде надано після юридичного узгодження.' },
      { heading: 'Які дані', body: 'Email, дата народження, нікнейм, необов’язкові вподобання, історія розмов і покупок.' },
      { heading: 'Ваші права', body: 'Ви можете запросити копію даних, видалити історію або акаунт у налаштуваннях.' },
    ],
  },
  ai: {
    title: 'Про AI-персонажів',
    version: LEGAL_VERSIONS.aiDisclosure,
    sections: [
      { heading: 'Чи це реальні люди?', body: 'Ні. Усі персонажі вигадані, а їхні фото, біографії та відповіді створені AI або сценаріями.' },
      { heading: 'Чи можна зустрітися?', body: 'Ні. Персонажі не існують у реальному світі, офлайн-зустрічі неможливі.' },
      { heading: 'Чи може AI помилятися?', body: 'Так. Відповіді можуть бути неточними. Не сприймайте їх як професійну пораду.' },
    ],
  },
};

function isLegalDocId(value: unknown): value is LegalDocId {
  return value === 'terms' || value === 'privacy' || value === 'ai';
}

export default function LegalScreen() {
  const { colors } = useTheme();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const document = isLegalDocId(doc) ? DOCUMENTS[doc] : null;

  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <IconButton icon="chevron-back" onPress={handleBack} accessibilityLabel="Назад" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {document ? (
          <>
            <AppText variant="title" accessibilityRole="header">
              {document.title}
            </AppText>
            <AppText variant="secondary" color="textSecondary">
              Версія від {document.version}
            </AppText>
            {document.sections.map((section) => (
              <View key={section.heading} style={styles.section}>
                <AppText variant="heading" accessibilityRole="header">
                  {section.heading}
                </AppText>
                <AppText variant="body">{section.body}</AppText>
              </View>
            ))}
          </>
        ) : (
          <AppText variant="body">Документ не знайдено.</AppText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: spacing.sm,
    height: 56,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  section: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
});
