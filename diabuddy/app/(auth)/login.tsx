import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/context/AppContext';

type Role = 'child' | 'caretaker';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [role, setRole] = useState<Role>('child');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) { setError('Please enter your username'); return; }
    if (role === 'child' && !password) { setError('Please enter your password'); return; }
    if (role === 'caretaker' && pin.length < 4) { setError('Please enter your 4-digit PIN'); return; }
    setLoading(true);
    setError('');
    const ok = await login(username.trim(), password, role, pin);
    setLoading(false);
    if (!ok) { setError(role === 'child' ? 'Incorrect username or password' : 'Incorrect username or PIN'); return; }
    router.replace(role === 'caretaker' ? '/caregiver/dashboard' : '/' as any);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 24 : 48), paddingBottom: insets.bottom + 40 }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo */}
      <View style={styles.logoArea}>
        <View style={styles.logoCircle}>
          <Ionicons name="heart" size={36} color={COLORS.card} />
        </View>
        <Text style={styles.appName}>DiaBuddy</Text>
        <Text style={styles.tagline}>Your Diabetes Companion</Text>
      </View>

      {/* Role selector */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Sign in as</Text>
        <View style={styles.roleRow}>
          {(['child', 'caretaker'] as Role[]).map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.roleBtn, role === r && styles.roleBtnActive]}
              onPress={() => { setRole(r); setError(''); setPassword(''); setPin(''); }}
            >
              <Ionicons name={r === 'child' ? 'person' : 'people'} size={20} color={role === r ? COLORS.card : COLORS.textMuted} />
              <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                {r === 'child' ? 'Child' : 'Caretaker'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.iIcon} />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={t => { setUsername(t); setError(''); }}
              placeholder="Enter username"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {role === 'child' ? (
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.iIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={t => { setPassword(t); setError(''); }}
                placeholder="Password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.field}>
            <Text style={styles.label}>Caretaker PIN</Text>
            <View style={styles.inputRow}>
              <Ionicons name="keypad-outline" size={18} color={COLORS.textMuted} style={styles.iIcon} />
              <TextInput
                style={styles.input}
                value={pin}
                onChangeText={t => { setPin(t.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                placeholder="4-digit PIN"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
              />
            </View>
          </View>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.textDark} /> : <Text style={styles.loginBtnText}>Sign In</Text>}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.signupBtn} onPress={() => router.push('/(auth)/signup' as any)}>
          <Text style={styles.signupBtnText}>Create a New Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, padding: 24, gap: 24 },
  logoArea: { alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  appName: { fontSize: 32, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  tagline: { fontSize: 15, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  card: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 20, gap: 14,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border,
  },
  roleBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  roleBtnTextActive: { color: COLORS.card },
  form: { gap: 16 },
  field: { gap: 8 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 4,
  },
  iIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, fontFamily: 'Inter_400Regular', color: COLORS.textDark, paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: COLORS.alertRed, textAlign: 'center' },
  loginBtn: {
    backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    shadowColor: COLORS.accent, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  loginBtnText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  signupBtn: { borderWidth: 2, borderColor: COLORS.primary, borderRadius: 16, paddingVertical: 17, alignItems: 'center' },
  signupBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.primary },
});
