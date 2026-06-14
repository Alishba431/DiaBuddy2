import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { PointsToast } from '@/components/PointsToast';
import { MISSION_POINTS } from '@/lib/rewards';
import { useDiet } from '@/hooks/useDiet';

const FOOD_TABS = ['Everyday', 'Sometimes', 'Avoid'];

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { id: 'lunch',     label: 'Lunch',     emoji: '☀️' },
  { id: 'dinner',    label: 'Dinner',    emoji: '🌙' },
  { id: 'snack',     label: 'Snack',     emoji: '🍎' },
];

const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  let hours = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${m} ${ampm}`;
};

export default function EatSmartScreen() {
  const { foods, mealLogs, logMeal } = useDiet();
  const [activeTab, setActiveTab] = useState('Everyday');
  const [activeMeal, setActiveMeal] = useState('breakfast');
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState('');
  const [toast, setToast] = useState(false);

  const toggleFood = (id: string) => {
    setSelectedFoodIds(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleLogMeal = async () => {
    if (selectedFoodIds.length === 0 && !customNotes) return;
    const mealTypeId = activeMeal;
    await logMeal(mealTypeId, selectedFoodIds, customNotes);
    setSelectedFoodIds([]);
    setCustomNotes('');
    setToast(true);
  };

  const currentMeal = MEAL_TYPES.find(m => m.id === activeMeal);

  // Helper to safely get current tab's foods
  const activeFoods = foods[activeTab.toLowerCase() as keyof typeof foods] || [];
  
  // Create an array for fast food select (top 8 everyday + sometimes)
  const quickSelectFoods = [...foods.everyday, ...foods.sometimes].slice(0, 8);

  return (
    <View style={styles.root}>
      <PointsToast points={MISSION_POINTS.meal_logged} visible={toast} onHide={() => setToast(false)} />
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
            <TouchableOpacity 
              key={t} 
              style={[
                styles.tab, 
                activeTab === t && styles.tabActive,
                activeTab === t && t === 'Avoid' && { backgroundColor: COLORS.alertRed }
              ]} 
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.foodGrid}>
          {activeFoods.length === 0 && (
             <Text style={{color: COLORS.textMuted, marginTop: 10, fontStyle: 'italic', paddingHorizontal: 10}}>No foods found in this category.</Text>
          )}
          {activeFoods.map((f) => (
            <View key={f.id} style={[styles.foodCard, activeTab === 'Avoid' && { borderColor: '#FEE2E2', borderWidth: 1 }]}>
              <Text style={styles.foodEmoji}>{f.emoji}</Text>
              <Text style={styles.foodName}>{f.name_en}</Text>
              {f.estimated_carbs_g !== undefined && f.estimated_carbs_g !== null && (
                <View style={[styles.carbBadge, activeTab === 'Avoid' && { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.carbText, activeTab === 'Avoid' && { color: COLORS.alertRed }]}>{f.estimated_carbs_g}g carbs</Text>
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
            {quickSelectFoods.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.foodSelectItem, selectedFoodIds.includes(f.id) && styles.foodSelectItemActive]}
                onPress={() => toggleFood(f.id)}
              >
                <Text style={styles.foodSelectEmoji}>{f.emoji}</Text>
                <Text style={[styles.foodSelectName, selectedFoodIds.includes(f.id) && { color: COLORS.primary }]} numberOfLines={1}>{f.name_en}</Text>
                {selectedFoodIds.includes(f.id) && (
                  <View style={styles.foodCheckDot}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Custom Notes */}
          <TextInput 
            style={styles.input} 
            placeholder="Custom notes or foods not listed..." 
            placeholderTextColor="#999" 
            value={customNotes} 
            onChangeText={setCustomNotes} 
          />

          <TouchableOpacity
            style={[styles.logBtn, (selectedFoodIds.length === 0 && !customNotes) && { opacity: 0.5 }]}
            onPress={handleLogMeal}
            disabled={selectedFoodIds.length === 0 && !customNotes}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.textDark} />
            <Text style={styles.logBtnText}>Log {currentMeal?.label}</Text>
          </TouchableOpacity>
        </View>

        {/* Today's logged meals */}
        {mealLogs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Meal History</Text>
            <View style={styles.historyCard}>
              {mealLogs.map((m, i) => {
                 const mealInfo = MEAL_TYPES.find(mt => mt.id === m.meal_type);
                 const foodsList = (m.food_items || []).map((f: any) => f.name).join(', ');
                 const displayFoods = [foodsList, m.custom_notes].filter(Boolean).join(' · ');
                 
                 return (
                  <React.Fragment key={m.id}>
                    <View style={styles.histRow}>
                      <View style={styles.histIconBox}>
                        <Text style={{ fontSize: 22 }}>{mealInfo?.emoji ?? '🍽️'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.histType}>{mealInfo?.label || m.meal_type} · {formatTime(m.logged_at)}</Text>
                        <Text style={styles.histFoods}>{displayFoods || 'No foods listed'}</Text>
                        {m.total_carbs_g > 0 && (
                           <Text style={[styles.histFoods, { color: COLORS.primary, marginTop: 4, fontFamily: 'Inter_600SemiBold' }]}>
                             {m.total_carbs_g}g Total Carbs
                           </Text>
                        )}
                      </View>
                      {m.postGlucose ? (
                        <View style={styles.histGluc}>
                          <Text style={styles.histGlucPre}>+2h</Text>
                          <Ionicons name="arrow-forward" size={10} color={COLORS.textMuted} />
                          <Text style={[styles.histGlucPost, { color: m.postGlucose > 200 ? COLORS.alertOrange : COLORS.success }]}>{m.postGlucose}</Text>
                        </View>
                      ) : null}
                    </View>
                    {i < mealLogs.length - 1 && <View style={styles.histDivider} />}
                  </React.Fragment>
                );
              })}
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
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', padding: 14, borderRadius: 12, fontSize: 15, fontFamily: 'Inter_400Regular', color: COLORS.textDark, marginTop: 10 },
  logBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 },
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
