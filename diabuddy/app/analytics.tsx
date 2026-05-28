import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polyline, Circle, Line, Text as SvgText, Rect } from 'react-native-svg';
import { COLORS } from '@/constants/colors';
import { useGlucose } from '@/context/AppContext';
import { mockWeeklyData, mockMonthlyData } from '@/data/mockData';

type Period = 'week' | 'month';

function LineChart({ data, labels, width, height = 180 }: { data: number[]; labels: string[]; width: number; height?: number }) {
  const padL = 36, padR = 12, padT = 12, padB = 28;
  const cW = width - padL - padR;
  const cH = height - padT - padB;
  const max = Math.max(...data, 280);
  const min = Math.min(...data, 60);
  const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: padL + (i / Math.max(data.length - 1, 1)) * cW,
    y: padT + (1 - (v - min) / range) * cH,
    v,
  }));
  const pStr = pts.map(p => `${p.x},${p.y}`).join(' ');

  const gridVals = [70, 140, 180, 250];

  return (
    <Svg width={width} height={height}>
      {/* Grid lines */}
      {gridVals.map(gv => {
        const gy = padT + (1 - (gv - min) / range) * cH;
        if (gy < padT || gy > padT + cH) return null;
        return (
          <React.Fragment key={gv}>
            <Line x1={padL} y1={gy} x2={width - padR} y2={gy} stroke={COLORS.border} strokeWidth={1} strokeDasharray="4 4" />
            <SvgText x={padL - 4} y={gy + 4} textAnchor="end" fill={COLORS.textMuted} fontSize={9}>{gv}</SvgText>
          </React.Fragment>
        );
      })}
      {/* In-range band */}
      <Rect
        x={padL} y={padT + (1 - (180 - min) / range) * cH}
        width={cW} height={((180 - 70) / range) * cH}
        fill={COLORS.success + '18'}
      />
      {/* Line */}
      {pts.length > 1 && (
        <Polyline points={pStr} fill="none" stroke={COLORS.primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      )}
      {/* Dots */}
      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={4}
          fill={p.v < 70 ? COLORS.alertRed : p.v > 250 ? COLORS.alertOrange : COLORS.primary}
          stroke="#fff" strokeWidth={1.5}
        />
      ))}
      {/* X labels — show a subset */}
      {labels.map((l, i) => {
        if (data.length > 14 && i % 5 !== 0 && i !== data.length - 1) return null;
        const lx = padL + (i / Math.max(data.length - 1, 1)) * cW;
        return <SvgText key={i} x={lx} y={height - 4} textAnchor="middle" fill={COLORS.textMuted} fontSize={9}>{l}</SvgText>;
      })}
    </Svg>
  );
}

