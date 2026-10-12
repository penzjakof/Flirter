import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { GlassSurface } from '@/components/ui/glass-surface';
import { useLanguageStore } from '@/store/language-store';
import { useMotionPreferences } from '@/hooks/use-motion-preferences';
import { radius, shadows, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const PILL_PADDING = spacing.xs + 2;
const ICON_SIZE = 24;
const HIGHLIGHT_SPRING = { damping: 18, stiffness: 190, mass: 0.8 } as const;

/** Нижній відступ від краю екрана до «пігулки» з урахуванням home indicator. */
function useBottomOffset(): number {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, sizes.floatingTabBarGap);
}

/** Відстань від низу екрана до верхнього краю «пігулки» — для елементів, закріплених над tab bar. */
export function useFloatingTabBarTop(): number {
  return sizes.floatingTabBarHeight + useBottomOffset();
}

/** Скільки місця знизу треба залишити контенту екрана, щоб його не перекривав плаваючий tab bar. */
export function useFloatingTabBarInset(): number {
  return useFloatingTabBarTop() + spacing.md;
}

/**
 * Плаваючий tab bar у стилі iOS Liquid Glass: заокруглена скляна «пігулка» над контентом,
 * активна вкладка підсвічена «лінзою», що плавно переїжджає між пунктами.
 */
export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { reduceMotion } = useMotionPreferences();
  const isRTL = useLanguageStore((s) => s.isRTL);
  const bottomOffset = useBottomOffset();
  const [rowWidth, setRowWidth] = useState(0);
  const itemWidth = state.routes.length > 0 ? rowWidth / state.routes.length : 0;
  
  const translateX = useSharedValue(0);
  const squishX = useSharedValue(0);
  const stretchY = useSharedValue(0);
  
  const prevIndex = useRef(state.index);

  useEffect(() => {
    const targetIndex = isRTL ? state.routes.length - 1 - state.index : state.index;
    translateX.set(reduceMotion ? targetIndex * itemWidth : withSpring(targetIndex * itemWidth, HIGHLIGHT_SPRING));
    
    // Анімація стиснення (squish) без деформації закруглень (border-radius)
    if (!reduceMotion && prevIndex.current !== state.index && itemWidth > 0) {
      squishX.set(withSequence(withTiming(16, { duration: 150 }), withSpring(0, HIGHLIGHT_SPRING)));
      stretchY.set(withSequence(withTiming(-8, { duration: 150 }), withSpring(0, HIGHLIGHT_SPRING)));
    }
    prevIndex.current = state.index;
    if (reduceMotion) { squishX.set(0); stretchY.set(0); }
  }, [state.index, state.routes.length, itemWidth, translateX, squishX, stretchY, isRTL, reduceMotion]);

  const highlightStyle = useAnimatedStyle(() => ({ 
    transform: [{ translateX: translateX.get() }],
    top: stretchY.get(),
    bottom: stretchY.get(),
    left: squishX.get(),
    width: itemWidth - squishX.get() * 2,
  }));

  const handleRowLayout = (event: LayoutChangeEvent) => setRowWidth(event.nativeEvent.layout.width);

  return (
    <View style={[styles.wrapper, styles.pill, { bottom: bottomOffset }]}>
      <GlassSurface testID="tab-glass" style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]} />
      <View style={styles.row} onLayout={handleRowLayout} accessibilityRole="tablist">
        {itemWidth > 0 && (
          <Animated.View
            style={[
              styles.highlight,
              { backgroundColor: colors.glassLens },
              highlightStyle,
            ]}
          />
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const color = isFocused ? colors.brandText : colors.tabBarInactive;
          const label = options.title ?? route.name;
          const badge = options.tabBarBadge;

            const handlePress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
            };

            return (
              <Pressable
                key={route.key}
                testID={`tab-${route.name}`}
                onPress={handlePress}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                aria-selected={isFocused}
                accessibilityLabel={
                  badge !== undefined
                    ? t('tabs.unread_badge_accessibility', { label, count: badge })
                    : label
                }
                style={styles.item}>
                <View>
                  {options.tabBarIcon?.({ focused: isFocused, color, size: ICON_SIZE })}
                  {badge !== undefined && (
                    <View style={[styles.badge, { backgroundColor: colors.brand, borderColor: colors.surface }]}>
                      <AppText variant="caption" color="textOnBrand" style={styles.badgeText}>
                  {typeof badge === 'number' && badge > 99 ? '99+' : badge}
                      </AppText>
                    </View>
                  )}
                </View>
                <AppText variant="caption" numberOfLines={1} style={[styles.label, { color }]}>
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Оверлей поверх контенту — єдиний виправданий випадок absolute для навігації.
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
  pill: {
    height: sizes.floatingTabBarHeight,
    borderRadius: radius.pill,
    padding: PILL_PADDING,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.pill,
    ...shadows.lens,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  label: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
});
