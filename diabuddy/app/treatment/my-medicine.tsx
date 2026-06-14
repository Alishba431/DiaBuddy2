import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { PointsToast } from '@/components/PointsToast';
import { MISSION_POINTS } from '@/lib/rewards';
import { useInsulin } from '@/hooks/useInsulin';

type DoseStatus = 'pending' | 'taken' | 'skipped';

const bgForStatus = (s: DoseStatus) => {
  if (s === 'taken')   return COLORS.mint;
  if (s === 'skipped') return '#FEE2E2';
  return COLORS.card;
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  let hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${m} ${ampm}`;
};

export default function MyMedicineScreen() {
  const { schedules, weeklyAdherence, confirmDose, addSchedule } = useInsulin();
  const [toast, setToast] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newUnits, setNewUnits] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSaveSchedule = async () => {
    if (!newLabel || !newTime || !newUnits) {
      Alert.alert('Incomplete', 'Please fill all fields');
      return;
    }
    await addSchedule(newLabel, newTime, parseInt(newUnits, 10));
    setIsAdding(false);
    setNewLabel('');
    setNewTime('');
    setNewUnits('');
    setShowTimePicker(false);
  };

  const markTaken = async (scheduleId: string, logId?: string) => {
    await confirmDose(scheduleId, logId);
    setToast(true);
  };

  const onTrackDays = weeklyAdherence.filter(a => a.taken >= a.total && a.total > 0).length;

  const HOURS = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));
  const MINS = ['00', '15', '30', '45'];
  
  const currentHour = newTime ? newTime.split(':')[0] : '12';
  const currentMin = newTime ? newTime.split(':')[1] : '00';

  return (
    <View style={styles.root}>
      <PointsToast points={MISSION_POINTS.medicine_confirmed} visible={toast} onHide={() => setToast(false)} />
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
        {schedules.map(d => {
          let s: DoseStatus = 'pending';
          if (d.log) {
            if (d.log.confirmed) s = 'taken';
            else s = 'skipped';
          }

          const isMorning = parseInt(d.scheduled_time.split(':')[0]) < 12;
          const icon = isMorning ? '🌅' : '🌙';

          return (
            <View key={d.id} style={[styles.doseCard, { backgroundColor: bgForStatus(s) }]}>
              <Text style={styles.doseIcon}>{icon}</Text>
              <View style={styles.doseInfo}>
                <Text style={styles.doseLabel}>{d.insulin_type}</Text>
                <Text style={styles.doseTime}>{formatTime(d.scheduled_time)}</Text>
                <View style={styles.dosePill}>
                  <Text style={styles.dosePillText}>{d.dose_units} units</Text>
                </View>
              </View>
              {s === 'pending' ? (
                <TouchableOpacity style={styles.takenBtn} onPress={() => markTaken(d.id, d.log?.id)}>
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

        {/* Add Schedule Button & Form */}
        {!isAdding ? (
          <TouchableOpacity style={styles.addDoseBtn} onPress={() => setIsAdding(true)}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.addDoseText}>Add Dose Schedule</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>New Dose Schedule</Text>
            <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Insulin Type (e.g., Fast-acting)" value={newLabel} onChangeText={setNewLabel} />
            
            {/* Custom Time Picker */}
            <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(!showTimePicker)}>
              <Text style={{ color: newTime ? COLORS.textDark : '#999', fontSize: 15 }}>
                {newTime ? formatTime(newTime) : 'Select Time'}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <View style={styles.pickerContainer}>
                <ScrollView style={styles.pickerList} nestedScrollEnabled>
                  {HOURS.map(h => (
                    <TouchableOpacity key={h} onPress={() => setNewTime(`${h}:${currentMin}`)} style={[styles.pickerItem, currentHour === h && styles.pickerItemSelected]}>
                      <Text style={[styles.pickerItemText, currentHour === h && styles.pickerItemTextSelected]}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={{ alignSelf: 'center', fontSize: 20, color: COLORS.textMuted }}>:</Text>
                <ScrollView style={styles.pickerList} nestedScrollEnabled>
                  {MINS.map(m => (
                    <TouchableOpacity key={m} onPress={() => setNewTime(`${currentHour}:${m}`)} style={[styles.pickerItem, currentMin === m && styles.pickerItemSelected]}>
                      <Text style={[styles.pickerItemText, currentMin === m && styles.pickerItemTextSelected]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <TextInput style={styles.input} placeholderTextColor="#999" placeholder="Units (e.g., 5)" value={newUnits} onChangeText={setNewUnits} keyboardType="numeric" />
            
            <View style={styles.addFormRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setIsAdding(false); setShowTimePicker(false); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSchedule}>
                <Text style={styles.saveText}>Save Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 7-Day Adherence */}
        <Text style={styles.sectionTitle}>7-Day Adherence</Text>
        <View style={styles.adherenceCard}>
          <View style={styles.adherenceRow}>
            {weeklyAdherence.map((adherence, i) => {
              const isOnTrack = adherence.taken >= adherence.total && adherence.total > 0;
              return (
                <View key={i} style={styles.adherenceDay}>
                  <View style={[styles.adherenceDot, { backgroundColor: isOnTrack ? COLORS.success : COLORS.alertRed }]}>
                    <Ionicons name={isOnTrack ? 'checkmark' : 'close'} size={14} color="#fff" />
                  </View>
                  <Text style={styles.dayLabel}>{adherence.day}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.adherenceSummary}>
            <Ionicons name="star" size={16} color={COLORS.accent} />
            <Text style={styles.adherenceRate}>{onTrackDays}/7 days · {Math.round((onTrackDays / 7) * 100)}% on track</Text>
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
  addDoseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 16, borderWidth: 2, borderColor: COLORS.primaryLight, borderStyle: 'dashed' },
  addDoseText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: COLORS.primary },
  addForm: { backgroundColor: COLORS.card, padding: 18, borderRadius: 20, gap: 12, borderWidth: 1, borderColor: '#eee' },
  addFormTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark, marginBottom: 4 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', padding: 14, borderRadius: 12, fontSize: 15, fontFamily: 'Inter_400Regular', color: COLORS.textDark },
  addFormRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#f1f1f1', alignItems: 'center' },
  cancelText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
  saveText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  pickerContainer: { flexDirection: 'row', backgroundColor: '#f9f9f9', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#eee', height: 120 },
  pickerList: { flex: 1 },
  pickerItem: { padding: 8, borderRadius: 8, alignItems: 'center', marginVertical: 2 },
  pickerItemSelected: { backgroundColor: COLORS.primary },
  pickerItemText: { fontSize: 16, color: COLORS.textDark, fontFamily: 'Inter_500Medium' },
  pickerItemTextSelected: { color: '#fff', fontFamily: 'Inter_700Bold' },
});
