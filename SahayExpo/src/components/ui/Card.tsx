import React, { type ReactNode } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useThemeColors, FontFamily, FontSize, BorderRadius, Spacing } from '../../theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'elevated';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: variant === 'outlined' ? colors.border : 'transparent',
          borderWidth: variant === 'outlined' ? 1 : 0,
          ...(variant === 'elevated' && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardTitle({ children, style }: { children: ReactNode; style?: any }) {
  const colors = useThemeColors();
  return (
    <Text style={[styles.title, { color: colors.cardForeground }, style]}>
      {children}
    </Text>
  );
}

export function CardDescription({ children }: { children: ReactNode }) {
  const colors = useThemeColors();
  return <Text style={[styles.description, { color: colors.mutedForeground }]}>{children}</Text>;
}

export function CardContent({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.content, style]}>{children}</View>;
}

export function CardFooter({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  header: {
    padding: Spacing[4],
    paddingBottom: Spacing[2],
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semiBold,
  },
  description: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    marginTop: Spacing[1],
  },
  content: {
    padding: Spacing[4],
    paddingTop: 0,
  },
  footer: {
    padding: Spacing[4],
    paddingTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
