import { Image } from 'expo-image';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { lightColors, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface AvatarProps {
  source: ImageSourcePropType;
  size: number;
  ringColor?: string | boolean;
  accessibilityLabel?: string;
}

export function Avatar({ source, size, ringColor, accessibilityLabel }: AvatarProps) {
  const { colors } = useTheme();
  const resolvedRingColor =
    ringColor === true || ringColor === lightColors.surface ? colors.surface : ringColor;

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          backgroundColor: colors.surfaceMuted,
        },
        resolvedRingColor ? { borderWidth: 2, borderColor: resolvedRingColor, padding: 2 } : null,
      ]}>
      <Image
        source={source}
        style={styles.image}
        contentFit="cover"
        contentPosition="top"
        accessibilityLabel={accessibilityLabel}
        transition={120}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: radius.pill,
  },
});

