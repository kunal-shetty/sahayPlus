import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSahay } from '../../lib/sahay-context';
import { calculateConfidence, getConfidenceMessage } from '../../lib/types';
import { ArrowLeft, TrendingUp, Calendar, Award, Pill } from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function AnalyticsDashboard({ onClose }: { onClose: () => void }) {
  const { data, getWeeklyAdherence, getMedicationStats } = useSahay();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const weeklyData = getWeeklyAdherence();
  const confidence = calculateConfidence(data.timeline, data.dayClosures);
  const confidenceMessage = getConfidenceMessage(confidence);

  const totalTaken = weeklyData.reduce((sum, d) => sum + d.taken, 0);
  const totalPossible = weeklyData.reduce((sum, d) => sum + d.total, 0);
  const adherencePercent = totalPossible > 0 ? Math.round((totalTaken / totalPossible) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[6]) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: colors.secondary }]} activeOpacity={0.8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Care Insights</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>How things are going</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing[8]) }]}>
        
        <View style={[styles.confidenceCard, { backgroundColor: colors.sage + '15' }]}>
          <View style={styles.confidenceRow}>
            <View style={[styles.confidenceIconBox, { backgroundColor: colors.sage + '30' }]}>
              <TrendingUp size={20} color={colors.sage} />
            </View>
            <View>
              <Text style={[styles.confidenceLabel, { color: colors.sage }]}>CARE CONFIDENCE</Text>
              <Text style={[styles.confidenceTitle, { color: colors.foreground }]}>{confidenceMessage}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Calendar size={20} color={colors.blue} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>This Week</Text>
          </View>
          
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.chartContainer}>
              {weeklyData.map((day, i) => {
                const percent = day.total > 0 ? (day.taken / day.total) * 100 : 0;
                return (
                  <View key={i} style={styles.barCol}>
                    <View style={[styles.barBg, { backgroundColor: colors.secondary }]}>
                      <View style={[styles.barFill, { backgroundColor: colors.sage, height: `${percent}%` }]} />
                    </View>
                    <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{day.day}</Text>
                  </View>
                );
              })}
            </View>

            <View style={[styles.chartSummaryRow, { borderTopColor: colors.border }]}>
              <View>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Weekly adherence</Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>{adherencePercent}%</Text>
              </View>
              <View style={styles.summaryAlignRight}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Doses taken</Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>{totalTaken}/{totalPossible}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Award size={20} color={colors.warning} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Streaks</Text>
          </View>
          
          <View style={styles.streaksGrid}>
            <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>Current streak</Text>
              <Text style={[styles.streakValue, { color: colors.sage }]}>{data.currentStreak || 0}</Text>
              <Text style={[styles.streakSub, { color: colors.mutedForeground }]}>days</Text>
            </View>
            <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>Longest streak</Text>
              <Text style={[styles.streakValue, { color: colors.blue }]}>{data.longestStreak || 0}</Text>
              <Text style={[styles.streakSub, { color: colors.mutedForeground }]}>days</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Pill size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Medication Details</Text>
          </View>
          
          <View style={styles.list}>
            {data.medications.map((med) => {
              const stats = getMedicationStats(med.id);
              // Note: the original code checks if med.color was one of specific strings and applies tailwind classes.
              // In this port, we don't have med.color (it's not even in the type). We'll fallback to transparent.

              return (
                <View key={med.id} style={[styles.medCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.medHeaderRow}>
                    <View>
                      <Text style={[styles.medTitle, { color: colors.foreground }]}>{med.name}</Text>
                      <Text style={[styles.medSubtitle, { color: colors.mutedForeground }]}>{med.dosage}</Text>
                    </View>
                  </View>
                  <View style={styles.medStatsRow}>
                    <View style={styles.medStatTextWrap}>
                      <Text style={[styles.medStatLabel, { color: colors.mutedForeground }]}>Streak: </Text>
                      <Text style={[styles.medStatValue, { color: colors.sage }]}>{stats.streak} days</Text>
                    </View>
                    <View style={styles.medStatTextWrap}>
                      <Text style={[styles.medStatLabel, { color: colors.mutedForeground }]}>Total: </Text>
                      <Text style={[styles.medStatValue, { color: colors.foreground }]}>{stats.total} doses</Text>
                    </View>
                    {med.refillDaysLeft !== undefined && med.refillDaysLeft <= 7 && (
                      <Text style={[styles.medRefillWarning, { color: colors.pending }]}>Refill soon</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing[6], paddingBottom: Spacing[4] },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4] },
  backButton: { width: 48, height: 48, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize['2xl'], fontFamily: FontFamily.semiBold },
  subtitle: { fontSize: FontSize.base },
  content: { padding: Spacing[6] },
  confidenceCard: { padding: Spacing[6], borderRadius: BorderRadius['2xl'], marginBottom: Spacing[6] },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  confidenceIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  confidenceLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, letterSpacing: 1 },
  confidenceTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.semiBold },
  section: { marginBottom: Spacing[8] },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[4] },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.semiBold },
  card: { padding: Spacing[5], borderRadius: BorderRadius['2xl'], borderWidth: 2 },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, marginBottom: Spacing[4] },
  barCol: { flex: 1, alignItems: 'center', gap: Spacing[2], paddingHorizontal: 2 },
  barBg: { width: '100%', height: 96, borderRadius: BorderRadius.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: BorderRadius.lg },
  barLabel: { fontSize: FontSize.xs, fontFamily: FontFamily.medium },
  chartSummaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Spacing[4], borderTopWidth: 1 },
  summaryAlignRight: { alignItems: 'flex-end' },
  summaryLabel: { fontSize: FontSize.sm, marginBottom: 2 },
  summaryValue: { fontSize: FontSize['2xl'], fontFamily: FontFamily.bold },
  streaksGrid: { flexDirection: 'row', gap: Spacing[4] },
  streakCard: { flex: 1, padding: Spacing[5], borderRadius: BorderRadius['2xl'], borderWidth: 2 },
  streakLabel: { fontSize: FontSize.sm, marginBottom: 4 },
  streakValue: { fontSize: 30, fontFamily: FontFamily.bold },
  streakSub: { fontSize: FontSize.sm },
  list: { gap: Spacing[3] },
  medCard: { padding: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 2 },
  medHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing[2] },
  medTitle: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
  medSubtitle: { fontSize: FontSize.sm },
  medStatsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[5] },
  medStatTextWrap: { flexDirection: 'row', alignItems: 'center' },
  medStatLabel: { fontSize: FontSize.sm },
  medStatValue: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  medRefillWarning: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
});
