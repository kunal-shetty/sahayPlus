import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Linking,
} from 'react-native';
import {
  Heart, Phone, Plus, Trash2, Shield, Smile, Meh, Frown,
  User, FileText, Share2, LogOut, Settings,
} from 'lucide-react-native';
import { useSahay } from '../../lib/sahay-context';
import { type WellnessLevel } from '../../lib/types';
import { useThemeColors, FontFamily, FontSize, Spacing, BorderRadius } from '../../theme';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, Separator } from '../../components/ui/Extras';

export function CareScreen() {
  const {
    data, logWellness, getTodayWellness, getWellnessTrend,
    addEmergencyContact, removeEmergencyContact,
    startHandover, endHandover, getHumanInsights, getDoctorPrepSummary, logout, user,
  } = useSahay();
  const colors = useThemeColors();
  const todayWellness = getTodayWellness();
  const trend = getWellnessTrend();
  const insights = getHumanInsights();
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('');

  const wellnessOptions: { level: WellnessLevel; icon: any; label: string; color: string }[] = [
    { level: 'great', icon: Smile, label: 'Great', color: colors.success },
    { level: 'okay', icon: Meh, label: 'Okay', color: colors.warning },
    { level: 'notGreat', icon: Frown, label: 'Not Great', color: colors.destructive },
  ];

  const handleAddContact = () => {
    if (!contactName.trim() || !contactPhone.trim()) return;
    addEmergencyContact({ name: contactName.trim(), phone: contactPhone.trim(), relationship: contactRelation.trim(), isPrimary: false });
    setContactName(''); setContactPhone(''); setContactRelation('');
    setShowAddContact(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Heart color={colors.primary} size={22} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Care</Text>
      </View>

      {/* Wellness Check-in */}
      <Card style={{ marginBottom: Spacing[4] }}>
        <CardContent style={{ paddingTop: Spacing[4] }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>How is {data.careReceiver?.name || 'they'} today?</Text>
          <View style={styles.wellnessRow}>
            {wellnessOptions.map(({ level, icon: Icon, label, color }) => (
              <TouchableOpacity
                key={level}
                onPress={() => logWellness(level)}
                style={[styles.wellnessBtn, {
                  backgroundColor: todayWellness?.level === level ? color + '15' : colors.muted,
                  borderColor: todayWellness?.level === level ? color : 'transparent',
                  borderWidth: todayWellness?.level === level ? 2 : 0,
                }]}
              >
                <Icon color={todayWellness?.level === level ? color : colors.mutedForeground} size={28} />
                <Text style={[styles.wellnessLabel, { color: todayWellness?.level === level ? color : colors.mutedForeground }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </CardContent>
      </Card>

      {/* Wellness Trend */}
      {trend.length > 0 && (
        <Card style={{ marginBottom: Spacing[4] }}>
          <CardContent style={{ paddingTop: Spacing[4] }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Wellness</Text>
            {trend.map((entry) => (
              <View key={entry.id} style={styles.trendRow}>
                <Text style={[styles.trendDate, { color: colors.mutedForeground }]}>{new Date(entry.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                <Badge label={entry.level === 'great' ? '😊 Great' : entry.level === 'okay' ? '😐 Okay' : '😟 Not Great'} variant={entry.level === 'great' ? 'success' : entry.level === 'okay' ? 'warning' : 'destructive'} />
              </View>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Card style={{ marginBottom: Spacing[4] }}>
          <CardContent style={{ paddingTop: Spacing[4] }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Insights</Text>
            {insights.map((insight, i) => (
              <Text key={i} style={[styles.insightText, { color: colors.mutedForeground }]}>• {insight}</Text>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts */}
      <Card style={{ marginBottom: Spacing[4] }}>
        <CardContent style={{ paddingTop: Spacing[4] }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Emergency Contacts</Text>
            <TouchableOpacity onPress={() => setShowAddContact(true)}>
              <Plus color={colors.primary} size={22} />
            </TouchableOpacity>
          </View>
          {(data.emergencyContacts || []).map((contact) => (
            <View key={contact.id} style={[styles.contactRow, { borderBottomColor: colors.border }]}>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: colors.foreground }]}>{contact.name}</Text>
                <Text style={[styles.contactDetail, { color: colors.mutedForeground }]}>{contact.relationship} • {contact.phone}</Text>
              </View>
              <View style={styles.contactActions}>
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${contact.phone}`)} style={[styles.callBtn, { backgroundColor: colors.success + '15' }]}>
                  <Phone color={colors.success} size={16} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Alert.alert('Remove', `Remove ${contact.name}?`, [
                  { text: 'Cancel' }, { text: 'Remove', style: 'destructive', onPress: () => removeEmergencyContact(contact.id) },
                ])}>
                  <Trash2 color={colors.destructive} size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {(data.emergencyContacts || []).length === 0 && (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No emergency contacts added</Text>
          )}
        </CardContent>
      </Card>

      {/* Doctor Prep */}
      <Card style={{ marginBottom: Spacing[4] }}>
        <CardContent style={{ paddingTop: Spacing[4] }}>
          <TouchableOpacity onPress={() => Alert.alert('Doctor Prep', getDoctorPrepSummary())}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
              <FileText color={colors.primary} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>Doctor Visit Prep</Text>
            </View>
            <Text style={[styles.emptyText, { color: colors.mutedForeground, textAlign: 'left', marginTop: Spacing[1] }]}>Tap to view a summary for your next doctor visit</Text>
          </TouchableOpacity>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent style={{ paddingTop: Spacing[4] }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Account</Text>
          <Text style={[styles.settingText, { color: colors.mutedForeground }]}>Signed in as {user?.email}</Text>
          <Button title="Sign Out" onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel' }, { text: 'Sign Out', style: 'destructive', onPress: logout },
          ])} variant="destructive" style={{ marginTop: Spacing[3] }} />
        </CardContent>
      </Card>

      <View style={{ height: Spacing[24] }} />

      {/* Add Contact Modal */}
      <Modal visible={showAddContact} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Emergency Contact</Text>
            <TextInput placeholder="Name" value={contactName} onChangeText={setContactName} style={[styles.modalInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]} placeholderTextColor={colors.mutedForeground} />
            <TextInput placeholder="Phone number" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" style={[styles.modalInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]} placeholderTextColor={colors.mutedForeground} />
            <TextInput placeholder="Relationship (optional)" value={contactRelation} onChangeText={setContactRelation} style={[styles.modalInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]} placeholderTextColor={colors.mutedForeground} />
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setShowAddContact(false)} variant="ghost" />
              <Button title="Add" onPress={handleAddContact} disabled={!contactName.trim() || !contactPhone.trim()} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing[4], paddingTop: Spacing[14] },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[5] },
  headerTitle: { fontSize: FontSize['2xl'], fontFamily: FontFamily.bold },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.semiBold, marginBottom: Spacing[3] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wellnessRow: { flexDirection: 'row', justifyContent: 'space-around', gap: Spacing[3] },
  wellnessBtn: { flex: 1, alignItems: 'center', padding: Spacing[4], borderRadius: BorderRadius.xl, gap: Spacing[2] },
  wellnessLabel: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  trendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing[2] },
  trendDate: { fontSize: FontSize.sm, fontFamily: FontFamily.regular },
  insightText: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, marginBottom: Spacing[1], lineHeight: 20 },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing[3], borderBottomWidth: 1 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: FontSize.base, fontFamily: FontFamily.semiBold },
  contactDetail: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, marginTop: 2 },
  contactActions: { flexDirection: 'row', gap: Spacing[3], alignItems: 'center' },
  callBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, textAlign: 'center', paddingVertical: Spacing[2] },
  settingText: { fontSize: FontSize.sm, fontFamily: FontFamily.regular },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { borderTopLeftRadius: BorderRadius['3xl'], borderTopRightRadius: BorderRadius['3xl'], padding: Spacing[6], paddingBottom: Spacing[10] },
  modalTitle: { fontSize: FontSize.xl, fontFamily: FontFamily.bold, marginBottom: Spacing[4] },
  modalInput: { borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing[3], fontSize: FontSize.base, fontFamily: FontFamily.regular, marginBottom: Spacing[3] },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing[3], marginTop: Spacing[2] },
});
