import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';

interface Props {
  points: number;
  visible: boolean;
  onHide: () => void;
}

export function PointsToast({ points, visible, onHide }: Props) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 1200 }),
        withTiming(0, { duration: 400 }, (finished) => {
          if (finished) runOnJS(onHide)();
        }),
      );
      translateY.value = withSequence(
        withTiming(0, { duration: 200 }),
        withTiming(-40, { duration: 1400 }),
      );
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, animStyle]}>
      <Text style={styles.text}>+{points} pts! ⭐</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    backgroundColor: COLORS.yellow,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 999,
  },
  text: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: COLORS.textDark,
  },
});
