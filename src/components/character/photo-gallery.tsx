import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useMotionPreferences } from '@/hooks/use-motion-preferences';
import type { Character } from '@/models/types';
import { radius, spacing } from '@/theme/tokens';

/** Each page uses the measured app column, including on tablets and web. */
export function PhotoGallery({ photos, name }: Pick<Character, 'photos' | 'name'>) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const activeIndexRef = useRef(0);
  const { reduceMotion } = useMotionPreferences();

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: activeIndexRef.current * width, animated: false });
  }, [width]);

  return (
    <View style={styles.root} {...(Platform.OS === 'web' ? { dir: 'ltr' } : {})} onLayout={({ nativeEvent }) => setWidth(nativeEvent.layout.width)}>
      {width > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          directionalLockEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={photos.length > 1}
          testID="character-gallery"
          scrollEventThrottle={16}
          onScroll={({ nativeEvent }) => {
            const index = Math.max(0, Math.min(photos.length - 1, Math.round(nativeEvent.contentOffset.x / width)));
            if (index !== activeIndexRef.current) {
              activeIndexRef.current = index;
              setActiveIndex(index);
            }
          }}>
          {photos.map((photo, index) => (
            <Image
              key={index}
              source={photo}
              style={{ width, height: '100%' }}
              contentFit="cover"
              contentPosition="top"
              priority={index === 0 ? 'high' : 'normal'}
              accessibilityLabel={`${name}, ${index + 1} / ${photos.length}`}
            />
          ))}
        </ScrollView>
      )}
      {photos.length > 1 && (
        <View style={styles.pagination}>
          {photos.map((_, index) => (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`${name}, ${index + 1} / ${photos.length}`}
              accessibilityState={{ selected: activeIndex === index }}
              aria-pressed={activeIndex === index}
              testID={`character-photo-dot-${index}`}
              style={styles.dotTarget}
              onPress={() => {
                scrollRef.current?.scrollTo({ x: index * width, animated: !reduceMotion });
              }}>
              <View style={[styles.dot, { opacity: activeIndex === index ? 1 : 0.45 }]} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, ...Platform.select({ web: {}, default: { direction: 'ltr' as const } }) },
  pagination: {
    position: 'absolute',
    bottom: spacing.xl + spacing.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  dotTarget: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: '#FFFFFF' },
});
