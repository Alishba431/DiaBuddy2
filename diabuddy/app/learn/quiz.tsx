import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { learningVideos } from '@/data/mockData';

const POINTS_PER_CORRECT = 20;

export default function QuizScreen() {
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const video = learningVideos.find(v => v.id === videoId) ?? learningVideos[0];
  const questions = video.quiz ?? [];

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[current];
  const progress = (current + 1) / questions.length;

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      const totalPts = score * POINTS_PER_CORRECT + (selected === q.correct ? POINTS_PER_CORRECT : 0);
      const finalScore = score + (selected === q.correct ? 1 : 0);
      router.replace({
        pathname: '/learn/quiz-result' as any,
        params: { score: finalScore, total: questions.length, points: totalPts },
      });
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (!q) return null;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Progress */}
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Question {current + 1} of {questions.length}</Text>
          <Text style={styles.progressPts}>+{POINTS_PER_CORRECT} pts per answer</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionEmoji}>{video.emoji}</Text>
          <Text style={styles.questionText}>{q.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsGrid}>
          {q.options.map((opt, i) => {
            let style = styles.optionCard;
            let textStyle = styles.optionText;
            if (answered) {
              if (i === q.correct) { style = { ...style, ...styles.optionCorrect }; textStyle = { ...textStyle, color: '#fff' }; }
              else if (i === selected) { style = { ...style, ...styles.optionWrong }; textStyle = { ...textStyle, color: '#fff' }; }
              else { style = { ...style, opacity: 0.5 } as any; }
            } else if (selected === i) {
              style = { ...style, ...styles.optionSelected };
            }
            return (
              <TouchableOpacity key={i} style={style} onPress={() => handleAnswer(i)} disabled={answered} activeOpacity={0.75}>
                <Text style={styles.optionLetter}>{String.fromCharCode(65 + i)}</Text>
                <Text style={textStyle}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {answered && (
          <View style={[styles.feedbackCard, selected === q.correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackText}>
              {selected === q.correct ? `✅ Correct! +${POINTS_PER_CORRECT} pts` : `❌ Not quite! The answer is: ${q.options[q.correct]}`}
            </Text>
            {q.explanation && <Text style={styles.explanationText}>{q.explanation}</Text>}
          </View>
        )}

        {answered && (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {current + 1 >= questions.length ? '🏁 See Results!' : 'Next Question →'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  progressPts: { fontSize: 13, fontFamily: 'Inter_500Medium', color: COLORS.primary },
  progressTrack: { height: 12, backgroundColor: COLORS.border, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 6 },
  questionCard: {
    backgroundColor: COLORS.card, borderRadius: 24, padding: 24, alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  questionEmoji: { fontSize: 48 },
  questionText: { fontSize: 20, fontFamily: 'Inter_700Bold', color: COLORS.textDark, textAlign: 'center', lineHeight: 30 },
  optionsGrid: { gap: 12 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 18,
    padding: 18, gap: 14, borderWidth: 2, borderColor: COLORS.border,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: '#F0FDFA' },
  optionCorrect: { backgroundColor: COLORS.zoneGreen, borderColor: COLORS.zoneGreen },
  optionWrong: { backgroundColor: COLORS.alertRed, borderColor: COLORS.alertRed },
  optionLetter: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.background, textAlign: 'center', lineHeight: 32, fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark, overflow: 'hidden' },
  optionText: { flex: 1, fontSize: 17, fontFamily: 'Inter_500Medium', color: COLORS.textDark },
  feedbackCard: { borderRadius: 20, padding: 18, gap: 8 },
  feedbackCorrect: { backgroundColor: '#DCFCE7' },
  feedbackWrong: { backgroundColor: '#FEE2E2' },
  feedbackText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  explanationText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, lineHeight: 22 },
  nextBtn: { backgroundColor: COLORS.primary, borderRadius: 24, paddingVertical: 20, alignItems: 'center' },
  nextBtnText: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#fff' },
});
