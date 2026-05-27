import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { COLORS } from '@/constants/colors';
import { learningVideos } from '@/data/mockData';
import { PointsToast } from '@/components/PointsToast';

const LANGS = ['English', 'اردو', 'Roman Urdu'];

export default function VideoPlayerScreen() {
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const video = learningVideos.find(v => v.id === videoId) ?? learningVideos[0];
  const [lang, setLang] = useState('English');
  const [toast, setToast] = useState(false);

  const openVideo = async () => {
    await WebBrowser.openBrowserAsync(video.youtubeUrl);
    setToast(true);
  };

  return (
    <View style={styles.root}>
      <PointsToast points={25} visible={toast} onHide={() => setToast(false)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Thumbnail */}
        <View style={[styles.thumbnail, { backgroundColor: video.color }]}>
          <Text style={styles.thumbEmoji}>{video.emoji}</Text>
          <TouchableOpacity style={styles.playBtn} onPress={openVideo}>
            <Text style={styles.playBtnText}>▶ Watch Video</Text>
          </TouchableOpacity>
          <View style={styles.durationTag}>
            <Text style={styles.durationText}>⏱ {video.duration}</Text>
          </View>
        </View>

        {/* Lang selector */}
        <View style={styles.langRow}>
          {LANGS.map(l => (
            <TouchableOpacity key={l} style={[styles.langBtn, lang === l && styles.langBtnActive]} onPress={() => setLang(l)}>
              <Text style={[styles.langBtnText, lang === l && styles.langBtnTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.title}>{video.title}</Text>
        <Text style={styles.desc}>{video.description}</Text>

        {/* Key Points */}
        <Text style={styles.sectionTitle}>📌 Key Points</Text>
        <View style={styles.keyPoints}>
          {video.keyPoints.map((p, i) => (
            <View key={i} style={styles.keyPoint}>
              <Text style={styles.keyBullet}>•</Text>
              <Text style={styles.keyText}>{p}</Text>
            </View>
          ))}
        </View>

        {/* Open in browser */}
        <TouchableOpacity style={styles.openBtn} onPress={openVideo}>
          <Text style={styles.openBtnText}>🎬 Open Full Video in Browser +25 pts</Text>
        </TouchableOpacity>

        {/* Quiz CTA */}
        <TouchableOpacity
          style={styles.quizBtn}
          onPress={() => router.push({ pathname: '/learn/quiz' as any, params: { videoId: video.id } })}
        >
          <Text style={styles.quizBtnText}>📝 Take Quiz & Earn Points!</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { gap: 16, paddingBottom: 40 },
  thumbnail: {
    height: 220, justifyContent: 'center', alignItems: 'center', gap: 12,
  },
  thumbEmoji: { fontSize: 56 },
  playBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 30, paddingHorizontal: 24, paddingVertical: 12,
  },
  playBtnText: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' },
  durationTag: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  durationText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#fff' },
  langRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
  langBtn: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
    backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.border,
  },
  langBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langBtnText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: COLORS.textMuted },
  langBtnTextActive: { color: '#fff' },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold', color: COLORS.textDark, paddingHorizontal: 20 },
  desc: { fontSize: 15, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, lineHeight: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.textDark, paddingHorizontal: 20 },
  keyPoints: { backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: 20, padding: 16, gap: 10 },
  keyPoint: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  keyBullet: { fontSize: 18, color: COLORS.primary, marginTop: -2 },
  keyText: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: COLORS.textDark, lineHeight: 22 },
  openBtn: {
    marginHorizontal: 20, backgroundColor: COLORS.card, borderRadius: 20,
    paddingVertical: 18, alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary,
  },
  openBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.primary },
  quizBtn: {
    marginHorizontal: 20, backgroundColor: COLORS.primary, borderRadius: 20,
    paddingVertical: 20, alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  quizBtnText: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' },
});
