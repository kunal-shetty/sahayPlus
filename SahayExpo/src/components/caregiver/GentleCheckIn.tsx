import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSahay } from '../../lib/sahay-context';
import { Phone, MessageCircle, X, Heart } from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';

export function GentleCheckIn() {
  const { getSuggestedCheckIn, dismissCheckInSuggestion, addTimelineEvent, data } = useSahay();
  const colors = useThemeColors();
  const [isVisible, setIsVisible] = useState(true);

  const suggestion = getSuggestedCheckIn();

  if (!suggestion || !isVisible) return null;

  const handleCall = () => {
    addTimelineEvent('check_in', undefined, 'Called to check in');
    dismissCheckInSuggestion();
    setIsVisible(false);
  };

  const handleMessage = () => {
    addTimelineEvent('check_in', undefined, 'Sent a message to check in');
    dismissCheckInSuggestion();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    dismissCheckInSuggestion();
    setIsVisible(false);
  };

  const pendingCount = data.medications.filter((m) => !m.taken).length;

  return (
    <View style={[styles.card, { backgroundColor: colors.blue + '10', borderColor: colors.blue + '30' }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.blue + '20' }]}>
            <Heart size={20} color={colors.blue} strokeWidth={1.5} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>{suggestion}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {pendingCount} medication{pendingCount !== 1 ? 's' : ''} pending
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleDismiss}
          style={[styles.closeBtn, { backgroundColor: colors.card + '80' }]}
        >
          <X size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={handleCall}
          style={[styles.actionBtn, styles.flexRow, { backgroundColor: colors.blue }]}
        >
          <Phone size={18} color="#fff" />
          <Text style={[styles.actionBtnText, { color: '#fff' }]}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleMessage}
          style={[styles.actionBtn, styles.flexRow, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 2 }]}
        >
          <MessageCircle size={18} color={colors.foreground} />
          <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDismiss}
          style={[styles.actionBtn, { backgroundColor: colors.card + '80' }]}
        >
          <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing[5], borderRadius: BorderRadius['2xl'], borderWidth: 2, marginBottom: Spacing[6] },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing[4] },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], flex: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.lg, fontFamily: FontFamily.medium },
  subtitle: { fontSize: FontSize.sm },
  closeBtn: { width: 32, height: 32, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  actionsRow: { flexDirection: 'row', gap: Spacing[3] },
  flexRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  actionBtn: { flex: 1, paddingVertical: Spacing[3], borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
});
