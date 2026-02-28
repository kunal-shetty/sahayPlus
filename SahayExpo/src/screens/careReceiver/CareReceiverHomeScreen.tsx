import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Animated, { FadeInUp, FadeIn, FadeOut, ZoomIn, useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';
import { Heart, Check, Clock, Sun, Cloud, Moon, Settings, Pill, ArrowLeftRight, Smile, Info } from 'lucide-react-native';
import { useSahay } from '../../lib/sahay-context';
import { Medication, TimeOfDay, timeOfDayLabels, getCurrentTimeOfDay } from '../../lib/types';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WellnessCheckin, QuickMessages, EmergencyCall, SafetyCheckPrompt } from '../../components/careReceiver';
import { CareReceiverHomeSkeleton } from '../../components/skeletons/CareReceiverHomeSkeleton';

export function CareReceiverHomeScreen() {
  const {
    data,
    isLoading,
    isDataLoading,
    markMedicationTaken,
    isDayClosed,
    logout,
    triggerSafetyCheck,
    completeDailyCheckIn,
    requestHelp,
    dismissChangeIndicator,
  } = useSahay();
  
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [confirmedMed, setConfirmedMed] = useState<Medication | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWellness, setShowWellness] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showHelpConfirmed, setShowHelpConfirmed] = useState(false);

  const currentTimeOfDay = getCurrentTimeOfDay();

  const getNextMedication = useCallback((): Medication | null => {
    const pendingMeds = data.medications.filter((m) => !m.taken);
    if (pendingMeds.length === 0) return null;

    const currentTimeMeds = pendingMeds.filter((m) => m.timeOfDay === currentTimeOfDay);
    if (currentTimeMeds.length > 0) return currentTimeMeds[0];

    const timeOrder: TimeOfDay[] = ['morning', 'afternoon', 'evening'];
    for (const time of timeOrder) {
      const timeMeds = pendingMeds.filter((m) => m.timeOfDay === time);
      if (timeMeds.length > 0) return timeMeds[0];
    }
    return pendingMeds[0];
  }, [data.medications, currentTimeOfDay]);

  const nextMed = getNextMedication();
  const allDone = data.medications.length > 0 && data.medications.every((m) => m.taken);
  const dayClosed = isDayClosed();

  const handleTookIt = () => {
    if (nextMed) {
      markMedicationTaken(nextMed.id, true);
      setConfirmedMed(nextMed);
      setShowUndo(true);
    }
  };

  const handleUndo = () => {
    if (confirmedMed) {
      markMedicationTaken(confirmedMed.id, false);
      setConfirmedMed(null);
      setShowUndo(false);
    }
  };

  // Undo progress bar animation
  const undoProgress = useSharedValue(100);
  useEffect(() => {
    if (showUndo) {
      undoProgress.value = 100;
      undoProgress.value = withTiming(0, { duration: 3000 });
      const timer = setTimeout(() => {
        setShowUndo(false);
        setConfirmedMed(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showUndo]);

  const animatedProgressStyle = useAnimatedStyle(() => ({ width: `${undoProgress.value}%` }));

  const timeIcons = { morning: Sun, afternoon: Cloud, evening: Moon };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const isNight = () => {
    const hour = new Date().getHours();
    return hour >= 21 || hour < 6;
  };

  const nightMode = isNight();
  const bgColor = nightMode ? '#0f172a' : colors.background;
  const textColor = nightMode ? '#cbd5e1' : colors.mutedForeground;

  if (isLoading || isDataLoading) return <CareReceiverHomeSkeleton />;
  if (showWellness) return <WellnessCheckin onClose={() => setShowWellness(false)} />;
  if (showMessages) return <QuickMessages onClose={() => setShowMessages(false)} />;
  if (showEmergency) return <EmergencyCall onClose={() => setShowEmergency(false)} />;

  if (showSettings) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.settingsContent}>
          <View style={[styles.settingsIconBox, { backgroundColor: colors.sage + '20' }]}>
            <Heart size={40} color={colors.sage} strokeWidth={1.5} />
          </View>
          <Text style={[styles.settingsTitle, { color: colors.foreground }]}>Sahay+</Text>
          <Text style={[styles.settingsSub, { color: colors.mutedForeground }]}>Gentle medication care</Text>

          <View style={styles.settingsBtns}>
            <TouchableOpacity onPress={() => { triggerSafetyCheck('manual'); setShowSettings(false); }} style={[styles.settingsBtn, { backgroundColor: colors.secondary }]}>
              <Heart size={24} color={colors.sage} />
              <Text style={[styles.settingsBtnText, { color: colors.foreground }]}>Simulate Safety Check</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={logout} style={[styles.settingsBtn, { backgroundColor: colors.secondary }]}>
              <ArrowLeftRight size={24} color={colors.foreground} />
              <Text style={[styles.settingsBtnText, { color: colors.foreground }]}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowSettings(false)} style={[styles.settingsBtn, { backgroundColor: colors.primary, marginTop: Spacing[4] }]}>
              <Text style={[styles.settingsBtnText, { color: colors.primaryForeground, fontWeight: 'bold' }]}>Go back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (showUndo && confirmedMed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.sage + '15' }]}>
        <View style={styles.successContent}>
          <Animated.View entering={ZoomIn.duration(300)} style={[styles.successIconBox, { backgroundColor: colors.success + '20' }]}>
            <Check size={48} color={colors.success} strokeWidth={3} />
          </Animated.View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Noted. Take care.</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>{confirmedMed.name} marked as taken</Text>

          <TouchableOpacity onPress={handleUndo} style={[styles.undoBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.7}>
            <Text style={[styles.undoBtnText, { color: colors.foreground }]}>Undo this</Text>
          </TouchableOpacity>

          <View style={[styles.undoProgressBg, { backgroundColor: colors.sage + '30' }]}>
            <Animated.View style={[styles.undoProgressFill, { backgroundColor: colors.sage }, animatedProgressStyle]} />
          </View>
        </View>
      </View>
    );
  }

  if (dayClosed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.sage + '15' }]}>
        <View style={[styles.headerActions, { paddingTop: Math.max(insets.top, Spacing[6]) }]}>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={[styles.headerIconBtn, { backgroundColor: colors.card + '80' }]}>
            <Settings size={28} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <View style={styles.successContent}>
          <View style={[styles.successIconBox, { backgroundColor: colors.success + '20' }]}>
            <Moon size={48} color={colors.success} strokeWidth={1.5} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>That's everything for today.</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>Rest well. Tomorrow is a fresh start.</Text>
        </View>
      </View>
    );
  }

  if (allDone) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerActions, { paddingTop: Math.max(insets.top, Spacing[6]) }]}>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={[styles.headerIconBtn, { backgroundColor: colors.secondary + '80' }]}>
            <Settings size={28} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <View style={styles.successContent}>
          <View style={[styles.successIconBox, { backgroundColor: colors.sage + '20' }]}>
            <Check size={48} color={colors.sage} strokeWidth={3} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>You're all set for today</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>Everything looks good right now</Text>
        </View>
      </View>
    );
  }

  if (data.medications.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerActions, { paddingTop: Math.max(insets.top, Spacing[6]) }]}>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={[styles.headerIconBtn, { backgroundColor: colors.secondary + '80' }]}>
            <Settings size={28} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <View style={styles.successContent}>
          <View style={[styles.successIconBox, { backgroundColor: colors.blue + '20' }]}>
            <Heart size={40} color={colors.blue} strokeWidth={1.5} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>{getGreeting()}</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>Your caregiver will set up your medications</Text>
        </View>
      </View>
    );
  }

  const TimeIcon = timeIcons[nextMed!.timeOfDay];
  const isFineCheckedIn = data.lastFineCheckIn?.startsWith(new Date().toISOString().split('T')[0]);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {data.lastChangeNotifiedAt && (
        <Animated.View entering={FadeInUp} exiting={FadeOut} style={[styles.changeBanner, { backgroundColor: colors.blue + '15', borderBottomColor: colors.blue + '30' }]}>
          <View style={styles.changeBannerContent}>
            <View style={styles.changeBannerLeft}>
              <Info size={20} color={colors.blue} />
              <Text style={[styles.changeBannerText, { color: colors.blue }]}>Something is a little different today.</Text>
            </View>
            <TouchableOpacity onPress={dismissChangeIndicator}>
              <Text style={[styles.changeBannerBtn, { color: colors.blue }]}>DISMISS</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[6]) }]}>
        <View>
          <Text style={[styles.greetingLabel, { color: textColor }]}>{getGreeting()}</Text>
          <Text style={[styles.nameLabel, { color: nightMode ? '#f8fafc' : colors.foreground }]}>{data.careReceiver?.name || 'Your care'}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowSettings(true)} style={[styles.headerIconBtn, { backgroundColor: nightMode ? '#1e293b' : colors.secondary }]} activeOpacity={0.8}>
          <Settings size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
        {!isFineCheckedIn && (
          <Animated.View entering={ZoomIn}>
            <TouchableOpacity
              onPress={completeDailyCheckIn}
              style={[styles.fineBtn, { backgroundColor: nightMode ? '#1e293b' : colors.sage + '15', borderColor: nightMode ? '#334155' : colors.sage + '30' }]}
              activeOpacity={0.8}
            >
              <View style={[styles.fineIconBox, { backgroundColor: nightMode ? '#334155' : '#fff' }]}>
                <Smile size={24} color={colors.sage} />
              </View>
              <View>
                <Text style={[styles.fineBtnTitle, { color: nightMode ? '#f8fafc' : colors.foreground }]}>I'm fine today</Text>
                <Text style={[styles.fineBtnSub, { color: textColor }]}>Tap to let {data.caregiver?.name} know</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.timeIndicator}>
          <TimeIcon size={24} color={colors.sage} strokeWidth={1.5} />
          <Text style={[styles.timeLabel, { color: textColor }]}>
            {timeOfDayLabels[nextMed!.timeOfDay]}
            {nextMed?.time && ` at ${nextMed.time}`}
          </Text>
        </View>

        <Animated.View entering={FadeInUp.delay(100)} style={[styles.medCard, { backgroundColor: nightMode ? '#1e293b' : colors.card, borderColor: nightMode ? '#334155' : colors.border }]}>
          <Text style={[styles.medName, { color: nightMode ? '#f8fafc' : colors.foreground }]}>{nextMed!.name}</Text>
          {nextMed?.time && (
            <View style={styles.medTimeRow}>
              <Clock size={20} color={colors.blue} strokeWidth={2.5} />
              <Text style={[styles.medTime, { color: colors.blue }]}>{nextMed.time}</Text>
            </View>
          )}
          <Text style={[styles.medDosage, { color: textColor }]}>{nextMed!.dosage}</Text>

          {nextMed!.simpleExplanation && (
            <View style={[styles.divider, { borderTopColor: nightMode ? '#334155' : colors.border }]} />
          )}
          {nextMed!.simpleExplanation && (
            <Text style={[styles.simpleExplain, { color: colors.sage }]}>{nextMed!.simpleExplanation}</Text>
          )}

          {nextMed!.notes && (
            <View style={[styles.divider, { borderTopColor: nightMode ? '#334155' : colors.border }]} />
          )}
          {nextMed!.notes && (
            <Text style={[styles.medNotes, { color: textColor }]}>{nextMed!.notes}</Text>
          )}

          {nextMed!.pharmacistNote && (
            <View style={[styles.medPharmaNote, { borderTopColor: nightMode ? '#334155' : colors.border }]}>
              <View style={styles.pharmaLabelRow}>
                <Pill size={16} color={colors.blue} />
                <Text style={[styles.pharmaLabel, { color: colors.blue }]}>From pharmacist</Text>
              </View>
              <Text style={[styles.pharmaNoteText, { color: textColor }]}>{nextMed!.pharmacistNote}</Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.actionRow}>
          <Animated.View entering={FadeInUp.delay(200)} style={{ flex: 1 }}>
            <TouchableOpacity onPress={handleTookIt} style={[styles.tookItBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} activeOpacity={0.8}>
              <Check size={28} color={colors.primaryForeground} strokeWidth={2.5} />
              <Text style={[styles.tookItText, { color: colors.primaryForeground }]}>I took it</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.quickGrid}>
          <TouchableOpacity onPress={() => setShowWellness(true)} style={[styles.gridBtn, { backgroundColor: nightMode ? '#1e293b' : colors.card, borderColor: nightMode ? '#334155' : colors.border }]} activeOpacity={0.8}>
            <Smile size={28} color={colors.success} />
            <Text style={[styles.gridBtnText, { color: nightMode ? '#f8fafc' : colors.foreground }]}>How I feel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { requestHelp(); setShowHelpConfirmed(true); setTimeout(() => setShowHelpConfirmed(false), 3000); }} style={[styles.gridBtn, { backgroundColor: showHelpConfirmed ? colors.blue + '20' : nightMode ? '#1e293b' : colors.card, borderColor: showHelpConfirmed ? colors.blue : nightMode ? '#334155' : colors.border }]} activeOpacity={0.8}>
            {showHelpConfirmed ? <Check size={28} color={colors.blue} /> : <Heart size={28} color={colors.blue} />}
            <Text style={[styles.gridBtnText, { color: nightMode ? '#f8fafc' : colors.foreground }]}>{showHelpConfirmed ? 'Notified!' : 'I need help'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowEmergency(true)} style={[styles.gridBtn, { backgroundColor: nightMode ? '#1e293b' : colors.card, borderColor: nightMode ? '#334155' : colors.border }]} activeOpacity={0.8}>
            <Phone size={28} color={colors.destructive} />
            <Text style={[styles.gridBtnText, { color: nightMode ? '#f8fafc' : colors.foreground }]}>Call help</Text>
          </TouchableOpacity>
        </View>

        {nightMode && (
          <Animated.View entering={FadeIn} style={styles.nightModeLabel}>
            <Moon size={16} color="#64748b" />
            <Text style={styles.nightModeText}>QUIET NIGHT MODE ACTIVE</Text>
          </Animated.View>
        )}
      </ScrollView>

      <SafetyCheckPrompt />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerActions: { paddingHorizontal: Spacing[6], alignItems: 'flex-end', marginBottom: Spacing[6] },
  headerIconBtn: { width: 56, height: 56, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  successContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing[6] },
  successIconBox: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[6] },
  successTitle: { fontSize: FontSize['3xl'], fontFamily: FontFamily.semiBold, marginBottom: Spacing[3], textAlign: 'center' },
  successSub: { fontSize: FontSize.xl, textAlign: 'center', marginBottom: Spacing[6] },
  undoBtn: { paddingVertical: Spacing[4], paddingHorizontal: Spacing[8], borderRadius: BorderRadius.xl, borderWidth: 2 },
  undoBtnText: { fontSize: FontSize.lg, fontFamily: FontFamily.medium },
  undoProgressBg: { width: '100%', maxWidth: 240, height: 4, borderRadius: 2, marginTop: Spacing[8], overflow: 'hidden' },
  undoProgressFill: { height: '100%', borderRadius: 2 },

  settingsContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing[6] },
  settingsIconBox: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[6] },
  settingsTitle: { fontSize: FontSize['3xl'], fontFamily: FontFamily.semiBold, marginBottom: Spacing[2] },
  settingsSub: { fontSize: FontSize.xl, marginBottom: Spacing[8] },
  settingsBtns: { width: '100%', maxWidth: 400, gap: Spacing[3] },
  settingsBtn: { width: '100%', paddingVertical: Spacing[4], paddingHorizontal: Spacing[6], borderRadius: BorderRadius.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[3] },
  settingsBtnText: { fontSize: FontSize.xl, fontFamily: FontFamily.medium },

  changeBanner: { paddingVertical: Spacing[4], paddingHorizontal: Spacing[4], borderBottomWidth: 1 },
  changeBannerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', maxWidth: 400, alignSelf: 'center', width: '100%' },
  changeBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  changeBannerText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  changeBannerBtn: { fontSize: 11, fontFamily: FontFamily.bold, letterSpacing: 1 },

  header: { paddingHorizontal: Spacing[6], paddingBottom: Spacing[4], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greetingLabel: { fontSize: FontSize.lg },
  nameLabel: { fontSize: FontSize['2xl'], fontFamily: FontFamily.semiBold },

  mainScroll: { paddingHorizontal: Spacing[6], paddingBottom: Spacing[10], alignItems: 'center' },
  fineBtn: { width: '100%', maxWidth: 400, padding: Spacing[6], borderRadius: BorderRadius['2xl'], borderWidth: 2, flexDirection: 'row', alignItems: 'center', gap: Spacing[4], marginBottom: Spacing[8] },
  fineIconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  fineBtnTitle: { fontSize: FontSize.xl, fontFamily: FontFamily.bold },
  fineBtnSub: { fontSize: FontSize.sm },
  timeIndicator: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[6] },
  timeLabel: { fontSize: FontSize.lg, fontFamily: FontFamily.medium },
  medCard: { width: '100%', maxWidth: 400, padding: Spacing[8], borderRadius: BorderRadius['3xl'], borderWidth: 2, alignItems: 'center', marginBottom: Spacing[8] },
  medName: { fontSize: 30, fontFamily: FontFamily.semiBold, textAlign: 'center', marginBottom: Spacing[2] },
  medTimeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[2] },
  medTime: { fontSize: FontSize['2xl'], fontFamily: FontFamily.bold },
  medDosage: { fontSize: FontSize['2xl'], textAlign: 'center' },
  divider: { width: '100%', borderTopWidth: 1, marginVertical: Spacing[3] },
  simpleExplain: { fontSize: FontSize.lg, fontFamily: FontFamily.medium, textAlign: 'center', paddingVertical: Spacing[2] },
  medNotes: { fontSize: FontSize.lg, textAlign: 'center', paddingTop: Spacing[2] },
  medPharmaNote: { width: '100%', borderTopWidth: 1, marginTop: Spacing[4], paddingTop: Spacing[4] },
  pharmaLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2], marginBottom: 4 },
  pharmaLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  pharmaNoteText: { fontSize: FontSize.base, textAlign: 'center' },

  actionRow: { width: '100%', maxWidth: 400, flexDirection: 'row', gap: Spacing[3], marginBottom: Spacing[8] },
  tookItBtn: { paddingVertical: Spacing[6], paddingHorizontal: Spacing[8], borderRadius: BorderRadius['2xl'], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[3], elevation: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  tookItText: { fontSize: 24, fontFamily: FontFamily.semiBold },

  quickGrid: { width: '100%', maxWidth: 400, flexDirection: 'row', gap: Spacing[3] },
  gridBtn: { flex: 1, padding: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 2, alignItems: 'center', gap: Spacing[2] },
  gridBtnText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },

  nightModeLabel: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginTop: Spacing[8] },
  nightModeText: { fontSize: 11, fontFamily: FontFamily.medium, color: '#64748b', letterSpacing: 1 },
});
