import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { useMissions, useChildProfile } from '@/context/AppContext';

export default function QuizResultScreen() {
  const { score, total, points } = useLocalSearchParams<{ score: string; total: string; points: string }>();
  const sc = parseInt(score ?? '0');
  const tot = parseInt(total ?? '0');
  const pts = parseInt(points ?? '0');
  const pct = tot > 0 ? sc / tot : 0;

  const trophyScale = useSharedValue(0);
  const cardScale = useSharedValue(0.8);
  const { awardBadge } = useMissions();
  const { addPoints } = useChildProfile();

  useEffect(() => {
    trophyScale.value = withDelay(200, withSpring(1, { damping: 6, stiffness: 180 }));
    cardScale.value = withDelay(100, withSpring(1, { damping: 10 }));
    if (pts > 0) addPoints(pts);
    awardBadge('first_quiz');
  }, []);

  const trophyStyle = useAnimatedStyle(() => ({ transform: [{ scale: trophyScale.value }] }));
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }));

  const grade = pct >= 0.8 ? { label: 'Excellent!', emoji: '🏆', color: COLORS.yellow } :
    pct >= 0.6 ? { label: 'Good Job!', emoji: '🌟', color: COLORS.primary } :
    { label: 'Keep Trying!', emoji: '💪', color: COLORS.alertOrange };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.trophyArea, trophyStyle]}>
        <Text style={styles.trophyEmoji}>{grade.emoji}</Text>
        <Text style={styles.gradeLabel}>{grade.label}</Text>
      </Animated.View>

      <Animated.View style={[styles.resultCard, cardStyle]}>
        <Text style={styles.scoreText}>{sc}/{tot}</Text>
        <Text style={styles.scoreLabel}>Correct answers</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: grade.color }]} />
        </View>
        <Text style={styles.progressPct}>{Math.round(pct * 100)}% correct</Text>

        <View style={styles.pointsBadge}>
          <Text style={styles.pointsValue}>+{pts}</Text>
          <Text style={styles.pointsLabel}>Points earned! ⭐</Text>
        </View>
      </Animated.View>

      {pct >= 0.8 && (
        <View style={styles.certificateBanner}>
          <Text style={styles.certText}>🏅 You earned a certificate!</Text>
          <TouchableOpacity onPress={() => router.push('/learn/certificate' as any)}>
            <Text style={styles.certLink}>View Certificate →</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)/learn' as any)}>
        <Text style={styles.homeBtnText}>Back to Learn Zone</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
        <Text style={styles.retryBtnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },
  trophyArea: { alignItems: 'center', gap: 8 },
  trophyEmoji: { fontSize: 80 },
  gradeLabel: { fontSize: 28, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  resultCard: {
    width: '100%', backgroundColor: COLORS.card, borderRadius: 28, padding: 28,
    alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  scoreText: { fontSize: 56, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  scoreLabel: { fontSize: 18, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  progressTrack: { width: '100%', height: 14, backgroundColor: COLORS.background, borderRadius: 7, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 7 },
  progressPct: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  pointsBadge: {
    backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 14, alignItems: 'center',
  },
  pointsValue: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#fff' },
  pointsLabel: { fontSize: 16, fontFamily: 'Inter_500Medium', color: 'rgba(255,255,255,0.85)' },
  certificateBanner: {
    backgroundColor: COLORS.yellow, borderRadius: 20, padding: 16, width: '100%',
    alignItems: 'center', gap: 6,
  },
  certText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  certLink: { fontSize: 15, fontFamily: 'Inter_700Bold', color: COLORS.primary },
  homeBtn: { backgroundColor: COLORS.primary, borderRadius: 24, paddingVertical: 18, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  homeBtnText: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' },
  retryBtn: { borderRadius: 24, paddingVertical: 14, paddingHorizontal: 40 },
  retryBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
});
