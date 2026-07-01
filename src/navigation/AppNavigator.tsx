import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import LandingScreen from '../../app/landing';
import OnboardingScreen from '../../app/onboarding';
import PublicFeedScreen from '../../app/public-feed';
import PublicTripScreen from '../../app/public-trip';

export type RootStackParams = {
  Landing: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  PublicFeed: undefined;
  PublicTrip: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParams>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="PublicFeed" component={PublicFeedScreen} />
          <Stack.Screen name="PublicTrip" component={PublicTripScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Auth" component={AuthStack} />
          <Stack.Screen name="PublicFeed" component={PublicFeedScreen} />
          <Stack.Screen name="PublicTrip" component={PublicTripScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
