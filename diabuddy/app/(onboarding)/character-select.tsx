import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useChildProfile } from '@/context/AppContext';
import { characters } from '@/data/mockData';

function CharacterCard({ char, isSelected, onSelect }: { char: typeof characters[number]; isSelected: boolean; onSelect: () => void }) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(1.08, { damping: 6 }, () => {
      scale.value = withSpring(1);
    });
    onSelect();
  };

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Text style={styles.charEmoji}>{char.emoji}</Text>
        <Text style={styles.charName}>{char.name}</Text>
        <Text style={styles.tagline}>{char.tagline}</Text>
        {isSelected && <View style={styles.checkBadge}><Text style={styles.check}>✓</Text></View>}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CharacterSelectScreen() {
  const insets = useSafeAreaInsets();
  const { profile, setProfile } = useChildProfile();
  const [selected, setSelected] = useState<string>(profile.character);

  const handleNext = () => {
    setProfile({ ...profile, character: selected as any });
    router.push('/(onboarding)/profile-setup' as any);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20), paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Text style={styles.heading}>Choose your buddy! 🌟</Text>
      <Text style={styles.sub}>Your buddy will cheer you on every day</Text>

      {characters.map(c => (
        <CharacterCard
          key={c.id}
          char={c}
          isSelected={selected === c.id}
          onSelect={() => setSelected(c.id)}
        />
      ))}

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextText}>Next →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, padding: 24, alignItems: 'center', gap: 16 },
  heading: { fontSize: 28, fontFamily: 'Inter_700Bold', color: COLORS.textDark, textAlign: 'center' },
  sub: { fontSize: 16, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, textAlign: 'center', marginBottom: 8 },
  card: {
    width: '100%', backgroundColor: COLORS.card, borderRadius: 24, padding: 24,
    alignItems: 'center', borderWidth: 3, borderColor: COLORS.border,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardSelected: { borderColor: COLORS.primary, backgroundColor: '#F0FDFA' },
  charEmoji: { fontSize: 72, marginBottom: 12 },
  charName: { fontSize: 24, fontFamily: 'Inter_700Bold', color: COLORS.textDark, marginBottom: 6 },
  tagline: { fontSize: 16, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, textAlign: 'center' },
  checkBadge: {
    position: 'absolute', top: 16, right: 16,
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  check: { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold' },
  nextBtn: {
    width: '100%', backgroundColor: COLORS.primary, borderRadius: 24,
    paddingVertical: 20, alignItems: 'center', marginTop: 8,
  },
  nextText: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#fff' },
});
