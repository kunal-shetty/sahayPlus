import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { ArrowLeft, Phone, Star, User, Building2, Stethoscope } from 'lucide-react-native';
import { useSahay } from '../../lib/sahay-context';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function EmergencyCall({ onClose }: { onClose: () => void }) {
  const { data } = useSahay();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const contacts = data.emergencyContacts || [];
  const primaryContact = contacts.find((c) => c.isPrimary);
  const otherContacts = contacts.filter((c) => !c.isPrimary);

  const getRelationshipIcon = (relationship: string) => {
    const lower = relationship.toLowerCase();
    if (lower.includes('doctor') || lower.includes('dr.')) return <Stethoscope size={24} color={colors.mutedForeground} />;
    if (lower.includes('hospital') || lower.includes('clinic')) return <Building2 size={24} color={colors.mutedForeground} />;
    return <User size={24} color={colors.mutedForeground} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[6]) }]}>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.backBtn, { backgroundColor: colors.secondary }]}
          activeOpacity={0.8}
        >
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>Need Help?</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Tap to call</Text>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {primaryContact && (
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${primaryContact.phone}`)}
            style={[styles.primaryCard, { backgroundColor: colors.sage }]}
            activeOpacity={0.8}
          >
            <View style={[styles.primaryIconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Phone size={40} color="#fff" />
            </View>
            <View style={styles.primaryTextWrap}>
              <View style={styles.primaryTag}>
                <Star size={14} color="#fff" fill="#fff" />
                <Text style={styles.primaryTagText}>Primary Contact</Text>
              </View>
              <Text style={styles.primaryName}>{primaryContact.name}</Text>
              <Text style={styles.primaryRel}>{primaryContact.relationship}</Text>
            </View>
          </TouchableOpacity>
        )}

        {otherContacts.length > 0 && (
          <View style={styles.othersSection}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Other contacts</Text>
            {otherContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.7}
              >
                <View style={[styles.contactIconBox, { backgroundColor: colors.secondary }]}>
                  {getRelationshipIcon(contact.relationship)}
                </View>
                <View style={styles.contactTextWrap}>
                  <Text style={[styles.contactName, { color: colors.foreground }]}>{contact.name}</Text>
                  <Text style={[styles.contactRel, { color: colors.mutedForeground }]}>{contact.relationship}</Text>
                </View>
                <View style={[styles.callIconBox, { backgroundColor: colors.sage + '20' }]}>
                  <Phone size={20} color={colors.sage} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {contacts.length === 0 && (
          <View style={styles.emptyState}>
            <Phone size={64} color={colors.mutedForeground + '60'} style={{ marginBottom: Spacing[4] }} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No emergency contacts set up</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Ask your caregiver to add contacts</Text>
          </View>
        )}

        <View style={[styles.standardEmergency, { borderTopColor: colors.border }]}>
          <Text style={[styles.standardText, { color: colors.mutedForeground }]}>For medical emergencies</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('tel:112')}
            style={[styles.standardBtn, { backgroundColor: colors.destructive + '15', borderColor: colors.destructive + '30' }]}
            activeOpacity={0.8}
          >
            <Phone size={24} color={colors.destructive} />
            <Text style={[styles.standardBtnText, { color: colors.destructive }]}>Call 112</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing[6], marginBottom: Spacing[6] },
  backBtn: { width: 56, height: 56, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize['3xl'], fontFamily: FontFamily.semiBold, textAlign: 'center', marginBottom: Spacing[2] },
  subtitle: { fontSize: FontSize.xl, textAlign: 'center', marginBottom: Spacing[8] },
  content: { paddingHorizontal: Spacing[6], paddingBottom: Spacing[10] },
  primaryCard: { padding: Spacing[6], borderRadius: BorderRadius['2xl'], marginBottom: Spacing[6], flexDirection: 'row', alignItems: 'center', gap: Spacing[5] },
  primaryIconBox: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  primaryTextWrap: { flex: 1 },
  primaryTag: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: 4 },
  primaryTagText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, color: 'rgba(255,255,255,0.8)' },
  primaryName: { fontSize: FontSize['2xl'], fontFamily: FontFamily.semiBold, color: '#fff' },
  primaryRel: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.8)' },
  othersSection: { gap: Spacing[3] },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.medium, marginBottom: Spacing[1] },
  contactCard: { padding: Spacing[5], borderRadius: BorderRadius.xl, borderWidth: 2, flexDirection: 'row', alignItems: 'center', gap: Spacing[4] },
  contactIconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  contactTextWrap: { flex: 1 },
  contactName: { fontSize: FontSize.xl, fontFamily: FontFamily.semiBold },
  contactRel: { fontSize: FontSize.base },
  callIconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  emptyState: { paddingVertical: Spacing[12], alignItems: 'center' },
  emptyTitle: { fontSize: FontSize.xl, fontFamily: FontFamily.medium },
  emptySub: { fontSize: FontSize.base, marginTop: Spacing[2] },
  standardEmergency: { marginTop: Spacing[8], paddingTop: Spacing[6], borderWidth: 0, borderTopWidth: 1 },
  standardText: { fontSize: FontSize.sm, textAlign: 'center', marginBottom: Spacing[3] },
  standardBtn: { padding: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[3] },
  standardBtnText: { fontSize: FontSize.xl, fontFamily: FontFamily.semiBold },
});
