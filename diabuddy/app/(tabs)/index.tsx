import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useChildProfile, useGlucose, useMissions } from '@/context/AppContext';
import { CharacterMascot } from '@/components/CharacterMascot';
import { GlucoseZoneBadge } from '@/components/GlucoseZoneBadge';
import { PointsToast } from '@/components/PointsToast';

const TIPS = [
  "Don't forget your afternoon glucose check!",
  "Great job logging today. Keep it up!",
  "Stay hydrated — drink plenty of water.",
  "Remember to check before exercise.",
  "You are doing amazing this week!",
];

const MOODS = ['😄', '😊', '😐', '😟', '😢'];

const QUICK_ACTIONS = [
  { icon: 'bar-chart', label: 'Analytics', screen: '/analytics', tint: COLORS.blue },
  { icon: 'pulse',     label: 'AI Health', screen: '/ai-health', tint: COLORS.mint },
  { icon: 'notifications', label: 'Alerts', screen: '/notifications', tint: COLORS.yellow },
  { icon: 'document-text', label: 'Report', screen: '/health-report', tint: COLORS.purple },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile, getCharacterEmoji } = useChildProfile();
  const { lastReading, getZone } = useGlucose();
  const { missions, toggleMission, completedCount } = useMissions();
  const [tipIdx, setTipIdx] = useState(0);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [toast, setToast] = useState(false);
  const [toastPts, setToastPts] = useState(0);

  const progressW = useSharedValue(0);

  useEffect(() => {
    progressW.value = withTiming(completedCount / missions.length, { duration: 800 });
  }, [completedCount]);

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const progressStyle = useAnimatedStyle(() => ({ width: `${progressW.value * 100}%` as any }));

  const handleMission = (id: string, pts: number, screen: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleMission(id);
    setToastPts(pts);
    setToast(true);
  };

  const zone = lastReading ? getZone(lastReading.value) : 'green';
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <PointsToast points={toastPts} visible={toast} onHide={() => setToast(false)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>

        {/* Top Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {profile.name}</Text>
            <Text style={styles.greetingSub}>Let's manage your sugar today</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFlame}>🔥</Text>
            <Text style={styles.streakText}>{profile.streak} days</Text>
          </View>
        </View>

        {/* Character + Tip Card */}
        <View style={styles.characterCard}>
          <CharacterMascot emoji={getCharacterEmoji()} mood="happy" size={72} />
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>{TIPS[tipIdx]}</Text>
          </View>
        </View>

        {/* Today's Progress */}
        <View style={styles.section}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Today's Missions</Text>
            <Text style={styles.progressCount}>{completedCount} of {missions.length} done</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
        </View>

        {/* Missions */}
        {missions.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[styles.missionCard, m.status === 'done' && styles.missionDone]}
            onPress={() => m.status === 'pending' ? handleMission(m.id, m.points, m.screen) : undefined}
            activeOpacity={m.status === 'pending' ? 0.7 : 1}
          >
            <View style={[styles.missionIconBox, { backgroundColor: m.status === 'done' ? COLORS.mint : COLORS.surface }]}>
              <Ionicons
                name={m.status === 'done' ? 'checkmark-circle' : 'time-outline'}
                size={24}
                color={m.status === 'done' ? COLORS.success : COLORS.textMuted}
              />
            </View>
            <View style={styles.missionInfo}>
              <Text style={[styles.missionTitle, m.status === 'done' && styles.missionTitleDone]}>{m.title}</Text>
              <Text style={styles.missionPts}>+{m.points} pts</Text>
            </View>
            {m.status === 'pending' && (
              <TouchableOpacity
                style={styles.doItBtn}
                onPress={() => { handleMission(m.id, m.points, m.screen); router.push(m.screen as any); }}
              >
                <Text style={styles.doItText}>Go</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}

        {/* Glucose Card */}
        {lastReading && (
          <TouchableOpacity style={styles.glucoseCard} onPress={() => router.push('/treatment/my-sugar' as any)}>
            <Text style={styles.glucoseLabel}>Last Reading</Text>
            <View style={styles.glucoseRow}>
              <Text style={[styles.glucoseValue, {
                color: zone === 'green' ? COLORS.zoneGreen : zone === 'yellow' ? COLORS.zoneYellow : COLORS.alertRed,
              }]}>
                {lastReading.value}
              </Text>
              <Text style={styles.glucoseUnit}>mg/dL</Text>
              <GlucoseZoneBadge value={lastReading.value} showValue={false} />
            </View>
            <Text style={styles.glucoseTime}>{lastReading.time} · {lastReading.type}</Text>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Insights</Text>
          <View style={styles.qaGrid}>
            {QUICK_ACTIONS.map(a => (
              <TouchableOpacity
                key={a.label}
                style={[styles.qaCard, { backgroundColor: a.tint }]}
                onPress={() => router.push(a.screen as any)}
                activeOpacity={0.8}
              >
                <Ionicons name={a.icon as any} size={22} color={COLORS.textDark} />
                <Text style={styles.qaLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mood Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.moodBtn, selectedMood === i && styles.moodBtnSelected]}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedMood(i);
                }}
              >
                <Text style={styles.moodEmoji}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedMood !== null && (
            <Text style={styles.moodConfirm}>Mood logged for today</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 22, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  greetingSub: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF3E0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1.5, borderColor: COLORS.alertOrange,
  },
  streakFlame: { fontSize: 16 },
  streakText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: COLORS.alertOrange },
  characterCard: {
    backgroundColor: COLORS.card, borderRadius: 24, padding: 20, alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  speechBubble: {
    backgroundColor: COLORS.surface, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  speechText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: COLORS.textDark, textAlign: 'center' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressCount: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: COLORS.primary },
  progressTrack: { height: 14, backgroundColor: COLORS.border, borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 7 },
  missionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 20, padding: 16, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  missionDone: { opacity: 0.65 },
  missionIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  missionInfo: { flex: 1 },
  missionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  missionTitleDone: { color: COLORS.textMuted, textDecorationLine: 'line-through' },
  missionPts: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  doItBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 9 },
  doItText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#fff' },
  glucoseCard: {
    backgroundColor: COLORS.card, borderRadius: 24, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  glucoseLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: COLORS.textMuted, marginBottom: 8 },
  glucoseRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  glucoseValue: { fontSize: 42, fontFamily: 'Inter_700Bold' },
  glucoseUnit: { fontSize: 18, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, marginTop: 8 },
  glucoseTime: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  qaGrid: { flexDirection: 'row', gap: 10 },
  qaCard: {
    flex: 1, borderRadius: 18, padding: 16, alignItems: 'center', gap: 8, minHeight: 80, justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  qaLabel: { fontSize: 12, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  moodRow: { flexDirection: 'row', justifyContent: 'space-around' },
  moodBtn: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.card,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.border,
  },
  moodBtnSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.surface, borderWidth: 3 },
  moodEmoji: { fontSize: 28 },
  moodConfirm: { fontSize: 14, fontFamily: 'Inter_500Medium', color: COLORS.primary, textAlign: 'center' },
});
