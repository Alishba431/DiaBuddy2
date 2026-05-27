import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { PointsToast } from '@/components/PointsToast';
import { mealHistory, everydayFoods, sometimesFoods } from '@/data/mockData';

const FOOD_TABS = ['Everyday', 'Sometimes'];
const FOODS: Record<string, { emoji: string; name: string; note: string; carbs?: number }[]> = {
  Everyday: [
    { emoji: '🥦', name: 'Vegetables',   note: 'Great for sugar control', carbs: 8  },
    { emoji: '🍗', name: 'Chicken',       note: 'Good protein source',     carbs: 0  },
    { emoji: '🥚', name: 'Eggs',          note: 'Balanced nutrition',       carbs: 1  },
    { emoji: '🥛', name: 'Milk',          note: 'Low-fat is best',          carbs: 12 },
    { emoji: '🍎', name: 'Whole Fruits',  note: 'Count the carbs!',         carbs: 20 },
    { emoji: '🫘', name: 'Lentils',       note: 'Slow carbs are good',      carbs: 20 },
  ],
  Sometimes: [
    { emoji: '🍞', name: 'Brown Bread',   note: 'Wholegrain best',          carbs: 28 },
    { emoji: '🍚', name: 'Rice',          note: 'Control portion size',     carbs: 45 },
    { emoji: '🍌', name: 'Banana',        note: 'Higher sugar fruit',       carbs: 27 },
    { emoji: '🧀', name: 'Cheese',        note: 'Small amounts',            carbs: 1  },
    { emoji: '🍕', name: 'Pizza',         note: 'Check glucose after!',     carbs: 36 },
    { emoji: '🍫', name: 'Chocolate',     note: 'Very small amounts',       carbs: 60 },
  ],
};

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { id: 'lunch',     label: 'Lunch',     emoji: '☀️' },
  { id: 'dinner',    label: 'Dinner',    emoji: '🌙' },
  { id: 'snack',     label: 'Snack',     emoji: '🍎' },
];

interface MealLog {
  type: string;
  foods: string[];
  preGlucose: string;
  postGlucose: string;
  time: string;
  logged: boolean;
}

