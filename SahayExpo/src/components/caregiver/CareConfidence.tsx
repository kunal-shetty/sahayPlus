import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSahay } from '../../lib/sahay-context';
import { calculateConfidence, getConfidenceMessage } from '../../lib/types';
import { Leaf, Sparkles, Sprout } from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';

export function CareConfidence() {
  const { data } = useSahay();
  const colors = useThemeColors();

  const confidence = calculateConfidence(data.timeline, data.dayClosures);
  const message = getConfidenceMessage(confidence);

  const getConfig = () => {
    switch (confidence) {
      case 'stable':
        return { Icon: Leaf, bg: colors.sage + '15', iconColor: colors.sage, border: colors.sage + '40' };
      case 'adjusting':
        return { Icon: Sparkles, bg: colors.pending + '15', iconColor: colors.pending, border: colors.pending + '40' };
      case 'new':
        return { Icon: Sprout, bg: colors.blue + '15', iconColor: colors.blue, border: colors.blue + '40' };
    }
  };

  const { Icon, bg, iconColor, border } = getConfig();

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: border }]}>
      <View style={[styles.iconBox, { backgroundColor: colors.card }]}>
        <Icon size={20} color={iconColor} strokeWidth={1.5} />
      </View>
      <View>
        <Text style={[styles.title, { color: colors.foreground }]}>{message}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {data.dayClosures.length} day{data.dayClosures.length !== 1 ? 's' : ''} of care recorded
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing[4],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.medium,
  },
  subtitle: {
    fontSize: FontSize.sm,
  },
});
