import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { PointsToast } from '@/components/PointsToast';

type DoseStatus = 'pending' | 'taken' | 'skipped';

const DOSES = [
  { id: 'morning', time: '08:00 AM', label: 'Morning Dose', insulin: 'Fast-acting', units: 6, icon: '🌅' },
  { id: 'evening', time: '08:00 PM', label: 'Evening Dose', insulin: 'Long-acting',  units: 10, icon: '🌙' },
];
const ADHERENCE = [true, true, false, true, true, true, false];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const bgForStatus = (s: DoseStatus) => {
  if (s === 'taken')   return COLORS.mint;
  if (s === 'skipped') return '#FEE2E2';
  return COLORS.card;
};

export default function MyMedicineScreen() {
  const [status, setStatus] = useState<Record<string, DoseStatus>>({ morning: 'taken', evening: 'pending' });
  const [toast, setToast] = useState(false);

  const markTaken = (id: string) => {
    setStatus(s => ({ ...s, [id]: 'taken' }));
    setToast(true);
  };

  const takenCount = ADHERENCE.filter(Boolean).length;

  return (
    <View style={styles.root}>
      <PointsToast points={15} visible={toast} onHide={() => setToast(false)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Ionicons name="medical" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Insulin Reminders</Text>
            <Text style={styles.infoSub}>Always take insulin with a parent's help</Text>
          </View>
        </View>

        {/* Dose cards */}
        {DOSES.map(d => {
          const s = status[d.id];
          return (
            <View key={d.id} style={[styles.doseCard, { backgroundColor: bgForStatus(s) }]}>
              <Text style={styles.doseIcon}>{d.icon}</Text>
              <View style={styles.doseInfo}>
                <Text style={styles.doseLabel}>{d.label}</Text>
                <Text style={styles.doseTime}>{d.time}</Text>
                <View style={styles.dosePill}>
                  <Text style={styles.dosePillText}>{d.insulin} · {d.units} units</Text>
                </View>
              </View>
              {s === 'pending' ? (
                <TouchableOpacity style={styles.takenBtn} onPress={() => markTaken(d.id)}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.takenText}>Mark Taken</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: s === 'taken' ? COLORS.success + '20' : '#FEE2E2' }]}>
                  <Ionicons name={s === 'taken' ? 'checkmark-circle' : 'close-circle'} size={18} color={s === 'taken' ? COLORS.success : COLORS.alertRed} />
                  <Text style={[styles.statusBadgeText, { color: s === 'taken' ? COLORS.success : COLORS.alertRed }]}>
                    {s === 'taken' ? 'Taken' : 'Skipped'}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {/* 7-Day Adherence */}
        <Text style={styles.sectionTitle}>7-Day Adherence</Text>
        <View style={styles.adherenceCard}>
          <View style={styles.adherenceRow}>
            {DAYS.map((d, i) => (
              <View key={i} style={styles.adherenceDay}>
                <View style={[styles.adherenceDot, { backgroundColor: ADHERENCE[i] ? COLORS.success : COLORS.alertRed }]}>
                  <Ionicons name={ADHERENCE[i] ? 'checkmark' : 'close'} size={14} color="#fff" />
                </View>
                <Text style={styles.dayLabel}>{d}</Text>
              </View>
            ))}
          </View>
          <View style={styles.adherenceSummary}>
            <Ionicons name="star" size={16} color={COLORS.accent} />
            <Text style={styles.adherenceRate}>{takenCount}/7 days · {Math.round((takenCount / 7) * 100)}% on track</Text>
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={18} color={COLORS.alertOrange} />
            <Text style={styles.warningTitle}>Important Reminder</Text>
          </View>
          <Text style={styles.warningText}>
            Never skip insulin without talking to your doctor. Always have your parent help you with your shots or pump.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.blue, borderRadius: 20, padding: 18, borderWidth: 1.5, borderColor: COLORS.primaryLight,
  },
  infoIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
  infoTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  infoSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, marginTop: 2 },
  doseCard: {
    borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  doseIcon: { fontSize: 40 },
  doseInfo: { flex: 1, gap: 4 },
  doseLabel: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  doseTime: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  dosePill: { backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 4 },
  dosePillText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: COLORS.textDark },
  takenBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 11 },
  takenText: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#fff' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8 },
  statusBadgeText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  adherenceCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 20, gap: 14,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  adherenceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  adherenceDay: { alignItems: 'center', gap: 6 },
  adherenceDot: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dayLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  adherenceSummary: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  adherenceRate: { fontSize: 14, fontFamily: 'Inter_700Bold', color: COLORS.primary },
  warningCard: { backgroundColor: '#FFF3E0', borderRadius: 20, padding: 18, borderWidth: 1.5, borderColor: COLORS.alertOrange, gap: 10 },
  warningHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  warningTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  warningText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textDark, lineHeight: 22 },
});
