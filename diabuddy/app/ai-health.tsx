import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useGlucose, useNotifications, useChildProfile } from '@/context/AppContext';
import { weeklyInsulinAdherence } from '@/data/mockData';

type Severity = 'critical' | 'warning' | 'info' | 'good';

interface Insight {
  id: string;
  severity: Severity;
  title: string;
  body: string;
  action?: string;
  icon: string;
}

const SEV_COLORS: Record<Severity, { bg: string; border: string; icon: string }> = {
  critical: { bg: '#FFF1F2', border: COLORS.alertRed,    icon: COLORS.alertRed },
  warning:  { bg: '#FFF8EC', border: COLORS.alertOrange, icon: COLORS.alertOrange },
  info:     { bg: COLORS.blue,   border: COLORS.primary,    icon: COLORS.primary },
  good:     { bg: COLORS.mint,   border: COLORS.success,    icon: COLORS.success },
};

function InsightCard({ insight }: { insight: Insight }) {
  const col = SEV_COLORS[insight.severity];
  return (
    <View style={[styles.card, { backgroundColor: col.bg, borderColor: col.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: col.border + '20' }]}>
          <Ionicons name={insight.icon as any} size={20} color={col.icon} />
        </View>
        <View style={styles.cardMeta}>
          <View style={[styles.sevBadge, { backgroundColor: col.border }]}>
            <Text style={styles.sevText}>{insight.severity.toUpperCase()}</Text>
          </View>
          <Text style={[styles.cardTitle, { color: COLORS.textDark }]}>{insight.title}</Text>
        </View>
      </View>
      <Text style={styles.cardBody}>{insight.body}</Text>
      {insight.action && (
        <TouchableOpacity style={[styles.actionBtn, { borderColor: col.border }]}>
          <Text style={[styles.actionText, { color: col.icon }]}>{insight.action}</Text>
          <Ionicons name="chevron-forward" size={14} color={col.icon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function AIHealthScreen() {
  const insets = useSafeAreaInsets();
  const { readings } = useGlucose();
  const { settings } = useNotifications();
  const { profile } = useChildProfile();

  const insights = useMemo<Insight[]>(() => {
    const result: Insight[] = [];
    const highReadings = readings.filter(r => r.value > settings.highThreshold);
    const lowReadings  = readings.filter(r => r.value < settings.lowThreshold);
    const avg = Math.round(readings.reduce((s, r) => s + r.value, 0) / readings.length);
    const inRange = readings.filter(r => r.value >= 70 && r.value <= 180).length;
    const inRangePct = Math.round((inRange / readings.length) * 100);
    const adherence = weeklyInsulinAdherence.reduce((s, d) => s + d.taken, 0) /
                      weeklyInsulinAdherence.reduce((s, d) => s + d.total, 0) * 100;

    // Hypoglycemia alert
    if (lowReadings.length > 0) {
      result.push({
        id: 'hypo',
        severity: 'critical',
        icon: 'trending-down',
        title: 'Hypoglycemia Detected',
        body: `${lowReadings.length} reading(s) dropped below ${settings.lowThreshold} mg/dL. Low blood sugar can cause shakiness, dizziness, and confusion. Always treat quickly with juice or glucose tablets and notify a caretaker.`,
        action: 'Learn Low Sugar Safety',
      });
    }

    // Hyperglycemia pattern
    if (highReadings.length >= 2) {
      result.push({
        id: 'hyper',
        severity: 'warning',
        icon: 'trending-up',
        title: 'Persistent High Glucose',
        body: `${highReadings.length} readings exceeded ${settings.highThreshold} mg/dL recently. Consistently high sugar can affect energy and long-term health. Review recent meals and insulin timing.`,
        action: 'Review Glucose Trend',
      });
    }

    // Medication review
    if (avg > 200 || adherence < 80) {
      result.push({
        id: 'med',
        severity: 'warning',
        icon: 'medical',
        title: 'Medication Review Suggested',
        body: `Average glucose is ${avg} mg/dL and insulin adherence is ${Math.round(adherence)}% this week. A care team review of the current insulin regimen may help improve glucose control.`,
        action: 'Schedule Doctor Visit',
      });
    }

    // HbA1c reminder
    result.push({
      id: 'hba1c',
      severity: 'info',
      icon: 'calendar',
      title: `HbA1c Test Reminder`,
      body: `HbA1c tests should be done every ${settings.hba1cReminderDays} days (every ${Math.round(settings.hba1cReminderDays / 30)} month${settings.hba1cReminderDays >= 60 ? 's' : ''}). This test shows your average glucose level over 3 months and helps guide treatment decisions. Talk to your doctor about scheduling one.`,
      action: 'Set Reminder',
    });

    // Doctor consultation
    if (highReadings.length >= 2 || lowReadings.length > 0) {
      result.push({
        id: 'doctor',
        severity: 'info',
        icon: 'person-circle',
        title: 'Schedule a Consultation',
        body: `Based on recent glucose patterns, a check-in with ${profile.name}'s diabetes care team is recommended. Bring the weekly health report to the appointment for a complete picture.`,
        action: 'View Health Report',
      });
    }

    // Time in range — good news
    if (inRangePct >= 60) {
      result.push({
        id: 'tir',
        severity: 'good',
        icon: 'checkmark-circle',
        title: `Good Time in Range — ${inRangePct}%`,
        body: `${inRangePct}% of today's readings are within the target range of 70–180 mg/dL. Keep up the good work! Consistent logging and following the daily routine helps maintain this.`,
      });
    }

    return result;
  }, [readings, settings, profile]);

  const criticals = insights.filter(i => i.severity === 'critical').length;
  const warnings  = insights.filter(i => i.severity === 'warning').length;

  return (
    <View style={[styles.root, { paddingTop: Platform.OS === 'web' ? insets.top + 67 : insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>

        {/* Summary banner */}
        <View style={[styles.banner, { backgroundColor: criticals > 0 ? '#FFF1F2' : warnings > 0 ? '#FFF8EC' : COLORS.mint }]}>
          <Ionicons
            name={criticals > 0 ? 'warning' : warnings > 0 ? 'alert-circle' : 'checkmark-circle'}
            size={28}
            color={criticals > 0 ? COLORS.alertRed : warnings > 0 ? COLORS.alertOrange : COLORS.success}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              {criticals > 0 ? `${criticals} Critical Alert${criticals > 1 ? 's' : ''}`
               : warnings > 0 ? `${warnings} Warning${warnings > 1 ? 's' : ''} — Review Needed`
               : 'All Clear — Looking Good'}
            </Text>
            <Text style={styles.bannerSub}>
              {insights.length} insight{insights.length !== 1 ? 's' : ''} generated from today's data
            </Text>
          </View>
        </View>

        {/* Threshold info */}
        <View style={styles.threshRow}>
          <View style={styles.threshBadge}>
            <Ionicons name="arrow-down" size={14} color={COLORS.alertRed} />
            <Text style={styles.threshText}>Low: &lt;{settings.lowThreshold} mg/dL</Text>
          </View>
          <View style={styles.threshBadge}>
            <Text style={[styles.threshText, { color: COLORS.success }]}>Target: 70–180 mg/dL</Text>
          </View>
          <View style={styles.threshBadge}>
            <Ionicons name="arrow-up" size={14} color={COLORS.alertOrange} />
            <Text style={styles.threshText}>High: &gt;{settings.highThreshold} mg/dL</Text>
          </View>
        </View>

        {/* Insight cards */}
        {insights.map(ins => <InsightCard key={ins.id} insight={ins} />)}

        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.footerText}>These insights are generated from logged data and are for informational purposes only. Always consult your healthcare team for medical decisions.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 14 },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 20, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  bannerTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  bannerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, marginTop: 2 },
  threshRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  threshBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  threshText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  card: {
    borderRadius: 20, padding: 18, gap: 12, borderWidth: 1.5,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardMeta: { flex: 1, gap: 4 },
  sevBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  sevText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: 0.5 },
  cardTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', lineHeight: 22 },
  cardBody: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textDark, lineHeight: 22 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start' },
  actionText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  footer: { flexDirection: 'row', gap: 8, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, alignItems: 'flex-start' },
  footerText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, lineHeight: 18 },
});
