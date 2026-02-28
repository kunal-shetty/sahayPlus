import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSahay } from '../lib/sahay-context';
import { useThemeColors } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { OnboardingFlow } from '../screens/onboarding/OnboardingFlow';
import { EmailLoginScreen } from '../screens/auth/EmailLoginScreen';
import { EnterCareCodeScreen } from '../screens/auth/EnterCareCodeScreen';
import { CaregiverHomeScreen } from '../screens/caregiver/CaregiverHomeScreen';
import { CaregiverOnboardingScreen } from '../screens/caregiver/CaregiverOnboardingScreen';
import { CareReceiverHomeScreen } from '../screens/careReceiver/CareReceiverHomeScreen';

const ONBOARDING_KEY = 'sahay_onboarding_complete';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const { data, isLoading, user } = useSahay();
  const colors = useThemeColors();

  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  useEffect(() => {
    (async () => {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      setShowOnboarding(completed !== 'true');
      setHasCheckedOnboarding(true);
    })();
  }, []);

  const handleSplashComplete = () => setShowSplash(false);
  const handleOnboardingComplete = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  // Determine screen state
  const caregiverSetupComplete = (data?.medications?.length || 0) > 0;

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (isLoading || !hasCheckedOnboarding) {
    return <SplashScreen onComplete={() => {}} />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={EmailLoginScreen} />
        ) : !user.care_relationship_id ? (
          <Stack.Screen name="CareCode" component={EnterCareCodeScreen} />
        ) : user.role === 'caregiver' ? (
          caregiverSetupComplete ? (
            <Stack.Screen name="CaregiverMain" component={CaregiverHomeScreen} />
          ) : (
            <Stack.Screen name="CaregiverOnboarding" component={CaregiverOnboardingScreen} />
          )
        ) : (
          <Stack.Screen name="CareReceiverMain" component={CareReceiverHomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
