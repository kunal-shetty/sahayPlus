import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Heart, Shield, Bell, Calendar, ArrowRight, Sparkles } from 'lucide-react-native';
import { useThemeColors, FontFamily, FontSize, Spacing, BorderRadius } from '../../theme';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: Heart,
    title: 'Welcome to Sahay+',
    subtitle: 'Gentle medication care for families',
    description: 'A calm, human-centered app for managing everyday medication routines together.',
    color: 'primary',
  },
  {
    icon: Calendar,
    title: 'Simple Routines',
    subtitle: 'Morning, Afternoon, Evening',
    description: 'Organize medications by time of day. Track what\'s taken, what\'s pending.',
    color: 'sahayBlue',
  },
  {
    icon: Shield,
    title: 'Peace of Mind',
    subtitle: 'Stay connected with care',
    description: 'Safety checks, emergency contacts, and gentle notifications keep everyone informed.',
    color: 'success',
  },
  {
    icon: Sparkles,
    title: 'Ready to Begin',
    subtitle: 'Everyday care, made easier',
    description: 'Set up your profile and start managing medication with confidence.',
    color: 'accent',
  },
];

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const colors = useThemeColors();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const iconColor = (colors as any)[slide.color] || colors.primary;
  const isLast = currentSlide === slides.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Icon color={iconColor} size={44} strokeWidth={1.5} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{slide.title}</Text>
        <Text style={[styles.subtitle, { color: iconColor }]}>{slide.subtitle}</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{slide.description}</Text>
      </View>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i === currentSlide ? colors.primary : colors.muted }]}
          />
        ))}
      </View>

      <View style={styles.bottom}>
        {isLast ? (
          <Button title="Get Started" onPress={onComplete} fullWidth size="lg" />
        ) : (
          <View style={styles.row}>
            <TouchableOpacity onPress={onComplete}>
              <Text style={[styles.skip, { color: colors.mutedForeground }]}>Skip</Text>
            </TouchableOpacity>
            <Button
              title="Next"
              onPress={() => setCurrentSlide((p) => p + 1)}
              icon={<ArrowRight color={colors.primaryForeground} size={18} />}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing[6], paddingTop: Spacing[20], paddingBottom: Spacing[10] },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconContainer: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[8] },
  title: { fontSize: FontSize['3xl'], fontFamily: FontFamily.bold, textAlign: 'center', marginBottom: Spacing[2] },
  subtitle: { fontSize: FontSize.lg, fontFamily: FontFamily.semiBold, textAlign: 'center', marginBottom: Spacing[4] },
  description: { fontSize: FontSize.base, fontFamily: FontFamily.regular, textAlign: 'center', lineHeight: 24, paddingHorizontal: Spacing[4] },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: Spacing[2], marginBottom: Spacing[8] },
  dot: { width: 8, height: 8, borderRadius: 4 },
  bottom: { paddingHorizontal: Spacing[4] },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skip: { fontSize: FontSize.base, fontFamily: FontFamily.medium },
});
