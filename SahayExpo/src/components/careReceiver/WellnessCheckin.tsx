import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInUp, FadeIn, ZoomIn, FadeOut } from 'react-native-reanimated';
import { ArrowLeft, Smile, Meh, Frown, Check } from 'lucide-react-native';
import { useSahay } from '../../lib/sahay-context';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WellnessLevel } from '../../lib/types';

export function WellnessCheckin({ onClose }: { onClose: () => void }) {
  const { logWellness, getTodayWellness, data } = useSahay();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [selectedLevel, setSelectedLevel] = useState<WellnessLevel | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const todayWellness = getTodayWellness();
  const caregiverName = data.caregiver?.name || 'your caregiver';

  const wellnessOptions = [
    { level: 'great' as WellnessLevel, Icon: Smile, label: 'Feeling Great', desc: 'I feel good today', color: colors.success },
    { level: 'okay' as WellnessLevel, Icon: Meh, label: 'Doing Okay', desc: "I'm managing alright", color: colors.pending },
    { level: 'notGreat' as WellnessLevel, Icon: Frown, label: 'Not Feeling Great', desc: 'Could be better', color: colors.destructive },
  ];

  const handleSubmit = () => {
    if (selectedLevel) {
      logWellness(selectedLevel, note.trim() || undefined);
      setSubmitted(true);
    }
  };

  // Already submitted today view
  if (todayWellness && !submitted) {
    const config = wellnessOptions.find((o) => o.level === todayWellness.level)!;
    const Icon = config.Icon;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[6]) }]}>
          <TouchableOpacity onPress={onClose} style={[styles.backBtn, { backgroundColor: colors.secondary }]} activeOpacity={0.8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <View style={styles.successContent}>
          <View style={[styles.successIconBoxRound, { backgroundColor: config.color + '15', borderColor: config.color + '30', borderWidth: 2 }]}>
            <Icon size={48} color={config.color} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>You checked in today</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>{config.label}</Text>
          {todayWellness.note && (
            <Text style={[styles.noteText, { color: colors.mutedForeground }]}>"{todayWellness.note}"</Text>
          )}

          <TouchableOpacity onPress={onClose} style={[styles.actionBtn, { backgroundColor: colors.secondary, marginTop: Spacing[8], width: '100%' }]} activeOpacity={0.8}>
            <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Success view
  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.sage + '15' }]}>
        <View style={styles.successContent}>
          <Animated.View entering={ZoomIn.duration(400)} style={[styles.successIconBox, { backgroundColor: colors.success + '20' }]}>
            <Check size={48} color={colors.success} strokeWidth={3} />
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(300)} style={[styles.successTitle, { color: colors.foreground }]}>Thank you for sharing</Animated.Text>
          <Animated.Text entering={FadeIn.delay(400)} style={[styles.successSub, { color: colors.mutedForeground }]}>{caregiverName} will see how you're feeling</Animated.Text>

          <Animated.View entering={FadeInUp.delay(500)} style={{ width: '100%', marginTop: Spacing[8] }}>
            <TouchableOpacity onPress={onClose} style={[styles.actionBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
              <Text style={[styles.actionBtnText, { color: colors.primaryForeground }]}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[6]) }]}>
        <TouchableOpacity onPress={onClose} style={[styles.backBtn, { backgroundColor: colors.secondary }]} activeOpacity={0.8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>How are you feeling?</Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>Take a moment to check in</Text>

        <View style={styles.optionsList}>
          {wellnessOptions.map((option, idx) => {
            const isSelected = selectedLevel === option.level;
            return (
              <Animated.View key={option.level} entering={FadeInUp.delay(100 + idx * 100)}>
                <TouchableOpacity
                  onPress={() => setSelectedLevel(option.level)}
                  style={[
                    styles.optionCard,
                    { backgroundColor: isSelected ? option.color + '10' : colors.card, borderColor: isSelected ? option.color + '50' : colors.border },
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.optionIconBox, { backgroundColor: isSelected ? option.color + '20' : colors.secondary }]}>
                    <option.Icon size={32} color={isSelected ? option.color : colors.mutedForeground} />
                  </View>
                  <View style={styles.optionTextWrap}>
                    <Text style={[styles.optionLabel, { color: isSelected ? option.color : colors.foreground }]}>{option.label}</Text>
                    <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>{option.desc}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {selectedLevel && (
          <Animated.View entering={FadeInUp} exiting={FadeOut} style={styles.noteSection}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Anything you want to add? <Text style={{ color: colors.mutedForeground, fontWeight: 'normal' }}>(optional)</Text></Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
              value={note}
              onChangeText={setNote}
              placeholder="e.g., Feeling a bit tired today"
              placeholderTextColor={colors.mutedForeground}
            />
          </Animated.View>
        )}

        <Animated.View style={{ opacity: selectedLevel ? 1 : 0.5, marginTop: 'auto' }}>
          <TouchableOpacity
            disabled={!selectedLevel}
            onPress={handleSubmit}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>Share how I feel</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing[6], marginBottom: Spacing[6] },
  backBtn: { width: 56, height: 56, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: Spacing[6], paddingBottom: Spacing[10], flexGrow: 1 },
  pageTitle: { fontSize: FontSize['3xl'], fontFamily: FontFamily.semiBold, textAlign: 'center', marginBottom: Spacing[2] },
  pageSubtitle: { fontSize: FontSize.xl, textAlign: 'center', marginBottom: Spacing[8] },
  optionsList: { gap: Spacing[4], marginBottom: Spacing[8] },
  optionCard: { padding: Spacing[6], borderRadius: BorderRadius['2xl'], borderWidth: 2, flexDirection: 'row', alignItems: 'center', gap: Spacing[5] },
  optionIconBox: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  optionTextWrap: { flex: 1 },
  optionLabel: { fontSize: FontSize.xl, fontFamily: FontFamily.semiBold, marginBottom: 2 },
  optionDesc: { fontSize: FontSize.base },
  noteSection: { marginBottom: Spacing[8] },
  inputLabel: { fontSize: FontSize.lg, fontFamily: FontFamily.medium, marginBottom: Spacing[2] },
  input: { paddingHorizontal: Spacing[5], paddingVertical: Spacing[4], fontSize: FontSize.lg, borderRadius: BorderRadius.xl, borderWidth: 2 },
  submitBtn: { width: '100%', paddingVertical: Spacing[5], borderRadius: BorderRadius.xl, alignItems: 'center' },
  submitBtnText: { fontSize: FontSize.xl, fontFamily: FontFamily.semiBold },

  successContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing[6] },
  successIconBox: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[6] },
  successIconBoxRound: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[6] },
  successTitle: { fontSize: FontSize['2xl'], fontFamily: FontFamily.semiBold, marginBottom: Spacing[2], textAlign: 'center' },
  successSub: { fontSize: FontSize.xl, textAlign: 'center', marginBottom: Spacing[4] },
  noteText: { fontSize: FontSize.lg, fontStyle: 'italic', textAlign: 'center' },
  actionBtn: { width: '100%', paddingVertical: Spacing[4], borderRadius: BorderRadius.xl, alignItems: 'center' },
  actionBtnText: { fontSize: FontSize.lg, fontFamily: FontFamily.medium },
});
