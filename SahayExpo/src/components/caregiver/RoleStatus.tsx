import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSahay } from '../../lib/sahay-context';
import { CareRoleStatus, TimeOfDay, timeOfDayLabels } from '../../lib/types';
import { User, Calendar, Sun, Cloud, Moon, ArrowLeft, Check, Minus, Plus } from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function RoleStatus({ onClose }: { onClose: () => void }) {
  const { data, updateCaregiverStatus, setCareReceiverIndependence } = useSahay();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [awayDays, setAwayDays] = useState(1);

  const currentStatus = data.caregiver?.roleStatus || 'active';
  const independentTimes = data.careReceiver?.independentTimes || [];

  const handleStatusChange = (status: CareRoleStatus) => {
    if (status === 'away') {
      const awayUntil = new Date();
      awayUntil.setDate(awayUntil.getDate() + awayDays);
      updateCaregiverStatus(status, awayUntil.toISOString());
    } else {
      updateCaregiverStatus(status, undefined);
    }
  };

  const toggleIndependentTime = (time: TimeOfDay) => {
    if (independentTimes.includes(time)) {
      setCareReceiverIndependence(independentTimes.filter((t) => t !== time));
    } else {
      setCareReceiverIndependence([...independentTimes, time]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[6]), borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: colors.secondary }]} activeOpacity={0.8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Care Roles</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Adjust how care responsibilities are shared</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing[8]) }]}>
        
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <User size={20} color={colors.mutedForeground} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Status</Text>
          </View>

          <View style={styles.cardsSpace}>
            <TouchableOpacity
              onPress={() => handleStatusChange('active')}
              style={[
                styles.statusCard,
                { 
                  backgroundColor: currentStatus === 'active' ? colors.sage + '20' : colors.card,
                  borderColor: currentStatus === 'active' ? colors.sage : colors.border
                }
              ]}
              activeOpacity={0.8}
            >
              <View style={styles.statusRow}>
                <View>
                  <Text style={[styles.statusTitle, { color: colors.foreground }]}>Actively caring</Text>
                  <Text style={[styles.statusDesc, { color: colors.mutedForeground }]}>You're managing care as usual</Text>
                </View>
                {currentStatus === 'active' && <Check size={20} color={colors.sage} />}
              </View>
            </TouchableOpacity>

            <View style={[
              styles.statusCard,
              { 
                backgroundColor: currentStatus === 'away' ? colors.pending + '15' : colors.card,
                borderColor: currentStatus === 'away' ? colors.pending : colors.border
              }
            ]}>
              <View style={styles.statusRow}>
                <View>
                  <Text style={[styles.statusTitle, { color: colors.foreground }]}>Temporarily away</Text>
                  <Text style={[styles.statusDesc, { color: colors.mutedForeground }]}>Check-in suggestions will pause</Text>
                </View>
                {currentStatus === 'away' && <Check size={20} color={colors.pending} />}
              </View>

              <View style={styles.awayDaysRow}>
                <Calendar size={20} color={colors.mutedForeground} />
                <View style={styles.stepperContainer}>
                  <TouchableOpacity 
                    onPress={() => setAwayDays(Math.max(1, awayDays - 1))}
                    style={[styles.stepperBtn, { backgroundColor: colors.secondary }]}
                  >
                    <Minus size={16} color={colors.foreground} />
                  </TouchableOpacity>
                  <Text style={[styles.daysText, { color: colors.foreground }]}>{awayDays} day{awayDays > 1 ? 's' : ''}</Text>
                  <TouchableOpacity 
                    onPress={() => setAwayDays(Math.min(14, awayDays + 1))}
                    style={[styles.stepperBtn, { backgroundColor: colors.secondary }]}
                  >
                    <Plus size={16} color={colors.foreground} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleStatusChange('away')}
                style={[styles.applyButton, { backgroundColor: colors.secondary }]}
              >
                <Text style={[styles.applyButtonText, { color: colors.foreground }]}>Mark as away for {awayDays} day{awayDays > 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Sun size={20} color={colors.mutedForeground} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{data.careReceiver?.name || 'Care Receiver'}'s Independence</Text>
          </View>
          <Text style={[styles.introText, { color: colors.mutedForeground }]}>Select times when they manage medications on their own</Text>

          <View style={styles.cardsSpace}>
            {(['morning', 'afternoon', 'evening'] as TimeOfDay[]).map((time) => {
              const Icon = time === 'morning' ? Sun : time === 'afternoon' ? Cloud : Moon;
              const isIndependent = independentTimes.includes(time);

              return (
                <TouchableOpacity
                  key={time}
                  onPress={() => toggleIndependentTime(time)}
                  style={[
                    styles.statusCard,
                    {
                      backgroundColor: isIndependent ? colors.blue + '15' : colors.card,
                      borderColor: isIndependent ? colors.blue : colors.border
                    }
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.statusRow}>
                    <View style={styles.timeIconWrap}>
                      <Icon size={20} color={isIndependent ? colors.blue : colors.mutedForeground} />
                      <View>
                        <Text style={[styles.statusTitle, { color: colors.foreground }]}>{timeOfDayLabels[time]}</Text>
                        <Text style={[styles.statusDesc, { color: colors.mutedForeground }]}>
                          {isIndependent ? 'Managing independently' : 'May need support'}
                        </Text>
                      </View>
                    </View>
                    {isIndependent && <Check size={20} color={colors.blue} />}
                  </View>
                </TouchableOpacity>
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
  header: { paddingHorizontal: Spacing[6], paddingBottom: Spacing[4], borderBottomWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4] },
  backButton: { width: 48, height: 48, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize['2xl'], fontFamily: FontFamily.semiBold },
  subtitle: { fontSize: FontSize.base },
  content: { padding: Spacing[6] },
  section: { marginBottom: Spacing[8] },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[4] },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.medium },
  cardsSpace: { gap: Spacing[3] },
  introText: { fontSize: FontSize.base, marginBottom: Spacing[4], marginTop: -8 },
  statusCard: { padding: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.medium },
  statusDesc: { fontSize: FontSize.base },
  awayDaysRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4], marginTop: Spacing[4] },
  stepperContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[4] },
  stepperBtn: { width: 40, height: 40, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  daysText: { fontSize: FontSize.lg, fontFamily: FontFamily.medium, minWidth: 60, textAlign: 'center' },
  applyButton: { marginTop: Spacing[4], width: '100%', paddingVertical: 12, borderRadius: BorderRadius.xl, alignItems: 'center' },
  applyButtonText: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
  timeIconWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
});
