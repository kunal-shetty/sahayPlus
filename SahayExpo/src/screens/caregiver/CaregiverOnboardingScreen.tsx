import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Pill, Plus, Sun, Cloud, Moon, ArrowRight, Heart, Check } from 'lucide-react-native';
import { useSahay } from '../../lib/sahay-context';
import { type TimeOfDay, timeOfDayLabels } from '../../lib/types';
import { useThemeColors, FontFamily, FontSize, Spacing, BorderRadius } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export function CaregiverOnboardingScreen() {
  const { addMedication, data } = useSahay();
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [notes, setNotes] = useState('');

  const timeGroups: TimeOfDay[] = ['morning', 'afternoon', 'evening'];
  const timeIcons: Record<TimeOfDay, any> = { morning: Sun, afternoon: Cloud, evening: Moon };

  const handleAdd = () => {
    if (!name.trim() || !dosage.trim()) return;
    addMedication({ name: name.trim(), dosage: dosage.trim(), timeOfDay, notes: notes.trim() || undefined });
    setName(''); setDosage(''); setNotes('');
    Alert.alert('Added!', `${name} has been added.`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
        <Pill color={colors.primary} size={36} strokeWidth={1.5} />
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>Set Up Medications</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Add the medications you manage. You can always add more later.
      </Text>

      {/* Added meds */}
      {data.medications.length > 0 && (
        <View style={styles.addedList}>
          {data.medications.map((med) => (
            <View key={med.id} style={[styles.addedItem, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]}>
              <Check color={colors.success} size={16} />
              <Text style={[styles.addedText, { color: colors.foreground }]}>{med.name} — {med.dosage}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Form */}
      <Card style={{ marginTop: Spacing[4] }}>
        <CardContent style={{ paddingTop: Spacing[4], gap: Spacing[3] }}>
          <TextInput
            placeholder="Medication name"
            value={name}
            onChangeText={setName}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
            placeholderTextColor={colors.mutedForeground}
          />
          <TextInput
            placeholder="Dosage (e.g. 500mg)"
            value={dosage}
            onChangeText={setDosage}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Time of Day</Text>
          <View style={styles.timeRow}>
            {timeGroups.map((t) => {
              const Icon = timeIcons[t];
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTimeOfDay(t)}
                  style={[styles.timePill, { backgroundColor: timeOfDay === t ? colors.primary : colors.muted }]}
                >
                  <Icon color={timeOfDay === t ? colors.primaryForeground : colors.foreground} size={16} />
                  <Text style={{ color: timeOfDay === t ? colors.primaryForeground : colors.foreground, fontFamily: FontFamily.medium, fontSize: FontSize.sm }}>
                    {timeOfDayLabels[t]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            placeholder="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
            placeholderTextColor={colors.mutedForeground}
            multiline
          />

          <Button
            title="Add Medication"
            onPress={handleAdd}
            disabled={!name.trim() || !dosage.trim()}
            fullWidth
            size="lg"
            icon={<Plus color={colors.primaryForeground} size={20} />}
          />
        </CardContent>
      </Card>

      {data.medications.length > 0 && (
        <Text style={[styles.doneHint, { color: colors.success }]}>
          ✓ {data.medications.length} medication{data.medications.length > 1 ? 's' : ''} added — you're all set!
        </Text>
      )}

      <View style={{ height: Spacing[10] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing[6], paddingTop: Spacing[16] },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: Spacing[6] },
  title: { fontSize: FontSize['2xl'], fontFamily: FontFamily.bold, textAlign: 'center', marginBottom: Spacing[2] },
  subtitle: { fontSize: FontSize.base, fontFamily: FontFamily.regular, textAlign: 'center', lineHeight: 24, marginBottom: Spacing[2] },
  addedList: { gap: Spacing[2], marginTop: Spacing[4] },
  addedItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], padding: Spacing[3], borderRadius: BorderRadius.lg, borderWidth: 1 },
  addedText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  input: { borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing[3], fontSize: FontSize.base, fontFamily: FontFamily.regular },
  label: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  timeRow: { flexDirection: 'row', gap: Spacing[2] },
  timePill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[1], paddingVertical: Spacing[2.5], borderRadius: BorderRadius.full },
  doneHint: { fontSize: FontSize.base, fontFamily: FontFamily.semiBold, textAlign: 'center', marginTop: Spacing[6] },
});
