import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInUp, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, BarChart3, Heart, MessageCircle } from 'lucide-react-native';
import { useThemeColors, FontSize, FontFamily, Spacing, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CaregiverBottomNav({ state, descriptors, navigation, unreadMessages = 0 }: BottomTabBarProps & { unreadMessages?: number }) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom, borderTopColor: colors.border }]}>
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({ name: route.name, merge: true });
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const getIcon = () => {
            if (route.name === 'HomeTab') return Home;
            if (route.name === 'ActivityTab') return BarChart3;
            if (route.name === 'CareTab') return Heart;
            if (route.name === 'MessagesTab') return MessageCircle;
            return Home;
          };

          const Icon = getIcon();

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapper}>
                <AnimatedIcon isFocused={isFocused}>
                  <Icon 
                    size={22} 
                    color={isFocused ? colors.primary : colors.mutedForeground} 
                    strokeWidth={isFocused ? 2.5 : 1.8} 
                  />
                </AnimatedIcon>

                {route.name === 'MessagesTab' && unreadMessages > 0 && (
                  <View style={[styles.badgeContainer, { backgroundColor: colors.destructive }]}>
                    <Text style={styles.badgeText}>
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[
                styles.tabLabel, 
                { color: isFocused ? colors.primary : colors.mutedForeground },
                isFocused && styles.tabLabelFocused
              ]}>
                {label as string}
              </Text>
              
              {isFocused && (
                <Animated.View layout={withSpring} style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function AnimatedIcon({ children, isFocused }: { children: React.ReactNode, isFocused: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(isFocused ? 1.15 : 1, { stiffness: 400, damping: 20 }) },
      { translateY: withSpring(isFocused ? -2 : 0, { stiffness: 400, damping: 20 }) }
    ],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    height: 64,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrapper: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontFamily: FontFamily.medium,
  },
  tabLabelFocused: {
    fontFamily: FontFamily.bold,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: FontFamily.bold,
  }
});
