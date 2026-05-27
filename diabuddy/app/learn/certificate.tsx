import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useChildProfile } from '@/context/AppContext';

export default function CertificateScreen() {
  const insets = useSafeAreaInsets();
  const { profile, getCharacterEmoji } = useChildProfile();
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }]}>
      {/* Certificate */}
      <LinearGradient
        colors={['#F0FDFA', '#CCFBF1', '#99F6E4']}
        style={styles.certFrame}
      >
        {/* Decorative corners */}
        {['TL', 'TR', 'BL', 'BR'].map(c => (
          <View key={c} style={[styles.corner, {
            top: c.startsWith('T') ? 12 : undefined,
            bottom: c.startsWith('B') ? 12 : undefined,
            left: c.endsWith('L') ? 12 : undefined,
            right: c.endsWith('R') ? 12 : undefined,
            transform: [{ rotate: c === 'TR' ? '90deg' : c === 'BR' ? '180deg' : c === 'BL' ? '270deg' : '0deg' }],
          }]}>
            <Text style={styles.cornerSymbol}>✦</Text>
          </View>
        ))}

        <Text style={styles.certStars}>✦ ✦ ✦</Text>
        <Text style={styles.certTitle}>Certificate of Achievement</Text>
        <Text style={styles.certSubtitle}>This is to certify that</Text>

        <View style={styles.nameBox}>
          <Text style={styles.certEmoji}>{getCharacterEmoji()}</Text>
          <Text style={styles.certName}>{profile.name}</Text>
        </View>

        <Text style={styles.certDesc}>
          has demonstrated outstanding dedication to managing Type 1 Diabetes, showing courage, consistency, and a wonderful learning spirit.
        </Text>

        <View style={styles.badgeRow}>
          {['💉', '🩸', '🏃', '🍎', '📚'].map((e, i) => (
            <Text key={i} style={styles.badgeEmoji}>{e}</Text>
          ))}
        </View>

        <Text style={styles.achievement}>🏅 Diabetes Star — Level {profile.level}</Text>
        <Text style={styles.points}>{profile.streak} Day Streak · {profile.points} Points Earned</Text>

        <View style={styles.divider} />
        <Text style={styles.date}>{today}</Text>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <Text style={styles.sigLine}>DiaBuddy Team</Text>
            <Text style={styles.sigTitle}>Health Partner</Text>
          </View>
          <View style={styles.seal}>
            <Text style={styles.sealEmoji}>🌟</Text>
            <Text style={styles.sealText}>Official</Text>
          </View>
        </View>
      </LinearGradient>

      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeBtnText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background, padding: 20, gap: 16, alignItems: 'center' },
  certFrame: {
    width: '100%', flex: 1, borderRadius: 24, padding: 24,
    alignItems: 'center', gap: 12, justifyContent: 'center',
    borderWidth: 3, borderColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  corner: { position: 'absolute', width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  cornerSymbol: { fontSize: 20, color: COLORS.primary },
  certStars: { fontSize: 18, color: COLORS.primary, letterSpacing: 8 },
  certTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: COLORS.primary, letterSpacing: 1 },
  certSubtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  nameBox: { alignItems: 'center', gap: 6 },
  certEmoji: { fontSize: 48 },
  certName: { fontSize: 28, fontFamily: 'Inter_700Bold', color: COLORS.textDark, letterSpacing: 1 },
  certDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textDark, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  badgeRow: { flexDirection: 'row', gap: 10 },
  badgeEmoji: { fontSize: 22 },
  achievement: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.primary },
  points: { fontSize: 14, fontFamily: 'Inter_500Medium', color: COLORS.textMuted },
  divider: { width: '80%', height: 1, backgroundColor: COLORS.border },
  date: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  signatureRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 8 },
  signatureBox: { alignItems: 'flex-start' },
  sigLine: { fontSize: 15, fontFamily: 'Inter_700Bold', color: COLORS.textDark, borderBottomWidth: 1, borderBottomColor: COLORS.textDark, paddingBottom: 2 },
  sigTitle: { fontSize: 11, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  seal: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', gap: 2,
  },
  sealEmoji: { fontSize: 22 },
  sealText: { fontSize: 9, fontFamily: 'Inter_700Bold', color: '#fff' },
  closeBtn: { width: '100%', backgroundColor: COLORS.primary, borderRadius: 20, paddingVertical: 16, alignItems: 'center' },
  closeBtnText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#fff' },
});
