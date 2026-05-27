import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Switch, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useNotifications, NotificationSettings } from '@/context/AppContext';

const TIMES = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];

function TimePicker({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  const idx = TIMES.indexOf(value);
  const dec = () => onChange(TIMES[Math.max(0, idx - 1)]);
  const inc = () => onChange(TIMES[Math.min(TIMES.length - 1, idx + 1)]);
  return (
    <View style={tp.row}>
      <TouchableOpacity onPress={dec} style={tp.btn}><Ionicons name="chevron-back" size={16} color={COLORS.primary} /></TouchableOpacity>
      <Text style={tp.value}>{value}</Text>
      <TouchableOpacity onPress={inc} style={tp.btn}><Ionicons name="chevron-forward" size={16} color={COLORS.primary} /></TouchableOpacity>
    </View>
  );
}
const tp = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  btn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 14, fontFamily: 'Inter_700Bold', color: COLORS.textDark, minWidth: 44, textAlign: 'center' },
});

function ThresholdRow({ label, value, onChange, min, max, step = 5 }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <View style={styles.threshRow}>
      <Text style={styles.threshLabel}>{label}</Text>
      <View style={styles.threshControl}>
        <TouchableOpacity onPress={() => onChange(Math.max(min, value - step))} style={styles.threshBtn}>
          <Ionicons name="remove" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.threshValue}>{value} mg/dL</Text>
        <TouchableOpacity onPress={() => onChange(Math.min(max, value + step))} style={styles.threshBtn}>
          <Ionicons name="add" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SectionCard({ title, icon, iconColor, children }: { title: string; icon: string; iconColor: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
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

function AlertRow({ label, sub, enabled, onToggle, time, onTimeChange }: {
  label: string; sub?: string; enabled: boolean; onToggle: () => void; time?: string; onTimeChange?: (t: string) => void;
}) {
  return (
    <View style={[styles.alertRow, !enabled && styles.alertRowOff]}>
      <View style={styles.alertInfo}>
        <Text style={styles.alertLabel}>{label}</Text>
        {sub ? <Text style={styles.alertSub}>{sub}</Text> : null}
        {enabled && time && onTimeChange ? (
          <View style={{ marginTop: 6 }}>
            <TimePicker value={time} onChange={onTimeChange} />
          </View>
        ) : null}
      </View>
      <Switch value={enabled} onValueChange={onToggle} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor="#fff" />
    </View>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useNotifications();
  const u = <K extends keyof NotificationSettings>(k: K, v: NotificationSettings[K]) => updateSettings({ [k]: v } as any);

  return (
    <View style={[styles.root, { paddingTop: Platform.OS === 'web' ? insets.top + 67 : insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>

        {/* Sugar Alerts */}
        <SectionCard title="Sugar Alerts" icon="water" iconColor={COLORS.alertRed}>
          <AlertRow
            label="Low Sugar Alert"
            sub={`Notify when glucose is below threshold`}
            enabled={settings.lowSugarAlert}
            onToggle={() => u('lowSugarAlert', !settings.lowSugarAlert)}
          />
          <View style={styles.rowDivider} />
          <AlertRow
            label="High Sugar Alert"
            sub={`Notify when glucose exceeds threshold`}
            enabled={settings.highSugarAlert}
            onToggle={() => u('highSugarAlert', !settings.highSugarAlert)}
          />
          <View style={styles.rowDivider} />
          <ThresholdRow label="Low threshold" value={settings.lowThreshold} onChange={v => u('lowThreshold', v)} min={50} max={100} />
          <View style={styles.rowDivider} />
          <ThresholdRow label="High threshold" value={settings.highThreshold} onChange={v => u('highThreshold', v)} min={150} max={400} step={10} />
        </SectionCard>

        {/* Insulin Reminders */}
        <SectionCard title="Insulin Reminders" icon="medical" iconColor={COLORS.primary}>
          <AlertRow
            label="Morning Dose"
            sub="Remind to take morning insulin"
            enabled={settings.insulinMorning}
            onToggle={() => u('insulinMorning', !settings.insulinMorning)}
            time={settings.insulinMorningTime}
            onTimeChange={t => u('insulinMorningTime', t)}
          />
          <View style={styles.rowDivider} />
          <AlertRow
            label="Evening Dose"
            sub="Remind to take evening insulin"
            enabled={settings.insulinEvening}
            onToggle={() => u('insulinEvening', !settings.insulinEvening)}
            time={settings.insulinEveningTime}
            onTimeChange={t => u('insulinEveningTime', t)}
          />
        </SectionCard>

        {/* Lifestyle Reminders */}
        <SectionCard title="Lifestyle Reminders" icon="leaf" iconColor={COLORS.success}>
          <AlertRow
            label="Snack Reminder"
            sub="Remind to have a mid-day snack"
            enabled={settings.snackReminder}
            onToggle={() => u('snackReminder', !settings.snackReminder)}
            time={settings.snackTime}
            onTimeChange={t => u('snackTime', t)}
          />
          <View style={styles.rowDivider} />
          <AlertRow
            label="Exercise Reminder"
            sub="Remind for daily activity time"
            enabled={settings.exerciseReminder}
            onToggle={() => u('exerciseReminder', !settings.exerciseReminder)}
            time={settings.exerciseTime}
            onTimeChange={t => u('exerciseTime', t)}
          />
        </SectionCard>

        {/* Medical Reminders */}
        <SectionCard title="Medical Reminders" icon="calendar" iconColor={COLORS.accent}>
          <View style={styles.threshRow}>
            <View>
              <Text style={styles.alertLabel}>HbA1c Review</Text>
              <Text style={styles.alertSub}>Remind to schedule HbA1c test</Text>
            </View>
            <View style={styles.threshControl}>
              {[30, 60, 90].map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayPill, settings.hba1cReminderDays === d && styles.dayPillActive]}
                  onPress={() => u('hba1cReminderDays', d)}
                >
                  <Text style={[styles.dayPillText, settings.hba1cReminderDays === d && styles.dayPillTextActive]}>{d}d</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </SectionCard>

        {/* Sound & Vibration */}
        <SectionCard title="Sound & Vibration" icon="volume-high" iconColor={COLORS.purple}>
          <AlertRow label="Sound Alerts" sub="Play sound for all notifications" enabled={settings.sound} onToggle={() => u('sound', !settings.sound)} />
          <View style={styles.rowDivider} />
          <AlertRow label="Vibration" sub="Vibrate for all notifications" enabled={settings.vibration} onToggle={() => u('vibration', !settings.vibration)} />
        </SectionCard>

        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.noticeText}>Notifications require device permission to work on a real device. This app currently shows in-app alerts only.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 16 },
  sectionCard: {
    backgroundColor: COLORS.card, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sectionIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 16, gap: 12 },
  alertRowOff: { opacity: 0.6 },
  alertInfo: { flex: 1 },
  alertLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  alertSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, marginTop: 2 },
  rowDivider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 16 },
  threshRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  threshLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  threshControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  threshBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  threshValue: { fontSize: 14, fontFamily: 'Inter_700Bold', color: COLORS.textDark, minWidth: 72, textAlign: 'center' },
  dayPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  dayPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayPillText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  dayPillTextActive: { color: '#fff' },
  notice: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: COLORS.surface, borderRadius: 14, alignItems: 'flex-start' },
  noticeText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, lineHeight: 18 },
});
