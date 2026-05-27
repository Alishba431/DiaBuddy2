import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withRepeat, withSequence, Easing,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';

const BUDDIES = [
  { emoji: '🦁', delay: 0 },
  { emoji: '🤖', delay: 200 },
  { emoji: '🐼', delay: 400 },
];

function BouncingBuddy({ emoji, delay }: { emoji: string; delay: number }) {
  const translateY = useSharedValue(60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay + 400, withRepeat(
      withSequence(
        withTiming(-16, { duration: 500, easing: Easing.out(Easing.quad) }),
        withTiming(0,   { duration: 500, easing: Easing.in(Easing.quad) }),
      ),
      -1, false,
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={style}><Text style={styles.buddyEmoji}>{emoji}</Text></Animated.View>;
}

export default function SplashScreen() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const t = setTimeout(() => router.replace('/(auth)/login' as any), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark, '#1A2A80']}
      style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}
    >
      <View style={styles.logoArea}>
        <Text style={styles.appName}>DiaBuddy</Text>
        <Text style={styles.tagline}>Your Diabetes Companion</Text>
      </View>

      <View style={styles.buddies}>
        {BUDDIES.map(b => <BouncingBuddy key={b.emoji} emoji={b.emoji} delay={b.delay} />)}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.footerText}>Loading...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 },
  logoArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 48, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: -1, marginBottom: 8 },
  tagline: { fontSize: 18, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)' },
  buddies: { flexDirection: 'row', gap: 24, marginBottom: 32 },
  buddyEmoji: { fontSize: 64 },
  footer: { alignItems: 'center' },
  footerText: { fontSize: 16, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.5)' },
});
