import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown, withRepeat, withSequence, withTiming, useAnimatedStyle, useSharedValue, useEffect } from 'react-native-reanimated';
import { useSahay } from '../../lib/sahay-context';
import { Pill, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';

export function QuickPillActions() {
  const { data, markMedicationTaken } = useSahay();
  const colors = useThemeColors();

  const getPillsNeedingAttention = () => {
    const issues = [];
    const pending = data.medications.filter((m) => !m.taken);
    if (pending.length > 0) {
      issues.push({ type: 'pending', count: pending.length, meds: pending });
    }
    const needRefill = data.medications.filter(
      (m) => m.refillDaysLeft !== undefined && m.refillDaysLeft <= 3
    );
    if (needRefill.length > 0) {
      issues.push({ type: 'refill', count: needRefill.length, meds: needRefill });
    }
    return issues;
  };

  const issues = getPillsNeedingAttention();

  if (issues.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {issues.map((issue, idx) => {
        const isPending = issue.type === 'pending';
        const bgColor = isPending ? colors.destructive + '15' : colors.warning + '15';
        const borderColor = isPending ? colors.destructive + '40' : colors.warning + '40';
        const iconColor = isPending ? colors.destructive : colors.warning;
        const Icon = isPending ? AlertCircle : Pill;

        return (
          <Animated.View
            key={`${issue.type}-${idx}`}
            entering={FadeInDown.delay(100 * idx).springify()}
            style={[
              styles.card,
              { backgroundColor: bgColor, borderColor: borderColor }
            ]}
          >
            <View style={styles.headerRow}>
              <AnimatedIconContainer color={iconColor} bgColor={bgColor}>
                <Icon size={20} color={iconColor} />
              </AnimatedIconContainer>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  {isPending
                    ? `${issue.count} pending ${issue.count === 1 ? 'pill' : 'pills'}`
                    : `${issue.count} need refill soon`}
                </Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {issue.meds.map((m) => m.name).join(', ')}
                </Text>
              </View>
            </View>

            {isPending && issue.meds.length > 0 && (
              <View style={styles.actionsGrid}>
                {issue.meds.slice(0, 2).map((med) => (
                  <TouchableOpacity
                    key={med.id}
                    onPress={() => markMedicationTaken(med.id, true)}
                    style={[styles.actionButton, { backgroundColor: colors.success + '20' }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.actionText, { color: colors.success }]} numberOfLines={1}>
                      ✓ {med.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                {issue.meds.length > 2 && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.moreButton, { backgroundColor: colors.muted }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.actionText, { color: colors.foreground }]}>
                      +{issue.meds.length - 2} more
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
}

function AnimatedIconContainer({ children, color, bgColor }: { children: React.ReactNode, color: string, bgColor: string }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.iconContainer, { backgroundColor: bgColor }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing[6],
    gap: Spacing[3],
  },
  card: {
    padding: Spacing[4],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[3],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
  },
  subtitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    marginTop: Spacing[3],
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '45%',
  },
  moreButton: {
    flexBasis: '100%',
  },
  actionText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
  },
});
