import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth, useChildProfile } from '@/context/AppContext';
import { MISSION_POINTS, completeMissionField } from '@/lib/rewards';

export type FoodItem = {
  id: string;
  name_en: string;
  category: 'everyday' | 'sometimes' | 'avoid';
  emoji: string;
  estimated_carbs_g: number;
};

export type MealLogEnhanced = {
  id: string;
  meal_type: string;
  food_items: any[];
  total_carbs_g: number;
  custom_notes: string;
  logged_at: string;
  postGlucose?: number;
};

export function useDiet() {
  const { currentUser } = useAuth();
  const { addPoints } = useChildProfile();
  const childProfileId = currentUser?.childProfiles?.[0]?.id;

  const [foods, setFoods] = useState<{ everyday: FoodItem[], sometimes: FoodItem[], avoid: FoodItem[] }>({
    everyday: [], sometimes: [], avoid: []
  });
  const [mealLogs, setMealLogs] = useState<MealLogEnhanced[]>([]);

  const fetchData = useCallback(async () => {
    if (!childProfileId) return;

    // 1. Fetch Food Items
    const { data: foodData } = await supabase.from('food_items').select('*');
    if (foodData) {
      const everyday = foodData.filter(f => f.category === 'everyday');
      const sometimes = foodData.filter(f => f.category === 'sometimes');
      const avoid = foodData.filter(f => f.category === 'avoid');
      setFoods({ everyday, sometimes, avoid });
    }

    // 2. Fetch Meal Logs
    const { data: logData, error: logErr } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('child_profile_id', childProfileId)
      .order('logged_at', { ascending: false })
      .limit(20);

    if (logErr) console.error(logErr);

    // 3. Fetch Glucose Readings for correlation
    const { data: glucoseData } = await supabase
      .from('glucose_readings')
      .select('reading_value, recorded_at')
      .eq('child_profile_id', childProfileId)
      .order('recorded_at', { ascending: true });

    if (logData) {
      const enhancedLogs = logData.map(log => {
        const logTime = new Date(log.logged_at).getTime();
        const twoHoursLater = logTime + 2 * 60 * 60 * 1000;
        
        // Find first glucose reading within 2 hours after meal
        const postReading = (glucoseData || []).find(g => {
          const gTime = new Date(g.recorded_at).getTime();
          return gTime >= logTime && gTime <= twoHoursLater;
        });

        return {
          ...log,
          postGlucose: postReading?.reading_value
        };
      });
      setMealLogs(enhancedLogs);
    }
  }, [childProfileId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const logMeal = async (meal_type: string, selectedFoodIds: string[], customNotes: string) => {
    if (!childProfileId) return;

    // Build food_items JSONB
    const allFoods = [...foods.everyday, ...foods.sometimes, ...foods.avoid];
    const selectedFoods = allFoods.filter(f => selectedFoodIds.includes(f.id));
    
    const foodJson = selectedFoods.map(f => ({
      id: f.id,
      name: f.name_en,
      carbs: f.estimated_carbs_g
    }));

    const totalCarbs = selectedFoods.reduce((sum, f) => sum + (f.estimated_carbs_g || 0), 0);

    const { data, error } = await supabase.from('meal_logs').insert({
      child_profile_id: childProfileId,
      meal_type,
      food_items: foodJson,
      total_carbs_g: totalCarbs,
      custom_notes: customNotes
    });

    if (error) {
      console.error('Error logging meal:', error);
      return;
    }

    addPoints(MISSION_POINTS.meal_logged);
    await completeMissionField(childProfileId, 'meal_logged');
    await fetchData();
  };

  return { foods, mealLogs, logMeal, refresh: fetchData };
}
