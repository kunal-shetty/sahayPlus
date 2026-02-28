import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { useSahay } from '../../lib/sahay-context';
import { Medication } from '../../lib/types';
import { ChevronLeft, Calendar, Pill } from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function MedicationHistory({ onClose }: { onClose: () => void }) {
  const { data } = useSahay();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const getMedicationStats = (med: Medication) => {
    const events = data.timeline.filter((e) => e.medicationId === med.id && e.type === 'medication_taken');
    const lastTaken = events[events.length - 1]?.timestamp;
    const daysAgo = lastTaken ? Math.floor((Date.now() - new Date(lastTaken).getTime()) / (1000 * 60 * 60 * 24)) : null;

    return {
      totalTaken: med.totalTaken || 0,
      streak: med.streak || 0,
      lastTaken: lastTaken ? new Date(lastTaken) : null,
      daysAgo,
      adherenceRate: data.dayClosures.length > 0 ? Math.round(((med.totalTaken || 0) / data.dayClosures.length) * 100) : 0,
    };
  };

  const getRecentEvents = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return data.timeline
      .filter((e) => new Date(e.timestamp) > sevenDaysAgo)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15);
  };

  const recentEvents = getRecentEvents();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeInUp.duration(300)} style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[6]), borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: colors.secondary }]} activeOpacity={0.8}>
            <ChevronLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Medication History</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Performance & adherence tracking</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing[8]) }]}>
        
        <Animated.View entering={FadeInUp.delay(100)} style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Days</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{data.totalDaysTracked}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.success + '40' }]}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Current Streak</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>🔥 {data.currentStreak}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Best Streak</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{data.longestStreak}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Pill size={20} color={colors.sage} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Medication Performance</Text>
          </View>

          <View style={styles.list}>
            {data.medications.map((med, idx) => {
              const stats = getMedicationStats(med);
              return (
                <Animated.View key={med.id} entering={FadeInLeft.delay(250 + idx * 50)} style={[styles.medCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.medHeader}>
                    <View>
                      <Text style={[styles.medName, { color: colors.foreground }]}>{med.name}</Text>
                      <Text style={[styles.medDosage, { color: colors.mutedForeground }]}>{med.dosage}</Text>
                    </View>
                    {stats.streak > 0 && (
                      <View style={[styles.streakBadge, { backgroundColor: colors.success + '20' }]}>
                        <Text style={[styles.streakText, { color: colors.success }]}>🔥 {stats.streak}d</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.adherenceContainer}>
                    <View style={styles.adherenceRow}>
                      <Text style={[styles.adherenceLabel, { color: colors.mutedForeground }]}>Adherence</Text>
                      <Text style={[styles.adherenceValue, { color: colors.foreground }]}>{stats.adherenceRate}%</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: colors.secondary }]}>
                      <View style={[styles.progressBarFill, { backgroundColor: colors.success, width: `${stats.adherenceRate}%` }]} />
                    </View>
                  </View>

                  <View style={styles.medStatsRow}>
                    <View style={[styles.medStatBox, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.medStatLabel, { color: colors.mutedForeground }]}>Total Taken</Text>
                      <Text style={[styles.medStatValue, { color: colors.foreground }]}>{stats.totalTaken}</Text>
                    </View>
                    <View style={[styles.medStatBox, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.medStatLabel, { color: colors.mutedForeground }]}>Last Taken</Text>
                      <Text style={[styles.medStatValue, { color: colors.foreground }]}>
                        {stats.lastTaken ? (stats.daysAgo === 0 ? 'Today' : stats.daysAgo === 1 ? 'Yesterday' : `${stats.daysAgo}d ago`) : 'Never'}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Calendar size={20} color={colors.sage} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity (Last 7 Days)</Text>
          </View>

          <View style={styles.list}>
            {recentEvents.length > 0 ? (
              recentEvents.map((event, idx) => (
                <Animated.View key={event.id} entering={FadeInLeft.delay(350 + idx * 50)} style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityTitle, { color: colors.foreground }]}>
                      {event.medicationName || event.type.replace(/_/g, ' ')}
                    </Text>
                    <Text style={[styles.activityTime, { color: colors.mutedForeground }]}>
                      {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={[styles.activityBadge, { backgroundColor: event.type === 'medication_taken' ? colors.success + '20' : colors.pending + '20' }]}>
                    <Text style={[styles.activityBadgeText, { color: event.type === 'medication_taken' ? colors.success : colors.pending }]}>
                      {event.type === 'medication_taken' ? '✓ Taken' : event.type.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No recent activity</Text>
              </View>
            )}
          </View>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing[6], paddingBottom: Spacing[4], borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4] },
  backButton: { width: 40, height: 40, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize['2xl'], fontFamily: FontFamily.semiBold },
  subtitle: { fontSize: FontSize.base },
  content: { padding: Spacing[6] },
  statsGrid: { flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[6] },
  statBox: { flex: 1, padding: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 2, alignItems: 'center' },
  statLabel: { fontSize: FontSize.sm, marginBottom: Spacing[2] },
  statValue: { fontSize: FontSize['2xl'], fontFamily: FontFamily.bold },
  section: { marginBottom: Spacing[8] },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[4] },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.semiBold },
  list: { gap: Spacing[3] },
  medCard: { padding: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 2 },
  medHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing[3] },
  medName: { fontSize: FontSize.base, fontFamily: FontFamily.semiBold },
  medDosage: { fontSize: FontSize.sm },
  streakBadge: { paddingHorizontal: Spacing[2], paddingVertical: 4, borderRadius: BorderRadius.full },
  streakText: { fontSize: FontSize.xs, fontFamily: FontFamily.bold },
  adherenceContainer: { marginBottom: Spacing[2] },
  adherenceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  adherenceLabel: { fontSize: FontSize.xs },
  adherenceValue: { fontSize: FontSize.xs, fontFamily: FontFamily.semiBold },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  medStatsRow: { flexDirection: 'row', gap: Spacing[2] },
  medStatBox: { flex: 1, padding: Spacing[2], borderRadius: BorderRadius.lg },
  medStatLabel: { fontSize: FontSize.xs },
  medStatValue: { fontSize: FontSize.sm, fontFamily: FontFamily.bold },
  activityCard: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: Spacing[3], borderRadius: BorderRadius.xl, borderWidth: 2 },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  activityTime: { fontSize: FontSize.xs, marginTop: 4 },
  activityBadge: { paddingHorizontal: Spacing[2], paddingVertical: 4, borderRadius: BorderRadius.full },
  activityBadgeText: { fontSize: FontSize.xs, fontFamily: FontFamily.semiBold },
  emptyState: { paddingVertical: Spacing[8], alignItems: 'center' },
  emptyText: { fontSize: FontSize.base },
});
