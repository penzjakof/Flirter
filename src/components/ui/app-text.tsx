import { Text, type TextProps } from 'react-native';

import { typography, type ColorToken, type TypographyVariant } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
}

export function AppText({ variant = 'body', color = 'textPrimary', align, style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  return <Text style={[typography[variant], { color: colors[color] }, align && { textAlign: align }, style]} {...rest} />;
}

