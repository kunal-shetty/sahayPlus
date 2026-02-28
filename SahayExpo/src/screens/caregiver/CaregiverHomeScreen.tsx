import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
  Dimensions, Alert, TextInput, Modal, Switch,
} from 'react-native';
import {
  Sun, Cloud, Moon, Check, X, Plus, ChevronDown, ChevronUp,
  Pill, Heart, Clock, AlertTriangle, Flame, MoreHorizontal,
  FileText, Settings, LogOut, ChevronRight, Edit3, Trash2,
} from 'lucide-react-native';
import { useSahay } from '../../lib/sahay-context';
import {
  type TimeOfDay, type Medication,
  timeOfDayLabels, getCurrentTimeOfDay, calculateConfidence, getConfidenceMessage,
} from '../../lib/types';
import { useThemeColors, FontFamily, FontSize, Spacing, BorderRadius } from '../../theme';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, Separator, Progress } from '../../components/ui/Extras';

const { width } = Dimensions.get('window');

function MedicationCard({ med, onTaken, onSkip }: { med: Medication; onTaken: () => void; onSkip: () => void }) {
  const colors = useThemeColors();
  const pillColorMap: Record<string, string> = {
    white: '#e8e8e8', blue: '#60a5fa', pink: '#f472b6',
    yellow: '#fbbf24', orange: '#fb923c', green: '#4ade80', red: '#f87171',
  };

  return (
    <View style={[styles.medCard, { backgroundColor: colors.card, borderColor: med.taken ? colors.success + '40' : colors.border }]}>
      <View style={styles.medRow}>
        <View style={[styles.pillDot, { backgroundColor: pillColorMap[med.color || 'white'] || '#e8e8e8' }]} />
        <View style={styles.medInfo}>
          <Text style={[styles.medName, { color: colors.foreground }]}>{med.name}</Text>
          <Text style={[styles.medDosage, { color: colors.mutedForeground }]}>{med.dosage}</Text>
          {med.notes ? <Text style={[styles.medNotes, { color: colors.mutedForeground }]}>{med.notes}</Text> : null}
        </View>
        <View style={styles.medActions}>
          {med.taken ? (
            <View style={[styles.takenBadge, { backgroundColor: colors.success + '15' }]}>
              <Check color={colors.success} size={16} strokeWidth={2.5} />
              <Text style={[styles.takenText, { color: colors.success }]}>Taken</Text>
            </View>
          ) : (
            <View style={styles.actionBtns}>
              <TouchableOpacity onPress={onTaken} style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}>
                <Check color={colors.primary} size={18} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onSkip} style={[styles.actionBtn, { backgroundColor: colors.destructive + '10' }]}>
                <X color={colors.destructive} size={18} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      {med.refillDaysLeft !== undefined && med.refillDaysLeft <= 7 && (
        <View style={[styles.refillWarning, { backgroundColor: colors.warning + '10' }]}>
          <AlertTriangle color={colors.warning} size={14} />
          <Text style={[styles.refillText, { color: colors.warning }]}>Refill in {med.refillDaysLeft} days</Text>
        </View>
      )}
      {med.simpleExplanation ? (
        <Text style={[styles.explanation, { color: colors.mutedForeground }]}>{med.simpleExplanation}</Text>
      ) : null}
    </View>
  );
}

