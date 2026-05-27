import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useChildProfile } from '@/context/AppContext';
import { characters } from '@/data/mockData';

const LANGS = [
  { id: 'english', label: 'English' },
  { id: 'urdu', label: 'اردو' },
  { id: 'roman_urdu', label: 'Roman Urdu' },
];

export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { profile, setProfile } = useChildProfile();
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [language, setLanguage] = useState<'english' | 'urdu' | 'roman_urdu'>(profile.language);
  const char = characters.find(c => c.id === profile.character);

  const handleNext = () => {
    setProfile({ ...profile, name, age, language });
    router.push('/(onboarding)/parent-setup' as any);
  };

  return (
    <ScrollView contentContainerStyle={[
      styles.container,
      { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20), paddingBottom: insets.bottom + 24 },
    ]}>
      <Text style={styles.heading}>Tell us about you! 👋</Text>

      <View style={styles.avatarCard}>
        <Text style={styles.avatarEmoji}>{char?.emoji ?? '🦁'}</Text>
        <Text style={styles.avatarName}>{char?.name ?? 'Buddy'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>What's your name?</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={COLORS.textMuted}
          fontSize={20}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>How old are you?</Text>
        <View style={styles.ageRow}>
          <TouchableOpacity style={styles.ageBtn} onPress={() => setAge(a => Math.max(4, a - 1))}>
            <Text style={styles.ageBtnText}>−</Text>
          </TouchableOpacity>
          <View style={styles.ageDisplay}>
            <Text style={styles.ageValue}>{age}</Text>
            <Text style={styles.ageUnit}>years old</Text>
          </View>
          <TouchableOpacity style={styles.ageBtn} onPress={() => setAge(a => Math.min(18, a + 1))}>
            <Text style={styles.ageBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Choose your language</Text>
        <View style={styles.langRow}>
          {LANGS.map(l => (
            <TouchableOpacity
              key={l.id}
              style={[styles.langPill, language === l.id && styles.langPillActive]}
              onPress={() => setLanguage(l.id as any)}
            >
              <Text style={[styles.langText, language === l.id && styles.langTextActive]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={[styles.nextBtn, !name.trim() && styles.nextBtnDisabled]} onPress={handleNext} disabled={!name.trim()}>
        <Text style={styles.nextText}>Next →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, padding: 24, gap: 20 },
  heading: { fontSize: 28, fontFamily: 'Inter_700Bold', color: COLORS.textDark, textAlign: 'center' },
  avatarCard: {
    alignSelf: 'center', backgroundColor: COLORS.card, borderRadius: 24, padding: 24,
    alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  avatarEmoji: { fontSize: 64, marginBottom: 8 },
  avatarName: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.primary },
  section: { gap: 10 },
  label: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  input: {
    backgroundColor: COLORS.card, borderRadius: 18, paddingHorizontal: 20, paddingVertical: 16,
    fontSize: 20, fontFamily: 'Inter_500Medium', color: COLORS.textDark,
    borderWidth: 2, borderColor: COLORS.border,
  },
  ageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  ageBtn: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  ageBtnText: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#fff' },
  ageDisplay: { alignItems: 'center', minWidth: 100 },
  ageValue: { fontSize: 48, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  ageUnit: { fontSize: 16, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  langPill: {
    paddingHorizontal: 18, paddingVertical: 12, borderRadius: 24,
    backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.border,
  },
  langPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langText: { fontSize: 16, fontFamily: 'Inter_500Medium', color: COLORS.textMuted },
  langTextActive: { color: '#fff' },
  nextBtn: { backgroundColor: COLORS.primary, borderRadius: 24, paddingVertical: 20, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.5 },
  nextText: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff' },
});
