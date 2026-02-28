import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart3, TrendingUp, Calendar, Target } from 'lucide-react-native';
import { useSahay } from '../../lib/sahay-context';
import { useThemeColors, FontFamily, FontSize, Spacing, BorderRadius } from '../../theme';
import { Card, CardContent } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Extras';

const { width } = Dimensions.get('window');

export function ActivityScreen() {
  const { data, getWeeklyAdherence } = useSahay();
  const colors = useThemeColors();
  const weekly = getWeeklyAdherence();

  const maxTotal = Math.max(...weekly.map((d) => d.total), 1);

  const overallAdherence = useMemo(() => {
    const totalTaken = weekly.reduce((sum, d) => sum + d.taken, 0);
    const totalMeds = weekly.reduce((sum, d) => sum + d.total, 0);
    return totalMeds > 0 ? Math.round((totalTaken / totalMeds) * 100) : 0;
  }, [weekly]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <BarChart3 color={colors.primary} size={22} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Activity</Text>
      </View>

      {/* Overall Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <CardContent style={{ paddingTop: Spacing[4], alignItems: 'center' }}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{overallAdherence}%</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>This Week</Text>
          </CardContent>
        </Card>
        <Card style={styles.statCard}>
          <CardContent style={{ paddingTop: Spacing[4], alignItems: 'center' }}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{data.currentStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Day Streak</Text>
          </CardContent>
        </Card>
        <Card style={styles.statCard}>
          <CardContent style={{ paddingTop: Spacing[4], alignItems: 'center' }}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{data.totalDaysTracked}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Days Tracked</Text>
          </CardContent>
        </Card>
      </View>

      {/* Weekly Chart */}
      <Card style={{ marginBottom: Spacing[4] }}>
        <CardContent style={{ paddingTop: Spacing[4] }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Weekly Adherence</Text>
          <View style={styles.chart}>
            {weekly.map((day, i) => {
              const pct = day.total > 0 ? (day.taken / day.total) * 100 : 0;
              return (
                <View key={i} style={styles.barContainer}>
                  <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
                    <View style={[styles.barFill, { height: `${pct}%`, backgroundColor: pct === 100 ? colors.success : colors.primary }]} />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{day.day}</Text>
                  <Text style={[styles.barValue, { color: colors.foreground }]}>{day.taken}/{day.total}</Text>
                </View>
              );
            })}
          </View>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent style={{ paddingTop: Spacing[4] }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Timeline</Text>
          {data.timeline.slice(-10).reverse().map((event) => (
            <View key={event.id} style={[styles.timelineItem, { borderLeftColor: colors.primary + '40' }]}>
              <Text style={[styles.timelineText, { color: colors.foreground }]}>
                {event.note || `${event.type.replace(/_/g, ' ')}${event.medicationName ? `: ${event.medicationName}` : ''}`}
              </Text>
              <Text style={[styles.timelineTime, { color: colors.mutedForeground }]}>
                {new Date(event.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}
          {data.timeline.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No activity yet</Text>
          )}
        </CardContent>
      </Card>
      <View style={{ height: Spacing[24] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing[4], paddingTop: Spacing[14] },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[5] },
  headerTitle: { fontSize: FontSize['2xl'], fontFamily: FontFamily.bold },
  statsRow: { flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[4] },
  statCard: { flex: 1 },
  statNumber: { fontSize: FontSize['2xl'], fontFamily: FontFamily.bold },
  statLabel: { fontSize: FontSize.xs, fontFamily: FontFamily.medium, marginTop: Spacing[1] },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.semiBold, marginBottom: Spacing[4] },
  chart: { flexDirection: 'row', justifyContent: 'space-between', height: 120, alignItems: 'flex-end' },
  barContainer: { alignItems: 'center', flex: 1, gap: Spacing[1] },
  barBg: { width: 20, height: 80, borderRadius: BorderRadius.sm, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: BorderRadius.sm },
  barLabel: { fontSize: 10, fontFamily: FontFamily.medium },
  barValue: { fontSize: 10, fontFamily: FontFamily.semiBold },
  timelineItem: { borderLeftWidth: 2, paddingLeft: Spacing[3], paddingVertical: Spacing[2], marginBottom: Spacing[1] },
  timelineText: { fontSize: FontSize.sm, fontFamily: FontFamily.regular },
  timelineTime: { fontSize: FontSize.xs, fontFamily: FontFamily.regular, marginTop: 2 },
  emptyText: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, textAlign: 'center', paddingVertical: Spacing[4] },
});
