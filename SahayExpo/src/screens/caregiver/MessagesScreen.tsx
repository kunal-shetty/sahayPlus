import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Send, MessageCircle } from 'lucide-react-native';
import { useSahay } from '../../lib/sahay-context';
import { useThemeColors, FontFamily, FontSize, Spacing, BorderRadius } from '../../theme';

export function MessagesScreen() {
  const { data, sendMessage, markMessageRead, user } = useSahay();
  const colors = useThemeColors();
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const messages = data.messages || [];
  const isCaregiver = data.userRole === 'caregiver';

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <MessageCircle color={colors.primary} size={22} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Messages</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <MessageCircle color={colors.muted} size={48} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No messages yet</Text>
          </View>
        )}
        {messages.map((msg) => {
          const isMine = (isCaregiver && msg.from === 'caregiver') || (!isCaregiver && msg.from === 'careReceiver');
          return (
            <View key={msg.id} style={[styles.bubble, isMine ? styles.bubbleRight : styles.bubbleLeft, {
              backgroundColor: isMine ? colors.primary : colors.card,
            }]}>
              <Text style={[styles.bubbleText, { color: isMine ? colors.primaryForeground : colors.foreground }]}>
                {msg.text}
              </Text>
              <Text style={[styles.bubbleTime, { color: isMine ? colors.primaryForeground + '80' : colors.mutedForeground }]}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
          multiline
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim()}
          style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.muted }]}
        >
          <Send color={text.trim() ? colors.primaryForeground : colors.mutedForeground} size={18} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], paddingHorizontal: Spacing[4], paddingTop: Spacing[14], paddingBottom: Spacing[3], borderBottomWidth: 1 },
  headerTitle: { fontSize: FontSize.xl, fontFamily: FontFamily.bold },
  messageList: { flex: 1 },
  messageContent: { padding: Spacing[4], gap: Spacing[2] },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing[20], gap: Spacing[3] },
  emptyText: { fontSize: FontSize.base, fontFamily: FontFamily.regular },
  bubble: { maxWidth: '80%', padding: Spacing[3], borderRadius: BorderRadius.xl },
  bubbleLeft: { alignSelf: 'flex-start', borderBottomLeftRadius: BorderRadius.sm },
  bubbleRight: { alignSelf: 'flex-end', borderBottomRightRadius: BorderRadius.sm },
  bubbleText: { fontSize: FontSize.base, fontFamily: FontFamily.regular },
  bubbleTime: { fontSize: FontSize.xs, fontFamily: FontFamily.regular, marginTop: Spacing[1], alignSelf: 'flex-end' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing[3], gap: Spacing[2], borderTopWidth: 1 },
  input: { flex: 1, borderWidth: 1, borderRadius: BorderRadius.xl, paddingHorizontal: Spacing[4], paddingVertical: Spacing[2.5], fontSize: FontSize.base, fontFamily: FontFamily.regular, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
