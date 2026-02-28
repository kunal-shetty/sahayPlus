import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useThemeColors, FontFamily, FontSize, BorderRadius, Spacing } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const colors = useThemeColors();
  const bgMap = {
    default: colors.primary + '20',
    success: colors.success + '20',
    warning: colors.warning + '20',
    destructive: colors.destructive + '20',
    outline: 'transparent',
  };
  const textMap = {
    default: colors.primary,
    success: colors.success,
    warning: colors.warning,
    destructive: colors.destructive,
    outline: colors.foreground,
  };

  return (
    <View style={[styles.badge, { backgroundColor: bgMap[variant], borderColor: variant === 'outline' ? colors.border : 'transparent', borderWidth: variant === 'outline' ? 1 : 0 }, style]}>
      <Text style={[styles.text, { color: textMap[variant] }]}>{label}</Text>
    </View>
  );
}

export function Separator({ style }: { style?: ViewStyle }) {
  const colors = useThemeColors();
  return <View style={[styles.separator, { backgroundColor: colors.border }, style]} />;
}

export function Progress({ value, max = 100, color, style }: { value: number; max?: number; color?: string; style?: ViewStyle }) {
  const colors = useThemeColors();
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <View style={[styles.progressBg, { backgroundColor: colors.muted }, style]}>
      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color || colors.primary }]} />
    </View>
  );
}

export function Skeleton({ width, height, style }: { width?: number | string; height?: number; style?: ViewStyle }) {
  const colors = useThemeColors();
  return <View style={[styles.skeleton, { width: width || '100%', height: height || 20, backgroundColor: colors.muted }, style]} />;
}

export function Spinner({ size = 'md', color }: { size?: 'sm' | 'md' | 'lg'; color?: string }) {
  const colors = useThemeColors();
  const sizeMap = { sm: 16, md: 24, lg: 36 };
  const s = sizeMap[size];
  return (
    <View style={[styles.spinner, { width: s, height: s, borderColor: colors.muted, borderTopColor: color || colors.primary }]} />
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[0.5],
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.semiBold,
  },
  separator: {
    height: 1,
    width: '100%',
    marginVertical: Spacing[3],
  },
  progressBg: {
    height: 6,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  skeleton: {
    borderRadius: BorderRadius.md,
    opacity: 0.6,
  },
  spinner: {
    borderWidth: 2.5,
    borderRadius: BorderRadius.full,
  },
});
