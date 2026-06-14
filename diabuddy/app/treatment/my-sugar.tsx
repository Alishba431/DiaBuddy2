import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useGlucose } from '@/context/AppContext';
import { GlucoseZoneBadge } from '@/components/GlucoseZoneBadge';
import { CharacterMascot } from '@/components/CharacterMascot';
import { LogGlucoseModal } from '@/components/LogGlucoseModal';
import { useChildProfile } from '@/context/AppContext';
import { PointsToast } from '@/components/PointsToast';
import { MISSION_POINTS } from '@/lib/rewards';

const zoneColors: Record<string, string> = {
  green: COLORS.mint, yellow: COLORS.yellow, red_high: '#FEE2E2', red_low: '#FEE2E2',
};
const zoneMood: Record<string, 'happy' | 'neutral' | 'worried' | 'urgent'> = {
  green: 'happy', yellow: 'worried', red_high: 'urgent', red_low: 'urgent',
};
const zoneMessages: Record<string, string> = {
  green:    "You are in the target range. Great job!",
  yellow:   "A bit high — stay calm and manage it.",
  red_high: "Sugar is too high. Tell an adult right away.",
  red_low:  "Sugar is low. Eat something sweet now.",
};
const zoneIcons: Record<string, { name: string; color: string }> = {
  green:    { name: 'checkmark-circle', color: COLORS.success },
  yellow:   { name: 'alert-circle',     color: COLORS.zoneYellow },
  red_high: { name: 'warning',          color: COLORS.alertOrange },
  red_low:  { name: 'trending-down',    color: COLORS.alertRed },
};

export default function MySugarScreen() {
  const { readings, lastReading, getZone } = useGlucose();
  const { getCharacterEmoji } = useChildProfile();
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(false);

  const zone = lastReading ? getZone(lastReading.value) : 'green';
  const icon = zoneIcons[zone];

  return (
    <View style={styles.root}>
      <PointsToast points={MISSION_POINTS.bg_logged} visible={toast} onHide={() => setToast(false)} />
      <LogGlucoseModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSaved={(_val: number, _z: string) => { setToast(true); }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === 'web' ? 60 : 40 }]}>

        {/* Current Reading Card */}
        {lastReading && (
          <View style={[styles.currentCard, { backgroundColor: zoneColors[zone] }]}>
            <CharacterMascot emoji={getCharacterEmoji()} mood={zoneMood[zone]} size={56} />
            <View style={styles.currentCenter}>
              <Text style={styles.currentValue}>{lastReading.value}</Text>
              <Text style={styles.currentUnit}>mg/dL</Text>
              <GlucoseZoneBadge value={lastReading.value} />
            </View>
            <View style={styles.zoneMsg}>
              <Ionicons name={icon.name as any} size={18} color={icon.color} />
              <Text style={styles.zoneMsgText}>{zoneMessages[zone]}</Text>
            </View>
            <Text style={styles.readingTime}>{lastReading.time} · {lastReading.type}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.logBtn} onPress={() => setShowModal(true)}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.logBtnText}>Log Reading</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.trendBtn} onPress={() => router.push('/treatment/glucose-trend' as any)}>
            <Ionicons name="analytics-outline" size={20} color={COLORS.primary} />
            <Text style={styles.trendBtnText}>This Week</Text>
          </TouchableOpacity>
        </View>

        {/* Zone Guide */}
        <View style={styles.zoneGuide}>
          {[
            { label: 'Low',      range: '<70',        color: COLORS.alertRed },
            { label: 'Target',   range: '70–180',     color: COLORS.success },
            { label: 'Elevated', range: '181–250',    color: COLORS.zoneYellow },
            { label: 'High',     range: '>250',       color: COLORS.alertOrange },
          ].map(z => (
            <View key={z.label} style={styles.zoneItem}>
              <View style={[styles.zoneDot, { backgroundColor: z.color }]} />
              <View>
                <Text style={styles.zoneItemLabel}>{z.label}</Text>
                <Text style={styles.zoneItemRange}>{z.range}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Today's Readings */}
        <Text style={styles.sectionTitle}>Today's Readings</Text>
        <View style={styles.readingsList}>
          {readings.map((r, i) => {
            const z = getZone(r.value);
            const dotColor = z === 'green' ? COLORS.zoneGreen : z === 'yellow' ? COLORS.zoneYellow : COLORS.alertRed;
            return (
              <View key={r.id} style={[styles.readingRow, i < readings.length - 1 && styles.readingBorder]}>
                <View style={[styles.readingDot, { backgroundColor: dotColor }]} />
                <View style={styles.readingInfo}>
                  <Text style={styles.readingTime2}>{r.time}</Text>
                  <Text style={styles.readingType}>{r.type}</Text>
                </View>
                <Text style={[styles.readingValue, { color: dotColor }]}>{r.value}</Text>
                <Text style={styles.readingUnit}>mg/dL</Text>
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
  currentCard: {
    borderRadius: 24, padding: 24, alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  currentCenter: { alignItems: 'center', gap: 4 },
  currentValue: { fontSize: 72, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  currentUnit: { fontSize: 18, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  zoneMsg: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  zoneMsgText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: COLORS.textDark },
  readingTime: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  actionRow: { flexDirection: 'row', gap: 12 },
  logBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 20, paddingVertical: 17 },
  logBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#fff' },
  trendBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.card, borderRadius: 20, paddingVertical: 17, borderWidth: 2, borderColor: COLORS.primary },
  trendBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.primary },
  zoneGuide: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 20, padding: 16, justifyContent: 'space-between',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  zoneItem: { alignItems: 'center', gap: 6 },
  zoneDot: { width: 14, height: 14, borderRadius: 7 },
  zoneItemLabel: { fontSize: 12, fontFamily: 'Inter_700Bold', color: COLORS.textDark, textAlign: 'center' },
  zoneItemRange: { fontSize: 10, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  readingsList: {
    backgroundColor: COLORS.card, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  readingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  readingBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  readingDot: { width: 14, height: 14, borderRadius: 7 },
  readingInfo: { flex: 1 },
  readingTime2: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  readingType: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  readingValue: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  readingUnit: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
});
