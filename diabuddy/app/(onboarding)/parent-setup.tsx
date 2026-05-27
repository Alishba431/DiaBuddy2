import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/colors';

export default function ParentSetupScreen() {
  const insets = useSafeAreaInsets();
  const [lowThreshold, setLowThreshold] = useState(70);
  const [highThreshold, setHighThreshold] = useState(250);
  const [morningTime, setMorningTime] = useState('08:00');
  const [eveningTime, setEveningTime] = useState('20:00');

  const adjustLow = (d: number) => setLowThreshold(v => Math.max(50, Math.min(100, v + d)));
  const adjustHigh = (d: number) => setHighThreshold(v => Math.max(180, Math.min(400, v + d)));

  const handleDone = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    await AsyncStorage.setItem('low_threshold', String(lowThreshold));
    await AsyncStorage.setItem('high_threshold', String(highThreshold));
    router.replace('/' as any);
  };

  return (
    <ScrollView contentContainerStyle={[
      styles.container,
      { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20), paddingBottom: insets.bottom + 24 },
    ]}>
      <Text style={styles.heading}>Parent Setup 👨‍👩‍👧</Text>
      <Text style={styles.sub}>Let's set up safety alerts and reminders</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🕐 Insulin Reminder Times</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeCard}>
            <Text style={styles.timeLabel}>Morning</Text>
            <Text style={styles.timeValue}>{morningTime}</Text>
            <View style={styles.timeAdj}>
              <TouchableOpacity onPress={() => setMorningTime('07:00')} style={styles.miniBtn}><Text style={styles.miniText}>07:00</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setMorningTime('08:00')} style={[styles.miniBtn, morningTime === '08:00' && styles.miniBtnActive]}><Text style={[styles.miniText, morningTime === '08:00' && styles.miniTextActive]}>08:00</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setMorningTime('09:00')} style={styles.miniBtn}><Text style={styles.miniText}>09:00</Text></TouchableOpacity>
            </View>
          </View>
          <View style={styles.timeCard}>
            <Text style={styles.timeLabel}>Evening</Text>
            <Text style={styles.timeValue}>{eveningTime}</Text>
            <View style={styles.timeAdj}>
              <TouchableOpacity onPress={() => setEveningTime('19:00')} style={styles.miniBtn}><Text style={styles.miniText}>19:00</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setEveningTime('20:00')} style={[styles.miniBtn, eveningTime === '20:00' && styles.miniBtnActive]}><Text style={[styles.miniText, eveningTime === '20:00' && styles.miniTextActive]}>20:00</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setEveningTime('21:00')} style={styles.miniBtn}><Text style={styles.miniText}>21:00</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚨 Low Glucose Alert</Text>
        <Text style={styles.thresholdDesc}>Alert when glucose drops below:</Text>
        <View style={styles.adjRow}>
          <TouchableOpacity style={styles.adjBtn} onPress={() => adjustLow(-5)}><Text style={styles.adjText}>−</Text></TouchableOpacity>
          <View style={styles.thresholdDisplay}>
            <Text style={[styles.thresholdValue, { color: COLORS.alertRed }]}>{lowThreshold}</Text>
            <Text style={styles.thresholdUnit}>mg/dL</Text>
          </View>
          <TouchableOpacity style={styles.adjBtn} onPress={() => adjustLow(5)}><Text style={styles.adjText}>+</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚠️ High Glucose Alert</Text>
        <Text style={styles.thresholdDesc}>Alert when glucose rises above:</Text>
        <View style={styles.adjRow}>
          <TouchableOpacity style={styles.adjBtn} onPress={() => adjustHigh(-10)}><Text style={styles.adjText}>−</Text></TouchableOpacity>
          <View style={styles.thresholdDisplay}>
            <Text style={[styles.thresholdValue, { color: COLORS.alertOrange }]}>{highThreshold}</Text>
            <Text style={styles.thresholdUnit}>mg/dL</Text>
          </View>
          <TouchableOpacity style={styles.adjBtn} onPress={() => adjustHigh(10)}><Text style={styles.adjText}>+</Text></TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
        <Text style={styles.doneText}>All Done! Let's Start ✓</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, padding: 24, gap: 20 },
  heading: { fontSize: 28, fontFamily: 'Inter_700Bold', color: COLORS.textDark, textAlign: 'center' },
  sub: { fontSize: 16, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.card, borderRadius: 24, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.textDark, marginBottom: 12 },
  timeRow: { flexDirection: 'row', gap: 12 },
  timeCard: {
    flex: 1, backgroundColor: COLORS.background, borderRadius: 16, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  timeLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: COLORS.textMuted, marginBottom: 4 },
  timeValue: { fontSize: 24, fontFamily: 'Inter_700Bold', color: COLORS.textDark, marginBottom: 10 },
  timeAdj: { gap: 6 },
  miniBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: COLORS.border },
  miniBtnActive: { backgroundColor: COLORS.primary },
  miniText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: COLORS.textMuted },
  miniTextActive: { color: '#fff' },
  thresholdDesc: { fontSize: 15, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, marginBottom: 14 },
  adjRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  adjBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.border,
  },
  adjText: { fontSize: 24, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  thresholdDisplay: { alignItems: 'center', minWidth: 100 },
  thresholdValue: { fontSize: 40, fontFamily: 'Inter_700Bold' },
  thresholdUnit: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  doneBtn: { backgroundColor: COLORS.primary, borderRadius: 24, paddingVertical: 20, alignItems: 'center' },
  doneText: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff' },
});