export default function EatSmartScreen() {
  const [activeTab, setActiveTab] = useState('Everyday');
  const [activeMeal, setActiveMeal] = useState('breakfast');
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [preGlucose, setPreGlucose] = useState('');
  const [postGlucose, setPostGlucose] = useState('');
  const [toast, setToast] = useState(false);
  const [loggedMeals, setLoggedMeals] = useState<MealLog[]>([]);

  const toggleFood = (name: string) => {
    setSelectedFoods(prev =>
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );
  };

  const handleLogMeal = () => {
    if (selectedFoods.length === 0) return;
    const meal: MealLog = {
      type: MEAL_TYPES.find(m => m.id === activeMeal)?.label || activeMeal,
      foods: selectedFoods,
      preGlucose,
      postGlucose,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      logged: true,
    };
    setLoggedMeals(prev => [meal, ...prev]);
    setSelectedFoods([]);
    setPreGlucose('');
    setPostGlucose('');
    setToast(true);
  };

  const currentMeal = MEAL_TYPES.find(m => m.id === activeMeal);

  return (
    <View style={styles.root}>
      <PointsToast points={10} visible={toast} onHide={() => setToast(false)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Balanced plate tip */}
        <View style={styles.plateCard}>
          <Text style={styles.plateEmoji}>🍽️</Text>
          <View style={styles.plateInfo}>
            <Text style={styles.plateTitle}>The Balanced Plate</Text>
            <Text style={styles.plateSub}>Half veggies · Quarter protein · Quarter carbs</Text>
          </View>
        </View>

        {/* Food Guide */}
        <Text style={styles.sectionTitle}>Food Guide</Text>
        <View style={styles.tabRow}>
          {FOOD_TABS.map(t => (
            <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.tabActive]} onPress={() => setActiveTab(t)}>
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.foodGrid}>
          {FOODS[activeTab].map((f, i) => (
            <View key={i} style={styles.foodCard}>
              <Text style={styles.foodEmoji}>{f.emoji}</Text>
              <Text style={styles.foodName}>{f.name}</Text>
              <Text style={styles.foodNote}>{f.note}</Text>
              {f.carbs !== undefined && (
                <View style={styles.carbBadge}>
                  <Text style={styles.carbText}>{f.carbs}g carbs</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Log a Meal */}
        <Text style={styles.sectionTitle}>Log a Meal</Text>
        <View style={styles.logCard}>
          {/* Meal type selector */}
          <Text style={styles.logSubTitle}>Meal Type</Text>
          <View style={styles.mealTypeRow}>
            {MEAL_TYPES.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[styles.mealTypeBtn, activeMeal === m.id && styles.mealTypeBtnActive]}
                onPress={() => setActiveMeal(m.id)}
              >
                <Text style={styles.mealTypeEmoji}>{m.emoji}</Text>
                <Text style={[styles.mealTypeText, activeMeal === m.id && styles.mealTypeTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Food selection */}
          <Text style={styles.logSubTitle}>Select Foods</Text>
          <View style={styles.foodSelectGrid}>
            {[...FOODS['Everyday'], ...FOODS['Sometimes']].slice(0, 8).map((f, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.foodSelectItem, selectedFoods.includes(f.name) && styles.foodSelectItemActive]}
                onPress={() => toggleFood(f.name)}
              >
                <Text style={styles.foodSelectEmoji}>{f.emoji}</Text>
                <Text style={[styles.foodSelectName, selectedFoods.includes(f.name) && { color: COLORS.primary }]}>{f.name}</Text>
                {selectedFoods.includes(f.name) && (
                  <View style={styles.foodCheckDot}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Glucose fields */}
          <Text style={styles.logSubTitle}>Glucose Readings (optional)</Text>
          <View style={styles.glucoseInputRow}>
            <View style={styles.glucoseField}>
              <Text style={styles.glucoseFieldLabel}>Before meal</Text>
              <View style={styles.glucoseInput}>
                <TextInput
                  style={styles.glucoseInputText}
                  value={preGlucose}
                  onChangeText={setPreGlucose}
                  placeholder="e.g. 95"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={styles.glucoseUnit}>mg/dL</Text>
              </View>
            </View>
            <View style={styles.glucoseArrow}>
              <Ionicons name="arrow-forward" size={18} color={COLORS.textMuted} />
            </View>
            <View style={styles.glucoseField}>
              <Text style={styles.glucoseFieldLabel}>After meal</Text>
              <View style={styles.glucoseInput}>
                <TextInput
                  style={styles.glucoseInputText}
                  value={postGlucose}
                  onChangeText={setPostGlucose}
                  placeholder="e.g. 145"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={styles.glucoseUnit}>mg/dL</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.logBtn, selectedFoods.length === 0 && { opacity: 0.5 }]}
            onPress={handleLogMeal}
            disabled={selectedFoods.length === 0}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.textDark} />
            <Text style={styles.logBtnText}>Log {currentMeal?.label}</Text>
          </TouchableOpacity>
        </View>

        {/* Today's logged meals */}
        {(loggedMeals.length > 0 || mealHistory.length > 0) && (
          <>
            <Text style={styles.sectionTitle}>Today's Log</Text>
            <View style={styles.historyCard}>
              {loggedMeals.map((m, i) => (
                <React.Fragment key={`new-${i}`}>
                  <View style={styles.histRow}>
                    <View style={styles.histIconBox}>
                      <Text style={{ fontSize: 22 }}>{MEAL_TYPES.find(mt => mt.label === m.type)?.emoji ?? '🍽️'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.histType}>{m.type} · {m.time}</Text>
                      <Text style={styles.histFoods}>{m.foods.join(', ')}</Text>
                    </View>
                    {m.preGlucose && m.postGlucose ? (
                      <View style={styles.histGluc}>
                        <Text style={styles.histGlucPre}>{m.preGlucose}</Text>
                        <Ionicons name="arrow-forward" size={10} color={COLORS.textMuted} />
                        <Text style={[styles.histGlucPost, { color: parseInt(m.postGlucose) > 200 ? COLORS.alertOrange : COLORS.success }]}>{m.postGlucose}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.histDivider} />
                </React.Fragment>
              ))}
              {mealHistory[0].meals.map((m: any, i: number) => (
                <React.Fragment key={`hist-${i}`}>
                  <View style={styles.histRow}>
                    <View style={styles.histIconBox}>
                      <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.histType}>{m.type} · {m.time}</Text>
                      <Text style={styles.histFoods}>{m.foods.join(', ')}</Text>
                    </View>
                    {m.postGlucose ? (
                      <View style={styles.histGluc}>
                        <Text style={styles.histGlucPre}>{m.preGlucose}</Text>
                        <Ionicons name="arrow-forward" size={10} color={COLORS.textMuted} />
                        <Text style={[styles.histGlucPost, { color: m.postGlucose > 200 ? COLORS.alertOrange : COLORS.success }]}>{m.postGlucose}</Text>
                      </View>
                    ) : null}
                  </View>
                  {i < mealHistory[0].meals.length - 1 && <View style={styles.histDivider} />}
                </React.Fragment>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  plateCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.mint,
    borderRadius: 20, padding: 18, gap: 14, borderWidth: 1.5, borderColor: COLORS.success + '50',
  },
  plateEmoji: { fontSize: 40 },
  plateInfo: { flex: 1 },
  plateTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  plateSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 14, gap: 4, padding: 4, borderWidth: 1.5, borderColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  tabTextActive: { color: '#fff' },
  foodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  foodCard: {
    width: '30%', backgroundColor: COLORS.card, borderRadius: 16, padding: 12, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  foodEmoji: { fontSize: 30 },
  foodName: { fontSize: 12, fontFamily: 'Inter_700Bold', color: COLORS.textDark, textAlign: 'center' },
  foodNote: { fontSize: 10, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, textAlign: 'center' },
  carbBadge: { backgroundColor: COLORS.surface, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  carbText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: COLORS.primary },
  logCard: { backgroundColor: COLORS.card, borderRadius: 20, padding: 18, gap: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  logSubTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  mealTypeRow: { flexDirection: 'row', gap: 8 },
  mealTypeBtn: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, padding: 10, alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: COLORS.border },
  mealTypeBtnActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  mealTypeEmoji: { fontSize: 20 },
  mealTypeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  mealTypeTextActive: { color: COLORS.primary },
  foodSelectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  foodSelectItem: { width: '22%', alignItems: 'center', gap: 3, padding: 8, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  foodSelectItemActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  foodSelectEmoji: { fontSize: 22 },
  foodSelectName: { fontSize: 10, fontFamily: 'Inter_500Medium', color: COLORS.textMuted, textAlign: 'center' },
  foodCheckDot: { position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  glucoseInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  glucoseField: { flex: 1, gap: 6 },
  glucoseFieldLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: COLORS.textMuted },
  glucoseInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 10 },
  glucoseInputText: { flex: 1, fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  glucoseUnit: { fontSize: 11, fontFamily: 'Inter_400Regular', color: COLORS.textMuted },
  glucoseArrow: { paddingTop: 20 },
  logBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: COLORS.textDark },
  historyCard: { backgroundColor: COLORS.card, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  histRow: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, gap: 12 },
  histIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  histType: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: COLORS.textDark },
  histFoods: { fontSize: 12, fontFamily: 'Inter_400Regular', color: COLORS.textMuted, marginTop: 2 },
  histGluc: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  histGlucPre: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: COLORS.textMuted },
  histGlucPost: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  histDivider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 16 },
});
