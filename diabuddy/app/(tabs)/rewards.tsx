import React, { useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useChildProfile, useAuth, useMissions } from '@/context/AppContext';
import { buildRollingWeek, checkAndAwardBadges, fetchEarnedBadgeTypes } from '@/lib/rewards';
import { supabase } from '@/lib/supabase';

const BADGE_DEFS = [
  { id: 'first_log', name: 'First Log', emoji: '🏅', requirement: 'Log your first glucose' },
  { id: 'week_streak', name: '7-Day Streak', emoji: '🔥', requirement: 'Log 7 days in a row' },
  { id: 'month_streak', name: 'Month Champion', emoji: '🏆', requirement: 'Log 30 days in a row' },
  { id: 'first_quiz', name: 'Quiz Master', emoji: '🧠', requirement: 'Complete a quiz' },
  { id: 'diabetes_star', name: 'Diabetes Star', emoji: '⭐', requirement: 'Reach 500 points' },
  { id: 'sugar_warrior', name: 'Sugar Warrior', emoji: '💪', requirement: '100% in target for a day' },
  { id: 'medicine_hero', name: 'Medicine Hero', emoji: '💊', requirement: 'No missed doses this week' },
];

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const childProfileId = currentUser?.childProfiles?.[0]?.id;
  const { profile, getCharacterEmoji, refreshProfile } = useChildProfile();
  const { earnedBadgeIds, refreshBadges } = useMissions();

  useFocusEffect(
    useCallback(() => {
      const sync = async () => {
        if (!childProfileId) return;
        await refreshProfile();
        const { data: totals } = await supabase
          .from('reward_totals')
          .select('total_stars, current_streak_days')
          .eq('child_profile_id', childProfileId)
          .maybeSingle();
        const earned = await fetchEarnedBadgeTypes(childProfileId);
        await checkAndAwardBadges(childProfileId, {
          totalStars: totals?.total_stars ?? profile.points,
          streakDays: totals?.current_streak_days ?? profile.streak,
          earned,
        });
        await refreshBadges();
        await refreshProfile();
      };
      sync();
    }, [childProfileId, refreshProfile, refreshBadges, profile.points, profile.streak])
  );

  const earnedBadges = BADGE_DEFS.filter(b => earnedBadgeIds.includes(b.id));
  const lockedBadges = BADGE_DEFS.filter(b => !earnedBadgeIds.includes(b.id));

  const nextLevelPts = profile.level * 200;
  const progress = profile.points / nextLevelPts;
  const weekDays = buildRollingWeek(profile.streak);

  return (
    <View style={[styles.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>

        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>{getCharacterEmoji()}</Text>
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={16} color={COLORS.accent} />
            <Text style={styles.levelText}>Level {profile.level}</Text>
          </View>
          <Text style={styles.points}>{profile.points}</Text>
          <Text style={styles.pointsLabel}>stars earned</Text>
          <Text style={styles.nextLevel}>{Math.max(nextLevelPts - profile.points, 0)} pts to next level</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Streak: {profile.streak} days</Text>
          <View style={styles.streakCard}>
            {weekDays.map((d, i) => (
              <View key={i} style={styles.streakDay}>
                <View style={[styles.streakCircle, d.filled ? styles.streakFilled : styles.streakEmpty]}>
                  {d.filled && <Ionicons name="flame" size={14} color="#fff" />}
                </View>
                <Text style={[styles.streakLabel, (d.filled || d.isToday) && { color: COLORS.primary }]}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Badges</Text>
          <View style={styles.badgeGrid}>
            {earnedBadges.map(b => (
              <View key={b.id} style={styles.badgeCard}>
                <View style={[styles.badgeIconBox, { backgroundColor: COLORS.primary + '15' }]}>
                  <Text style={{ fontSize: 28 }}>{b.emoji}</Text>
                </View>
                <Text style={styles.badgeName}>{b.name}</Text>
                <Text style={styles.badgeDesc} numberOfLines={2}>{b.requirement}</Text>
              </View>
            ))}
            {lockedBadges.map(b => (
              <View key={b.id} style={[styles.badgeCard, styles.badgeLocked]}>
                <View style={[styles.badgeIconBox, { backgroundColor: COLORS.border }]}>
                  <Ionicons name="lock-closed" size={24} color={COLORS.textMuted} />
                </View>
                <Text style={[styles.badgeName, { color: COLORS.textMuted }]}>{b.name}</Text>
                <Text style={[styles.badgeDesc, { color: COLORS.textMuted }]} numberOfLines={2}>{b.requirement}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 20 },
  heroCard: {
    backgroundColor: COLORS.primary, borderRadius: 28, padding: 28, alignItems: 'center', gap: 6,
    shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  heroEmoji: { fontSize: 64 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  levelText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },
  points: { fontSize: 40, fontFamily: 'Inter_700Bold', color: '#fff' },
  pointsLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)', marginTop: -6 },
  nextLevel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)' },
  progressTrack: { width: '100%', height: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 5, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 5 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  streakCard: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: COLORS.card, borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  streakDay: { alignItems: 'center', gap: 8 },
  streakCircle: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  streakFilled: { backgroundColor: COLORS.primary },
  streakEmpty: { backgroundColor: COLORS.border },
  streakLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: {
    width: '46%', backgroundColor: COLORS.card, borderRadius: 20, padding: 16, alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  badgeLocked: { opacity: 0.6, backgroundColor: COLORS.surface },
  badgeIconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  badgeName: { fontSize: 14, fontFamily: 'Inter_700Bold', color: COLORS.textDark, textAlign: 'center' },
  badgeDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, textAlign: 'center', lineHeight: 16 },
});
