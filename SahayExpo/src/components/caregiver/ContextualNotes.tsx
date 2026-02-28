import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSahay } from '../../lib/sahay-context';
import { FileText, Plus, X, ArrowLeft } from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ContextualNotes({ onClose }: { onClose: () => void }) {
  const { data, addContextualNote, removeContextualNote } = useSahay();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [isAdding, setIsAdding] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [linkedType, setLinkedType] = useState<'day' | 'medication'>('day');
  const [linkedMedId, setLinkedMedId] = useState<string | undefined>();

  const now = new Date();
  const activeNotes = data.contextualNotes.filter((note) => {
    return new Date(note.fadingAt) > now;
  });

  const getNoteOpacity = (fadingAt: string) => {
    const fadeDate = new Date(fadingAt);
    const daysLeft = Math.ceil((fadeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft >= 5) return 1;
    if (daysLeft >= 3) return 0.8;
    if (daysLeft >= 1) return 0.6;
    return 0.4;
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;

    const linkedTo =
      linkedType === 'medication' && linkedMedId
        ? { type: 'medication' as const, id: linkedMedId }
        : { type: 'day' as const };

    addContextualNote(noteText.trim(), linkedTo);
    setNoteText('');
    setIsAdding(false);
    setLinkedType('day');
    setLinkedMedId(undefined);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMedName = (medId: string | undefined) => {
    if (!medId) return null;
    return data.medications.find((m) => m.id === medId)?.name;
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[6]), borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: colors.secondary }]} activeOpacity={0.8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Notes</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Quick notes that gently fade over time</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, isAdding ? Spacing[6] : 100) }]} keyboardShouldPersistTaps="handled">
        
        {activeNotes.length === 0 && !isAdding ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.secondary }]}>
              <FileText size={32} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No notes yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Add notes to remember context about changes</Text>
          </View>
        ) : (
          <View style={styles.notesList}>
            {activeNotes
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((note) => {
                const opacity = getNoteOpacity(note.fadingAt);
                const medName = getMedName(note.linkedTo?.id);

                return (
                  <View
                    key={note.id}
                    style={[styles.noteCard, { opacity, backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <View style={styles.noteRow}>
                      <View style={styles.noteContent}>
                        <Text style={[styles.noteText, { color: colors.foreground }]}>{note.text}</Text>
                        <View style={styles.noteMeta}>
                          <Text style={[styles.noteDate, { color: colors.mutedForeground }]}>{formatDate(note.createdAt)}</Text>
                          {medName && (
                            <View style={[styles.medBadge, { backgroundColor: colors.secondary }]}>
                              <Text style={[styles.medBadgeText, { color: colors.mutedForeground }]}>{medName}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => removeContextualNote(note.id)}
                        style={[styles.removeBtn, { backgroundColor: colors.secondary + '80' }]}
                      >
                        <X size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
          </View>
        )}

        {isAdding && (
          <View style={[styles.addForm, { backgroundColor: colors.card, borderColor: colors.sage }]}>
            <TextInput
              style={[styles.inputArea, { backgroundColor: colors.secondary + '80', color: colors.foreground }]}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Why did something change? What should you remember?"
              placeholderTextColor={colors.mutedForeground}
              multiline
              autoFocus
            />

            <View style={styles.linkOptions}>
              <TouchableOpacity
                onPress={() => { setLinkedType('day'); setLinkedMedId(undefined); }}
                style={[
                  styles.linkBadge,
                  { backgroundColor: linkedType === 'day' && !linkedMedId ? colors.sage : colors.secondary }
                ]}
              >
                <Text style={[
                  styles.linkBadgeText,
                  { color: linkedType === 'day' && !linkedMedId ? '#fff' : colors.foreground }
                ]}>General note</Text>
              </TouchableOpacity>

              {data.medications.map((med) => (
                <TouchableOpacity
                  key={med.id}
                  onPress={() => { setLinkedType('medication'); setLinkedMedId(med.id); }}
                  style={[
                    styles.linkBadge,
                    { backgroundColor: linkedMedId === med.id ? colors.sage : colors.secondary }
                  ]}
                >
                  <Text style={[
                    styles.linkBadgeText,
                    { color: linkedMedId === med.id ? '#fff' : colors.foreground }
                  ]}>{med.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                onPress={() => { setIsAdding(false); setNoteText(''); }}
                style={[styles.formBtn, { backgroundColor: colors.secondary }]}
              >
                <Text style={[styles.formBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddNote}
                disabled={!noteText.trim()}
                style={[styles.formBtn, { backgroundColor: noteText.trim() ? colors.primary : colors.muted }]}
              >
                <Text style={[styles.formBtnText, { color: noteText.trim() ? colors.primaryForeground : colors.mutedForeground }]}>Save note</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {!isAdding && (
        <View style={[styles.floatingActionArea, { paddingBottom: Math.max(insets.bottom, Spacing[6]) }]}>
          <TouchableOpacity
            onPress={() => setIsAdding(true)}
            style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Plus size={20} color={colors.primaryForeground} />
            <Text style={[styles.fabText, { color: colors.primaryForeground }]}>Add a note</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing[6], paddingBottom: Spacing[4], borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4] },
  backButton: { width: 48, height: 48, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize['2xl'], fontFamily: FontFamily.semiBold },
  subtitle: { fontSize: FontSize.base },
  content: { padding: Spacing[6] },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing[12] },
  emptyIconBox: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[4] },
  emptyTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.medium },
  emptySub: { fontSize: FontSize.base, marginTop: 4 },
  notesList: { gap: Spacing[3] },
  noteCard: { padding: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 2 },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing[3] },
  noteContent: { flex: 1 },
  noteText: { fontSize: FontSize.base, lineHeight: 22 },
  noteMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginTop: Spacing[2] },
  noteDate: { fontSize: FontSize.sm },
  medBadge: { paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full },
  medBadgeText: { fontSize: 11 },
  removeBtn: { width: 32, height: 32, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  addForm: { padding: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 2, marginTop: Spacing[4] },
  inputArea: { minHeight: 80, padding: Spacing[3], borderRadius: BorderRadius.lg, fontSize: FontSize.base, textAlignVertical: 'top' },
  linkOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginTop: Spacing[3] },
  linkBadge: { paddingHorizontal: Spacing[3], paddingVertical: 6, borderRadius: BorderRadius.lg },
  linkBadgeText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  formActions: { flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[4] },
  formBtn: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.xl, alignItems: 'center' },
  formBtnText: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
  floatingActionArea: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing[6], alignItems: 'center' },
  fab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2], width: '100%', maxWidth: 400, paddingVertical: Spacing[4], borderRadius: BorderRadius.xl, elevation: 5, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  fabText: { fontSize: FontSize.lg, fontFamily: FontFamily.semiBold },
});
