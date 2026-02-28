import React from 'react';
import { TextInput as RNTextInput, View, Text, StyleSheet, type TextInputProps, type ViewStyle } from 'react-native';
import { useThemeColors, FontFamily, FontSize, BorderRadius, Spacing } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, icon, containerStyle, style, ...props }: InputProps) {
  const colors = useThemeColors();
  return (
    <View style={containerStyle}>
      {label && (
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      )}
      <View style={[styles.inputContainer, { borderColor: error ? colors.destructive : colors.border, backgroundColor: colors.card }]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <RNTextInput
          style={[
            styles.input,
            { color: colors.foreground, paddingLeft: icon ? 0 : Spacing[4] },
            style,
          ]}
          placeholderTextColor={colors.mutedForeground + '99'}
          {...props}
        />
      </View>
      {error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.medium,
    marginBottom: Spacing[1.5],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
  },
  icon: {
    paddingLeft: Spacing[4],
  },
  input: {
    flex: 1,
    paddingVertical: Spacing[4],
    paddingRight: Spacing[4],
    fontSize: FontSize.lg,
    fontFamily: FontFamily.regular,
  },
  error: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    marginTop: Spacing[1],
  },
});
