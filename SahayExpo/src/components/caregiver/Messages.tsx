import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import Animated, { FadeInDown, FadeInUp, withTiming, Layout } from 'react-native-reanimated';
import { useSahay } from '../../lib/sahay-context';
import { ArrowLeft, Send, Heart, Check, CheckCheck, MessageCircle } from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MessagesProps {
  onClose: () => void;
}

export function Messages({ onClose }: MessagesProps) {
  const { data, isDataLoading, sendMessage, markMessageRead, getUnreadCount } = useSahay();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const messages = data.messages || [];
  const careReceiverName = data.careReceiver?.name || 'Care Receiver';
  const unreadCount = getUnreadCount();

  useEffect(() => {
    const unread = messages.filter((m) => !m.isRead && m.from === 'careReceiver');
    unread.forEach((m) => markMessageRead(m.id));
  }, [messages, markMessageRead]);

  const handleSend = () => {
    if (newMessage.trim() && !isSending) {
      setIsSending(true);
      sendMessage(newMessage.trim(), false);
      setNewMessage('');
      setTimeout(() => setIsSending(false), 300);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getDateLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View entering={FadeInUp.duration(300)} style={[styles.header, { paddingTop: Math.max(insets.top, Spacing[4]), borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.backButton, { backgroundColor: colors.secondary }]}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.title, { color: colors.foreground }]}>{careReceiverName}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : 'Stay connected with gentle words'}
            </Text>
          </View>
          <View style={[styles.avatarBox, { backgroundColor: colors.sage + '30' }]}>
            <Heart size={20} color={colors.sage} />
          </View>
        </View>
      </Animated.View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && !isDataLoading ? (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.emptyState}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.sage + '20' }]}>
              <MessageCircle size={40} color={colors.sage} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No messages yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Send a warm note to {careReceiverName} to stay connected.
            </Text>
          </Animated.View>
        ) : (
          messages.map((message, idx) => {
            const isFromMe = message.from === 'caregiver';
            const isUnread = !message.isRead && !isFromMe;
            const prevMessage = idx > 0 ? messages[idx - 1] : null;
            const showDateSeparator = !prevMessage || getDateLabel(message.timestamp) !== getDateLabel(prevMessage.timestamp);

            return (
              <Animated.View key={message.id} layout={Layout.springify()}>
                {showDateSeparator && (
                  <View style={styles.dateSeparator}>
                    <View style={[styles.dateBadge, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.dateText, { color: colors.mutedForeground }]}>{getDateLabel(message.timestamp)}</Text>
                    </View>
                  </View>
                )}

                <Animated.View 
                  entering={FadeInDown.duration(250)}
                  style={[styles.messageRow, isFromMe ? styles.messageRight : styles.messageLeft]}
                >
                  <View style={[
                    styles.messageBubble,
                    isFromMe ? [styles.bubbleRight, { backgroundColor: colors.sage }] : 
                    isUnread ? [styles.bubbleUnread, { backgroundColor: colors.card, borderColor: colors.blue + '60' }] : 
                    [styles.bubbleLeft, { backgroundColor: colors.card, borderColor: colors.border }]
                  ]}>
                    {message.isQuickMessage && !isFromMe && (
                      <View style={styles.quickMessageLabel}>
                        <MessageCircle size={12} color={colors.mutedForeground} />
                        <Text style={[styles.quickMessageText, { color: colors.mutedForeground }]}>Quick message</Text>
                      </View>
                    )}
                    
                    <Text style={[
                      styles.messageText,
                      isFromMe ? { color: '#fff' } : 
                      isUnread ? { color: colors.foreground, fontFamily: FontFamily.medium } : 
                      { color: colors.foreground }
                    ]}>
                      {message.text}
                    </Text>

                    <View style={[styles.timeRow, isFromMe && styles.timeRowRight]}>
                      <Text style={[styles.timeText, isFromMe ? { color: 'rgba(255,255,255,0.7)' } : { color: colors.mutedForeground }]}>
                        {formatTime(message.timestamp)}
                      </Text>
                      {isFromMe && (
                        <View style={styles.readStatus}>
                          {message.isRead ? (
                            <CheckCheck size={14} color="rgba(255,255,255,0.7)" />
                          ) : (
                            <Check size={14} color="rgba(255,255,255,0.5)" />
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </Animated.View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(100)} style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, Spacing[4]), borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder={`Message ${careReceiverName}...`}
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.sage, opacity: newMessage.trim() ? 1 : 0.5 }]}
            onPress={handleSend}
            disabled={!newMessage.trim() || isSending}
            activeOpacity={0.8}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: { flex: 1 },
  title: { fontSize: FontSize.xl, fontFamily: FontFamily.semiBold },
  subtitle: { fontSize: FontSize.sm },
  avatarBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  messageList: { padding: Spacing[6], flexGrow: 1, paddingBottom: Spacing[8] },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing[16] },
  emptyIconBox: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[5] },
  emptyTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.semiBold, marginBottom: Spacing[2] },
  emptySub: { fontSize: FontSize.base, textAlign: 'center', maxWidth: 250 },
  dateSeparator: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing[3] },
  dateBadge: { paddingHorizontal: Spacing[3], paddingVertical: 4, borderRadius: BorderRadius.full },
  dateText: { fontSize: FontSize.xs, fontFamily: FontFamily.medium },
  messageRow: { marginBottom: Spacing[3] },
  messageRight: { alignItems: 'flex-end' },
  messageLeft: { alignItems: 'flex-start' },
  messageBubble: { maxWidth: '80%', paddingHorizontal: Spacing[4], paddingVertical: Spacing[3], borderRadius: 16 },
  bubbleRight: { borderBottomRightRadius: 4 },
  bubbleLeft: { borderWidth: 2, borderBottomLeftRadius: 4 },
  bubbleUnread: { borderWidth: 2, borderBottomLeftRadius: 4 },
  quickMessageLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  quickMessageText: { fontSize: FontSize.xs },
  messageText: { fontSize: FontSize.base, lineHeight: 22 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  timeRowRight: { justifyContent: 'flex-end' },
  timeText: { fontSize: 11 },
  readStatus: { marginLeft: 2 },
  inputContainer: { paddingHorizontal: Spacing[4], paddingTop: Spacing[4], borderTopWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing[3] },
  input: {
    flex: 1, minHeight: 48, maxHeight: 120, borderWidth: 2, borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[4], paddingTop: 12, paddingBottom: 12, fontSize: FontSize.base,
  },
  sendButton: { width: 48, height: 48, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
});
