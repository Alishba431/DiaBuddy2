import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Switch, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useChildProfile } from '@/context/AppContext';

const LANGS = [
  { id: 'english',    label: 'English',    flag: '🇬🇧' },
  { id: 'urdu',       label: 'اردو',       flag: '🇵🇰' },
  { id: 'roman_urdu', label: 'Roman Urdu', flag: '🌍'  },
];
const FONT_SIZES   = ['Small', 'Medium', 'Large'];
const GLUCOSE_UNITS = ['mg/dL', 'mmol/L'];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, setProfile } = useChildProfile();
  const [sounds,     setSounds]     = useState(true);
  const [vibration,  setVibration]  = useState(true);
  const [voice,      setVoice]      = useState(false);
  const [colorblind, setColorblind] = useState(false);
  const [fontSize,   setFontSize]   = useState('Medium');
  const [unit,       setUnit]       = useState('mg/dL');

  return (
    <View style={[styles.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>

        {/* Alerts shortcut */}
        <TouchableOpacity style={styles.alertsLink} onPress={() => router.push('/notifications' as any)}>
          <View style={[styles.alertsIcon, { backgroundColor: COLORS.alertRed + '20' }]}>
            <Ionicons name="notifications" size={20} color={COLORS.alertRed} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertsTitle}>Alerts & Notifications</Text>
            <Text style={styles.alertsSub}>Configure sugar alerts, insulin reminders, HbA1c</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.optionGroup}>
            {LANGS.map((l, i) => (
              <React.Fragment key={l.id}>
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setProfile({ ...profile, language: l.id as any })}
                >
                  <Text style={styles.optionFlag}>{l.flag}</Text>
                  <Text style={[styles.optionText, profile.language === l.id && styles.optionTextActive]}>{l.label}</Text>
                  {profile.language === l.id && (
                    <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
                {i < LANGS.length - 1 && <View style={styles.optDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Font size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Font Size</Text>
          <View style={styles.pillRow}>
            {FONT_SIZES.map(f => (
              <TouchableOpacity key={f} style={[styles.pill, fontSize === f && styles.pillActive]} onPress={() => setFontSize(f)}>
                <Text style={[styles.pillText, fontSize === f && styles.pillTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Glucose units */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Glucose Units</Text>
          <View style={styles.pillRow}>
            {GLUCOSE_UNITS.map(u => (
              <TouchableOpacity key={u} style={[styles.pill, unit === u && styles.pillActive]} onPress={() => setUnit(u)}>
                <Text style={[styles.pillText, unit === u && styles.pillTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Accessibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          <View style={styles.toggleGroup}>
            {[
              { label: 'Sound Effects',    sub: 'Play audio feedback',      value: sounds,     setter: setSounds },
              { label: 'Vibration',        sub: 'Tactile feedback',          value: vibration,  setter: setVibration },
              { label: 'Voice Assistance', sub: 'Read content aloud',        value: voice,      setter: setVoice },
              { label: 'Colorblind Mode',  sub: 'Adjust glucose zone colors', value: colorblind, setter: setColorblind },
            ].map((t, i, arr) => (
              <React.Fragment key={i}>
                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleLabel}>{t.label}</Text>
                    <Text style={styles.toggleSub}>{t.sub}</Text>
                  </View>
                  <Switch value={t.value} onValueChange={t.setter} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor="#fff" />
                </View>
                {i < arr.length - 1 && <View style={styles.optDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About DiaBuddy</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>Version 1.0.0</Text>
            <Text style={styles.aboutText}>For children aged 6–14 with Type 1 Diabetes</Text>
            <Text style={styles.aboutText}>Educational use only — not a medical device</Text>
            <View style={styles.aboutLinks}>
              <TouchableOpacity><Text style={styles.aboutLinkText}>Privacy Policy</Text></TouchableOpacity>
              <Text style={styles.aboutDot}>·</Text>
              <TouchableOpacity><Text style={styles.aboutLinkText}>Terms of Use</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 20 },
  alertsLink: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.card,
    borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: COLORS.alertRed + '40',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  alertsIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  alertsTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  alertsSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, marginTop: 2 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  optionGroup: {
    backgroundColor: COLORS.card, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  optDivider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 16 },
  optionFlag: { fontSize: 22 },
  optionText: { flex: 1, fontSize: 16, fontFamily: 'Inter_500Medium', color: COLORS.textMuted },
  optionTextActive: { color: COLORS.primary, fontFamily: 'Inter_700Bold' },
  pillRow: { flexDirection: 'row', gap: 10 },
  pill: { flex: 1, paddingVertical: 13, borderRadius: 16, backgroundColor: COLORS.card, alignItems: 'center', borderWidth: 2, borderColor: COLORS.border },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  pillTextActive: { color: '#fff' },
  toggleGroup: {
    backgroundColor: COLORS.card, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 12 },
  toggleLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  toggleSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, marginTop: 2 },
  aboutCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 20, gap: 8,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  aboutText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  aboutLinks: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  aboutDot: { color: COLORS.textMuted },
  aboutLinkText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: COLORS.primary, textDecorationLine: 'underline' },
});
