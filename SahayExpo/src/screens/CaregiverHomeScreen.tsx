import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import Animated, { FadeInUp, FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useSahay } from '../lib/sahay-context';
import { TimeOfDay, Medication, timeOfDayLabels, getCurrentTimeOfDay } from '../lib/types';
import {
  Sun,
  Cloud,
  Moon,
  Plus,
  Check,
  Clock,
  Settings,
  ChevronRight,
  BookOpen,
  Users,
  FileText,
  RefreshCw,
  BarChart3,
  Phone,
  MessageCircle,
  Heart,
  ArrowLeftRight,
  History,
  ShieldAlert,
  Smile,
  ArrowLeft,
  Pill,
} from 'lucide-react-native';

import {
  MedicationForm,
  SettingsPanel,
  CareTimeline,
  GentleCheckIn,
  CareConfidence,
  DailyClosure,
  RoleStatus,
  ContextualNotes,
  AnalyticsDashboard,
  EmergencyContacts,
  Messages,
  WellnessOverview,
  MedicationHistory,
  QuickPillActions,
  CaregiverBottomNav,
} from '../components/caregiver';
import { CaregiverTab } from '../components/caregiver/CaregiverBottomNav';
import { CaregiverHomeSkeleton } from '../components/skeletons/CaregiverHomeSkeleton';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CaregiverHomeScreen() {
  const {
    data,
    isLoading,
    isDataLoading,
    getUnreadCount,
    getHumanInsights,
    getDoctorPrepSummary,
    endHandover,
    startHandover,
    updatePharmacist,
    addPharmacistNote,
  } = useSahay();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showRoleStatus, setShowRoleStatus] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showWellness, setShowWellness] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDoctorPrep, setShowDoctorPrep] = useState(false);
  const [showPharmacist, setShowPharmacist] = useState(false);
  const [showHandoverSetup, setShowHandoverSetup] = useState(false);
  const [handoverName, setHandoverName] = useState('');
  const [handoverDays, setHandoverDays] = useState('3');
  const [activeTab, setActiveTab] = useState<CaregiverTab>('home');

  // Pharmacist editing state
  const [pharmaEditing, setPharmaEditing] = useState(false);
  const [pharmaName, setPharmaName] = useState(data.pharmacist?.name || '');
  const [pharmaNoteMedId, setPharmaNoteMedId] = useState<string | null>(null);
  const [pharmaNoteText, setPharmaNoteText] = useState('');

  const unreadMessages = getUnreadCount();
  const currentTimeOfDay = getCurrentTimeOfDay();

  const groupedMeds: Record<TimeOfDay, Medication[]> = { morning: [], afternoon: [], evening: [] };
  for (const med of data.medications) {
    if (groupedMeds[med.timeOfDay]) {
      groupedMeds[med.timeOfDay].push(med);
    }
  }

  const totalMeds = data.medications.length;
  const takenMeds = data.medications.filter((m) => m.taken).length;
  const allTaken = totalMeds > 0 && takenMeds === totalMeds;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading || isDataLoading) {
    return <CaregiverHomeSkeleton />;
  }

  // --- Full Screen Views ---
  if (showAddForm || editingMed) return <MedicationForm medication={editingMed || undefined} onClose={() => { setShowAddForm(false); setEditingMed(null); }} />;
  if (showSettings) return <SettingsPanel onClose={() => setShowSettings(false)} />;
  if (showTimeline) return <CareTimeline onClose={() => setShowTimeline(false)} />;
  if (showRoleStatus) return <RoleStatus onClose={() => setShowRoleStatus(false)} />;
  if (showNotes) return <ContextualNotes onClose={() => setShowNotes(false)} />;
  if (showAnalytics) return <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />;
  if (showEmergency) return <EmergencyContacts onClose={() => setShowEmergency(false)} />;
  if (showMessages) return <Messages onClose={() => setShowMessages(false)} />;
  if (showWellness) return <WellnessOverview onClose={() => setShowWellness(false)} />;
  if (showHistory) return <MedicationHistory onClose={() => setShowHistory(false)} />;

  if (showPharmacist) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[6]) }]}>
          <TouchableOpacity onPress={() => setShowPharmacist(false)} style={[styles.backBtn, { backgroundColor: colors.secondary }]}>
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Pharmacist</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.pharmaHeader}>
              <View style={[styles.pharmaIcon, { backgroundColor: colors.blue + '20' }]}>
                <Pill size={20} color={colors.blue} />
              </View>
              <View>
                <Text style={[styles.pharmaTitle, { color: colors.foreground }]}>Local Pharmacist</Text>
                <Text style={[styles.pharmaSubtitle, { color: colors.mutedForeground }]}>A silent helper for refill notes</Text>
              </View>
            </View>

            {data.pharmacist?.name ? (
              <View style={[styles.pharmaInfo, { backgroundColor: colors.secondary + '80' }]}>
                <Text style={[styles.pharmaName, { color: colors.foreground }]}>{data.pharmacist.name}</Text>
                {data.pharmacist.lastRefillConfirm && (
                  <Text style={[styles.pharmaDate, { color: colors.mutedForeground }]}>
                    Last refill: {new Date(data.pharmacist.lastRefillConfirm).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={[styles.pharmaEmpty, { color: colors.mutedForeground }]}>No pharmacist added yet</Text>
            )}

            {!pharmaEditing ? (
              <TouchableOpacity onPress={() => setPharmaEditing(true)} style={[styles.btn, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.btnText, { color: colors.foreground }]}>{data.pharmacist?.name ? 'Edit Pharmacist' : '+ Add Pharmacist'}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.pharmaForm}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                  value={pharmaName}
                  onChangeText={setPharmaName}
                  placeholder="Pharmacist name"
                  placeholderTextColor={colors.mutedForeground}
                  autoFocus
                />
                <View style={styles.formActions}>
                  <TouchableOpacity onPress={() => setPharmaEditing(false)} style={[styles.btn, { flex: 1, backgroundColor: colors.secondary }]}>
                    <Text style={[styles.btnText, { color: colors.foreground }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { updatePharmacist({ name: pharmaName.trim() || undefined }); setPharmaEditing(false); }}
                    style={[styles.btn, { flex: 1, backgroundColor: colors.primary }]}
                  >
                    <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {data.medications.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Medication Notes</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>Add notes from your pharmacist</Text>
              <View style={styles.itemsList}>
                {data.medications.map((med) => {
                  const expanded = pharmaNoteMedId === med.id;
                  return (
                    <View key={med.id} style={[styles.medNoteItem, { borderColor: colors.border }]}>
                      <TouchableOpacity onPress={() => setPharmaNoteMedId(expanded ? null : med.id)} style={styles.medNoteHeader}>
                        <View style={styles.medNoteIdent}>
                          <View style={[styles.medNoteIcon, { backgroundColor: med.taken ? colors.success + '20' : colors.pending + '20' }]}>
                            {med.taken ? <Check size={12} color={colors.success} /> : <Clock size={12} color={colors.pending} />}
                          </View>
                          <View>
                            <Text style={[styles.medNoteTitle, { color: colors.foreground }]}>{med.name}</Text>
                            {med.pharmacistNote && <Text style={[styles.hasNoteText, { color: colors.blue }]}>Has pharmacist note</Text>}
                          </View>
                        </View>
                        <ChevronRight size={20} color={colors.mutedForeground} style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }} />
                      </TouchableOpacity>
                      {expanded && (
                        <View style={styles.medNoteForm}>
                          {med.pharmacistNote && (
                            <View style={[styles.currNoteBox, { backgroundColor: colors.blue + '10' }]}>
                              <Text style={[styles.currNoteLabel, { color: colors.blue }]}>Current note:</Text>
                              <Text style={[styles.currNoteText, { color: colors.foreground }]}>{med.pharmacistNote}</Text>
                            </View>
                          )}
                          <TextInput
                            style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                            value={pharmaNoteText}
                            onChangeText={setPharmaNoteText}
                            placeholder="Add note..."
                            placeholderTextColor={colors.mutedForeground}
                            multiline
                            numberOfLines={2}
                          />
                          <TouchableOpacity
                            disabled={!pharmaNoteText.trim()}
                            onPress={() => { addPharmacistNote(med.id, pharmaNoteText.trim()); setPharmaNoteText(''); setPharmaNoteMedId(null); }}
                            style={[styles.btn, { backgroundColor: pharmaNoteText.trim() ? colors.blue : colors.blue + '80', marginTop: Spacing[2] }]}
                          >
                            <Text style={[styles.btnText, { color: '#fff' }]}>Save Note</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  if (showDoctorPrep) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[6]) }]}>
          <TouchableOpacity onPress={() => setShowDoctorPrep(false)} style={[styles.backBtn, { backgroundColor: colors.secondary }]}>
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Doctor Visit Prep</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.prepCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.prepText, { color: colors.foreground }]}>{getDoctorPrepSummary()}</Text>
          </View>
          <TouchableOpacity style={[styles.printBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.printBtnText, { color: colors.primaryForeground }]}>Share or Print</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }


  // --- Main Tabs Rendering ---
  const renderHomeTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity onPress={() => setShowAddForm(true)} style={[styles.addBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} activeOpacity={0.8}>
        <Plus size={20} color={colors.primaryForeground} />
        <Text style={[styles.addBtnText, { color: colors.primaryForeground }]}>Add medication</Text>
      </TouchableOpacity>

      {/* Help Requested Alert */}
      {data.timeline.find(e => e.type === 'help_requested' && !e.note?.includes('resolved')) && (
        <Animated.View entering={FadeInUp} style={[styles.alertCard, { backgroundColor: colors.blue + '10', borderColor: colors.blue + '30' }]}>
          <View style={styles.alertHeader}>
            <View style={[styles.alertIconBox, { backgroundColor: colors.blue + '20' }]}>
              <Heart size={28} color={colors.blue} />
            </View>
            <View style={styles.alertTextWrap}>
              <Text style={[styles.alertTitle, { color: colors.blue }]}>Check-in Requested</Text>
              <Text style={[styles.alertDesc, { color: colors.foreground }]}>{data.careReceiver?.name} just tapped "I need help". No alarm was triggered, but they'd appreciate a check-in.</Text>
            </View>
          </View>
          <View style={styles.alertActions}>
            <TouchableOpacity onPress={() => setShowEmergency(true)} style={[styles.alertBtn, { backgroundColor: colors.blue }]}>
              <Phone size={20} color="#fff" />
              <Text style={[styles.alertBtnText, { color: '#fff' }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('messages')} style={[styles.alertBtn, { backgroundColor: colors.secondary }]}>
              <MessageCircle size={20} color={colors.foreground} />
              <Text style={[styles.alertBtnText, { color: colors.foreground }]}>Message</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Safety Alert */}
      {data.safetyCheck.status === 'escalating' && (
        <Animated.View entering={FadeInUp} style={[styles.alertCard, { backgroundColor: colors.destructive + '10', borderColor: colors.destructive + '30' }]}>
          <View style={styles.alertHeader}>
            <View style={[styles.alertIconBox, { backgroundColor: colors.destructive + '20' }]}>
              <ShieldAlert size={28} color={colors.destructive} />
            </View>
            <View style={styles.alertTextWrap}>
              <Text style={[styles.alertTitle, { color: colors.destructive }]}>Safety Alert: No Response</Text>
              <Text style={[styles.alertDesc, { color: colors.foreground }]}>{data.careReceiver?.name} did not respond to the safety check. Please try to reach them immediately.</Text>
            </View>
          </View>
          <View style={styles.alertActions}>
            <TouchableOpacity onPress={() => setShowEmergency(true)} style={[styles.alertBtn, { backgroundColor: colors.destructive }]}>
              <Phone size={20} color="#fff" />
              <Text style={[styles.alertBtnText, { color: '#fff' }]}>Call Them</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('messages')} style={[styles.alertBtn, { backgroundColor: colors.secondary, borderWidth: 2, borderColor: colors.border }]}>
              <MessageCircle size={20} color={colors.foreground} />
              <Text style={[styles.alertBtnText, { color: colors.foreground }]}>Message</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Streak Counter */}
      {totalMeds > 0 && (
        <View style={[styles.streakCard, { backgroundColor: colors.sage + '15', borderColor: colors.sage + '30' }]}>
          <View>
            <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>Current Streak</Text>
            <View style={styles.streakRow}>
              <Text style={[styles.streakVal, { color: colors.sage }]}>{data.currentStreak}</Text>
              <Text style={[styles.streakDays, { color: colors.mutedForeground }]}>days</Text>
            </View>
            <Text style={[styles.streakBest, { color: colors.mutedForeground }]}>Best: {data.longestStreak} days</Text>
          </View>
          <View style={[styles.fireIcon, { backgroundColor: colors.success + '20' }]}>
            <Text style={styles.fireEmoji}>🔥</Text>
          </View>
        </View>
      )}

      {totalMeds > 0 && <QuickPillActions />}

      {/* "I'm Fine Today" */}
      {data.lastFineCheckIn?.startsWith(new Date().toISOString().split('T')[0]) && (
        <View style={[styles.fineCard, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
          <View style={[styles.fineIcon, { backgroundColor: colors.success + '20' }]}>
            <Smile size={24} color={colors.success} />
          </View>
          <View style={styles.fineTextWrap}>
            <Text style={[styles.fineTitle, { color: colors.foreground }]}>{data.careReceiver?.name} checked in</Text>
            <Text style={[styles.fineDesc, { color: colors.mutedForeground }]}>They tapped "I'm fine today" at {new Date(data.lastFineCheckIn!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>
      )}

      {/* Refill awareness */}
      {data.medications.some((m) => m.refillDaysLeft !== undefined && m.refillDaysLeft <= 7) && (
        <View style={[styles.refillCard, { backgroundColor: colors.pending + '15', borderColor: colors.pending + '30' }]}>
          <RefreshCw size={20} color={colors.pending} />
          <View style={styles.refillTextWrap}>
            <Text style={[styles.refillTitle, { color: colors.foreground }]}>Refill may be needed soon</Text>
            <Text style={[styles.refillDesc, { color: colors.mutedForeground }]}>
              {data.medications.filter((m) => m.refillDaysLeft !== undefined && m.refillDaysLeft <= 7).map((m) => m.name).join(', ')}
            </Text>
          </View>
        </View>
      )}

      {/* Medications Grouped by Time */}
      {(Object.keys(timeOfDayLabels) as TimeOfDay[]).map((timeOfDay) => {
        const meds = groupedMeds[timeOfDay];
        if (meds.length === 0) return null;

        const isCurrent = timeOfDay === currentTimeOfDay;
        const Icon = timeOfDay === 'morning' ? Sun : timeOfDay === 'afternoon' ? Cloud : Moon;

        return (
          <View key={timeOfDay} style={styles.timeSection}>
            <View style={styles.timeHeader}>
              <Icon size={20} color={isCurrent ? colors.sage : colors.mutedForeground} strokeWidth={1.5} />
              <Text style={[styles.timeTitle, { color: isCurrent ? colors.foreground : colors.mutedForeground }]}>{timeOfDayLabels[timeOfDay]}</Text>
              {isCurrent && (
                <View style={[styles.nowBadge, { backgroundColor: colors.sage + '20' }]}>
                  <Text style={[styles.nowText, { color: colors.sage }]}>Now</Text>
                </View>
              )}
            </View>

            <View style={styles.medsList}>
              {meds.map((med) => (
                <TouchableOpacity
                  key={med.id}
                  onPress={() => setEditingMed(med)}
                  style={[styles.medCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  activeOpacity={0.7}
                >
                  <View style={styles.medCardRow}>
                    <View style={styles.medCardLeft}>
                      <View style={[styles.medStatusIcon, { backgroundColor: med.taken ? colors.success + '20' : colors.pending + '20' }]}>
                        {med.taken ? <Check size={16} color={colors.success} /> : <Clock size={16} color={colors.pending} />}
                      </View>
                      <View>
                        <Text style={[styles.medName, { color: med.taken ? colors.mutedForeground : colors.foreground, textDecorationLine: med.taken ? 'line-through' : 'none' }]}>
                          {med.name}
                        </Text>
                        <Text style={[styles.medDesc, { color: colors.mutedForeground }]}>
                          {med.dosage}{med.time ? ` • ${med.time}` : ''}{med.notes ? ` • ${med.notes}` : ''}
                        </Text>
                        {med.streak && med.streak > 0 ? (
                          <Text style={[styles.medStreak, { color: colors.success }]}>🔥 {med.streak} day streak</Text>
                        ) : (
                          <Text style={[styles.medStreakMuted, { color: colors.mutedForeground }]}>No streak yet 🔥</Text>
                        )}
                      </View>
                    </View>
                    <ChevronRight size={20} color={colors.mutedForeground} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}

      {totalMeds === 0 && (
        <View style={styles.emptyHome}>
          <Text style={[styles.emptyHomeText, { color: colors.mutedForeground }]}>Add your first medication to get started</Text>
        </View>
      )}

      {totalMeds > 0 && (
        <View style={styles.closureWrapper}>
          <DailyClosure />
        </View>
      )}
    </View>
  );

  const renderActivityTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.tabSubHeader, { color: colors.mutedForeground }]}>ACTIVITY & INSIGHTS</Text>

      {getHumanInsights().length > 0 && (
        <View style={styles.insightsArea}>
          <Text style={[styles.insightsTitle, { color: colors.mutedForeground }]}>DAILY INSIGHTS</Text>
          {getHumanInsights().map((insight, idx) => (
            <View key={idx} style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.insightIcon, { backgroundColor: colors.warning + '20' }]}>
                <FileText size={20} color={colors.warning} />
              </View>
              <Text style={[styles.insightText, { color: colors.foreground }]}>{insight}</Text>
            </View>
          ))}
        </View>
      )}

      <GentleCheckIn />
      
      {totalMeds > 0 && (
        <View style={{ marginBottom: Spacing[4] }}>
          <CareConfidence />
        </View>
      )}

      <View style={styles.actionCardsList}>
        {[
          { label: 'Care Timeline', desc: 'Full history of care events', Icon: BookOpen, iconBg: colors.sage + '20', iconColor: colors.sage, action: () => setShowTimeline(true) },
          { label: 'Analytics', desc: 'Charts, trends & patterns', Icon: BarChart3, iconBg: colors.blue + '20', iconColor: colors.blue, action: () => setShowAnalytics(true) },
          { label: 'Wellness Log', desc: 'Track how they\'re feeling', Icon: Heart, iconBg: colors.success + '20', iconColor: colors.success, action: () => setShowWellness(true) },
          { label: 'Medication History', desc: 'Past medications & changes', Icon: History, iconBg: colors.blue + '20', iconColor: colors.blue, action: () => setShowHistory(true) },
        ].map((item, idx) => (
          <TouchableOpacity key={item.label} onPress={item.action} style={[styles.navCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.7}>
            <View style={styles.navCardLeft}>
              <View style={[styles.navCardIconBox, { backgroundColor: item.iconBg }]}>
                <item.Icon size={20} color={item.iconColor} />
              </View>
              <View>
                <Text style={[styles.navCardTitle, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.navCardDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCareTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.tabSubHeader, { color: colors.mutedForeground }]}>CARE TOOLS</Text>
      
      <View style={styles.actionCardsList}>
        {[
          { label: 'Contextual Notes', desc: 'Quick notes about care', Icon: FileText, iconBg: colors.warning + '20', iconColor: colors.warning, action: () => setShowNotes(true) },
          { label: 'Care Roles', desc: 'Manage who helps with care', Icon: Users, iconBg: colors.blue + '20', iconColor: colors.blue, action: () => setShowRoleStatus(true) },
          { label: 'Emergency Contacts', desc: 'Quick-dial important numbers', Icon: Phone, iconBg: colors.destructive + '20', iconColor: colors.destructive, action: () => setShowEmergency(true) },
          { label: 'Pharmacist', desc: 'Pharmacist info & med notes', Icon: Pill, iconBg: colors.blue + '20', iconColor: colors.blue, action: () => setShowPharmacist(true) },
          { label: 'Doctor Visit Prep', desc: 'Summary for your next visit', Icon: BookOpen, iconBg: colors.sage + '20', iconColor: colors.sage, action: () => setShowDoctorPrep(true) },
        ].map((item, idx) => (
          <TouchableOpacity key={item.label} onPress={item.action} style={[styles.navCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.7}>
            <View style={styles.navCardLeft}>
              <View style={[styles.navCardIconBox, { backgroundColor: item.iconBg }]}>
                <item.Icon size={20} color={item.iconColor} />
              </View>
              <View>
                <Text style={[styles.navCardTitle, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.navCardDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.handoverArea}>
        <TouchableOpacity
          onPress={() => setShowHandoverSetup(!showHandoverSetup)}
          style={[styles.handoverBtn, { backgroundColor: colors.blue + '10', borderColor: colors.blue + '30' }]}
        >
          <View style={styles.navCardLeft}>
            <View style={[styles.navCardIconBox, { backgroundColor: colors.blue + '20' }]}>
              <ArrowLeftRight size={20} color={colors.blue} />
            </View>
            <View>
              <Text style={[styles.navCardTitle, { color: colors.foreground }]}>Temporary Handover</Text>
              <Text style={[styles.navCardDesc, { color: colors.mutedForeground }]}>Let someone else handle care</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.mutedForeground} style={{ transform: [{ rotate: showHandoverSetup ? '90deg' : '0deg' }] }} />
        </TouchableOpacity>

        {showHandoverSetup && (
          <View style={[styles.handoverForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.handoverTitle, { color: colors.foreground }]}>Handover Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Trusted Person's Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                value={handoverName}
                onChangeText={setHandoverName}
                placeholder="e.g., Sibling Name"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>For how many days?</Text>
              {/* Using a simple row of buttons for selection instead of HTML select element */}
              <View style={styles.daysRow}>
                {['3', '5', '7'].map((days) => (
                  <TouchableOpacity
                    key={days}
                    onPress={() => setHandoverDays(days)}
                    style={[styles.daysBtn, { backgroundColor: handoverDays === days ? colors.blue : colors.secondary }]}
                  >
                    <Text style={[styles.daysBtnText, { color: handoverDays === days ? '#fff' : colors.foreground }]}>{days} days</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              disabled={!handoverName}
              onPress={() => {
                const date = new Date();
                date.setDate(date.getDate() + parseInt(handoverDays));
                startHandover(handoverName, date.toISOString());
                setShowHandoverSetup(false);
              }}
              style={[styles.btn, { backgroundColor: handoverName ? colors.blue : colors.blue + '80', marginTop: Spacing[4] }]}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>Confirm Handover</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {activeTab !== 'messages' && (
        <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, Spacing[6]) }]}>
          <View style={styles.topHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{getGreeting()}, {data.caregiver?.name}</Text>
              <Text style={[styles.patientName, { color: colors.foreground }]}>{data.careReceiver?.name}'s Care</Text>
            </View>
            <TouchableOpacity onPress={() => setShowSettings(true)} style={[styles.settingsBtn, { backgroundColor: colors.secondary }]} activeOpacity={0.8}>
              <Settings size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.statusCard, { backgroundColor: allTaken ? colors.sage + '15' : colors.card, borderColor: allTaken ? colors.sage + '40' : colors.border }]}>
            {totalMeds === 0 ? (
              <Text style={[styles.statusEmpty, { color: colors.mutedForeground }]}>No medications added yet</Text>
            ) : allTaken ? (
              <View style={styles.statusRow}>
                <View style={[styles.statusIconBox, { backgroundColor: colors.success + '20' }]}>
                  <Check size={20} color={colors.success} />
                </View>
                <View>
                  <Text style={[styles.statusTitle, { color: colors.foreground }]}>Everything looks good today</Text>
                  <Text style={[styles.statusDesc, { color: colors.mutedForeground }]}>All {totalMeds} medications taken</Text>
                </View>
              </View>
            ) : (
              <View style={styles.statusRow}>
                <View style={[styles.statusIconBox, { backgroundColor: colors.pending + '20' }]}>
                  <Clock size={20} color={colors.pending} />
                </View>
                <View>
                  <Text style={[styles.statusTitle, { color: colors.foreground }]}>{takenMeds} of {totalMeds} taken today</Text>
                  <Text style={[styles.statusDesc, { color: colors.mutedForeground }]}>{totalMeds - takenMeds} pending</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {data.caregiver?.handover?.isActive && (
        <View style={[styles.handoverBanner, { backgroundColor: colors.blue }]}>
          <View style={styles.handoverBannerRow}>
            <ArrowLeftRight size={14} color="#fff" />
            <Text style={styles.handoverBannerText}>CARE HANDED OVER TO {data.caregiver.handover.targetName.toUpperCase()}</Text>
            <TouchableOpacity onPress={endHandover}>
              <Text style={styles.handoverBannerLink}>End Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.scrollArea}>
        {activeTab === 'messages' ? (
          <Messages onClose={() => setActiveTab('home')} />
        ) : (
          <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
            {activeTab === 'home' && renderHomeTab()}
            {activeTab === 'activity' && renderActivityTab()}
            {activeTab === 'care' && renderCareTab()}
          </ScrollView>
        )}
      </View>

      <CaregiverBottomNav activeTab={activeTab} onTabChange={setActiveTab} unreadMessages={unreadMessages} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing[6], paddingBottom: Spacing[4] },
  backBtn: { width: 48, height: 48, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[4] },
  title: { fontSize: FontSize['2xl'], fontFamily: FontFamily.bold },
  content: { padding: Spacing[6] },
  card: { padding: Spacing[5], borderRadius: BorderRadius['2xl'], borderWidth: 2, marginBottom: Spacing[6] },
  pharmaHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginBottom: Spacing[4] },
  pharmaIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pharmaTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.medium },
  pharmaSubtitle: { fontSize: FontSize.sm },
  pharmaInfo: { padding: Spacing[3], borderRadius: BorderRadius.xl, marginBottom: Spacing[4] },
  pharmaName: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
  pharmaDate: { fontSize: FontSize.sm, marginTop: 2 },
  pharmaEmpty: { fontSize: FontSize.base, marginBottom: Spacing[4] },
  btn: { paddingVertical: Spacing[3], paddingHorizontal: Spacing[4], borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: Spacing[2] },
  btnText: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
  pharmaForm: { gap: Spacing[3] },
  input: { padding: Spacing[3], borderRadius: BorderRadius.xl, borderWidth: 1, fontSize: FontSize.base },
  formActions: { flexDirection: 'row', gap: Spacing[2] },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.medium, marginBottom: 2 },
  sectionSubtitle: { fontSize: FontSize.sm, marginBottom: Spacing[4] },
  itemsList: { gap: Spacing[3] },
  medNoteItem: { borderWidth: 2, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  medNoteHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing[3] },
  medNoteIdent: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  medNoteIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  medNoteTitle: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
  hasNoteText: { fontSize: 11, marginTop: 2 },
  medNoteForm: { padding: Spacing[3], paddingTop: 0 },
  currNoteBox: { padding: Spacing[2], borderRadius: BorderRadius.lg, marginBottom: Spacing[2] },
  currNoteLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  currNoteText: { fontSize: FontSize.sm },
  prepCard: { padding: Spacing[6], borderRadius: BorderRadius['2xl'], borderWidth: 2, marginBottom: Spacing[6] },
  prepText: { fontSize: FontSize.base, lineHeight: 24 },
  printBtn: { paddingVertical: Spacing[4], borderRadius: BorderRadius.xl, alignItems: 'center' },
  printBtnText: { fontSize: FontSize.lg, fontFamily: FontFamily.bold },

  topHeader: { paddingHorizontal: Spacing[6], paddingBottom: Spacing[4] },
  topHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing[4] },
  greeting: { fontSize: FontSize.lg },
  patientName: { fontSize: FontSize['2xl'], fontFamily: FontFamily.semiBold },
  settingsBtn: { width: 48, height: 48, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  statusCard: { padding: Spacing[5], borderRadius: BorderRadius['2xl'], borderWidth: 2 },
  statusEmpty: { fontSize: FontSize.lg, textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  statusIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.medium },
  statusDesc: { fontSize: FontSize.sm },

  handoverBanner: { paddingVertical: 8, paddingHorizontal: Spacing[4], alignItems: 'center' },
  handoverBannerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  handoverBannerText: { fontSize: 11, fontFamily: FontFamily.bold, color: '#fff', letterSpacing: 1 },
  handoverBannerLink: { fontSize: 11, color: '#fff', textDecorationLine: 'underline', marginLeft: 8 },

  scrollArea: { flex: 1 },
  tabContent: { flex: 1 },
  
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2], paddingVertical: Spacing[4], borderRadius: BorderRadius.xl, marginBottom: Spacing[6], elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  addBtnText: { fontSize: FontSize.lg, fontFamily: FontFamily.semiBold },

  alertCard: { padding: Spacing[6], borderRadius: BorderRadius['2xl'], borderWidth: 2, marginBottom: Spacing[6] },
  alertHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[4], marginBottom: Spacing[4] },
  alertIconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  alertTextWrap: { flex: 1 },
  alertTitle: { fontSize: FontSize.xl, fontFamily: FontFamily.bold, marginBottom: 4 },
  alertDesc: { fontSize: FontSize.base, lineHeight: 22 },
  alertActions: { flexDirection: 'row', gap: Spacing[3] },
  alertBtn: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: Spacing[2] },
  alertBtnText: { fontSize: FontSize.base, fontFamily: FontFamily.bold },

  streakCard: { padding: Spacing[5], borderRadius: BorderRadius['2xl'], borderWidth: 2, marginBottom: Spacing[6], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakLabel: { fontSize: FontSize.sm, marginBottom: 4 },
  streakRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing[2] },
  streakVal: { fontSize: 30, fontFamily: FontFamily.bold },
  streakDays: { fontSize: FontSize.lg },
  streakBest: { fontSize: FontSize.xs, marginTop: Spacing[2] },
  fireIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  fireEmoji: { fontSize: 28 },

  fineCard: { padding: Spacing[5], borderRadius: BorderRadius['2xl'], borderWidth: 2, marginBottom: Spacing[6], flexDirection: 'row', alignItems: 'center', gap: Spacing[4] },
  fineIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  fineTextWrap: { flex: 1 },
  fineTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.bold },
  fineDesc: { fontSize: FontSize.sm },

  refillCard: { padding: Spacing[4], borderRadius: BorderRadius['2xl'], borderWidth: 2, marginBottom: Spacing[6], flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  refillTextWrap: { flex: 1 },
  refillTitle: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
  refillDesc: { fontSize: FontSize.sm },

  timeSection: { marginBottom: Spacing[6] },
  timeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[3] },
  timeTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.medium },
  nowBadge: { paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.full },
  nowText: { fontSize: 11, fontFamily: FontFamily.medium },
  medsList: { gap: Spacing[2] },
  medCard: { padding: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 2 },
  medCardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  medCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], flex: 1 },
  medStatusIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  medName: { fontSize: FontSize.lg, fontFamily: FontFamily.medium },
  medDesc: { fontSize: FontSize.sm, marginVertical: 2 },
  medStreak: { fontSize: 11, fontFamily: FontFamily.medium },
  medStreakMuted: { fontSize: 11, fontStyle: 'italic' },

  emptyHome: { alignItems: 'center', paddingVertical: Spacing[12] },
  emptyHomeText: { fontSize: FontSize.lg },
  closureWrapper: { marginTop: Spacing[6], marginBottom: Spacing[8] },

  tabSubHeader: { fontSize: FontSize.sm, fontFamily: FontFamily.bold, letterSpacing: 1, marginBottom: Spacing[4] },
  insightsArea: { marginBottom: Spacing[4], gap: Spacing[3] },
  insightsTitle: { fontSize: FontSize.sm, fontFamily: FontFamily.bold, letterSpacing: 1, marginLeft: 4 },
  insightCard: { padding: Spacing[5], borderRadius: BorderRadius['2xl'], borderWidth: 2, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[4] },
  insightIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  insightText: { flex: 1, fontSize: FontSize.lg, fontFamily: FontFamily.medium, lineHeight: 24, paddingTop: 4 },

  actionCardsList: { gap: Spacing[3] },
  navCard: { padding: Spacing[4], borderRadius: BorderRadius['2xl'], borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4] },
  navCardIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  navCardTitle: { fontSize: FontSize.base, fontFamily: FontFamily.semiBold },
  navCardDesc: { fontSize: FontSize.sm },

  handoverArea: { marginTop: Spacing[4] },
  handoverBtn: { padding: Spacing[4], borderRadius: BorderRadius['2xl'], borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  handoverForm: { padding: Spacing[5], borderRadius: BorderRadius['2xl'], borderWidth: 2, marginTop: Spacing[3] },
  handoverTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.bold, marginBottom: Spacing[4] },
  inputGroup: { marginBottom: Spacing[4] },
  inputLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, marginBottom: 4 },
  daysRow: { flexDirection: 'row', gap: Spacing[2] },
  daysBtn: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.xl, alignItems: 'center' },
  daysBtnText: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
});
