import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Modal, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useChildProfile, useAuth } from '@/context/AppContext';

interface MenuItem {
  icon: string;
  label: string;
  sub?: string;
  onPress: () => void;
  danger?: boolean;
  badge?: string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, getCharacterEmoji } = useChildProfile();
  const { logout, login, currentUser } = useAuth();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const handlePinSubmit = async () => {
    if (!currentUser?.email) {
      setPinError(true);
      return;
    }

    const result = await login(currentUser.email, '', 'caretaker', pin);
    if (result.ok) {
      setShowPinModal(false);
      setPin('');
      setPinError(false);
      router.push('/caregiver/dashboard' as any);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const MENU: MenuItem[] = [
    { icon: 'bar-chart-outline',   label: 'Analytics',          sub: 'Weekly & monthly trends',    onPress: () => router.push('/analytics' as any) },
    { icon: 'pulse-outline',       label: 'AI Health Insights',  sub: 'Smart recommendations',      onPress: () => router.push('/ai-health' as any) },
    { icon: 'document-text-outline', label: 'Health Report',    sub: 'Auto-generated weekly report', onPress: () => router.push('/health-report' as any) },
    { icon: 'notifications-outline', label: 'Alerts & Notifications', sub: 'Reminder settings',    onPress: () => router.push('/notifications' as any) },
    { icon: 'settings-outline',    label: 'Settings',            sub: 'Language, font, accessibility', onPress: () => router.push('/settings' as any) },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <Text style={styles.title}>My Profile</Text>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <Text style={styles.charEmoji}>{getCharacterEmoji()}</Text>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileAge}>Age {profile.age}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Lv. {profile.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.streak}d</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {/* Caretaker view */}
        <TouchableOpacity
          style={styles.caretakerBtn}
          onPress={() => { setShowPinModal(true); setPinError(false); setPin(''); }}
        >
          <View style={styles.caretakerIconBox}>
            <Ionicons name="people" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.caretakerInfo}>
            <Text style={styles.caretakerTitle}>Switch to Caretaker View</Text>
            <Text style={styles.caretakerSub}>PIN required</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Menu items */}
        <View style={styles.menuGroup}>
          {MENU.map((item, i) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={styles.menuRow} onPress={item.onPress} activeOpacity={0.7}>
                <View style={styles.menuIconBox}>
                  <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.sub && <Text style={styles.menuSub}>{item.sub}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
              {i < MENU.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.alertRed} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* PIN Modal */}
      <Modal visible={showPinModal} transparent animationType="slide" onRequestClose={() => setShowPinModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowPinModal(false)} />
        <View style={styles.pinSheet}>
          <View style={styles.handle} />
          <Ionicons name="lock-closed" size={28} color={COLORS.primary} />
          <Text style={styles.pinTitle}>Caretaker Access</Text>
          <Text style={styles.pinSub}>Enter your 4-digit caretaker PIN</Text>
          <TextInput
            style={[styles.pinInput, pinError && styles.pinInputError]}
            value={pin}
            onChangeText={v => { setPin(v.replace(/\D/g, '').slice(0, 4)); setPinError(false); }}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            placeholder="• • • •"
            placeholderTextColor={COLORS.textMuted}
            autoFocus
            onSubmitEditing={handlePinSubmit}
          />
          {pinError && <Text style={styles.pinError}>Incorrect PIN. Try again.</Text>}
          <TouchableOpacity style={[styles.pinSubmit, pin.length < 4 && { opacity: 0.5 }]} onPress={handlePinSubmit} disabled={pin.length < 4}>
            <Text style={styles.pinSubmitText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 16 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  profileCard: {
    backgroundColor: COLORS.primary, borderRadius: 28, padding: 28, alignItems: 'center', gap: 8,
    shadowColor: COLORS.primary, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  charEmoji: { fontSize: 72 },
  profileName: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#fff' },
  profileAge: { fontSize: 16, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)' },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, padding: 16, gap: 16, marginTop: 8, width: '100%', justifyContent: 'center',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.7)' },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.3)' },
  caretakerBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 20, padding: 18, gap: 14, borderWidth: 2, borderColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  caretakerIconBox: { width: 44, height: 44, borderRadius: 13, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  caretakerInfo: { flex: 1 },
  caretakerTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  caretakerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  menuGroup: {
    backgroundColor: COLORS.card, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  menuSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, marginTop: 2 },
  menuDivider: { height: 1, backgroundColor: COLORS.divider, marginLeft: 70 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: COLORS.card, borderRadius: 20, padding: 18,
    borderWidth: 1.5, borderColor: '#FEE2E2',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  logoutText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.alertRed },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  pinSheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 48, alignItems: 'center', gap: 12,
  },
  handle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: 8 },
  pinTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  pinSub: { fontSize: 15, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  pinInput: {
    width: 180, textAlign: 'center', fontSize: 32, fontFamily: 'Inter_700Bold', color: COLORS.textDark,
    borderWidth: 2, borderColor: COLORS.border, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 24,
    backgroundColor: COLORS.background, letterSpacing: 12,
  },
  pinInputError: { borderColor: COLORS.alertRed },
  pinError: { fontSize: 14, fontFamily: 'Inter_500Medium', color: COLORS.alertRed },
  pinSubmit: {
    backgroundColor: COLORS.primary, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 48, marginTop: 8,
  },
  pinSubmitText: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' },
});
