import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/colors';
import { useGlucose } from '@/context/AppContext';
import { useChildProfile } from '@/context/AppContext';

const TYPES = ['Fasting', 'After Meal', 'Before Bed', 'After Exercise'];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: (value: number, zone: string) => void;
}

export function LogGlucoseModal({ visible, onClose, onSaved }: Props) {
  const { addReading, getZone } = useGlucose();
  const { addPoints } = useChildProfile();
  const [value, setValue] = useState(120);
  const [type, setType] = useState('Fasting');
  const [note, setNote] = useState('');

  const adjust = (delta: number) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue(v => Math.max(20, Math.min(600, v + delta)));
  };

  const handleSave = () => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    addReading({ time, value, type });
    addPoints(10);
    const zone = getZone(value);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSaved(value, zone);
    onClose();
  };

  const zone = getZone(value);
  const zoneColor = zone === 'green' ? COLORS.zoneGreen : zone === 'yellow' ? COLORS.zoneYellow : COLORS.alertRed;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Log Glucose Reading</Text>

        <View style={[styles.valueBox, { borderColor: zoneColor }]}>
          <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(-5)}>
            <Text style={styles.adjText}>−</Text>
          </TouchableOpacity>
          <View style={styles.valueCenter}>
            <TextInput
              style={[styles.valueInput, { color: zoneColor }]}
              value={String(value)}
              onChangeText={t => setValue(Number(t) || 0)}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.unitText}>mg/dL</Text>
          </View>
          <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(5)}>
            <Text style={styles.adjText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Reading Type</Text>
        <View style={styles.pills}>
          {TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.pill, type === t && styles.pillActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.pillText, type === t && styles.pillTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.noteInput}
          placeholder="Add a note (optional)"
          placeholderTextColor={COLORS.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: zoneColor }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Reading ✓</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  handle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold', color: COLORS.textDark, textAlign: 'center', marginBottom: 20 },
  valueBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 2, borderRadius: 20, padding: 16, marginBottom: 20,
  },
  adjBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
  },
  adjText: { fontSize: 28, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  valueCenter: { alignItems: 'center' },
  valueInput: { fontSize: 48, fontFamily: 'Inter_700Bold', textAlign: 'center', minWidth: 80 },
  unitText: { fontSize: 16, color: COLORS.textMuted, fontFamily: 'Inter_500Medium' },
  sectionLabel: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark, marginBottom: 10 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border,
  },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: COLORS.textMuted },
  pillTextActive: { color: '#fff' },
  noteInput: {
    backgroundColor: COLORS.background, borderRadius: 14, padding: 14,
    fontSize: 15, fontFamily: 'Inter_400Regular', color: COLORS.textDark,
    minHeight: 52, marginBottom: 20,
  },
  saveBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center' },
  saveBtnText: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' },
});
