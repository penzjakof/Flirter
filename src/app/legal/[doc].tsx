import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { IconButton } from '@/components/ui/icon-button';
import { LEGAL_VERSIONS } from '@/store/session-store';
import { colors, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type LegalDocId = 'terms' | 'privacy' | 'ai';

export function generateStaticParams() {
  return ['terms', 'privacy', 'ai'].map((doc) => ({ doc }));
}

interface LegalDocConfig {
  titleKey: 'legal.documents.terms.title' | 'legal.documents.privacy.title' | 'legal.documents.ai.title';
  version: string;
  sections: {
    headingKey:
      | 'legal.documents.terms.sections.draft.heading'
      | 'legal.documents.terms.sections.nature.heading'
      | 'legal.documents.terms.sections.age.heading'
      | 'legal.documents.privacy.sections.draft.heading'
      | 'legal.documents.privacy.sections.data.heading'
      | 'legal.documents.privacy.sections.rights.heading'
      | 'legal.documents.ai.sections.real_people.heading'
      | 'legal.documents.ai.sections.offline_meet.heading'
      | 'legal.documents.ai.sections.ai_mistakes.heading';
    bodyKey:
      | 'legal.documents.terms.sections.draft.body'
      | 'legal.documents.terms.sections.nature.body'
      | 'legal.documents.terms.sections.age.body'
      | 'legal.documents.privacy.sections.draft.body'
      | 'legal.documents.privacy.sections.data.body'
      | 'legal.documents.privacy.sections.rights.body'
      | 'legal.documents.ai.sections.real_people.body'
      | 'legal.documents.ai.sections.offline_meet.body'
      | 'legal.documents.ai.sections.ai_mistakes.body';
  }[];
}

const LEGAL_DOCS: Record<LegalDocId, LegalDocConfig> = {
  terms: {
    titleKey: 'legal.documents.terms.title',
    version: LEGAL_VERSIONS.terms,
    sections: [
      {
        headingKey: 'legal.documents.terms.sections.draft.heading',
        bodyKey: 'legal.documents.terms.sections.draft.body',
      },
      {
        headingKey: 'legal.documents.terms.sections.nature.heading',
        bodyKey: 'legal.documents.terms.sections.nature.body',
      },
      {
        headingKey: 'legal.documents.terms.sections.age.heading',
        bodyKey: 'legal.documents.terms.sections.age.body',
      },
    ],
  },
  privacy: {
    titleKey: 'legal.documents.privacy.title',
    version: LEGAL_VERSIONS.privacy,
    sections: [
      {
        headingKey: 'legal.documents.privacy.sections.draft.heading',
        bodyKey: 'legal.documents.privacy.sections.draft.body',
      },
      {
        headingKey: 'legal.documents.privacy.sections.data.heading',
        bodyKey: 'legal.documents.privacy.sections.data.body',
      },
      {
        headingKey: 'legal.documents.privacy.sections.rights.heading',
        bodyKey: 'legal.documents.privacy.sections.rights.body',
      },
    ],
  },
  ai: {
    titleKey: 'legal.documents.ai.title',
    version: LEGAL_VERSIONS.aiDisclosure,
    sections: [
      {
        headingKey: 'legal.documents.ai.sections.real_people.heading',
        bodyKey: 'legal.documents.ai.sections.real_people.body',
      },
      {
        headingKey: 'legal.documents.ai.sections.offline_meet.heading',
        bodyKey: 'legal.documents.ai.sections.offline_meet.body',
      },
      {
        headingKey: 'legal.documents.ai.sections.ai_mistakes.heading',
        bodyKey: 'legal.documents.ai.sections.ai_mistakes.body',
      },
    ],
  },
};

function isLegalDocId(value: unknown): value is LegalDocId {
  return value === 'terms' || value === 'privacy' || value === 'ai';
}

export default function LegalScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { doc } = useLocalSearchParams<{ doc: string }>();

  const isDocValid = isLegalDocId(doc);
  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const config = isDocValid ? LEGAL_DOCS[doc] : null;
  const title = config ? t(config.titleKey) : null;
  const version = config ? config.version : null;
  const sections = config
    ? config.sections.map((section) => ({
        heading: t(section.headingKey),
        body: t(section.bodyKey),
      }))
    : [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <IconButton icon="chevron-back" onPress={handleBack} accessibilityLabel={t('legal.back_accessibility')} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {isDocValid ? (
          <>
            <AppText variant="title" accessibilityRole="header">
              {title}
            </AppText>
            <AppText variant="secondary" color="textSecondary">
              {t('legal.version_label', { version })}
            </AppText>
            {sections.map((section) => (
              <View key={section.heading} style={styles.section}>
                <AppText variant="heading" accessibilityRole="header">
                  {section.heading}
                </AppText>
                <AppText variant="body">{section.body}</AppText>
              </View>
            ))}
          </>
        ) : (
          <AppText variant="body">{t('legal.not_found')}</AppText>
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
