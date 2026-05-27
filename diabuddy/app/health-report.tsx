import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useGlucose, useChildProfile } from '@/context/AppContext';
import { weeklyInsulinAdherence, mealHistory } from '@/data/mockData';

function Section({ icon, iconColor, title, children }: { icon: string; iconColor: string; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon as any} size={18} color={iconColor} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function MetricRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

export default function HealthReportScreen() {
  const insets = useSafeAreaInsets();
  const { readings } = useGlucose();
  const { profile } = useChildProfile();

  const today = new Date();
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - 6);
  const dateRange = `${weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const stats = useMemo(() => {
    const avg = Math.round(readings.reduce((s, r) => s + r.value, 0) / readings.length);
    const inRange = readings.filter(r => r.value >= 70 && r.value <= 180).length;
    const tir = Math.round((inRange / readings.length) * 100);
    const highs = readings.filter(r => r.value > 250).length;
    const lows  = readings.filter(r => r.value < 70).length;
    const totalDoses = weeklyInsulinAdherence.reduce((s, d) => s + d.total, 0);
    const takenDoses = weeklyInsulinAdherence.reduce((s, d) => s + d.taken, 0);
    const adherence = Math.round((takenDoses / totalDoses) * 100);
    const estimatedHba1c = ((avg + 46.7) / 28.7).toFixed(1);
    return { avg, tir, highs, lows, adherence, totalDoses, takenDoses, estimatedHba1c };
  }, [readings]);

  const recs = useMemo(() => {
    const r: string[] = [];
    if (stats.tir < 70)  r.push('Review meal carbohydrate content and timing of insulin doses to improve time in range.');
    if (stats.lows > 0)  r.push('Discuss hypoglycemia episodes with care team — consider adjusting basal or bolus dosing.');
    if (stats.highs >= 2) r.push('Multiple hyperglycemia readings detected. Review recent weekend meal choices and activity level.');
    if (stats.adherence < 90) r.push(`Insulin adherence is ${stats.adherence}%. Setting up reminder alerts may help improve consistency.`);
    if (r.length === 0) r.push('Blood glucose control has been good this week. Continue the current management plan and maintain regular check-ins.');
    r.push(`Next HbA1c test is recommended within 90 days. Bring this report to your next appointment.`);
    return r;
  }, [stats]);

  const dietObs = mealHistory.flatMap(d => d.meals.filter((m: any) => m.postGlucose > 200)).length;

  return (
    <View style={[styles.root, { paddingTop: Platform.OS === 'web' ? insets.top + 67 : insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>

        {/* Report header */}
        <View style={styles.reportHeader}>
          <View style={styles.reportLogoBox}>
            <Ionicons name="heart" size={24} color={COLORS.card} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reportName}>DiaBuddy Health Report</Text>
            <Text style={styles.reportSub}>Weekly Summary</Text>
          </View>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Patient info */}
        <View style={styles.patientCard}>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Patient</Text>
            <Text style={styles.patientValue}>{profile.name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Age</Text>
            <Text style={styles.patientValue}>{profile.age} years</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Report Period</Text>
            <Text style={styles.patientValue}>{dateRange}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Diabetes Type</Text>
            <Text style={styles.patientValue}>Type 1</Text>
          </View>
        </View>

        {/* Quick summary banner */}
        <View style={[styles.summaryBanner, { backgroundColor: stats.tir >= 70 ? COLORS.mint : COLORS.yellow }]}>
          <Text style={styles.summaryTitle}>
            {stats.tir >= 70 ? 'Good week overall!' : 'Needs some attention this week'}
          </Text>
          <Text style={styles.summarySub}>
            Time in range: {stats.tir}% · Avg glucose: {stats.avg} mg/dL · Adherence: {stats.adherence}%
          </Text>
        </View>

        {/* Blood Glucose */}
        <Section icon="water" iconColor={COLORS.primary} title="Blood Glucose Overview">
          <View style={styles.card}>
            <MetricRow label="Average Glucose" value={`${stats.avg} mg/dL`} color={stats.avg > 200 ? COLORS.alertOrange : COLORS.primary} />
            <View style={styles.rowDivider} />
            <MetricRow label="Time in Range (70–180)" value={`${stats.tir}%`} color={stats.tir >= 70 ? COLORS.success : COLORS.alertOrange} />
            <View style={styles.rowDivider} />
            <MetricRow label="High Episodes (>250)" value={`${stats.highs}`} color={stats.highs > 0 ? COLORS.alertOrange : COLORS.success} />
            <View style={styles.rowDivider} />
            <MetricRow label="Low Episodes (<70)" value={`${stats.lows}`} color={stats.lows > 0 ? COLORS.alertRed : COLORS.success} />
            <View style={styles.rowDivider} />
            <MetricRow label="Total Readings" value={`${readings.length}`} />
            <View style={styles.rowDivider} />
            <MetricRow label="Estimated HbA1c" value={`${stats.estimatedHba1c}%`} />
          </View>
          <Text style={styles.noteText}>Estimated HbA1c is calculated from average glucose and is not a clinical measurement.</Text>
        </Section>

        {/* Insulin */}
        <Section icon="medical" iconColor={COLORS.alertOrange} title="Insulin Adherence">
          <View style={styles.card}>
            <MetricRow label="Doses Taken" value={`${stats.takenDoses} of ${stats.totalDoses}`} />
            <View style={styles.rowDivider} />
            <MetricRow label="Adherence Rate" value={`${stats.adherence}%`} color={stats.adherence >= 90 ? COLORS.success : COLORS.alertOrange} />
            <View style={styles.rowDivider} />
            <MetricRow label="Missed Doses" value={`${stats.totalDoses - stats.takenDoses}`} color={stats.totalDoses - stats.takenDoses > 2 ? COLORS.alertRed : COLORS.textMuted} />
          </View>
          {/* Weekly bar */}
          <View style={styles.adherenceBar}>
            {weeklyInsulinAdherence.map((d, i) => (
              <View key={i} style={styles.adherenceDay}>
                <View style={[styles.adherenceCircle, { backgroundColor: d.taken === d.total ? COLORS.success : d.taken === 0 ? COLORS.alertRed : COLORS.alertOrange }]}>
                  <Text style={styles.adherenceNum}>{d.taken}/{d.total}</Text>
                </View>
                <Text style={styles.adherenceDayLabel}>{d.day}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Diet correlation */}
        <Section icon="nutrition" iconColor={COLORS.success} title="Diet & Glucose Correlation">
          <View style={styles.card}>
            <MetricRow label="Meals Logged" value={`${mealHistory.reduce((s, d) => s + d.meals.length, 0)}`} />
            <View style={styles.rowDivider} />
            <MetricRow label="Post-meal Spikes (>200)" value={`${dietObs}`} color={dietObs > 1 ? COLORS.alertOrange : COLORS.success} />
            <View style={styles.rowDivider} />
            <MetricRow label="Best Meal Response" value="Breakfast (avg +50)" color={COLORS.success} />
          </View>
          {dietObs > 0 && (
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>Post-meal glucose spikes detected after high-carbohydrate meals. Consider splitting carb intake across meals and taking insulin 15 minutes before eating.</Text>
            </View>
          )}
        </Section>

        {/* Recommendations */}
        <Section icon="bulb" iconColor={COLORS.accent} title="AI Recommendations">
          <View style={styles.recsCard}>
            {recs.map((r, i) => (
              <View key={i} style={styles.recRow}>
                <View style={styles.recBullet} />
                <Text style={styles.recText}>{r}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Share */}
        <TouchableOpacity style={styles.shareFullBtn}>
          <Ionicons name="share-outline" size={20} color={COLORS.textDark} />
          <Text style={styles.shareBtnText}>Share with Doctor</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>This report is generated from DiaBuddy app data and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 16 },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reportLogoBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  reportName: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  reportSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  shareBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  patientCard: {
    backgroundColor: COLORS.card, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  patientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingHorizontal: 16 },
  patientLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  patientValue: { fontSize: 14, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  divider: { height: 1, backgroundColor: COLORS.divider },
  summaryBanner: { borderRadius: 20, padding: 18, gap: 4 },
  summaryTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  summarySub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textDark },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  card: { backgroundColor: COLORS.card, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, paddingHorizontal: 16 },
  metricLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  metricValue: { fontSize: 14, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  rowDivider: { height: 1, backgroundColor: COLORS.divider },
  noteText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, paddingHorizontal: 4 },
  adherenceBar: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 16, padding: 14, justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  adherenceDay: { alignItems: 'center', gap: 6 },
  adherenceCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  adherenceNum: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#fff' },
  adherenceDayLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: COLORS.textMuted },
  tipBox: { backgroundColor: COLORS.yellow, borderRadius: 14, padding: 14 },
  tipText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textDark, lineHeight: 20 },
  recsCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  recRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  recBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 7 },
  recText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textDark, lineHeight: 21 },
  shareFullBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 18,
    shadowColor: COLORS.accent, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  shareBtnText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  disclaimer: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, lineHeight: 18, textAlign: 'center', paddingHorizontal: 8 },
});
