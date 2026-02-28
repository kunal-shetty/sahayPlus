import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSahay } from '../../lib/sahay-context';
import { TimelineEvent } from '../../lib/types';
import {
  Check,
  AlertCircle,
  RefreshCw,
  Plus,
  Minus,
  FileText,
  Phone,
  Moon,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CareTimeline({ onClose }: { onClose: () => void }) {
  const { data } = useSahay();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const groupedEvents: Record<string, TimelineEvent[]> = {};

  for (const event of data.timeline) {
    const date = new Date(event.timestamp).toISOString().split('T')[0];
    if (!groupedEvents[date]) {
      groupedEvents[date] = [];
    }
    groupedEvents[date].push(event);
  }

  const sortedDays = Object.keys(groupedEvents).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const getOpacity = (date: string) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffDays = Math.floor(
      (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return 1;
    if (diffDays <= 2) return 0.9;
    if (diffDays <= 5) return 0.7;
    if (diffDays <= 10) return 0.5;
    return 0.4;
  };

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'medication_taken': return Check;
      case 'medication_skipped': return AlertCircle;
      case 'dose_changed': return RefreshCw;
      case 'medication_added': return Plus;
      case 'medication_removed': return Minus;
      case 'refill_noted': return RefreshCw;
      case 'note_added': return FileText;
      case 'check_in': return Phone;
      case 'day_closed': return Moon;
      case 'safety_check_triggered':
      case 'safety_check_dismissed':
      case 'safety_check_escalated':
        return ShieldAlert;
      default: return Check;
    }
  };

  const getEventMessage = (event: TimelineEvent): string => {
    switch (event.type) {
      case 'medication_taken': return `${event.medicationName || 'Medication'} taken`;
      case 'medication_skipped': return `${event.medicationName || 'Medication'} noted as skipped`;
      case 'dose_changed': return `${event.medicationName || 'Medication'} dosage adjusted`;
      case 'medication_added': return `${event.medicationName || 'Medication'} added to routine`;
      case 'medication_removed': return `${event.medicationName || 'Medication'} removed from routine`;
      case 'refill_noted': return `Refill noted for ${event.medicationName || 'medication'}`;
      case 'note_added': return event.note || 'Note added';
      case 'check_in': return 'Check-in completed';
      case 'day_closed': return event.note || "Day's routine completed";
      case 'safety_check_triggered': return 'Safety check started';
      case 'safety_check_dismissed': return 'Confirmed they are okay';
      case 'safety_check_escalated': return 'Safety check escalated - no response';
      default: return 'Activity recorded';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[6]), borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.backButton, { backgroundColor: colors.secondary }]}
          activeOpacity={0.8}
        >
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Care Story</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>A gentle record of your care journey</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing[6]) }]}>
        {sortedDays.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Your care story will appear here</Text>
            <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>Activities are recorded as they happen</Text>
          </View>
        ) : (
          <View style={styles.timelineWrapper}>
            {sortedDays.map((day) => {
              const events = groupedEvents[day];
              const opacity = getOpacity(day);

              return (
                <View key={day} style={{ opacity, marginBottom: Spacing[8] }}>
                  <Text style={[styles.dayHeader, { color: colors.foreground, backgroundColor: colors.background }]}>
                    {formatDate(day)}
                  </Text>

                  <View style={[styles.dayEvents, { borderLeftColor: colors.border }]}>
                    {events
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((event) => {
                        const Icon = getEventIcon(event.type);
                        const isPositive = ['medication_taken', 'day_closed', 'check_in'].includes(event.type);
                        const iconBg = isPositive ? colors.success + '20' : colors.pending + '20';
                        const iconColor = isPositive ? colors.success : colors.pending;

                        return (
                          <View key={event.id} style={styles.eventRow}>
                            <View style={[styles.eventIcon, { backgroundColor: iconBg }]}>
                              <Icon size={16} color={iconColor} />
                            </View>

                            <View style={styles.eventContent}>
                              <Text style={[styles.eventMessage, { color: colors.foreground }]}>
                                {getEventMessage(event)}
                              </Text>
                              
                              <View style={styles.eventTimeRow}>
                                <Text style={[styles.eventTime, { color: colors.mutedForeground }]}>
                                  {formatTime(event.timestamp)}
                                </Text>
                                {event.actor && event.actor !== 'careReceiver' && (
                                  <View style={[styles.actorBadge, { backgroundColor: colors.secondary }]}>
                                    <Text style={[styles.actorBadgeText, { color: colors.mutedForeground }]}>
                                      {event.actor === 'pharmacist' ? 'Pharmacist' : 'Caregiver'}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              
                              {event.note && event.type !== 'day_closed' && (
                                <View style={[styles.noteBox, { backgroundColor: colors.secondary }]}>
                                  <Text style={[styles.noteText, { color: colors.mutedForeground }]}>{event.note}</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingHorizontal: Spacing[6],
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
  title: {
    fontSize: FontSize['2xl'],
    fontFamily: FontFamily.semiBold,
  },
  subtitle: {
    fontSize: FontSize.base,
  },
  content: {
    padding: Spacing[6],
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[12],
  },
  emptyText: {
    fontSize: FontSize.lg,
    marginBottom: Spacing[2],
  },
  emptySubtext: {
    fontSize: FontSize.sm,
  },
  timelineWrapper: {
    paddingTop: Spacing[2],
  },
  dayHeader: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.medium,
    marginBottom: Spacing[4],
  },
  dayEvents: {
    paddingLeft: Spacing[4],
    borderLeftWidth: 2,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
    paddingLeft: Spacing[4],
    marginLeft: -9,
    marginBottom: Spacing[5],
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
  },
  eventContent: {
    flex: 1,
  },
  eventMessage: {
    fontSize: FontSize.base,
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: 4,
  },
  eventTime: {
    fontSize: FontSize.sm,
  },
  actorBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  actorBadgeText: {
    fontSize: FontSize.xs,
  },
  noteBox: {
    marginTop: Spacing[2],
    padding: Spacing[2],
    borderRadius: BorderRadius.lg,
  },
  noteText: {
    fontSize: FontSize.sm,
  },
});
