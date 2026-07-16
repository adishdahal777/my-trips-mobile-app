import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TripProvider } from './context/TripContext';
import { ForegroundNotificationToast } from './components/ForegroundNotificationToast';
import { PlaneRefreshOverlay } from './components/PlaneRefreshControl';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './utils/navigation';
import { setupNotificationListeners } from './utils/push';
import './app/global.css';

function AppContent() {
  const { colors, isDark } = useTheme();
  const { refresh } = useNotifications();

  useEffect(() => {
    refresh();
    return setupNotificationListeners();
  }, [refresh]);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <AppNavigator />
      <ForegroundNotificationToast />
      <PlaneRefreshOverlay />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <TripProvider>
              <NotificationProvider>
                <AppContent />
              </NotificationProvider>
            </TripProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
