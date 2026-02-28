import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useThemeColors, FontFamily, FontSize, BorderRadius, Spacing } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title, onPress, variant = 'primary', size = 'md',
  disabled = false, loading = false, icon, style, textStyle, fullWidth = false,
}: ButtonProps) {
  const colors = useThemeColors();

  const bgMap = {
    primary: colors.primary,
    secondary: colors.secondary,
    outline: 'transparent',
    ghost: 'transparent',
    destructive: colors.destructive,
  };

  const textColorMap = {
    primary: colors.primaryForeground,
    secondary: colors.secondaryForeground,
    outline: colors.foreground,
    ghost: colors.foreground,
    destructive: colors.destructiveForeground,
  };

  const paddingMap = { sm: Spacing[2], md: Spacing[4], lg: Spacing[5] };
  const fontSizeMap = { sm: FontSize.sm, md: FontSize.base, lg: FontSize.lg };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        {
          backgroundColor: bgMap[variant],
          paddingVertical: paddingMap[size],
          paddingHorizontal: paddingMap[size] * 1.5,
          opacity: disabled ? 0.5 : 1,
          borderWidth: variant === 'outline' ? 2 : 0,
          borderColor: variant === 'outline' ? colors.border : undefined,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColorMap[variant]} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: textColorMap[variant], fontSize: fontSizeMap[size] },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius['2xl'],
    gap: Spacing[2],
  },
  fullWidth: { width: '100%' },
  text: {
    fontFamily: FontFamily.semiBold,
    textAlign: 'center',
  },
});
