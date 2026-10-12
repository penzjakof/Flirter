import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhotoGallery } from '@/components/character/photo-gallery';
import { GlassSurface } from '@/components/ui/glass-surface';
import { useMotionPreferences } from '@/hooks/use-motion-preferences';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { IconButton } from '@/components/ui/icon-button';
import { CHARACTERS, getCharacterById } from '@/data/characters';
import { useChatsStore } from '@/store/chats-store';
import { colors, radius, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const PHOTO_ASPECT_RATIO = 3 / 4;
const WEB_BOTTOM_BLUR = Platform.select<ViewStyle>({
  web: {
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
  } as ViewStyle,
  default: {},
});

// Static hosting must serve a direct Home Screen launch/reload of every catalogue profile.
export function generateStaticParams() {
  return CHARACTERS.map(({ id }) => ({ id }));
}

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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const character = getCharacterById(id ?? '');
  const insets = useSafeAreaInsets();
  const { reduceMotion, reduceTransparency } = useMotionPreferences();
  const scrollY = useSharedValue(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [ctaHeight, setCtaHeight] = useState(sizes.buttonHeight + spacing.sm * 2);
  const bottomOffset = Math.max(insets.bottom, sizes.floatingTabBarGap);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(Math.max(0, event.contentOffset.y));
  });
  const photoStyle = useAnimatedStyle(() => ({
    // The sheet scrolls at full speed while the photo recedes more slowly.
    transform: [{ translateY: reduceMotion ? 0 : scrollY.get() * 0.65 }],
  }));
  const hasConversation = useChatsStore((state) => Boolean(character && state.conversations[character.id]));
  const createMatch = useChatsStore((state) => state.createMatch);

  const handleClose = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!character) {
    return (
      <SafeAreaView style={[styles.missing, { backgroundColor: colors.background }]}>
        <AppText variant="heading" align="center">
          {t('character.missing_title')}
        </AppText>
        <Button label={t('character.back_to_dating')} onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  const handleStartChat = () => {
    // Повторний CTA відкриває існуючий діалог — без дубля (F03).
    createMatch(character.id);
    router.replace({ pathname: '/chat/[id]', params: { id: character.id } });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]} onLayout={({ nativeEvent }) => setViewportHeight(nativeEvent.layout.height)}>
      <Animated.ScrollView
        testID="character-profile-scroll"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: ctaHeight + bottomOffset + spacing.xl }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        bounces={false}>
        <Animated.View testID="character-photo-layer" style={[styles.photoWrapper, { backgroundColor: colors.surfaceMuted }, photoStyle]}>
          <PhotoGallery key={character.id} photos={character.photos} name={character.name} />
          <LinearGradient colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)']} style={styles.topScrim} pointerEvents="none" />
        </Animated.View>

        <View testID="character-biography" style={[styles.body, {
          backgroundColor: colors.background,
          minHeight: Math.max(0, viewportHeight - insets.top - ctaHeight - bottomOffset - spacing.xl),
        }]}>
          <View style={styles.titleRow}>
            <AppText variant="hero" accessibilityRole="header">
              {character.name}, <AppText variant="hero" style={styles.ageText}>{character.age}</AppText>
            </AppText>
          </View>
          <AppText variant="body">{character.bio}</AppText>

          <Section title={t('character.section_interests')} items={character.interests} />
          <Section title={t('character.section_traits')} items={character.traits} />
          <Section title={t('character.section_lifestyle')} items={character.lifestyle} />
        </View>
      </Animated.ScrollView>

      <View pointerEvents="none" style={[styles.bottomOverlay, { height: ctaHeight + bottomOffset + spacing.xl }]}>
        {!reduceTransparency && <View style={[StyleSheet.absoluteFill, WEB_BOTTOM_BLUR]} />}
        <LinearGradient
          colors={[`${colors.background}00`, `${colors.background}66`, `${colors.background}B3`]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={[styles.stickyCta, { bottom: bottomOffset }]} onLayout={({ nativeEvent }) => setCtaHeight(nativeEvent.layout.height)}>
        <GlassSurface testID="character-cta-glass" style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]} />
        <Button
          label={hasConversation ? t('character.continue_chat') : t('character.start_chat')}
          icon="chatbubble"
          onPress={handleStartChat}
          testID="profile-start-chat"
          style={styles.ctaButton}
        />
      </View>
      <View style={[styles.closeButton, { top: insets.top + spacing.sm, backgroundColor: colors.mediaScrim }]}>
        <IconButton icon="chevron-down" color={colors.textOnMedia} onPress={handleClose} accessibilityLabel={t('character.close_accessibility')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
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
    zIndex: 1,
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
  section: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  stickyCta: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.sm,
  },
  ctaButton: {
    borderRadius: radius.pill,
  },
});
