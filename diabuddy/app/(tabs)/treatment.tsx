import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useGlucose } from '@/context/AppContext';

const MODULES = [
  { id: 'my-sugar',    icon: 'water',       title: 'My Sugar',    subtitle: '5 readings today', bg: COLORS.primary, text: '#fff',          iconColor: 'rgba(255,255,255,0.85)' },
  { id: 'my-medicine', icon: 'medical',     title: 'My Medicine', subtitle: 'Morning: Taken',   bg: COLORS.blue,    text: COLORS.textDark, iconColor: COLORS.primary },
  { id: 'eat-smart',   icon: 'nutrition',   title: 'Eat Smart',   subtitle: 'Lunch logged',     bg: COLORS.mint,    text: COLORS.textDark, iconColor: COLORS.success },
  { id: 'move-play',   icon: 'bicycle',     title: 'Move & Play', subtitle: '30 min today',     bg: COLORS.coral,   text: COLORS.textDark, iconColor: COLORS.alertRed },
];

export default function TreatmentScreen() {
  const insets = useSafeAreaInsets();
  const { lastReading, getZone } = useGlucose();

  const zone = lastReading ? getZone(lastReading.value) : null;
  const zoneColor = zone === 'green' ? COLORS.success : zone === 'yellow' ? COLORS.zoneYellow : zone === 'red_high' ? COLORS.alertOrange : COLORS.alertRed;
  const zoneLabel = zone === 'green' ? 'In Range' : zone === 'yellow' ? 'Slightly High' : zone === 'red_high' ? 'Too High' : 'Too Low';

  return (
    <View style={[styles.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <Text style={styles.title}>Treatment</Text>
        <Text style={styles.sub}>Manage your health every day</Text>

        {/* Live glucose snapshot */}
        {lastReading && (
          <TouchableOpacity style={styles.snapshotCard} onPress={() => router.push('/treatment/my-sugar' as any)}>
            <View>
              <Text style={styles.snapshotLabel}>Current Glucose</Text>
              <View style={styles.snapshotRow}>
                <Text style={[styles.snapshotValue, { color: zoneColor }]}>{lastReading.value}</Text>
                <Text style={styles.snapshotUnit}>mg/dL</Text>
              </View>
              <Text style={styles.snapshotTime}>{lastReading.time} · {lastReading.type}</Text>
            </View>
            <View style={[styles.zonePill, { backgroundColor: zoneColor + '20', borderColor: zoneColor }]}>
              <View style={[styles.zoneDot, { backgroundColor: zoneColor }]} />
              <Text style={[styles.zoneText, { color: zoneColor }]}>{zoneLabel}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Module grid */}
        <View style={styles.grid}>
          {MODULES.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.card, { backgroundColor: m.bg }]}
              onPress={() => router.push(`/treatment/${m.id}` as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.cardIconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name={m.icon as any} size={26} color={m.iconColor} />
              </View>
              <Text style={[styles.cardTitle, { color: m.text }]}>{m.title}</Text>
              <View style={styles.statusBadge}>
                <Text style={[styles.statusText, { color: m.text, opacity: 0.85 }]}>{m.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Glucose trend shortcut */}
        <TouchableOpacity style={styles.trendCard} onPress={() => router.push('/treatment/glucose-trend' as any)}>
          <View style={styles.trendLeft}>
            <View style={styles.trendIconBox}>
              <Ionicons name="analytics-outline" size={22} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.trendTitle}>Weekly Glucose Trend</Text>
              <Text style={styles.trendSub}>See your 7-day glucose chart</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Daily tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={18} color={COLORS.accentDark} />
            <Text style={styles.tipTitle}>Today's Tip</Text>
          </View>
          <Text style={styles.tipText}>
            Check your glucose before and after meals for the best understanding of how food affects your sugar levels.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 16 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  sub: { fontSize: 16, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  snapshotCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 18,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  snapshotLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: COLORS.textMuted, marginBottom: 4 },
  snapshotRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  snapshotValue: { fontSize: 36, fontFamily: 'Inter_700Bold' },
  snapshotUnit: { fontSize: 16, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  snapshotTime: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, marginTop: 4 },
  zonePill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1.5 },
  zoneDot: { width: 8, height: 8, borderRadius: 4 },
  zoneText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: {
    width: '47%', borderRadius: 24, padding: 20, gap: 10, minHeight: 150, justifyContent: 'space-between',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  cardIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, alignSelf: 'flex-start' },
  statusText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  trendCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  trendLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  trendIconBox: { width: 44, height: 44, borderRadius: 13, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  trendTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  trendSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  tipCard: { backgroundColor: COLORS.accentLight, borderRadius: 20, padding: 18, gap: 10, borderWidth: 1.5, borderColor: COLORS.accent },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  tipText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textDark, lineHeight: 22 },
});