export function CaregiverHomeScreen() {
  const {
    data, isDataLoading, user, markMedicationTaken, closeDay, isDayClosed,
    getSuggestedCheckIn, dismissCheckInSuggestion, logout,
    addMedication, removeMedication, getUnreadCount,
  } = useSahay();
  const colors = useThemeColors();
  const [expandedTime, setExpandedTime] = useState<TimeOfDay | null>(getCurrentTimeOfDay());
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Add med form
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newTime, setNewTime] = useState<TimeOfDay>('morning');
  const [newNotes, setNewNotes] = useState('');

  const confidence = useMemo(
    () => calculateConfidence(data.timeline, data.dayClosures),
    [data.timeline, data.dayClosures]
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const timeGroups: TimeOfDay[] = ['morning', 'afternoon', 'evening'];
  const timeIcons: Record<TimeOfDay, any> = {
    morning: Sun, afternoon: Cloud, evening: Moon,
  };

  const totalMeds = data.medications.length;
  const takenMeds = data.medications.filter((m) => m.taken).length;
  const progress = totalMeds > 0 ? (takenMeds / totalMeds) * 100 : 0;
  const checkInSuggestion = getSuggestedCheckIn();
  const dayClosed = isDayClosed();
  const unread = getUnreadCount();

  const handleAddMed = () => {
    if (!newName.trim() || !newDosage.trim()) return;
    addMedication({ name: newName.trim(), dosage: newDosage.trim(), timeOfDay: newTime, notes: newNotes.trim() || undefined });
    setNewName(''); setNewDosage(''); setNewTime('morning'); setNewNotes('');
    setShowAddModal(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {getGreeting()}, {data.caregiver?.name || user?.name || 'there'}
            </Text>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Today's Care</Text>
          </View>
          <TouchableOpacity
            onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
              { text: 'Cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: logout },
            ])}
            style={[styles.settingsBtn, { backgroundColor: colors.muted }]}
          >
            <Settings color={colors.mutedForeground} size={20} />
          </TouchableOpacity>
        </View>

        {/* Confidence */}
        <View style={[styles.confidenceBar, { backgroundColor: colors.primary + '10' }]}>
          <Heart color={colors.primary} size={16} />
          <Text style={[styles.confidenceText, { color: colors.primary }]}>
            {getConfidenceMessage(confidence)}
          </Text>
        </View>

        {/* Check-in suggestion */}
        {checkInSuggestion && (
          <TouchableOpacity
            onPress={dismissCheckInSuggestion}
            style={[styles.checkInBanner, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}
          >
            <Text style={[styles.checkInText, { color: colors.accent }]}>{checkInSuggestion}</Text>
          </TouchableOpacity>
        )}

        {/* Progress */}
        <Card style={{ marginBottom: Spacing[4] }}>
          <CardContent style={{ paddingTop: Spacing[4] }}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.foreground }]}>
                {takenMeds}/{totalMeds} medications taken
              </Text>
              {data.currentStreak > 0 && (
                <View style={styles.streakBadge}>
                  <Flame color={colors.accent} size={14} />
                  <Text style={[styles.streakText, { color: colors.accent }]}>{data.currentStreak}</Text>
                </View>
              )}
            </View>
            <Progress value={takenMeds} max={totalMeds} style={{ marginTop: Spacing[2] }} />
          </CardContent>
        </Card>

        {/* Medication Groups */}
        {timeGroups.map((time) => {
          const meds = data.medications.filter((m) => m.timeOfDay === time);
          if (meds.length === 0) return null;
          const Icon = timeIcons[time];
          const isExpanded = expandedTime === time;
          const groupTaken = meds.filter((m) => m.taken).length;

          return (
            <View key={time} style={{ marginBottom: Spacing[3] }}>
              <TouchableOpacity
                onPress={() => setExpandedTime(isExpanded ? null : time)}
                style={[styles.timeHeader, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.7}
              >
                <View style={styles.timeHeaderLeft}>
                  <Icon color={colors.primary} size={20} />
                  <Text style={[styles.timeLabel, { color: colors.foreground }]}>{timeOfDayLabels[time]}</Text>
                  <Badge label={`${groupTaken}/${meds.length}`} variant={groupTaken === meds.length ? 'success' : 'default'} />
                </View>
                {isExpanded ? <ChevronUp color={colors.mutedForeground} size={18} /> : <ChevronDown color={colors.mutedForeground} size={18} />}
              </TouchableOpacity>

              {isExpanded && meds.map((med) => (
                <MedicationCard
                  key={med.id}
                  med={med}
                  onTaken={() => markMedicationTaken(med.id, true)}
                  onSkip={() => markMedicationTaken(med.id, false)}
                />
              ))}
            </View>
          );
        })}

        {/* Close Day button */}
        {totalMeds > 0 && !dayClosed && (
          <Button
            title={`Close Day (${takenMeds}/${totalMeds} taken)`}
            onPress={() => Alert.alert('Close Day', `Close today with ${takenMeds}/${totalMeds} taken?`, [
              { text: 'Cancel' },
              { text: 'Close Day', onPress: closeDay },
            ])}
            variant="outline"
            fullWidth
            style={{ marginTop: Spacing[4] }}
          />
        )}

        {dayClosed && (
          <View style={[styles.closedBanner, { backgroundColor: colors.success + '10' }]}>
            <Check color={colors.success} size={20} />
            <Text style={[styles.closedText, { color: colors.success }]}>Day closed ✓</Text>
          </View>
        )}

        {/* Add Medication FAB area */}
        <View style={{ height: Spacing[24] }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
      >
        <Plus color={colors.primaryForeground} size={24} />
      </TouchableOpacity>

      {/* Add Medication Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Medication</Text>

            <TextInput
              placeholder="Medication name"
              value={newName}
              onChangeText={setNewName}
              style={[styles.modalInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
              placeholderTextColor={colors.mutedForeground}
            />
            <TextInput
              placeholder="Dosage (e.g. 500mg)"
              value={newDosage}
              onChangeText={setNewDosage}
              style={[styles.modalInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
              placeholderTextColor={colors.mutedForeground}
            />

            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Time of Day</Text>
            <View style={styles.timePickerRow}>
              {timeGroups.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setNewTime(t)}
                  style={[styles.timePill, {
                    backgroundColor: newTime === t ? colors.primary : colors.muted,
                  }]}
                >
                  <Text style={{ color: newTime === t ? colors.primaryForeground : colors.foreground, fontFamily: FontFamily.medium, fontSize: FontSize.sm }}>
                    {timeOfDayLabels[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Notes (optional)"
              value={newNotes}
              onChangeText={setNewNotes}
              style={[styles.modalInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
              placeholderTextColor={colors.mutedForeground}
              multiline
            />

            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setShowAddModal(false)} variant="ghost" />
              <Button title="Add" onPress={handleAddMed} disabled={!newName.trim() || !newDosage.trim()} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing[4], paddingTop: Spacing[14] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing[4] },
  greeting: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, marginBottom: Spacing[1] },
  headerTitle: { fontSize: FontSize['2xl'], fontFamily: FontFamily.bold },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  confidenceBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], padding: Spacing[3], borderRadius: BorderRadius.lg, marginBottom: Spacing[4] },
  confidenceText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  checkInBanner: { padding: Spacing[3], borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing[4] },
  checkInText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, textAlign: 'center' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: FontSize.base, fontFamily: FontFamily.semiBold },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakText: { fontSize: FontSize.sm, fontFamily: FontFamily.bold },
  timeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing[3], borderRadius: BorderRadius.lg, borderWidth: 1 },
  timeHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  timeLabel: { fontSize: FontSize.base, fontFamily: FontFamily.semiBold },
  medCard: { marginTop: Spacing[2], padding: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 1, marginHorizontal: Spacing[1] },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  pillDot: { width: 14, height: 14, borderRadius: 7 },
  medInfo: { flex: 1 },
  medName: { fontSize: FontSize.base, fontFamily: FontFamily.semiBold },
  medDosage: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, marginTop: 2 },
  medNotes: { fontSize: FontSize.xs, fontFamily: FontFamily.regular, marginTop: 2, fontStyle: 'italic' },
  medActions: { alignItems: 'flex-end' },
  takenBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: BorderRadius.full },
  takenText: { fontSize: FontSize.xs, fontFamily: FontFamily.semiBold },
  actionBtns: { flexDirection: 'row', gap: Spacing[2] },
  actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  refillWarning: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5], marginTop: Spacing[2], padding: Spacing[2], borderRadius: BorderRadius.md },
  refillText: { fontSize: FontSize.xs, fontFamily: FontFamily.medium },
  explanation: { fontSize: FontSize.xs, fontFamily: FontFamily.regular, marginTop: Spacing[2], fontStyle: 'italic' },
  closedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2], padding: Spacing[4], borderRadius: BorderRadius.lg, marginTop: Spacing[4] },
  closedText: { fontSize: FontSize.base, fontFamily: FontFamily.semiBold },
  fab: { position: 'absolute', bottom: Spacing[24], right: Spacing[5], width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { borderTopLeftRadius: BorderRadius['3xl'], borderTopRightRadius: BorderRadius['3xl'], padding: Spacing[6], paddingBottom: Spacing[10] },
  modalTitle: { fontSize: FontSize.xl, fontFamily: FontFamily.bold, marginBottom: Spacing[4] },
  modalInput: { borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing[3], fontSize: FontSize.base, fontFamily: FontFamily.regular, marginBottom: Spacing[3] },
  modalLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, marginBottom: Spacing[2] },
  timePickerRow: { flexDirection: 'row', gap: Spacing[2], marginBottom: Spacing[3] },
  timePill: { paddingVertical: Spacing[2], paddingHorizontal: Spacing[4], borderRadius: BorderRadius.full },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing[3], marginTop: Spacing[2] },
});
