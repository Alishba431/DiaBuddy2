import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';

type Mood = 'happy' | 'neutral' | 'worried' | 'urgent';

interface Props {
  emoji: string;
  mood?: Mood;
  size?: number;
  showBubble?: boolean;
  bubbleText?: string;
}

export function CharacterMascot({ emoji, mood = 'happy', size = 72, showBubble, bubbleText }: Props) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (mood === 'happy' || mood === 'neutral') {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 600 }),
          withTiming(0, { duration: 600 }),
        ),
        -1,
        false,
      );
    } else if (mood === 'worried') {
      scale.value = withRepeat(
        withSequence(
          withSpring(0.9, { damping: 5 }),
          withSpring(1, { damping: 5 }),
        ),
        -1,
        true,
      );
    } else if (mood === 'urgent') {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-15, { duration: 200 }),
          withTiming(0, { duration: 200 }),
        ),
        -1,
        false,
      );
      rotation.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 100 }),
          withTiming(5, { duration: 100 }),
          withTiming(0, { duration: 100 }),
        ),
        -1,
        false,
      );
    }
  }, [mood]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={animStyle}>
        <Text style={[styles.emoji, { fontSize: size }]}>{emoji}</Text>
      </Animated.View>
      {showBubble && bubbleText && (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{bubbleText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 72,
    textAlign: 'center',
  },
  bubble: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    maxWidth: 220,
  },
  bubbleText: {
    fontSize: 15,
    color: COLORS.textDark,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
});
