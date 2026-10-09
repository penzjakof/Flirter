import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (nextValue: boolean) => void;
  accessibilityLabel: string;
  children: ReactNode;
  testID?: string;
}

const BOX_SIZE = 24;

export function Checkbox({ checked, onChange, accessibilityLabel, children, testID }: CheckboxProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      testID={testID}
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View
        style={[
          styles.box,
          {
            backgroundColor: checked ? colors.brand : colors.surface,
            borderColor: checked ? colors.brand : colors.textSecondary,
          },
        ]}>
        {checked && <Ionicons name="checkmark" size={18} color={colors.textOnBrand} />}
      </View>
      <View style={styles.label}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: radius.sm - 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  label: {
    flex: 1,
  },
});

