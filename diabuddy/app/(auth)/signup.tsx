import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/context/AppContext';
import { characters } from '@/data/mockData';

const AGES = Array.from({ length: 13 }, (_, i) => i + 4);
type Step = 1 | 2 | 3;

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();
  const [step, setStep] = useState<Step>(1);

  const [childName, setChildName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(9);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedChar, setSelectedChar] = useState('gluco_lion');
  const [showPass, setShowPass] = useState(false);

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate1 = () => {
    if (!childName.trim()) { setError("Enter the child's full name"); return false; }
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setError('Enter a valid email address'); return false; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return false; }
    return true;
  };

  const validate2 = () => {
    if (pin.length < 4) { setError('PIN must be 4 digits'); return false; }
    if (pin !== confirmPin) { setError('PINs do not match'); return false; }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validate1()) setStep(2);
    else if (step === 2 && validate2()) setStep(3);
  };

  const handleCreate = async () => {
    setError('');
    setLoading(true);
    const result = await signup(childName.trim(), email.trim().toLowerCase(), password, age, selectedChar, pin);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Unable to create account. Please try again.');
      return;
    }
    router.replace('/' as any);
  };

  const stepLabels = ['Child Info', 'Caretaker PIN', 'Choose Buddy'];

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 24 : 36), paddingBottom: insets.bottom + 40 }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        {step > 1 ? (
          <TouchableOpacity onPress={() => { setStep(s => (s - 1) as Step); setError(''); }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSub}>Step {step} of 3 — {stepLabels[step - 1]}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
      </View>

      {/* Step 1: Child Info */}
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Child's Information</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={17} color={COLORS.textMuted} style={styles.iIcon} />
              <TextInput style={styles.input} value={childName} onChangeText={t => { setChildName(t); setError(''); }} placeholder="e.g. Ali Khan" placeholderTextColor={COLORS.textMuted} />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="at-outline" size={17} color={COLORS.textMuted} style={styles.iIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={t => { setEmail(t.trim().toLowerCase()); setError(''); }}
                placeholder="Email address"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Age</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ageRow}>
              {AGES.map(a => (
                <TouchableOpacity key={a} style={[styles.agePill, age === a && styles.agePillActive]} onPress={() => setAge(a)}>
                  <Text style={[styles.agePillText, age === a && styles.agePillTextActive]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={17} color={COLORS.textMuted} style={styles.iIcon} />
              <TextInput style={[styles.input, { flex: 1 }]} value={password} onChangeText={t => { setPassword(t); setError(''); }} placeholder="Min. 6 characters" placeholderTextColor={COLORS.textMuted} secureTextEntry={!showPass} />
              <TouchableOpacity onPress={() => setShowPass(s => !s)} style={{ padding: 4 }}>
                <Ionicons name={showPass ? 'eye' : 'eye-off'} size={17} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={17} color={COLORS.textMuted} style={styles.iIcon} />
              <TextInput style={styles.input} value={confirmPassword} onChangeText={t => { setConfirmPassword(t); setError(''); }} placeholder="Repeat password" placeholderTextColor={COLORS.textMuted} secureTextEntry />
            </View>
          </View>
        </View>
      )}

      {/* Step 2: Caretaker PIN */}
      {step === 2 && (
        <View style={styles.card}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              A caretaker account for <Text style={{ fontFamily: 'Inter_700Bold' }}>{childName}</Text> will be created. Set a 4-digit PIN to access the parent dashboard.
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Set Caretaker PIN</Text>
            <View style={styles.inputRow}>
              <Ionicons name="keypad-outline" size={17} color={COLORS.textMuted} style={styles.iIcon} />
              <TextInput style={styles.input} value={pin} onChangeText={t => { setPin(t.replace(/\D/g, '').slice(0, 4)); setError(''); }} placeholder="4-digit PIN" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" secureTextEntry maxLength={4} />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm PIN</Text>
            <View style={styles.inputRow}>
              <Ionicons name="keypad-outline" size={17} color={COLORS.textMuted} style={styles.iIcon} />
              <TextInput style={styles.input} value={confirmPin} onChangeText={t => { setConfirmPin(t.replace(/\D/g, '').slice(0, 4)); setError(''); }} placeholder="Repeat PIN" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" secureTextEntry maxLength={4} />
            </View>
          </View>

          <View style={styles.hintBox}>
            <Text style={styles.hintText}>Keep this PIN safe — caretakers use it to view logs, trends, and health reports.</Text>
          </View>
        </View>
      )}

      {/* Step 3: Character */}
      {step === 3 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Choose a Buddy for {childName}</Text>
          <Text style={styles.cardSub}>Your buddy will keep you motivated every day</Text>
          <View style={styles.charGrid}>
            {characters.map(c => (
              <TouchableOpacity key={c.id} style={[styles.charCard, selectedChar === c.id && styles.charCardActive]} onPress={() => setSelectedChar(c.id)}>
                <Text style={styles.charEmoji}>{c.emoji}</Text>
                <Text style={[styles.charName, selectedChar === c.id && { color: COLORS.primary }]}>{c.name}</Text>
                <Text style={styles.charTagline}>{c.tagline}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.nextBtn} onPress={step < 3 ? handleNext : handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color={COLORS.textDark} /> : (
          <Text style={styles.nextBtnText}>{step === 3 ? 'Create Account' : 'Continue'}</Text>
        )}
      </TouchableOpacity>

      {step === 1 && (
        <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
          <Text style={styles.loginLinkText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, padding: 20, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  progressTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 20, gap: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  cardSub: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, marginTop: -8 },
  field: { gap: 8 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 2,
  },
  iIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: COLORS.textDark, paddingVertical: 13 },
  ageRow: { gap: 8, paddingVertical: 4 },
  agePill: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border },
  agePillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  agePillText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  agePillTextActive: { color: COLORS.card },
  infoBox: { flexDirection: 'row', gap: 10, backgroundColor: COLORS.blue, borderRadius: 14, padding: 14, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textDark, lineHeight: 20 },
  hintBox: { backgroundColor: COLORS.yellow, borderRadius: 12, padding: 12 },
  hintText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textDark, lineHeight: 18 },
  charGrid: { flexDirection: 'row', gap: 10 },
  charCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6, borderWidth: 2, borderColor: COLORS.border },
  charCardActive: { borderColor: COLORS.primary, backgroundColor: '#EEF2FF' },
  charEmoji: { fontSize: 40 },
  charName: { fontSize: 14, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  charTagline: { fontSize: 11, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, textAlign: 'center' },
  errorText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: COLORS.alertRed, textAlign: 'center' },
  nextBtn: {
    backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    shadowColor: COLORS.accent, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  nextBtnText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  loginLink: { alignItems: 'center', paddingVertical: 4 },
  loginLinkText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: COLORS.primary },
});
