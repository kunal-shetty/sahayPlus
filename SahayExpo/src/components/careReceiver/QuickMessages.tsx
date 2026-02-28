import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInUp, FadeIn, ZoomIn } from 'react-native-reanimated';
import { ArrowLeft, Send, Check, MessageCircle } from 'lucide-react-native';
import { useSahay } from '../../lib/sahay-context';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function QuickMessages({ onClose }: { onClose: () => void }) {
  const { data, sendMessage } = useSahay();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [sendingIndex, setSendingIndex] = useState<number | null>(null);

  const caregiverName = data.caregiver?.name || 'your caregiver';
  const quickMessagesList = data.careReceiver?.quickMessages || [
    'I took my medicine',
    'Feeling good today',
    'Can you call me?',
    'Need help with refill',
    'All done for the day',
  ];

  const handleSendQuick = (message: string, index: number) => {
    setSendingIndex(index);
    setTimeout(() => {
      sendMessage(message, true);
      setSentMessage(message);
      setSendingIndex(null);
    }, 400);
  };

  const handleSendCustom = () => {
    if (customMessage.trim()) {
      sendMessage(customMessage.trim(), false);
      setSentMessage(customMessage.trim());
      setCustomMessage('');
    }
  };

  if (sentMessage) {
    return (
      <View style={[styles.container, { backgroundColor: colors.sage + '15' }]}>
        <View style={styles.successContent}>
          <Animated.View entering={ZoomIn.duration(400)} style={[styles.successIconBox, { backgroundColor: colors.success + '20' }]}>
            <Check size={48} color={colors.success} strokeWidth={3} />
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(300)} style={[styles.successTitle, { color: colors.foreground }]}>Message sent</Animated.Text>
          <Animated.Text entering={FadeIn.delay(400)} style={[styles.successSub, { color: colors.mutedForeground }]}>{caregiverName} will see:</Animated.Text>
          <Animated.View entering={FadeInUp.delay(500)} style={[styles.sentMsgCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sentMsgText, { color: colors.foreground }]}>"{sentMessage}"</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600)} style={styles.actionBtns}>
            <TouchableOpacity onPress={() => setSentMessage(null)} style={[styles.actionBtn, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Send another message</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
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
        <Animated.View entering={FadeIn.delay(100)}>
          <TouchableOpacity onPress={onClose} style={[styles.backBtn, { backgroundColor: colors.secondary }]} activeOpacity={0.8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100)} style={styles.pageTitleRow}>
          <View style={[styles.pageIconBox, { backgroundColor: colors.sage + '20' }]}>
            <MessageCircle size={28} color={colors.sage} />
          </View>
          <View>
            <Text style={[styles.pageTitle, { color: colors.foreground }]}>Send a message</Text>
            <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>to {caregiverName}</Text>
          </View>
        </Animated.View>

        <Animated.Text entering={FadeIn.delay(150)} style={[styles.sectionTitle, { color: colors.foreground }]}>Tap to send</Animated.Text>
        <View style={styles.quickMsgsList}>
          {quickMessagesList.map((msg, idx) => (
            <Animated.View key={idx} entering={FadeInUp.delay(150 + idx * 50)}>
              <TouchableOpacity
                disabled={sendingIndex !== null}
                onPress={() => handleSendQuick(msg, idx)}
                style={[
                  styles.quickMsgBtn,
                  { backgroundColor: sendingIndex === idx ? colors.sage + '15' : colors.card, borderColor: sendingIndex === idx ? colors.sage : colors.border }
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.quickMsgText, { color: colors.foreground }]}>{msg}</Text>
                {sendingIndex === idx && (
                  <Animated.View entering={ZoomIn}>
                    <Check size={20} color={colors.sage} />
                  </Animated.View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInUp.delay(400)} style={styles.customSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Or write your own</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
              value={customMessage}
              onChangeText={setCustomMessage}
              placeholder="Type a message..."
              placeholderTextColor={colors.mutedForeground}
            />
            <TouchableOpacity
              onPress={handleSendCustom}
              disabled={!customMessage.trim()}
              style={[styles.sendBtn, { backgroundColor: customMessage.trim() ? colors.sage : colors.sage + '80' }]}
            >
              <Send size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  successContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing[6] },
  successIconBox: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[6] },
  successTitle: { fontSize: FontSize['2xl'], fontFamily: FontFamily.semiBold, marginBottom: Spacing[3], textAlign: 'center' },
  successSub: { fontSize: FontSize.xl, textAlign: 'center', marginBottom: Spacing[2] },
  sentMsgCard: { paddingHorizontal: Spacing[6], paddingVertical: Spacing[4], borderRadius: BorderRadius.xl, borderWidth: 2, marginBottom: Spacing[8], elevation: 1 },
  sentMsgText: { fontSize: FontSize.lg, textAlign: 'center' },
  actionBtns: { width: '100%', gap: Spacing[3] },
  actionBtn: { width: '100%', paddingVertical: Spacing[4], borderRadius: BorderRadius.xl, alignItems: 'center' },
  actionBtnText: { fontSize: FontSize.lg, fontFamily: FontFamily.medium },

  header: { paddingHorizontal: Spacing[6], marginBottom: Spacing[6] },
  backBtn: { width: 56, height: 56, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: Spacing[6], paddingBottom: Spacing[10] },
  pageTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginBottom: Spacing[6] },
  pageIconBox: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: FontSize['2xl'], fontFamily: FontFamily.semiBold },
  pageSubtitle: { fontSize: FontSize.base },
  sectionTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.medium, marginBottom: Spacing[3] },
  quickMsgsList: { gap: Spacing[3], marginBottom: Spacing[8] },
  quickMsgBtn: { padding: Spacing[5], borderRadius: BorderRadius.xl, borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quickMsgText: { fontSize: FontSize.xl, flex: 1 },
  customSection: { marginTop: 'auto' },
  inputRow: { flexDirection: 'row', gap: Spacing[3] },
  input: { flex: 1, paddingHorizontal: Spacing[5], paddingVertical: Spacing[4], fontSize: FontSize.lg, borderRadius: BorderRadius.xl, borderWidth: 2 },
  sendBtn: { width: 56, height: 56, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
});
