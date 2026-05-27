import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useChildProfile } from '@/context/AppContext';
import { earnedBadges, lockedBadges, pointsHistory } from '@/data/mockData';

const STREAK_DAYS = [true, true, true, true, true, false, false];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const BADGE_ICONS: Record<string, string> = {
  'document-text': 'document-text',
  'flame': 'flame',
  'brain': 'bulb',
  'leaf': 'leaf',
};

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, getCharacterEmoji } = useChildProfile();
  const nextLevelPts = (profile.level + 1) * 200;
  const progress = profile.points / nextLevelPts;

  return (
    <View style={[styles.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>{getCharacterEmoji()}</Text>
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={16} color={COLORS.accent} />
            <Text style={styles.levelText}>Level {profile.level}</Text>
          </View>
          <Text style={styles.points}>{profile.points}</Text>
          <Text style={styles.pointsLabel}>points</Text>
          <Text style={styles.nextLevel}>{nextLevelPts - profile.points} pts to Level {profile.level + 1}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
          </View>
        </View>

        {/* Streak */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week's Streak</Text>
          <View style={styles.streakCard}>
            {DAYS.map((d, i) => (
              <View key={i} style={styles.streakDay}>
                <View style={[styles.streakCircle, STREAK_DAYS[i] ? styles.streakFilled : styles.streakEmpty]}>
                  {STREAK_DAYS[i] && <Ionicons name="flame" size={14} color="#fff" />}
                </View>
                <Text style={[styles.streakLabel, STREAK_DAYS[i] && { color: COLORS.primary }]}>{d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Earned badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Badges</Text>
          <View style={styles.badgeGrid}>
            {earnedBadges.map(b => (
              <View key={b.id} style={styles.badgeCard}>
                <View style={[styles.badgeIconBox, { backgroundColor: COLORS.primary + '15' }]}>
                  <Ionicons name={(BADGE_ICONS[b.icon] || b.icon) as any} size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.badgeName}>{b.name}</Text>
                <Text style={styles.badgeDesc} numberOfLines={2}>{b.description}</Text>
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

        {/* Certificate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certificates</Text>
          <TouchableOpacity style={styles.certCard} onPress={() => router.push('/learn/certificate' as any)}>
            <View style={styles.certIconBox}>
              <Ionicons name="ribbon" size={28} color={COLORS.accentDark} />
            </View>
            <View style={styles.certInfo}>
              <Text style={styles.certTitle}>Diabetes Star</Text>
              <Text style={styles.certDesc}>Logged every day for 5 days!</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        {/* Points history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Points</Text>
          <View style={styles.historyCard}>
            {pointsHistory.map((h, i) => (
              <React.Fragment key={i}>
                <View style={styles.historyRow}>
                  <View style={styles.historyIconBox}>
                    <Ionicons name="star" size={16} color={COLORS.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyAction}>{h.action}</Text>
                    <Text style={styles.historyDate}>{h.date}</Text>
                  </View>
                  <Text style={styles.historyPts}>+{h.points} pts</Text>
                </View>
                {i < pointsHistory.length - 1 && <View style={styles.histDivider} />}
              </React.Fragment>
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
  certCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accentLight,
    borderRadius: 20, padding: 18, gap: 14, borderWidth: 1.5, borderColor: COLORS.accent,
  },
  certIconBox: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center' },
  certInfo: { flex: 1 },
  certTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  certDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  historyCard: {
    backgroundColor: COLORS.card, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  historyRow: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, gap: 12 },
  historyIconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.accentLight, justifyContent: 'center', alignItems: 'center' },
  histDivider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 16 },
  historyAction: { fontSize: 14, fontFamily: 'Inter_500Medium', color: COLORS.textDark },
  historyDate: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  historyPts: { fontSize: 15, fontFamily: 'Inter_700Bold', color: COLORS.primary },
});
