import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { IconButton } from '@/components/ui/icon-button';
import { getCharacterById } from '@/data/characters';
import { useChatsStore } from '@/store/chats-store';
import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const PHOTO_ASPECT_RATIO = 3 / 4;

function Section({ title, items }: { title: string; items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <AppText variant="bodyStrong" color="textSecondary">
        {title}
      </AppText>
      <View style={styles.chips}>
        {items.map((item) => (
          <Chip key={item} label={item} />
        ))}
      </View>
    </View>
  );
}

/** S10. Профіль персонажа: галерея, біографія, sticky CTA. */
export default function CharacterProfileScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const character = getCharacterById(id ?? '');
  const insets = useSafeAreaInsets();
  const hasConversation = useChatsStore((state) => Boolean(character && state.conversations[character.id]));
  const createMatch = useChatsStore((state) => state.createMatch);

  const handleClose = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!character) {
    return (
      <SafeAreaView style={[styles.missing, { backgroundColor: colors.background }]}>
        <AppText variant="heading" align="center">
          Персонаж більше недоступний
        </AppText>
        <Button label="Повернутися до знайомств" onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  const handleStartChat = () => {
    // Повторний CTA відкриває існуючий діалог — без дубля (F03).
    createMatch(character.id);
    router.replace({ pathname: '/chat/[id]', params: { id: character.id } });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }} bounces={false}>
        <View style={[styles.photoWrapper, { backgroundColor: colors.surfaceMuted }]}>
          <Image source={character.photos[0]} style={styles.photo} contentFit="cover" contentPosition="top" priority="high" />
          <LinearGradient colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)']} style={styles.topScrim} pointerEvents="none" />
          <View style={[styles.closeButton, { top: insets.top + spacing.sm }]}>
            <IconButton icon="chevron-down" color={colors.textOnMedia} onPress={handleClose} accessibilityLabel="Закрити профіль" />
          </View>
        </View>

        <View style={[styles.body, { backgroundColor: colors.background }]}>
          <View style={styles.titleRow}>
            <AppText variant="hero" accessibilityRole="header">
              {character.name}, <AppText variant="hero" style={styles.ageText}>{character.age}</AppText>
            </AppText>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="book-outline" size={16} color={colors.textSecondary} />
            <AppText variant="secondary" color="textSecondary">
              У сюжеті: {character.storyCity}
            </AppText>
          </View>

          <AppText variant="body">{character.bio}</AppText>

          <Section title="Інтереси" items={character.interests} />
          <Section title="Характер" items={character.traits} />
          <Section title="Стиль життя" items={character.lifestyle} />

          <View style={[styles.aboutAi, { backgroundColor: colors.brandSubtle }]}>
            <Ionicons name="sparkles-outline" size={20} color={colors.brand} />
            <AppText variant="secondary" style={styles.aboutAiText}>
              {character.name} — вигаданий AI-персонаж. Фото, біографія та відповіді створені штучним інтелектом.
            </AppText>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.stickyCta, { paddingBottom: insets.bottom + spacing.lg, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          label={hasConversation ? 'Продовжити розмову' : 'Почати чат'}
          icon="chatbubble"
          onPress={handleStartChat}
          testID="profile-start-chat"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  missing: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  photoWrapper: {
    width: '100%',
    aspectRatio: PHOTO_ASPECT_RATIO,
    maxHeight: 640,
    backgroundColor: colors.surfaceMuted,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.mediaScrim,
  },
  body: {
    marginTop: -spacing.xl,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  ageText: {
    fontWeight: '400',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: -spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  aboutAi: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSubtle,
    alignItems: 'center',
  },
  aboutAiText: {
    flex: 1,
  },
  stickyCta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
