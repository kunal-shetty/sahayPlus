import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useThemeColors, FontFamily, FontSize, Spacing } from '../../theme';

const { width } = Dimensions.get('window');

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const colors = useThemeColors();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.logoContainer, { backgroundColor: colors.primary + '15', transform: [{ scale }] }]}>
        <Heart color={colors.primary} size={48} strokeWidth={1.5} />
      </Animated.View>
      <Animated.Text style={[styles.title, { color: colors.foreground, opacity }]}>
        Sahay+
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { color: colors.mutedForeground, opacity: textOpacity }]}>
        Gentle medication care
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[6],
  },
  title: {
    fontSize: FontSize['4xl'],
    fontFamily: FontFamily.bold,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.regular,
  },
});
