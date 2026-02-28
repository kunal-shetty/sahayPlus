import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, useSharedValue, useAnimatedStyle, withTiming, Easing, withRepeat, withSequence } from 'react-native-reanimated';
import { Heart, Info } from 'lucide-react-native';
import { useSahay } from '../../lib/sahay-context';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { Accelerometer } from 'expo-sensors';

export function SafetyCheckPrompt() {
  const { data, dismissSafetyCheck, triggerSafetyCheck } = useSahay();
  const colors = useThemeColors();
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (data.safetyCheck.status !== 'pending_check') return;

    const triggeredAt = data.safetyCheck.lastTriggered
      ? new Date(data.safetyCheck.lastTriggered).getTime()
      : Date.now();

    const updateCountdown = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - triggeredAt) / 1000);
      const remaining = Math.max(0, 300 - elapsed);
      setCountdown(remaining);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [data.safetyCheck.status, data.safetyCheck.lastTriggered]);

  // Motion Detection
  useEffect(() => {
    let lastTriggerTime = 0;
    
    // Set update interval for accelerometer
    Accelerometer.setUpdateInterval(200);

    const subscription = Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
      // Calculate magnitude (excluding gravity if device is at rest, magnitude is ~1g. 
      // Need a higher threshold for "shake")
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      // Simple shake threshold (> 2g change roughly. Standard gravity is 1g)
      if (magnitude > 2.5 && now - lastTriggerTime > 5000) {
        lastTriggerTime = now;
        triggerSafetyCheck('motion');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [triggerSafetyCheck]);

  // Pulse animation setup
  useEffect(() => {
    if (data.safetyCheck.status === 'pending_check') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1500, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 0 })
        ),
        -1, // Infinite repeat
        false
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
          withTiming(0.5, { duration: 0 })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = 1;
      pulseOpacity.value = 0.5;
    }
  }, [data.safetyCheck.status]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
    };
  });

  if (data.safetyCheck.status !== 'pending_check') return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const progress = (countdown / 300) * 100;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.overlay, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Animated.View entering={ZoomIn.delay(200)} style={styles.iconContainer}>
          <Animated.View style={[styles.pulseCircle, { borderColor: colors.sage }, pulseStyle]} />
          <View style={[styles.innerIconBox, { backgroundColor: colors.sage + '20' }]}>
            <Heart size={64} color={colors.sage} />
          </View>
        </Animated.View>

        <Text style={[styles.title, { color: colors.foreground }]}>Are you okay?</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          We noticed a quick movement and just wanted to check in.
        </Text>

        <TouchableOpacity onPress={dismissSafetyCheck} style={[styles.dismissBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} activeOpacity={0.9}>
          <Text style={[styles.dismissBtnText, { color: colors.primaryForeground }]}>Yes, I'm okay</Text>
        </TouchableOpacity>

        <View style={[styles.infoCard, { backgroundColor: colors.secondary + '80' }]}>
          <Info size={24} color={colors.mutedForeground} style={styles.infoIcon} />
          <View style={styles.infoTextWrap}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>No rush at all.</Text>
            <Text style={[styles.infoDesc, { color: colors.mutedForeground }]}>
              If you don't respond in {minutes > 0 ? `${minutes}m ` : ''}{seconds}s, we'll quietly let {data.caregiver?.name || 'your caregiver'} know.
            </Text>

            <View style={[styles.progressBarBg, { backgroundColor: colors.muted }]}>
              <View style={[styles.progressBarFill, { backgroundColor: colors.sage, width: `${progress}%` }]} />
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 999, justifyContent: 'center', alignItems: 'center', padding: Spacing[6] },
  content: { walignItems: 'center', width: '100%', maxWidth: 400 },
  iconContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[8], alignSelf: 'center' },
  pulseCircle: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 4, zIndex: -1 },
  innerIconBox: { width: 128, height: 128, borderRadius: 64, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize['4xl'], fontFamily: FontFamily.bold, textAlign: 'center', marginBottom: Spacing[4] },
  subtitle: { fontSize: FontSize['2xl'], textAlign: 'center', marginBottom: Spacing[12], alignSelf: 'center' },
  dismissBtn: { paddingVertical: Spacing[6], borderRadius: BorderRadius['2xl'], alignItems: 'center', marginBottom: Spacing[12], elevation: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  dismissBtnText: { fontSize: FontSize['2xl'], fontFamily: FontFamily.bold },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[4], padding: Spacing[6], borderRadius: BorderRadius['2xl'] },
  infoIcon: { marginTop: 4 },
  infoTextWrap: { flex: 1 },
  infoTitle: { fontSize: FontSize.lg, fontFamily: FontFamily.medium, marginBottom: 4 },
  infoDesc: { fontSize: FontSize.base, lineHeight: 22 },
  progressBarBg: { height: 6, borderRadius: 3, marginTop: Spacing[4], overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
});
