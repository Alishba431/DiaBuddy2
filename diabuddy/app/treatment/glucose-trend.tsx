import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import Svg, { Path, Line, Rect, Circle, Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useGlucose } from '@/context/AppContext';
import { mockWeeklyData } from '@/data/mockData';

const weeklyData = mockWeeklyData.map(d => ({
  avg: Math.round(d.readings.reduce((a, b) => a + b, 0) / d.readings.length),
  min: Math.min(...d.readings),
  max: Math.max(...d.readings),
}));

const W = Math.min(Dimensions.get('window').width - 40, 380);
const CH = 160;
const PAD = { top: 10, right: 12, bottom: 30, left: 44 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = CH - PAD.top - PAD.bottom;
const MIN_G = 0;
const MAX_G = 320;

const yScale = (val: number) => INNER_H - ((val - MIN_G) / (MAX_G - MIN_G)) * INNER_H;
const xScale = (i: number, total: number) => (i / (total - 1)) * INNER_W;

const ZONE_TOP = yScale(180);
const ZONE_BOTTOM = yScale(70);
const LINE_70 = yScale(70);
const LINE_180 = yScale(180);

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const Y_LABELS = [300, 250, 180, 70, 0];

function TrendChart({ data }: { data: { avg: number; min: number; max: number }[] }) {
  const avgPts = data.map((d, i) => ({ x: xScale(i, data.length), y: yScale(d.avg) }));
  const avgPath = avgPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  return (
    <Svg width={INNER_W + PAD.left + PAD.right} height={CH}>
      <Svg x={PAD.left} y={PAD.top}>
        {/* Green zone */}
        <Rect x={0} y={ZONE_TOP} width={INNER_W} height={ZONE_BOTTOM - ZONE_TOP} fill="rgba(16,185,129,0.12)" rx={4} />
        {/* 70 line */}
        <Line x1={0} y1={LINE_70} x2={INNER_W} y2={LINE_70} stroke={COLORS.alertRed} strokeWidth={1} strokeDasharray="4,4" />
        {/* 180 line */}
        <Line x1={0} y1={LINE_180} x2={INNER_W} y2={LINE_180} stroke={COLORS.alertOrange} strokeWidth={1} strokeDasharray="4,4" />
        {/* Main line */}
        <Path d={avgPath} stroke={COLORS.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Points */}
        {avgPts.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={COLORS.primary} stroke="#fff" strokeWidth={2} />
        ))}
        {/* X axis labels */}
        {DAYS.map((d, i) => (
          <SvgText key={i} x={xScale(i, 7)} y={INNER_H + 20} fill={COLORS.textMuted} fontSize={10} textAnchor="middle" fontFamily="System">
            {d}
          </SvgText>
        ))}
      </Svg>
      {/* Y axis labels */}
      {Y_LABELS.map((v, i) => (
        <SvgText key={i} x={PAD.left - 6} y={PAD.top + yScale(v) + 4} fill={COLORS.textMuted} fontSize={9} textAnchor="end" fontFamily="System">
          {v}
        </SvgText>
      ))}
    </Svg>
  );
}

export default function GlucoseTrendScreen() {
  const { readings } = useGlucose();
  const avgToday = Math.round(readings.reduce((s, r) => s + r.value, 0) / readings.length);

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Avg (7d)', value: '142', unit: 'mg/dL', color: COLORS.primary },
            { label: 'In Range', value: '71%', unit: 'of time', color: COLORS.zoneGreen },
            { label: 'High Events', value: '4', unit: 'this week', color: COLORS.alertOrange },
            { label: 'Low Events', value: '1', unit: 'this week', color: COLORS.alertRed },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statUnit}>{s.unit}</Text>
            </View>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>7-Day Glucose Trend</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: 'rgba(16,185,129,0.3)' }]} /><Text style={styles.legendText}>Target zone (70-180)</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDash, { borderColor: COLORS.primary }]} /><Text style={styles.legendText}>Average</Text></View>
          </View>
          <TrendChart data={weeklyData} />
        </View>

        {/* Today's Readings */}
        <Text style={styles.sectionTitle}>Today's Readings · Avg {avgToday} mg/dL</Text>
        <View style={styles.readingsList}>
          {readings.map((r, i) => {
            const pct = Math.min(r.value / 320, 1);
            const barColor = r.value < 70 ? COLORS.alertRed : r.value <= 180 ? COLORS.zoneGreen : COLORS.alertOrange;
            return (
              <View key={r.id} style={[styles.readingRow, i < readings.length - 1 && styles.readingBorder]}>
                <Text style={styles.readingTime}>{r.time}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
                </View>
                <Text style={[styles.readingVal, { color: barColor }]}>{r.value}</Text>
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
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '47%', backgroundColor: COLORS.card, borderRadius: 18, padding: 16, alignItems: 'center', gap: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  statUnit: { fontSize: 11, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  chartCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 16, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  chartTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  legendRow: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 10, borderRadius: 4 },
  legendDash: { width: 18, height: 0, borderTopWidth: 2.5, borderStyle: 'solid' },
  legendText: { fontSize: 11, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  readingsList: {
    backgroundColor: COLORS.card, borderRadius: 20,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  readingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  readingBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  readingTime: { width: 56, fontSize: 14, fontFamily: 'Inter_500Medium', color: COLORS.textMuted },
  barTrack: { flex: 1, height: 8, backgroundColor: COLORS.background, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  readingVal: { width: 40, fontSize: 15, fontFamily: 'Inter_700Bold', textAlign: 'right' },
});
