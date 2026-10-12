import { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { radius, sizes, spacing, typography } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helper?: string;
  error?: string | null;
  center?: boolean;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, helper, error, center = false, onFocus, onBlur, ...inputProps },
  ref,
) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = error ? colors.danger : isFocused ? colors.brand : colors.border;

  return (
    <View style={styles.wrapper}>
      {label && (
        <AppText variant="secondary" color="textSecondary" style={styles.label}>
          {label}
        </AppText>
      )}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel={label ?? inputProps.placeholder}
        aria-invalid={Boolean(error)}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          {
            borderColor,
            backgroundColor: colors.surface,
            color: colors.textPrimary,
          },
          center && styles.centered,
        ]}
        {...inputProps}
      />
      {error ? (
        <AppText variant="secondary" color="danger" accessibilityLiveRegion="polite" accessibilityRole="alert">
          ⚠︎ {error}
        </AppText>
      ) : (
        helper && (
          <AppText variant="secondary" color="textSecondary">
            {helper}
          </AppText>
        )
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    marginLeft: spacing.xs,
  },
  input: {
    ...typography.body,
    minHeight: sizes.inputHeight,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  centered: {
    textAlign: 'center',
  },
});

