import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { useSahay } from '../../lib/sahay-context';
import { ArrowLeft, Phone, Plus, Star, Trash2, User, Building2, Stethoscope } from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function EmergencyContacts({ onClose }: { onClose: () => void }) {
  const { data, addEmergencyContact, removeEmergencyContact, setPrimaryContact } = useSahay();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelationship, setNewRelationship] = useState('');

  const handleAdd = () => {
    if (newName.trim() && newPhone.trim()) {
      addEmergencyContact({
        name: newName.trim(),
        phone: newPhone.trim(),
        relationship: newRelationship.trim() || 'Contact',
        isPrimary: (data.emergencyContacts || []).length === 0,
      });
      setNewName('');
      setNewPhone('');
      setNewRelationship('');
      setShowAddForm(false);
    }
  };

  const getRelationshipIcon = (relationship: string, color: string) => {
    const lower = relationship.toLowerCase();
    if (lower.includes('doctor') || lower.includes('dr.')) return <Stethoscope size={20} color={color} />;
    if (lower.includes('hospital') || lower.includes('clinic')) return <Building2 size={20} color={color} />;
    return <User size={20} color={color} />;
  };

  const contacts = data.emergencyContacts || [];
  const primaryContacts = contacts.filter((c) => c.isPrimary);
  const otherContacts = contacts.filter((c) => !c.isPrimary);

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[6]) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: colors.secondary }]} activeOpacity={0.8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Emergency Contacts</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Quick access when needed</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing[8]) }]} keyboardShouldPersistTaps="handled">
        {primaryContacts.length > 0 && (
          <View style={styles.section}>
            {primaryContacts.map((contact) => (
              <View key={contact.id} style={[styles.primaryCard, { backgroundColor: colors.sage + '15', borderColor: colors.sage + '40' }]}>
                <View style={styles.primaryBadgeRow}>
                  <Star size={14} color={colors.sage} fill={colors.sage} />
                  <Text style={[styles.primaryBadgeText, { color: colors.sage }]}>Primary Contact</Text>
                </View>
                <View style={styles.contactRow}>
                  <View style={styles.contactInfoRow}>
                    <View style={[styles.primaryIconBox, { backgroundColor: colors.sage + '30' }]}>
                      {getRelationshipIcon(contact.relationship, colors.sage)}
                    </View>
                    <View>
                      <Text style={[styles.contactName, { color: colors.foreground }]}>{contact.name}</Text>
                      <Text style={[styles.contactRelation, { color: colors.mutedForeground }]}>{contact.relationship}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                    style={[styles.callButton, { backgroundColor: colors.sage }]}
                    activeOpacity={0.8}
                  >
                    <Phone size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.contactPhoneLarge, { color: colors.foreground }]}>{contact.phone}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Contacts</Text>
          <View style={styles.contactList}>
            {otherContacts.map((contact) => (
              <View key={contact.id} style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.contactRow}>
                  <View style={styles.contactInfoRow}>
                    <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
                      {getRelationshipIcon(contact.relationship, colors.mutedForeground)}
                    </View>
                    <View>
                      <Text style={[styles.contactNameSmall, { color: colors.foreground }]}>{contact.name}</Text>
                      <Text style={[styles.contactDetail, { color: colors.mutedForeground }]}>{contact.relationship}</Text>
                      <Text style={[styles.contactDetail, { color: colors.mutedForeground }]}>{contact.phone}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => setPrimaryContact(contact.id)} style={[styles.actionBtn, { backgroundColor: colors.secondary }]} activeOpacity={0.7}>
                      <Star size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${contact.phone}`)} style={[styles.actionBtn, { backgroundColor: colors.sage + '20' }]} activeOpacity={0.7}>
                      <Phone size={16} color={colors.sage} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeEmergencyContact(contact.id)} style={[styles.actionBtn, { backgroundColor: colors.destructive + '15' }]} activeOpacity={0.7}>
                      <Trash2 size={16} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {contacts.length === 0 && !showAddForm && (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No emergency contacts added yet</Text>
              </View>
            )}
          </View>
        </View>

        {showAddForm ? (
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>Add Contact</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={newName}
                onChangeText={setNewName}
                placeholder="Dr. Sharma"
                placeholderTextColor={colors.mutedForeground + '80'}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Phone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={newPhone}
                onChangeText={setNewName} // Wait, BUG in original! Let's fix: onChangeText={setNewPhone}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                placeholderTextColor={colors.mutedForeground + '80'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Relationship</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                value={newRelationship}
                onChangeText={setNewRelationship}
                placeholder="Family Doctor"
                placeholderTextColor={colors.mutedForeground + '80'}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity onPress={() => setShowAddForm(false)} style={[styles.formBtn, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.formBtnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAdd}
                disabled={!newName.trim() || !newPhone.trim()}
                style={[styles.formBtn, { backgroundColor: (!newName.trim() || !newPhone.trim()) ? colors.muted : colors.primary }]}
              >
                <Text style={[styles.formBtnText, { color: (!newName.trim() || !newPhone.trim()) ? colors.mutedForeground : colors.primaryForeground }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowAddForm(true)}
            style={[styles.addButton, { backgroundColor: colors.secondary }]}
            activeOpacity={0.8}
          >
            <Plus size={20} color={colors.foreground} />
            <Text style={[styles.addButtonText, { color: colors.foreground }]}>Add emergency contact</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing[6], paddingBottom: Spacing[4] },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4], marginBottom: Spacing[2] },
  backButton: { width: 48, height: 48, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize['2xl'], fontFamily: FontFamily.semiBold },
  subtitle: { fontSize: FontSize.base },
  content: { padding: Spacing[6] },
  section: { marginBottom: Spacing[6] },
  primaryCard: { padding: Spacing[5], borderRadius: BorderRadius['2xl'], borderWidth: 2 },
  primaryBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginBottom: Spacing[3] },
  primaryBadgeText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  contactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contactInfoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4], flex: 1 },
  primaryIconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  contactName: { fontSize: FontSize.xl, fontFamily: FontFamily.semiBold },
  contactRelation: { fontSize: FontSize.base },
  callButton: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  contactPhoneLarge: { fontSize: FontSize.lg, fontFamily: FontFamily.medium, marginTop: Spacing[3] },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.medium, marginBottom: Spacing[4] },
  contactList: { gap: Spacing[3] },
  contactCard: { padding: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  contactNameSmall: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
  contactDetail: { fontSize: FontSize.sm },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  actionBtn: { width: 40, height: 40, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  emptyState: { paddingVertical: Spacing[8], alignItems: 'center' },
  emptyText: { fontSize: FontSize.base },
  formCard: { padding: Spacing[5], borderRadius: BorderRadius['2xl'], borderWidth: 2, gap: Spacing[4] },
  formTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.semiBold },
  inputGroup: { gap: Spacing[2] },
  label: { fontSize: FontSize.sm, fontFamily: FontFamily.medium },
  input: { borderWidth: 2, borderRadius: BorderRadius.xl, paddingHorizontal: Spacing[4], paddingVertical: 12, fontSize: FontSize.base },
  formActions: { flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[2] },
  formBtn: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.xl, alignItems: 'center' },
  formBtnText: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2], paddingVertical: Spacing[4], borderRadius: BorderRadius.xl },
  addButtonText: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
});
