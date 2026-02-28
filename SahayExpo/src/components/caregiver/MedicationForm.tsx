import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSahay } from '../../lib/sahay-context';
import { TimeOfDay, Medication, timeOfDayLabels } from '../../lib/types';
import { ArrowLeft, Check, Trash2, Sun, Cloud, Moon, RefreshCw } from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MedicationFormProps {
  medication?: Medication | null;
  onClose: () => void;
}

export function MedicationForm({ medication, onClose }: MedicationFormProps) {
  const { addMedication, updateMedication, removeMedication, updateRefillStatus } = useSahay();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const isEditing = !!medication;

  const [name, setName] = useState(medication?.name || '');
  const [dosage, setDosage] = useState(medication?.dosage || '');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(medication?.timeOfDay || 'morning');
  const [notes, setNotes] = useState(medication?.notes || '');
  const [time, setTime] = useState(medication?.time || '');
  const [refillDaysLeft, setRefillDaysLeft] = useState<number | undefined>(medication?.refillDaysLeft);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !dosage.trim()) return;

    if (isEditing && medication) {
      updateMedication(medication.id, {
        name: name.trim(),
        dosage: dosage.trim(),
        timeOfDay,
        time: time || undefined,
        notes: notes.trim() || undefined,
        refillDaysLeft,
      });
      if (refillDaysLeft !== undefined) {
        updateRefillStatus(medication.id, refillDaysLeft);
      }
    } else {
      addMedication({
        name: name.trim(),
        dosage: dosage.trim(),
        timeOfDay,
        time: time || undefined,
        notes: notes.trim() || undefined,
        refillDaysLeft,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (medication) {
      removeMedication(medication.id);
      onClose();
    }
  };

  const isValid = name.trim().length > 0 && dosage.trim().length > 0;

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[4]), borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.backButton, { backgroundColor: colors.secondary }]}
          activeOpacity={0.8}
        >
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {isEditing ? 'Edit medication' : 'Add medication'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Medication name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Aspirin"
            placeholderTextColor={colors.mutedForeground + '90'}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Dosage</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
            value={dosage}
            onChangeText={setDosage}
            placeholder="e.g., 1 tablet"
            placeholderTextColor={colors.mutedForeground + '90'}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>When should it be taken?</Text>
          <View style={styles.timeGrid}>
            {(['morning', 'afternoon', 'evening'] as TimeOfDay[]).map((timeOpt) => {
              const isSelected = timeOfDay === timeOpt;
              const Icon = timeOpt === 'morning' ? Sun : timeOpt === 'afternoon' ? Cloud : Moon;
              
              return (
                <TouchableOpacity
                  key={timeOpt}
                  onPress={() => setTimeOfDay(timeOpt)}
                  style={[
                    styles.timeButton,
                    { 
                      backgroundColor: isSelected ? colors.sage + '20' : colors.card,
                      borderColor: isSelected ? colors.sage : colors.border
                    }
                  ]}
                  activeOpacity={0.8}
                >
                  <Icon size={24} color={isSelected ? colors.sage : colors.mutedForeground} strokeWidth={1.5} />
                  <Text style={[
                     styles.timeButtonText, 
                     { color: isSelected ? colors.foreground : colors.mutedForeground, fontFamily: isSelected ? FontFamily.semiBold : FontFamily.medium }
                  ]}>
                    {timeOfDayLabels[timeOpt]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>
            Exact time <Text style={{ color: colors.mutedForeground, fontFamily: FontFamily.regular }}>(optional)</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
            value={time}
            onChangeText={setTime}
            placeholder="e.g., 08:00 AM"
            placeholderTextColor={colors.mutedForeground + '90'}
          />
          <Text style={[styles.helpText, { color: colors.mutedForeground }]}>Helps us send more precise reminders</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>
            Notes <Text style={{ color: colors.mutedForeground, fontFamily: FontFamily.regular }}>(optional)</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., after food"
            placeholderTextColor={colors.mutedForeground + '90'}
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.refillHeader}>
            <RefreshCw size={20} color={colors.mutedForeground} />
            <Text style={[styles.label, { color: colors.foreground, marginBottom: 0 }]}>
              Refill awareness <Text style={{ color: colors.mutedForeground, fontFamily: FontFamily.regular }}>(optional)</Text>
            </Text>
          </View>
          <Text style={[styles.helpText, { color: colors.mutedForeground, marginBottom: Spacing[3], marginTop: Spacing[1] }]}>
            No need to count pills - just a gentle awareness of when refill might be needed
          </Text>
          
          <View style={styles.refillInputRow}>
            <TextInput
              style={[styles.input, styles.refillInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
              value={refillDaysLeft !== undefined ? String(refillDaysLeft) : ''}
              onChangeText={(t) => setRefillDaysLeft(t ? Number(t) : undefined)}
              placeholder="Days left"
              placeholderTextColor={colors.mutedForeground + '90'}
              keyboardType="number-pad"
            />
            <Text style={{ color: colors.mutedForeground, fontSize: FontSize.base }}>days of supply remaining</Text>
          </View>
          {refillDaysLeft !== undefined && refillDaysLeft <= 7 && (
            <Text style={[styles.warningText, { color: colors.pending }]}>This medication may need a refill soon</Text>
          )}
        </View>

        {isEditing && !showDeleteConfirm && (
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.destructive + '10', borderColor: colors.destructive + '40' }]}
            onPress={() => setShowDeleteConfirm(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.deleteButtonText, { color: colors.destructive }]}>Remove this medication</Text>
          </TouchableOpacity>
        )}

        {isEditing && showDeleteConfirm && (
          <View style={[styles.deleteConfirmCard, { backgroundColor: colors.destructive + '15', borderColor: colors.destructive + '40' }]}>
            <Text style={[styles.deleteConfirmText, { color: colors.foreground }]}>Are you sure you want to remove {medication?.name}?</Text>
            <View style={styles.deleteConfirmActions}>
              <TouchableOpacity
                style={[styles.keepButton, { backgroundColor: colors.secondary }]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={[styles.keepButtonText, { color: colors.foreground }]}>Keep it</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmRemoveButton, { backgroundColor: colors.destructive }]}
                onPress={handleDelete}
              >
                <Trash2 size={16} color={colors.destructiveForeground} />
                <Text style={styles.confirmRemoveButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing[4]), borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: isValid ? colors.primary : colors.muted }]}
          onPress={handleSubmit}
          disabled={!isValid}
          activeOpacity={0.8}
        >
          <Check size={20} color={isValid ? colors.primaryForeground : colors.mutedForeground} />
          <Text style={[styles.saveButtonText, { color: isValid ? colors.primaryForeground : colors.mutedForeground }]}>
            {isEditing ? 'Save changes' : 'Add medication'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.semiBold,
  },
  content: {
    padding: Spacing[6],
    paddingBottom: Spacing[12],
  },
  formGroup: {
    marginBottom: Spacing[6],
  },
  label: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.medium,
    marginBottom: Spacing[2],
  },
  input: {
    borderWidth: 2,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    fontSize: FontSize.lg,
    fontFamily: FontFamily.regular,
  },
  timeGrid: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  timeButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing[4],
    borderWidth: 2,
    borderRadius: BorderRadius.xl,
    gap: Spacing[2],
  },
  timeButtonText: {
    fontSize: FontSize.base,
  },
  helpText: {
    fontSize: FontSize.sm,
    marginTop: Spacing[2],
  },
  refillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  refillInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  refillInput: {
    width: 120,
    paddingVertical: Spacing[3],
  },
  warningText: {
    fontSize: FontSize.sm,
    marginTop: Spacing[2],
  },
  deleteButton: {
    width: '100%',
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.medium,
  },
  deleteConfirmCard: {
    padding: Spacing[4],
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
  },
  deleteConfirmText: {
    fontSize: FontSize.base,
    marginBottom: Spacing[4],
  },
  deleteConfirmActions: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  keepButton: {
    flex: 1,
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  keepButtonText: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.medium,
  },
  confirmRemoveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.xl,
  },
  confirmRemoveButtonText: {
    color: '#fff',
    fontSize: FontSize.base,
    fontFamily: FontFamily.medium,
  },
  footer: {
    padding: Spacing[6],
    borderTopWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius.xl,
  },
  saveButtonText: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semiBold,
  }
});
