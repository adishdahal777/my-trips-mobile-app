import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { SplashScreen } from '../../components/SplashScreen';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import LandingScreen from '../../app/landing';
import OnboardingScreen from '../../app/onboarding';
import PublicFeedScreen from '../../app/public-feed';
import PublicTripScreen from '../../app/public-trip';
import UserProfileScreen from '../../app/user-profile';
import ProfileEditScreen from '../../app/profile-edit';
import FollowListScreen from '../../app/follow-list';
import SuggestDestinationScreen from '../../app/suggest-destination';
import RateAppScreen from '../../app/rate-app';
import NotificationsScreen from '../../app/notifications';
import NotificationSettingsScreen from '../../app/notification-settings';
import PrivacySecurityScreen from '../../app/privacy-security';
import TermsOfServiceScreen from '../../app/terms-of-service';
import ReportBugScreen from '../../app/report-bug';

export type RootStackParams = {
  Landing: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  PublicFeed: undefined;
  PublicTrip: { id: string };
  UserProfile: { userId: string };
  ProfileEdit: undefined;
  FollowList: { userId: string; mode: 'followers' | 'following' };
  SuggestDestination: undefined;
  RateApp: undefined;
  Notifications: undefined;
  NotificationSettings: undefined;
  PrivacySecurity: undefined;
  TermsOfService: undefined;
  ReportBug: undefined;
};

const Stack = createNativeStackNavigator<RootStackParams>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [apiReady, setApiReady] = useState(false);

  if (isLoading || !apiReady) return <SplashScreen onReady={() => setApiReady(true)} />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="PublicFeed" component={PublicFeedScreen} />
          <Stack.Screen name="PublicTrip" component={PublicTripScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen name="FollowList" component={FollowListScreen} />
          <Stack.Screen name="SuggestDestination" component={SuggestDestinationScreen} />
          <Stack.Screen name="RateApp" component={RateAppScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
          <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="ReportBug" component={ReportBugScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Auth" component={AuthStack} />
          <Stack.Screen name="PublicFeed" component={PublicFeedScreen} />
          <Stack.Screen name="PublicTrip" component={PublicTripScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
