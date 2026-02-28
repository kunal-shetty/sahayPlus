import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSahay } from '../../lib/sahay-context';
import { WellnessLevel } from '../../lib/types';
import { ArrowLeft, Smile, Meh, Frown, MessageCircle } from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function WellnessOverview({ onClose }: { onClose: () => void }) {
  const { data, getWellnessTrend, getTodayWellness } = useSahay();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const trend = getWellnessTrend();
  const todayWellness = getTodayWellness();
  const careReceiverName = data.careReceiver?.name || 'Care Receiver';

  const wellnessConfig: Record<WellnessLevel, { Icon: any, label: string, color: string, bg: string }> = {
    great: { Icon: Smile, label: 'Feeling great', color: colors.success, bg: colors.success + '15' },
    okay: { Icon: Meh, label: 'Doing okay', color: colors.pending, bg: colors.pending + '15' },
    notGreat: { Icon: Frown, label: 'Not feeling great', color: colors.destructive, bg: colors.destructive + '15' },
  };

  const wellnessCounts = trend.reduce((acc, entry) => {
    acc[entry.level] = (acc[entry.level] || 0) + 1;
    return acc;
  }, {} as Record<WellnessLevel, number>);

  const mostCommon = Object.entries(wellnessCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as WellnessLevel | undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[6]) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: colors.secondary }]} activeOpacity={0.8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>How {careReceiverName} Feels</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Wellness check-ins</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing[8]) }]}>
        
        {todayWellness ? (
          <View style={[styles.todayCard, { backgroundColor: wellnessConfig[todayWellness.level].bg }]}>
            <Text style={[styles.todayLabel, { color: colors.mutedForeground }]}>TODAY</Text>
            <View style={styles.todayRow}>
              <View style={[styles.todayIconBox, { backgroundColor: wellnessConfig[todayWellness.level].bg }]}>
                {React.createElement(wellnessConfig[todayWellness.level].Icon, { size: 32, color: wellnessConfig[todayWellness.level].color })}
              </View>
              <View style={styles.todayTextWrap}>
                <Text style={[styles.todayTitle, { color: wellnessConfig[todayWellness.level].color }]}>{wellnessConfig[todayWellness.level].label}</Text>
                {todayWellness.note && (
                  <Text style={[styles.todayNote, { color: colors.mutedForeground }]}>"{todayWellness.note}"</Text>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.emptyTodayCard, { backgroundColor: colors.secondary + '80', borderColor: colors.border }]}>
            <Text style={[styles.emptyTodayText, { color: colors.mutedForeground }]}>No wellness check-in today yet</Text>
          </View>
        )}

        {mostCommon && (
          <View style={[styles.weekCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.weekTitle, { color: colors.foreground }]}>This Week</Text>
            <Text style={[styles.weekDesc, { color: colors.mutedForeground }]}>
              {careReceiverName} has mostly been <Text style={{ color: wellnessConfig[mostCommon].color, fontFamily: FontFamily.medium }}>{wellnessConfig[mostCommon].label.toLowerCase()}</Text> this week.
            </Text>
            <View style={styles.weekStatsRow}>
              {(['great', 'okay', 'notGreat'] as WellnessLevel[]).map((level) => {
                const config = wellnessConfig[level];
                const count = wellnessCounts[level] || 0;
                return (
                  <View key={level} style={styles.weekStat}>
                    {React.createElement(config.Icon, { size: 20, color: config.color })}
                    <Text style={[styles.weekStatText, { color: colors.foreground }]}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Check-ins</Text>
          <View style={styles.list}>
            {trend.map((entry) => {
              const config = wellnessConfig[entry.level];
              const date = new Date(entry.timestamp);
              return (
                <View key={entry.id} style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.historyRow}>
                    <View style={[styles.historyIconBox, { backgroundColor: config.bg }]}>
                      {React.createElement(config.Icon, { size: 20, color: config.color })}
                    </View>
                    <View>
                      <Text style={[styles.historyTitle, { color: colors.foreground }]}>{config.label}</Text>
                      <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                  {entry.note && (
                    <View style={[styles.historyNoteArea, { borderTopColor: colors.border }]}>
                      <MessageCircle size={16} color={colors.mutedForeground} style={{ marginTop: 2 }} />
                      <Text style={[styles.historyNoteText, { color: colors.mutedForeground }]}>{entry.note}</Text>
                    </View>
                  )}
                </View>
              );
            })}

            {trend.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No wellness check-ins recorded yet</Text>
              </View>
            )}
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
  todayCard: { padding: Spacing[6], borderRadius: BorderRadius['2xl'], marginBottom: Spacing[6] },
  todayLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, letterSpacing: 1, marginBottom: Spacing[2] },
  todayRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4] },
  todayIconBox: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  todayTextWrap: { flex: 1 },
  todayTitle: { fontSize: FontSize.xl, fontFamily: FontFamily.semiBold },
  todayNote: { fontSize: FontSize.base, marginTop: 4 },
  emptyTodayCard: { padding: Spacing[6], borderRadius: BorderRadius['2xl'], borderWidth: 2, borderStyle: 'dashed', marginBottom: Spacing[6], alignItems: 'center' },
  emptyTodayText: { fontSize: FontSize.base },
  weekCard: { padding: Spacing[5], borderRadius: BorderRadius['2xl'], borderWidth: 2, marginBottom: Spacing[6] },
  weekTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.semiBold, marginBottom: Spacing[3] },
  weekDesc: { fontSize: FontSize.base, lineHeight: 22 },
  weekStatsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4], marginTop: Spacing[4] },
  weekStat: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  weekStatText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  section: { marginBottom: Spacing[6] },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.semiBold, marginBottom: Spacing[4] },
  list: { gap: Spacing[3] },
  historyCard: { padding: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 2 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  historyIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  historyTitle: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
  historyDate: { fontSize: FontSize.sm },
  historyNoteArea: { marginTop: Spacing[3], paddingTop: Spacing[3], borderTopWidth: 1, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[2] },
  historyNoteText: { fontSize: FontSize.sm, flex: 1 },
  emptyState: { paddingVertical: Spacing[8], alignItems: 'center' },
  emptyText: { fontSize: FontSize.base },
});
