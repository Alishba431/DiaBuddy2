import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { COLORS } from '@/constants/colors';
import { PointsToast } from '@/components/PointsToast';

const ACTIVITIES = [
  { id: 'walk', emoji: '🚶', name: 'Walking', met: 1, color: COLORS.mint },
  { id: 'run', emoji: '🏃', name: 'Running', met: 3, color: COLORS.coral },
  { id: 'swim', emoji: '🏊', name: 'Swimming', met: 3, color: COLORS.blue },
  { id: 'cycle', emoji: '🚴', name: 'Cycling', met: 2, color: COLORS.yellow },
  { id: 'dance', emoji: '💃', name: 'Dancing', met: 2, color: '#E9D5FF' },
  { id: 'play', emoji: '⚽', name: 'Sports', met: 3, color: '#FED7AA' },
];
const DURATIONS = [15, 20, 30, 45, 60];
const INTENSITIES = ['Light', 'Medium', 'Intense'];

export default function MovePlayScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState('Medium');
  const [started, setStarted] = useState(false);
  const [toast, setToast] = useState(false);

  const isHigh = intensity === 'Intense' || ACTIVITIES.find(a => a.id === selected)?.met === 3;

  const handleStart = () => {
    setStarted(true);
    setToast(true);
  };

  return (
    <View style={styles.root}>
      <PointsToast points={20} visible={toast} onHide={() => setToast(false)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Before Exercise Tip</Text>
          <Text style={styles.tipText}>Check your glucose! If it's below 100 mg/dL, eat a small snack (e.g. banana or juice) first.</Text>
        </View>

        <Text style={styles.sectionTitle}>Choose Activity</Text>
        <View style={styles.activityGrid}>
          {ACTIVITIES.map(a => (
            <TouchableOpacity
              key={a.id}
              style={[styles.activityCard, { backgroundColor: a.color }, selected === a.id && styles.activitySelected]}
              onPress={() => setSelected(a.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.activityEmoji}>{a.emoji}</Text>
              <Text style={styles.activityName}>{a.name}</Text>
              {selected === a.id && <View style={styles.checkOverlay}><Text style={styles.checkText}>✓</Text></View>}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Duration</Text>
        <View style={styles.durationRow}>
          {DURATIONS.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.durBtn, duration === d && styles.durBtnActive]}
              onPress={() => setDuration(d)}
            >
              <Text style={[styles.durText, duration === d && styles.durTextActive]}>{d}m</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Intensity</Text>
        <View style={styles.intensityRow}>
          {INTENSITIES.map(i => (
            <TouchableOpacity
              key={i}
              style={[styles.intBtn, intensity === i && styles.intBtnActive]}
              onPress={() => setIntensity(i)}
            >
              <Text style={[styles.intText, intensity === i && styles.intTextActive]}>{i}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isHigh && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ High Intensity Alert</Text>
            <Text style={styles.warningText}>Intense exercise can drop your glucose fast! Check levels before and after, and keep juice nearby.</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.startBtn, !selected && styles.startBtnDisabled, started && styles.startBtnDone]}
          onPress={!started ? handleStart : undefined}
          disabled={!selected}
        >
          <Text style={styles.startBtnText}>
            {started ? '✅ Activity Logged! +20 pts' : `🏁 Start ${ACTIVITIES.find(a => a.id === selected)?.name ?? 'Activity'} · ${duration} min`}
          </Text>
        </TouchableOpacity>

        <View style={styles.challengeCard}>
          <Text style={styles.challengeTitle}>🏆 Mini Challenge</Text>
          <Text style={styles.challengeText}>Move for 30 minutes 5 days this week to earn the "Active Star" badge! 3/5 days done.</Text>
          <View style={styles.challengeProgress}>
            <View style={[styles.challengeFill, { width: '60%' }]} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  tipCard: { backgroundColor: COLORS.yellow, borderRadius: 20, padding: 18, borderWidth: 1.5, borderColor: '#FCD34D', gap: 8 },
  tipTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  tipText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textDark, lineHeight: 22 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  activityCard: {
    width: '30%', borderRadius: 20, padding: 14, alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  activitySelected: { borderWidth: 3, borderColor: COLORS.textDark },
  activityEmoji: { fontSize: 32 },
  activityName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  checkOverlay: {
    position: 'absolute', top: 6, right: 6,
    width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.textDark,
    justifyContent: 'center', alignItems: 'center',
  },
  checkText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_700Bold' },
  durationRow: { flexDirection: 'row', gap: 8 },
  durBtn: { flex: 1, paddingVertical: 12, borderRadius: 16, backgroundColor: COLORS.card, alignItems: 'center', borderWidth: 2, borderColor: COLORS.border },
  durBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  durText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: COLORS.textMuted },
  durTextActive: { color: '#fff' },
  intensityRow: { flexDirection: 'row', gap: 10 },
  intBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: COLORS.card, alignItems: 'center', borderWidth: 2, borderColor: COLORS.border },
  intBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  intText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  intTextActive: { color: '#fff' },
  warningCard: { backgroundColor: '#FFF3E0', borderRadius: 20, padding: 18, borderWidth: 1.5, borderColor: COLORS.alertOrange, gap: 8 },
  warningTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  warningText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textDark, lineHeight: 22 },
  startBtn: { backgroundColor: COLORS.primary, borderRadius: 24, paddingVertical: 20, alignItems: 'center' },
  startBtnDisabled: { opacity: 0.5 },
  startBtnDone: { backgroundColor: COLORS.zoneGreen },
  startBtnText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#fff' },
  challengeCard: {
    backgroundColor: '#EFF6FF', borderRadius: 20, padding: 18, gap: 10, borderWidth: 1.5, borderColor: COLORS.blue,
  },
  challengeTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  challengeText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, lineHeight: 22 },
  challengeProgress: { height: 10, backgroundColor: COLORS.border, borderRadius: 5, overflow: 'hidden' },
  challengeFill: { height: '100%', backgroundColor: COLORS.blue, borderRadius: 5 },
});
