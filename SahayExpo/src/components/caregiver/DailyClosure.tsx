import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSahay } from '../../lib/sahay-context';
import { Moon, Check } from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';

export function DailyClosure() {
  const { data, closeDay, isDayClosed } = useSahay();
  const colors = useThemeColors();

  const dayClosed = isDayClosed();
  const totalMeds = data.medications.length;
  const takenMeds = data.medications.filter((m) => m.taken).length;
  const allTaken = totalMeds > 0 && takenMeds === totalMeds;

  const hour = new Date().getHours();
  const shouldShow = hour >= 18 || allTaken;

  if (!shouldShow || totalMeds === 0) return null;

  if (dayClosed) {
    return (
      <View style={[styles.closedCard, { backgroundColor: colors.success + '15', borderColor: colors.success + '40' }]}>
        <View style={styles.row}>
          <View style={[styles.iconContainer, { backgroundColor: colors.success + '30' }]}>
            <Moon size={24} color={colors.success} strokeWidth={1.5} />
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.title, { color: colors.foreground }]}>That's everything for today.</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Rest well. Tomorrow is a fresh start.</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
          <Moon size={24} color={colors.warning} strokeWidth={1.5} />
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: colors.foreground }]}>Ready to close the day?</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{takenMeds} of {totalMeds} medications taken today</Text>
        </View>
      </View>

      {!allTaken && (
        <View style={[styles.noteContainer, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
            Some medications weren't marked as taken today, and that's okay. Tomorrow is a fresh start.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={closeDay}
        activeOpacity={0.8}
      >
        <Check size={20} color={colors.primaryForeground} />
        <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Close today</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing[5],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 2,
    marginBottom: Spacing[6],
  },
  closedCard: {
    padding: Spacing[5],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 2,
    marginBottom: Spacing[6],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.medium,
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  noteContainer: {
    padding: Spacing[3],
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing[4],
  },
  noteText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.xl,
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semiBold,
  },
});
