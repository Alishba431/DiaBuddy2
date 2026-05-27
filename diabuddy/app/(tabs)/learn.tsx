import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { learningVideos } from '@/data/mockData';
import { useChildProfile } from '@/context/AppContext';

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useChildProfile();
  const xpProgress = (profile.points % 200) / 200;

  const completedCount = learningVideos.filter(v => v.completed).length;

  return (
    <View style={[styles.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <Text style={styles.title}>Learn Zone</Text>
        <Text style={styles.sub}>Watch videos and earn points</Text>

        {/* XP Card */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <View style={styles.xpLeft}>
              <Text style={styles.xpTitle}>Level {profile.level} Progress</Text>
              <Text style={styles.xpSub}>{completedCount} of {learningVideos.length} videos complete</Text>
            </View>
            <Text style={styles.xpPoints}>{profile.points % 200}/200 XP</Text>
          </View>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
          </View>
        </View>

        {/* Video Grid */}
        <Text style={styles.sectionTitle}>Lessons</Text>
        <View style={styles.grid}>
          {learningVideos.map(v => (
            <TouchableOpacity
              key={v.id}
              style={styles.videoCard}
              onPress={() => router.push({ pathname: '/learn/video-player' as any, params: { videoId: v.id } })}
              activeOpacity={0.85}
            >
              <View style={[styles.thumbnail, { backgroundColor: v.color }]}>
                <Text style={styles.thumbEmoji}>{v.emoji}</Text>
                {v.completed && (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </View>
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>{v.title}</Text>
                <View style={styles.videoMeta}>
                  <View style={styles.durationBadge}>
                    <Ionicons name="time-outline" size={11} color={COLORS.textMuted} />
                    <Text style={styles.durationText}>{v.duration}</Text>
                  </View>
                  <View style={styles.langBadge}>
                    <Text style={styles.langText}>EN</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 16, },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  sub: { fontSize: 16, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  xpCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 18, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  xpLeft: { gap: 2 },
  xpTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  xpSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  xpPoints: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.primary },
  xpTrack: { height: 12, backgroundColor: COLORS.surface, borderRadius: 6, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 6 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  videoCard: {
    width: '47%', backgroundColor: COLORS.card, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  thumbnail: { height: 100, justifyContent: 'center', alignItems: 'center' },
  thumbEmoji: { fontSize: 40 },
  completedBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.success,
    justifyContent: 'center', alignItems: 'center',
  },
  videoInfo: { padding: 12, gap: 8 },
  videoTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark, lineHeight: 19 },
  videoMeta: { flexDirection: 'row', gap: 6 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.surface, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  durationText: { fontSize: 11, fontFamily: 'Inter_500Medium', color: COLORS.textMuted },
  langBadge: { backgroundColor: COLORS.primary + '20', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  langText: { fontSize: 11, fontFamily: 'Inter_700Bold', color: COLORS.primary },
});
