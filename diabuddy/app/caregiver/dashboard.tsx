import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform, Switch } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useChildProfile, useGlucose, useAuth, useNotifications } from '@/context/AppContext';
import { weeklyInsulinAdherence, mealHistory } from '@/data/mockData';

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MAX_BAR = 280;
const BAR_HEIGHT = 90;

function BarChart({ data }: { data: number[] }) {
  return (
    <View style={bc.container}>
      {data.map((v, i) => {
        const h = Math.max(8, (v / MAX_BAR) * BAR_HEIGHT);
        const color = v < 70 ? COLORS.alertRed : v <= 180 ? COLORS.zoneGreen : v <= 250 ? COLORS.zoneYellow : COLORS.alertOrange;
        return (
          <View key={i} style={bc.barWrapper}>
            <Text style={bc.barValue}>{v}</Text>
            <View style={bc.barTrack}>
              <View style={[bc.barFill, { height: h, backgroundColor: color }]} />
            </View>
            <Text style={bc.barLabel}>{WEEK_LABELS[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

const bc = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingTop: 8 },
  barWrapper: { flex: 1, alignItems: 'center', gap: 4 },
  barValue: { fontSize: 9, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  barTrack: { width: '100%', height: BAR_HEIGHT, backgroundColor: COLORS.background, borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
});

type Tab = 'overview' | 'logs' | 'alerts' | 'report';

const WEEK_AVG = [142, 155, 130, 178, 165, 200, 148];

const ALERTS = [
  { time: '2 hours ago',  msg: 'Glucose was 260 mg/dL — high', type: 'high'   },
  { time: 'Yesterday 3pm', msg: 'Glucose was 62 mg/dL — low',  type: 'low'    },
  { time: '2 days ago',   msg: 'Evening dose not marked taken', type: 'missed' },
];

export default function CaregiverDashboard() {
  const insets = useSafeAreaInsets();
  const { profile } = useChildProfile();
  const { readings, lastReading } = useGlucose();
  const { logout, currentUser } = useAuth();
  const { settings, updateSettings } = useNotifications();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const avgGlucose = Math.round(readings.reduce((s, r) => s + r.value, 0) / readings.length);
  const inRange = readings.filter(r => r.value >= 70 && r.value <= 180).length;
  const inRangePct = Math.round((inRange / readings.length) * 100);
  const takenDoses = weeklyInsulinAdherence.reduce((s, d) => s + d.taken, 0);
  const totalDoses = weeklyInsulinAdherence.reduce((s, d) => s + d.total, 0);
  const adherence = Math.round((takenDoses / totalDoses) * 100);
  const hyperCount = readings.filter(r => r.value > 250).length;
  const hypoCount  = readings.filter(r => r.value < 70).length;

  const handleExit = async () => {
    if (currentUser?.role === 'caretaker') {
      await logout();
    } else {
      router.back();
    }
  };

  const STAT_CARDS = [
    { label: 'Avg Glucose', value: `${avgGlucose}`, unit: 'mg/dL', color: COLORS.primary },
    { label: 'Time in Range', value: `${inRangePct}%`, color: inRangePct >= 70 ? COLORS.success : COLORS.alertOrange },
    { label: 'Insulin Adherence', value: `${adherence}%`, color: adherence >= 90 ? COLORS.success : COLORS.alertOrange },
    { label: 'Streak', value: `${profile.streak}d`, color: COLORS.accentDark },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12) }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Caretaker Dashboard</Text>
          <Text style={styles.headerSub}>{profile.name}'s Health Overview</Text>
        </View>
        <TouchableOpacity style={styles.exitBtn} onPress={handleExit}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.card} />
          <Text style={styles.exitText}>{currentUser?.role === 'caretaker' ? 'Sign Out' : 'Exit'}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
        {(['overview', 'logs', 'alerts', 'report'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <>
            {/* Stats grid */}
            <View style={styles.statsGrid}>
              {STAT_CARDS.map((s, i) => (
                <View key={i} style={[styles.statCard, { borderTopColor: s.color, borderTopWidth: 3 }]}>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  {s.unit && <Text style={styles.statUnit}>{s.unit}</Text>}
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Episode counts */}
            <View style={styles.episodeRow}>
              <View style={[styles.episodeCard, { borderColor: COLORS.alertRed }]}>
                <Ionicons name="trending-down" size={18} color={COLORS.alertRed} />
                <View>
                  <Text style={[styles.episodeVal, { color: COLORS.alertRed }]}>{hypoCount}</Text>
                  <Text style={styles.episodeLabel}>Hypo Episodes</Text>
                </View>
              </View>
              <View style={[styles.episodeCard, { borderColor: COLORS.alertOrange }]}>
                <Ionicons name="trending-up" size={18} color={COLORS.alertOrange} />
                <View>
                  <Text style={[styles.episodeVal, { color: COLORS.alertOrange }]}>{hyperCount}</Text>
                  <Text style={styles.episodeLabel}>Hyper Episodes</Text>
                </View>
              </View>
              <View style={[styles.episodeCard, { borderColor: COLORS.textMuted }]}>
                <Ionicons name="medical" size={18} color={COLORS.textMuted} />
                <View>
                  <Text style={styles.episodeVal}>{totalDoses - takenDoses}</Text>
                  <Text style={styles.episodeLabel}>Missed Doses</Text>
                </View>
              </View>
            </View>

            {/* 7-day chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>7-Day Average Glucose</Text>
              <BarChart data={WEEK_AVG} />
              <View style={styles.chartLegend}>
                {[{ c: COLORS.zoneGreen, l: 'In Range' }, { c: COLORS.zoneYellow, l: 'Elevated' }, { c: COLORS.alertOrange, l: 'High' }].map(x => (
                  <View key={x.l} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: x.c }]} />
                    <Text style={styles.legendText}>{x.l}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* AI Recommendation */}
            <View style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <View style={styles.aiIconBox}><Text style={{ fontSize: 18 }}>🤖</Text></View>
                <Text style={styles.aiTitle}>AI Recommendation</Text>
              </View>
              <Text style={styles.aiText}>
                {profile.name}'s glucose was elevated on Saturday and Sunday. Consider reviewing weekend meal choices and ensuring evening insulin is taken on time. Schedule a care team check-in if this pattern continues next week.
              </Text>
              <TouchableOpacity style={styles.aiBtn} onPress={() => router.push('/health-report' as any)}>
                <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
                <Text style={styles.aiBtnText}>View Full Report</Text>
              </TouchableOpacity>
            </View>

            {/* Notification settings */}
            <View style={styles.notifCard}>
              <Text style={styles.notifTitle}>Push Notifications</Text>
              {[
                { label: 'Low Sugar Alerts', key: 'lowSugarAlert' as const },
                { label: 'High Sugar Alerts', key: 'highSugarAlert' as const },
                { label: 'Missed Insulin Dose', key: 'insulinMorning' as const },
              ].map((n, i, arr) => (
                <React.Fragment key={n.key}>
                  <View style={styles.notifRow}>
                    <Text style={styles.notifLabel}>{n.label}</Text>
                    <Switch
                      value={settings[n.key] as boolean}
                      onValueChange={v => updateSettings({ [n.key]: v })}
                      trackColor={{ false: COLORS.border, true: COLORS.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                  {i < arr.length - 1 && <View style={styles.notifDivider} />}
                </React.Fragment>
              ))}
              <TouchableOpacity style={styles.notifMoreBtn} onPress={() => router.push('/notifications' as any)}>
                <Text style={styles.notifMoreText}>All notification settings</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── LOGS ── */}
        {activeTab === 'logs' && (
          <>
            <Text style={styles.tabSectionTitle}>Today's Glucose Readings</Text>
            <View style={styles.logsCard}>
              {readings.map((r, i) => {
                const color = r.value < 70 ? COLORS.alertRed : r.value <= 180 ? COLORS.success : r.value <= 250 ? COLORS.zoneYellow : COLORS.alertOrange;
                return (
                  <React.Fragment key={r.id}>
                    <View style={styles.logRow}>
                      <View style={[styles.logDot, { backgroundColor: color }]} />
                      <Text style={styles.logTime}>{r.time}</Text>
                      <Text style={styles.logType}>{r.type}</Text>
                      <Text style={[styles.logVal, { color }]}>{r.value} mg/dL</Text>
                    </View>
                    {i < readings.length - 1 && <View style={styles.logDivider} />}
                  </React.Fragment>
                );
              })}
            </View>

            <Text style={styles.tabSectionTitle}>Insulin Adherence — This Week</Text>
            <View style={styles.adherenceGrid}>
              {weeklyInsulinAdherence.map((d, i) => (
                <View key={i} style={styles.adherenceDay}>
                  <View style={[styles.adherenceCircle, { backgroundColor: d.taken === d.total ? COLORS.success : d.taken === 0 ? COLORS.alertRed : COLORS.alertOrange }]}>
                    <Text style={styles.adherenceNum}>{d.taken}/{d.total}</Text>
                  </View>
                  <Text style={styles.adherenceDayLabel}>{d.day}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.tabSectionTitle}>Recent Meals</Text>
            {mealHistory.map((d, di) => (
              <View key={di} style={styles.mealGroup}>
                <Text style={styles.mealDate}>{d.date}</Text>
                {d.meals.map((m: any, mi: number) => (
                  <View key={mi} style={styles.mealRow}>
                    <Text style={styles.mealEmoji}>{m.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.mealType}>{m.type} · {m.time}</Text>
                      <Text style={styles.mealFoods}>{m.foods.join(', ')}</Text>
                    </View>
                    {m.postGlucose && (
                      <View style={styles.mealGluc}>
                        <Text style={styles.mealGlucLabel}>Post</Text>
                        <Text style={[styles.mealGlucVal, { color: m.postGlucose > 200 ? COLORS.alertOrange : COLORS.success }]}>{m.postGlucose}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        {/* ── ALERTS ── */}
        {activeTab === 'alerts' && (
          <>
            {ALERTS.map((a, i) => (
              <View key={i} style={[styles.alertCard, { borderLeftColor: a.type === 'high' ? COLORS.alertOrange : a.type === 'low' ? COLORS.alertRed : COLORS.textMuted }]}>
                <View style={[styles.alertIconBox, { backgroundColor: (a.type === 'high' ? COLORS.alertOrange : a.type === 'low' ? COLORS.alertRed : COLORS.textMuted) + '20' }]}>
                  <Ionicons name={a.type === 'high' ? 'trending-up' : a.type === 'low' ? 'trending-down' : 'warning'} size={18} color={a.type === 'high' ? COLORS.alertOrange : a.type === 'low' ? COLORS.alertRed : COLORS.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertMsg}>{a.msg}</Text>
                  <Text style={styles.alertTime}>{a.time}</Text>
                </View>
              </View>
            ))}
            <View style={styles.clearBox}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.clearText}>No critical alerts in the last 6 hours.</Text>
            </View>
          </>
        )}

        {/* ── REPORT ── */}
        {activeTab === 'report' && (
          <>
            <View style={styles.reportSummary}>
              <Text style={styles.reportTitle}>Weekly Summary</Text>
              <Text style={styles.reportSub}>Auto-generated from logged data</Text>
              {[
                { l: 'Avg Glucose',     v: `${avgGlucose} mg/dL`, c: COLORS.primary },
                { l: 'Time in Range',   v: `${inRangePct}%`,       c: inRangePct >= 70 ? COLORS.success : COLORS.alertOrange },
                { l: 'Insulin Taken',   v: `${adherence}%`,        c: adherence >= 90 ? COLORS.success : COLORS.alertOrange },
                { l: 'Hypo Episodes',   v: `${hypoCount}`,          c: hypoCount > 0 ? COLORS.alertRed : COLORS.success },
                { l: 'Hyper Episodes',  v: `${hyperCount}`,         c: hyperCount > 1 ? COLORS.alertOrange : COLORS.success },
              ].map((m, i, arr) => (
                <React.Fragment key={i}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{m.l}</Text>
                    <Text style={[styles.summaryVal, { color: m.c }]}>{m.v}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={styles.logDivider} />}
                </React.Fragment>
              ))}
            </View>

            <TouchableOpacity style={styles.fullReportBtn} onPress={() => router.push('/health-report' as any)}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.textDark} />
              <Text style={styles.fullReportText}>Open Full Health Report</Text>
            </TouchableOpacity>

            <View style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <View style={styles.aiIconBox}><Text style={{ fontSize: 18 }}>🤖</Text></View>
                <Text style={styles.aiTitle}>AI Recommendations</Text>
              </View>
              <Text style={styles.aiText}>
                {adherence < 90
                  ? `Insulin adherence is ${adherence}% this week. Setting up reminder notifications may improve consistency. `
                  : `Insulin adherence is excellent at ${adherence}%. `}
                {inRangePct < 70
                  ? `Time in range is ${inRangePct}% — below the 70% target. Review meal timing and insulin dosing with the care team.`
                  : `Time in range of ${inRangePct}% is meeting the target. Keep up the good routine!`}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  headerSub: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  exitBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9 },
  exitText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: COLORS.card },
  tabRow: { paddingHorizontal: 20, gap: 8, marginBottom: 4, flexDirection: 'row' },
  tab: { paddingVertical: 9, paddingHorizontal: 18, borderRadius: 14, backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  tabTextActive: { color: '#fff' },
  scroll: { padding: 20, gap: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '47%', backgroundColor: COLORS.card, borderRadius: 18, padding: 16, alignItems: 'center', gap: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statUnit: { fontSize: 11, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  statLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: COLORS.textMuted },
  episodeRow: { flexDirection: 'row', gap: 10 },
  episodeCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.card, borderRadius: 16, padding: 14, borderWidth: 1.5 },
  episodeVal: { fontSize: 20, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  episodeLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  chartCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 16, gap: 8,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  chartTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  chartLegend: { flexDirection: 'row', gap: 14, paddingTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  aiCard: { backgroundColor: COLORS.blue, borderRadius: 20, padding: 18, gap: 12, borderWidth: 1.5, borderColor: COLORS.primaryLight },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center' },
  aiTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  aiText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textDark, lineHeight: 22 },
  aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, alignSelf: 'flex-start' },
  aiBtnText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: COLORS.primary },
  notifCard: { backgroundColor: COLORS.card, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  notifTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark, padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  notifRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  notifLabel: { fontSize: 15, fontFamily: 'Inter_500Medium', color: COLORS.textDark },
  notifDivider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 16 },
  notifMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, borderTopWidth: 1, borderTopColor: COLORS.divider },
  notifMoreText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: COLORS.primary },
  tabSectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  logsCard: { backgroundColor: COLORS.card, borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  logRow: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, gap: 10 },
  logDot: { width: 10, height: 10, borderRadius: 5 },
  logTime: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark, width: 44 },
  logType: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  logVal: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  logDivider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 16 },
  adherenceGrid: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 18, padding: 16, justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  adherenceDay: { alignItems: 'center', gap: 6 },
  adherenceCircle: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  adherenceNum: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#fff' },
  adherenceDayLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: COLORS.textMuted },
  mealGroup: { backgroundColor: COLORS.card, borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  mealDate: { fontSize: 13, fontFamily: 'Inter_700Bold', color: COLORS.textMuted, padding: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  mealRow: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 14, gap: 12 },
  mealEmoji: { fontSize: 24 },
  mealType: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  mealFoods: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  mealGluc: { alignItems: 'flex-end' },
  mealGlucLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  mealGlucVal: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 18, padding: 16, gap: 12, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  alertIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  alertMsg: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  alertTime: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  clearBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.mint, borderRadius: 14, padding: 14 },
  clearText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: COLORS.success },
  reportSummary: { backgroundColor: COLORS.card, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  reportTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textDark, padding: 16, paddingBottom: 4 },
  reportSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingHorizontal: 16 },
  summaryLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  summaryVal: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  fullReportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 18, shadowColor: COLORS.accent, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  fullReportText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
});