function StatCard({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

import { useAuth } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const { readings } = useGlucose();
  const { currentUser } = useAuth();
  const [dbReadings, setDbReadings] = useState<any[]>([]);
  const [period, setPeriod] = useState<Period>('week');

  const chartWidth = screenW - 40;

  useEffect(() => {
    const childProfileId = currentUser?.childProfiles?.[0]?.id;
    if (!childProfileId) return;

    const fetchTrendData = async () => {
      const { data, error } = await supabase
        .from('glucose_readings')
        .select('*')
        .eq('child_profile_id', childProfileId)
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error("Error fetching trend data:", error.message);
        return;
      }
      if (data) {
        setDbReadings(data);
      }
    };
    fetchTrendData();
  }, [currentUser]);

  const weeklyAvgs = useMemo(() => {
    if (dbReadings.length === 0) {
      return mockWeeklyData.map(d => Math.round(d.readings.reduce((s, v) => s + v, 0) / d.readings.length));
    }
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days: { dateStr: string; dayName: string; values: number[] }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      days.push({
        dateStr: d.toDateString(),
        dayName: dayNames[d.getDay()],
        values: [] as number[],
      });
    }
    dbReadings.forEach(r => {
      const rDate = new Date(r.recorded_at).toDateString();
      const match = days.find(day => day.dateStr === rDate);
      if (match) {
        match.values.push(r.reading_value);
      }
    });
    return days.map(d => {
      const vals = d.values.length > 0 ? d.values : [120];
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    });
  }, [dbReadings]);

  const weekLabels = useMemo(() => {
    if (dbReadings.length === 0) {
      return mockWeeklyData.map(d => d.day);
    }
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const labels = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      labels.push(dayNames[d.getDay()]);
    }
    return labels;
  }, [dbReadings]);

  const monthlyAvgs = useMemo(() => {
    if (dbReadings.length === 0) {
      return mockMonthlyData.map(d => d.avg);
    }
    const days: { dateStr: string; values: number[] }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      days.push({
        dateStr: d.toDateString(),
        values: [] as number[],
      });
    }
    dbReadings.forEach(r => {
      const rDate = new Date(r.recorded_at).toDateString();
      const match = days.find(day => day.dateStr === rDate);
      if (match) {
        match.values.push(r.reading_value);
      }
    });
    return days.map(d => {
      const vals = d.values.length > 0 ? d.values : [120];
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    });
  }, [dbReadings]);

  const monthLabels = useMemo(() => {
    if (dbReadings.length === 0) {
      return mockMonthlyData.map(d => `${d.day}`);
    }
    const labels = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      labels.push(`${d.getDate()}`);
    }
    return labels;
  }, [dbReadings]);

  const displayData   = period === 'week' ? weeklyAvgs : monthlyAvgs;
  const displayLabels = period === 'week' ? weekLabels : monthLabels;

  const stats = useMemo(() => {
    if (displayData.length === 0) return { avg: 120, tir: 100, highs: 0, lows: 0, estimatedHba1c: '6.0' };
    const avg = Math.round(displayData.reduce((s, v) => s + v, 0) / displayData.length);
    const inRange = displayData.filter(v => v >= 70 && v <= 180).length;
    const tir = Math.round((inRange / displayData.length) * 100);
    const highs = displayData.filter(v => v > 250).length;
    const lows  = displayData.filter(v => v < 70).length;
    const estimatedHba1c = ((avg + 46.7) / 28.7).toFixed(1);
    return { avg, tir, highs, lows, estimatedHba1c };
  }, [displayData]);

  const observation = useMemo(() => {
    const { avg, tir, highs, lows } = stats;
    const parts: string[] = [];
    if (tir >= 70) parts.push(`Excellent time-in-range of ${tir}% — well above the 70% target.`);
    else if (tir >= 50) parts.push(`Time-in-range is ${tir}%. The target is 70% or above — consider reviewing meal timing.`);
    else parts.push(`Time-in-range is ${tir}%, which needs attention. More frequent glucose checks may help.`);

    if (avg > 200) parts.push(`Average glucose of ${avg} mg/dL is above target. A care team review of insulin dosing is recommended.`);
    else if (avg < 100) parts.push(`Average glucose of ${avg} mg/dL is near the low end. Ensure snacks are not being skipped.`);

    if (highs > 0) parts.push(`${highs} reading(s) above 250 mg/dL detected — hyperglycemia episodes worth discussing with a doctor.`);
    if (lows > 0) parts.push(`${lows} reading(s) below 70 mg/dL detected — always treat low sugar promptly.`);
    if (lows === 0 && highs <= 1) parts.push('No significant high or low episodes. Keep up the consistent routine!');
    return parts.join(' ');
  }, [stats]);

  const breakdownData = useMemo(() => {
    if (period === 'week') {
      return weekLabels.map((label, idx) => ({
        label,
        avg: weeklyAvgs[idx] ?? 120,
      }));
    } else {
      const weeks = [0, 0, 0, 0];
      const counts = [0, 0, 0, 0];
      monthlyAvgs.forEach((avg, idx) => {
        const weekIdx = Math.min(3, Math.floor(idx / 7.5));
        weeks[weekIdx] += avg;
        counts[weekIdx] += 1;
      });
      return weeks.map((sum, idx) => ({
        label: `Week ${idx + 1}`,
        avg: counts[idx] > 0 ? Math.round(sum / counts[idx]) : 120,
      }));
    }
  }, [period, weeklyAvgs, weekLabels, monthlyAvgs]);

  return (
    <View style={[styles.root, { paddingTop: Platform.OS === 'web' ? insets.top + 67 : insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>

        {/* Period toggle */}
        <View style={styles.periodRow}>
          {(['week', 'month'] as Period[]).map(p => (
            <TouchableOpacity key={p} style={[styles.periodBtn, period === p && styles.periodBtnActive]} onPress={() => setPeriod(p)}>
              <Text style={[styles.periodBtnText, period === p && styles.periodBtnTextActive]}>
                {p === 'week' ? 'This Week' : 'This Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Average Glucose</Text>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.success + '50' }]} />
              <Text style={styles.legendText}>Target range</Text>
            </View>
          </View>
          <LineChart data={displayData} labels={displayLabels} width={chartWidth - 32} />
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard label="Average" value={stats.avg} unit="mg/dL" color={COLORS.primary} />
          <StatCard label="In Range" value={`${stats.tir}%`} color={COLORS.success} />
          <StatCard label="Highs" value={stats.highs} color={COLORS.alertOrange} />
          <StatCard label="Lows" value={stats.lows} color={COLORS.alertRed} />
        </View>

        {/* Estimated HbA1c */}
        <View style={styles.hba1cCard}>
          <View style={styles.hba1cLeft}>
            <Text style={styles.hba1cLabel}>Estimated HbA1c</Text>
            <Text style={styles.hba1cSub}>Based on average glucose — not a diagnostic value</Text>
          </View>
          <Text style={styles.hba1cValue}>{stats.estimatedHba1c}%</Text>
        </View>

        {/* AI Observations */}
        <View style={styles.obsCard}>
          <View style={styles.obsHeader}>
            <View style={styles.obsIconBox}>
              <Text style={{ fontSize: 18 }}>🤖</Text>
            </View>
            <Text style={styles.obsTitle}>AI Observations</Text>
          </View>
          <Text style={styles.obsText}>{observation}</Text>
        </View>

        {/* Daily breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>{period === 'week' ? 'Daily' : 'Weekly'} Breakdown</Text>
          {breakdownData.map((d: any, i: number) => {
            const avg = d.avg;
            const label = d.label;
            const color = avg < 70 ? COLORS.alertRed : avg > 250 ? COLORS.alertOrange : avg > 180 ? COLORS.zoneYellow : COLORS.success;
            const pct = Math.min(100, Math.round((avg / 300) * 100));
            return (
              <View key={i} style={styles.breakdownRow}>
                <Text style={styles.breakdownDay}>{label}</Text>
                <View style={styles.breakdownBar}>
                  <View style={[styles.breakdownFill, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
                <Text style={[styles.breakdownVal, { color }]}>{avg}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 16 },
  periodRow: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: COLORS.border },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 13, alignItems: 'center' },
  periodBtnActive: { backgroundColor: COLORS.primary },
  periodBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  periodBtnTextActive: { color: '#fff' },
  chartCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 16, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 16, padding: 14, alignItems: 'center', gap: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statUnit: { fontSize: 11, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  statLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: COLORS.textMuted, textAlign: 'center' },
  hba1cCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.purple, borderRadius: 20, padding: 18,
  },
  hba1cLeft: { flex: 1 },
  hba1cLabel: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  hba1cSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, marginTop: 4, lineHeight: 16 },
  hba1cValue: { fontSize: 32, fontFamily: 'Inter_700Bold', color: COLORS.primary },
  obsCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 18, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  obsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  obsIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  obsTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  obsText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textDark, lineHeight: 22 },
  breakdownCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 16, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  breakdownTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  breakdownDay: { width: 36, fontSize: 13, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  breakdownBar: { flex: 1, height: 10, backgroundColor: COLORS.surface, borderRadius: 5, overflow: 'hidden' },
  breakdownFill: { height: '100%', borderRadius: 5 },
  breakdownVal: { width: 36, fontSize: 13, fontFamily: 'Inter_700Bold', textAlign: 'right' },
});
