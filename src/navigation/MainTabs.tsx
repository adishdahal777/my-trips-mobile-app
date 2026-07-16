import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Dashboard from '../../app/(tabs)/dashboard';
import Explore from '../../app/(tabs)/explore';
import Profile from '../../app/(tabs)/profile';
import TripStack from './TripStack';
import TabBar from './TabBar';

// Nested screens that should hide the bottom tab bar (detail view, back-only).
const HIDE_TAB_BAR_ON = ['TripDetail'];

export type MainTabsParams = {
  Dashboard: undefined;
  Trips: undefined;
  Explore: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParams>();

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen
        name="Trips"
        component={TripStack}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? 'TripsList';
          return {
            tabBarStyle: HIDE_TAB_BAR_ON.includes(focused) ? { display: 'none' } : undefined,
          };
        }}
      />
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
