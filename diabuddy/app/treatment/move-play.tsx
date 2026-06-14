import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import { PointsToast } from '@/components/PointsToast';
import { MISSION_POINTS } from '@/lib/rewards';
import { ACTIVITY_DEFS, formatActivityTime, useActivity } from '@/hooks/useActivity';

const ACTIVITY_COLORS: Record<string, string> = {
  walk: COLORS.mint,
  run: COLORS.coral,
  swim: COLORS.blue,
  cycle: COLORS.yellow,
  dance: '#E9D5FF',
  play: '#FED7AA',
};

const DURATIONS = [15, 20, 30, 45, 60];
const INTENSITIES = ['Light', 'Medium', 'Intense'];

export default function MovePlayScreen() {
  const { logs, todayMinutes, weeklyGoalDays, weeklyGoalTarget, weeklyGoalMinutes, logActivity, loading, tableReady } = useActivity();
  const [selected, setSelected] = useState<string | null>(null);
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState('Medium');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  const selectedActivity = ACTIVITY_DEFS.find(a => a.id === selected);
  const isHigh = intensity === 'Intense' || selectedActivity?.met === 3;
  const challengeProgress = Math.min(weeklyGoalDays / weeklyGoalTarget, 1);

  const handleStart = async () => {
    if (!selectedActivity || saving) return;
    setSaving(true);
    const result = await logActivity({
      activityType: selectedActivity.id,
      activityName: selectedActivity.name,
      durationMins: duration,
      intensity,
      metLevel: selectedActivity.met,
    });
    setSaving(false);

    if (!result.ok) {
      Alert.alert(
        'Could not save activity',
        'Make sure the activity_logs table exists. Run supabase/migrations/20250615_activity_logs.sql in your Supabase SQL editor.'
      );
      return;
    }

    setToast(true);
    setSelected(null);
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <PointsToast points={MISSION_POINTS.activity_done} visible={toast} onHide={() => setToast(false)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Before Exercise Tip</Text>
          <Text style={styles.tipText}>
            Check your glucose! If it's below 100 mg/dL, eat a small snack (e.g. banana or juice) first.
          </Text>
        </View>

        {!tableReady && (
          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>Database setup needed</Text>
            <Text style={styles.setupText}>
              Open Supabase → SQL Editor, paste and run:{'\n'}
              supabase/migrations/20250615_activity_logs.sql
            </Text>
          </View>
        )}

        {todayMinutes > 0 && (
          <View style={styles.todayCard}>
            <Text style={styles.todayLabel}>Today so far</Text>
            <Text style={styles.todayValue}>{todayMinutes} min</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Choose Activity</Text>
        <View style={styles.activityGrid}>
          {ACTIVITY_DEFS.map(a => (
            <TouchableOpacity
              key={a.id}
              style={[
                styles.activityCard,
                { backgroundColor: ACTIVITY_COLORS[a.id] ?? COLORS.card },
                selected === a.id && styles.activitySelected,
              ]}
              onPress={() => setSelected(a.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.activityEmoji}>{a.emoji}</Text>
              <Text style={styles.activityName}>{a.name}</Text>
              {selected === a.id && (
                <View style={styles.checkOverlay}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
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
            <Text style={styles.warningText}>
              Intense exercise can drop your glucose fast! Check levels before and after, and keep juice nearby.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.startBtn, (!selected || saving) && styles.startBtnDisabled]}
          onPress={handleStart}
          disabled={!selected || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startBtnText}>
              🏁 Log {selectedActivity?.name ?? 'Activity'} · {duration} min
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.challengeCard}>
          <Text style={styles.challengeTitle}>🏆 Mini Challenge</Text>
          <Text style={styles.challengeText}>
            Move for {weeklyGoalMinutes} minutes {weeklyGoalTarget} days this week — {weeklyGoalDays}/{weeklyGoalTarget} days done.
          </Text>
          <View style={styles.challengeProgress}>
            <View style={[styles.challengeFill, { width: `${challengeProgress * 100}%` }]} />
          </View>
        </View>

        {logs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.historyList}>
              {logs.slice(0, 8).map((log, i) => {
                const def = ACTIVITY_DEFS.find(a => a.id === log.activity_type);
                return (
                  <View key={log.id} style={[styles.historyRow, i < Math.min(logs.length, 8) - 1 && styles.historyBorder]}>
                    <Text style={styles.historyEmoji}>{def?.emoji ?? '🏃'}</Text>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyName}>{log.activity_name}</Text>
                      <Text style={styles.historyMeta}>
                        {formatActivityTime(log.logged_at)} · {log.duration_mins} min · {log.intensity}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  tipCard: { backgroundColor: COLORS.yellow, borderRadius: 20, padding: 18, borderWidth: 1.5, borderColor: '#FCD34D', gap: 8 },
  tipTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  tipText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textDark, lineHeight: 22 },
  setupCard: { backgroundColor: '#FEE2E2', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: COLORS.alertRed, gap: 6 },
  setupTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: COLORS.alertRed },
  setupText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textDark, lineHeight: 20 },
  todayCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: COLORS.primaryLight,
  },
  todayLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  todayValue: { fontSize: 22, fontFamily: 'Inter_700Bold', color: COLORS.primary },
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
  startBtn: { backgroundColor: COLORS.primary, borderRadius: 24, paddingVertical: 20, alignItems: 'center', minHeight: 60, justifyContent: 'center' },
  startBtnDisabled: { opacity: 0.5 },
  startBtnText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#fff' },
  challengeCard: {
    backgroundColor: '#EFF6FF', borderRadius: 20, padding: 18, gap: 10, borderWidth: 1.5, borderColor: COLORS.blue,
  },
  challengeTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  challengeText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, lineHeight: 22 },
  challengeProgress: { height: 10, backgroundColor: COLORS.border, borderRadius: 5, overflow: 'hidden' },
  challengeFill: { height: '100%', backgroundColor: COLORS.blue, borderRadius: 5 },
  historyList: {
    backgroundColor: COLORS.card, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  historyRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  historyEmoji: { fontSize: 28 },
  historyInfo: { flex: 1, gap: 2 },
  historyName: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  historyMeta: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
});
