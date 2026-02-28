import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSahay } from '../../lib/sahay-context';
import { ArrowLeft, LogOut, Trash2, Heart, Pill, Plus } from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { data, logout, resetApp, updatePharmacist, addPharmacistNote } = useSahay();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPharmacistForm, setShowPharmacistForm] = useState(false);
  const [pharmacistName, setPharmacistName] = useState(data.pharmacist?.name || '');
  const [selectedMedForNote, setSelectedMedForNote] = useState<string | null>(null);
  const [pharmacistNote, setPharmacistNote] = useState('');

  const handleSavePharmacist = () => {
    updatePharmacist({ name: pharmacistName.trim() || undefined });
    setShowPharmacistForm(false);
  };

  const handleAddPharmacistNote = () => {
    if (selectedMedForNote && pharmacistNote.trim()) {
      addPharmacistNote(selectedMedForNote, pharmacistNote.trim());
      setSelectedMedForNote(null);
      setPharmacistNote('');
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[4]), borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: colors.secondary }]} activeOpacity={0.8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing[8]) }]} keyboardShouldPersistTaps="handled">
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.profileRow}>
            <View style={[styles.avatarBox, { backgroundColor: colors.sage + '30' }]}>
              <Heart size={28} color={colors.sage} strokeWidth={1.5} />
            </View>
            <View>
              <Text style={[styles.profileName, { color: colors.foreground }]}>{data.caregiver?.name}</Text>
              <Text style={[styles.profileDesc, { color: colors.mutedForeground }]}>Caring for {data.careReceiver?.name}</Text>
            </View>
          </View>
          <View style={[styles.divider, { borderTopColor: colors.border }]}>
            <Text style={[styles.medCountText, { color: colors.mutedForeground }]}>
              {data.medications.length} medication{data.medications.length !== 1 ? 's' : ''} set up
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.pharmacistHeader}>
            <View style={[styles.pillIconBox, { backgroundColor: colors.blue + '20' }]}>
              <Pill size={20} color={colors.blue} />
            </View>
            <View>
              <Text style={[styles.pharmacistTitle, { color: colors.foreground }]}>Local Pharmacist</Text>
              <Text style={[styles.pharmacistDesc, { color: colors.mutedForeground }]}>A silent helper for refill notes</Text>
            </View>
          </View>

          {!showPharmacistForm ? (
            <View>
              {data.pharmacist?.name ? (
                <View style={[styles.pharmacistInfo, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.pharmacistName, { color: colors.foreground }]}>{data.pharmacist.name}</Text>
                  {data.pharmacist.lastRefillConfirm && (
                    <Text style={[styles.pharmacistDate, { color: colors.mutedForeground }]}>
                      Last refill: {new Date(data.pharmacist.lastRefillConfirm).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ) : null}

              <TouchableOpacity onPress={() => setShowPharmacistForm(true)} style={[styles.updateButton, { backgroundColor: colors.secondary }]} activeOpacity={0.8}>
                <Text style={[styles.updateText, { color: colors.foreground }]}>
                  {data.pharmacist?.name ? 'Update pharmacist' : 'Add pharmacist name'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formSpace}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={pharmacistName}
                onChangeText={setPharmacistName}
                placeholder="Pharmacist or pharmacy name"
                placeholderTextColor={colors.mutedForeground + '80'}
              />
              <View style={styles.formRow}>
                <TouchableOpacity onPress={() => setShowPharmacistForm(false)} style={[styles.formBtn, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.formBtnText, { color: colors.foreground }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSavePharmacist} style={[styles.formBtn, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.formBtnText, { color: colors.primaryForeground }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {data.medications.length > 0 && !showPharmacistForm && (
            <View style={[styles.pharmacistNoteSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.noteHelpText, { color: colors.mutedForeground }]}>Add a note from pharmacist to a medication</Text>
              
              {selectedMedForNote ? (
                <View style={styles.formSpace}>
                  <Text style={[styles.noteMedTitle, { color: colors.foreground }]}>
                    Note for: {data.medications.find((m) => m.id === selectedMedForNote)?.name}
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                    value={pharmacistNote}
                    onChangeText={setPharmacistNote}
                    placeholder="e.g., Take with food"
                    placeholderTextColor={colors.mutedForeground + '80'}
                  />
                  <View style={styles.formRow}>
                    <TouchableOpacity onPress={() => { setSelectedMedForNote(null); setPharmacistNote(''); }} style={[styles.formBtn, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.formBtnText, { color: colors.foreground }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={handleAddPharmacistNote} 
                      disabled={!pharmacistNote.trim()}
                      style={[styles.formBtn, { backgroundColor: pharmacistNote.trim() ? colors.blue : colors.muted }]}
                    >
                      <Text style={[styles.formBtnText, { color: pharmacistNote.trim() ? '#fff' : colors.mutedForeground }]}>Add note</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.medChipsRow}>
                  {data.medications.map((med) => (
                    <TouchableOpacity
                      key={med.id}
                      onPress={() => setSelectedMedForNote(med.id)}
                      style={[styles.medChip, { backgroundColor: colors.secondary }]}
                    >
                      <Plus size={12} color={colors.foreground} />
                      <Text style={[styles.medChipText, { color: colors.foreground }]}>{med.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <Text style={[styles.actionsTitle, { color: colors.foreground }]}>Actions</Text>

          <TouchableOpacity onPress={logout} style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
            <View style={[styles.actionIconBox, { backgroundColor: colors.blue + '20' }]}>
              <LogOut size={20} color={colors.blue} />
            </View>
            <View>
              <Text style={[styles.actionTitle, { color: colors.foreground }]}>Switch role</Text>
              <Text style={[styles.actionDesc, { color: colors.mutedForeground }]}>Change to a different view</Text>
            </View>
          </TouchableOpacity>

          {!showResetConfirm ? (
            <TouchableOpacity onPress={() => setShowResetConfirm(true)} style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
              <View style={[styles.actionIconBox, { backgroundColor: colors.destructive + '20' }]}>
                <Trash2 size={20} color={colors.destructive} />
              </View>
              <View>
                <Text style={[styles.actionTitle, { color: colors.foreground }]}>Start fresh</Text>
                <Text style={[styles.actionDesc, { color: colors.mutedForeground }]}>Remove all data and start over</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.resetConfirmCard, { backgroundColor: colors.destructive + '15', borderColor: colors.destructive + '40' }]}>
              <Text style={[styles.resetConfirmText, { color: colors.foreground }]}>
                This will remove all your data including medications and profiles. Are you sure?
              </Text>
              <View style={styles.formRow}>
                <TouchableOpacity onPress={() => setShowResetConfirm(false)} style={[styles.formBtn, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.formBtnText, { color: colors.foreground }]}>Keep my data</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={resetApp} style={[styles.formBtn, { backgroundColor: colors.destructive }]}>
                  <View style={styles.btnContent}>
                    <Trash2 size={16} color="#fff" />
                    <Text style={[styles.formBtnText, { color: '#fff' }]}>Start fresh</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.appInfo, { borderTopColor: colors.border }]}>
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>Sahay+ · Gentle medication care</Text>
          <Text style={[styles.infoSubtext, { color: colors.mutedForeground + 'aa' }]}>Your data stays locally on your device (Supabase RLS disabled for mobile)</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4], paddingHorizontal: Spacing[4], paddingBottom: Spacing[4], borderBottomWidth: 1 },
  backButton: { width: 48, height: 48, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.xl, fontFamily: FontFamily.semiBold },
  content: { padding: Spacing[6], gap: Spacing[6] },
  card: { padding: Spacing[5], borderRadius: BorderRadius['2xl'], borderWidth: 2 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4], marginBottom: Spacing[4] },
  avatarBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: FontSize.lg, fontFamily: FontFamily.semiBold },
  profileDesc: { fontSize: FontSize.base },
  divider: { paddingTop: Spacing[4], borderTopWidth: 1 },
  medCountText: { fontSize: FontSize.sm },
  pharmacistHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginBottom: Spacing[4] },
  pillIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pharmacistTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.medium },
  pharmacistDesc: { fontSize: FontSize.sm },
  pharmacistInfo: { marginBottom: Spacing[4], padding: Spacing[3], borderRadius: BorderRadius.xl },
  pharmacistName: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
  pharmacistDate: { fontSize: FontSize.sm, marginTop: 4 },
  updateButton: { width: '100%', paddingVertical: 12, paddingHorizontal: Spacing[4], borderRadius: BorderRadius.xl, alignItems: 'center' },
  updateText: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
  formSpace: { gap: Spacing[3] },
  input: { paddingHorizontal: Spacing[4], paddingVertical: 12, borderWidth: 2, borderRadius: BorderRadius.xl, fontSize: FontSize.base },
  formRow: { flexDirection: 'row', gap: Spacing[3] },
  formBtn: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  formBtnText: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  pharmacistNoteSection: { marginTop: Spacing[4], paddingTop: Spacing[4], borderTopWidth: 1 },
  noteHelpText: { fontSize: FontSize.sm, marginBottom: Spacing[3] },
  noteMedTitle: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
  medChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  medChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing[3], paddingVertical: Spacing[2], borderRadius: BorderRadius.lg },
  medChipText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  actionsSection: { gap: Spacing[3] },
  actionsTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.medium, marginBottom: Spacing[3] },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4], padding: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 2 },
  actionIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.medium },
  actionDesc: { fontSize: FontSize.sm },
  resetConfirmCard: { padding: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 2, gap: Spacing[4] },
  resetConfirmText: { fontSize: FontSize.base },
  appInfo: { paddingTop: Spacing[6], borderTopWidth: 1, alignItems: 'center' },
  infoText: { fontSize: FontSize.sm },
  infoSubtext: { fontSize: FontSize.xs, marginTop: 4 },
});
