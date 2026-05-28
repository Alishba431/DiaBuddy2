import {
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Ensure splash screen is prevented from auto hiding as early as possible
SplashScreen.preventAutoHideAsync();
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppProviders, useAuth } from '@/context/AppContext';
import { COLORS } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

const headerDefaults = {
  headerStyle: { backgroundColor: COLORS.card },
  headerTintColor: COLORS.primary,
  headerTitleStyle: { fontFamily: 'Inter_700Bold', color: COLORS.textDark, fontSize: 17 },
  headerShadowVisible: false,
  headerBackTitle: '',
};

function RootLayoutNav() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = (segments[0] as string) === '(auth)';
    if (!currentUser && !inAuth) {
      router.replace('/(auth)/login' as any);
    } else if (currentUser && inAuth) {
      router.replace((currentUser.role === 'caretaker' ? '/caregiver/dashboard' : '/') as any);
    }
  }, [currentUser, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
      <Stack.Screen name="(auth)"         options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)"         options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)"   options={{ headerShown: false }} />
      <Stack.Screen name="treatment/my-sugar"      options={{ ...headerDefaults, headerShown: true, title: 'My Sugar' }} />
      <Stack.Screen name="treatment/my-medicine"   options={{ ...headerDefaults, headerShown: true, title: 'My Medicine' }} />
      <Stack.Screen name="treatment/eat-smart"     options={{ ...headerDefaults, headerShown: true, title: 'Eat Smart' }} />
      <Stack.Screen name="treatment/move-play"     options={{ ...headerDefaults, headerShown: true, title: 'Move & Play' }} />
      <Stack.Screen name="treatment/glucose-trend" options={{ ...headerDefaults, headerShown: true, title: 'This Week' }} />
      <Stack.Screen name="learn/video-player"      options={{ ...headerDefaults, headerShown: true, title: 'Learn' }} />
      <Stack.Screen name="learn/quiz"              options={{ ...headerDefaults, headerShown: true, title: 'Quiz' }} />
      <Stack.Screen name="learn/quiz-result"       options={{ ...headerDefaults, headerShown: true, title: 'Results' }} />
      <Stack.Screen name="learn/certificate"       options={{ ...headerDefaults, headerShown: true, title: 'Certificate' }} />
      <Stack.Screen name="caregiver/dashboard"     options={{ headerShown: false }} />
      <Stack.Screen name="settings"                options={{ ...headerDefaults, headerShown: true, title: 'Settings' }} />
      <Stack.Screen name="notifications"           options={{ ...headerDefaults, headerShown: true, title: 'Alerts & Notifications' }} />
      <Stack.Screen name="ai-health"               options={{ ...headerDefaults, headerShown: true, title: 'AI Health Insights' }} />
      <Stack.Screen name="analytics"               options={{ ...headerDefaults, headerShown: true, title: 'Analytics' }} />
      <Stack.Screen name="health-report"           options={{ ...headerDefaults, headerShown: true, title: 'Health Report' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    // Hide splash screen once fonts are loaded (or an error occurs)
    const hide = async () => {
      try {
        if (fontsLoaded || fontError) {
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn('SplashScreen hide error', e);
      }
    };
    hide();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProviders>
                <RootLayoutNav />
              </AppProviders>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
