import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';

interface Props {
  value: number;
  showValue?: boolean;
}

export function GlucoseZoneBadge({ value, showValue = true }: Props) {
  const getZoneInfo = () => {
    if (value < 70) return { label: 'Too Low', color: COLORS.alertRed, bg: '#FEE2E2', dot: '🔴' };
    if (value <= 180) return { label: 'In Range', color: COLORS.zoneGreen, bg: '#DCFCE7', dot: '🟢' };
    if (value <= 250) return { label: 'A Bit High', color: COLORS.zoneYellow, bg: '#FEF9C3', dot: '🟡' };
    return { label: 'Too High', color: COLORS.alertRed, bg: '#FEE2E2', dot: '🔴' };
  };

  const zone = getZoneInfo();

  return (
    <View style={[styles.badge, { backgroundColor: zone.bg }]}>
      <Text style={styles.dot}>{zone.dot}</Text>
      {showValue && <Text style={[styles.value, { color: zone.color }]}>{value}</Text>}
      <Text style={[styles.label, { color: zone.color }]}>{zone.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  dot: { fontSize: 14 },
  value: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
