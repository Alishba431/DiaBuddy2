import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth, useChildProfile } from '@/context/AppContext';
import { MISSION_POINTS, completeMissionField } from '@/lib/rewards';

export type EnhancedSchedule = {
  id: string;
  child_profile_id: string;
  insulin_type: string;
  dose_units: number;
  scheduled_time: string;
  is_active: boolean;
  log?: {
    id: string;
    confirmed: boolean;
    status: 'taken' | 'missed' | 'pending';
  };
};

export function useInsulin() {
  const { currentUser } = useAuth();
  const { addPoints } = useChildProfile();
  const childProfileId = currentUser?.childProfiles?.[0]?.id;

  const [schedules, setSchedules] = useState<EnhancedSchedule[]>([]);
  const [weeklyAdherence, setWeeklyAdherence] = useState<{ day: string, taken: number, total: number }[]>([]);

  const fetchData = useCallback(async () => {
    if (!childProfileId) return;
    
    // 1. Fetch schedules
    const { data: schedData, error: schedErr } = await supabase
      .from('insulin_schedules')
      .select('*')
      .eq('child_profile_id', childProfileId)
      .eq('is_active', true)
      .order('scheduled_time', { ascending: true });

    if (schedErr) console.error(schedErr);
    const activeSchedules = schedData || [];

    // 2. Fetch today's logs
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: logData, error: logErr } = await supabase
      .from('insulin_logs')
      .select('*')
      .eq('child_profile_id', childProfileId)
      .gte('scheduled_for', today.toISOString())
      .lt('scheduled_for', tomorrow.toISOString());

    if (logErr) console.error(logErr);
    const todayLogs = logData || [];

    const enhanced = activeSchedules.map((sched: any) => {
      const log = todayLogs.find((l: any) => l.schedule_id === sched.id);
      return { 
        ...sched, 
        log: log ? { id: log.id, confirmed: log.confirmed, status: log.confirmed ? 'taken' : 'missed' } : undefined 
      };
    });
    setSchedules(enhanced);

    // 5. Weekly adherence
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const { data: weeklyLogs, error: weeklyErr } = await supabase
      .from('insulin_logs')
      .select('confirmed, scheduled_for')
      .eq('child_profile_id', childProfileId)
      .gte('scheduled_for', sevenDaysAgo.toISOString())
      .lt('scheduled_for', tomorrow.toISOString());

    if (weeklyErr) console.error(weeklyErr);

    const adherence = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setDate(dayEnd.getDate() + 1);
      dayEnd.setHours(0, 0, 0, 0);

      const logsForDay = (weeklyLogs || []).filter((l: any) => {
        const t = new Date(l.scheduled_for).getTime();
        return t >= dayStart.getTime() && t < dayEnd.getTime();
      });

      const totalExpected = activeSchedules.length; 
      const taken = logsForDay.filter((l: any) => l.confirmed === true).length;
      
      adherence.push({
        day: dayName.charAt(0),
        taken,
        total: totalExpected > 0 ? totalExpected : (taken || 1)
      });
    }
    setWeeklyAdherence(adherence);
  }, [childProfileId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const confirmDose = async (scheduleId: string, logId?: string) => {
    if (!childProfileId) return;
    
    const sched = schedules.find(s => s.id === scheduleId);
    if (!sched) return;

    if (logId) {
      await supabase
        .from('insulin_logs')
        .update({ confirmed: true, taken_at: new Date().toISOString() })
        .eq('id', logId);
    } else {
      const now = new Date().toISOString();
      const [hours, mins] = sched.scheduled_time.split(':');
      const scheduledDate = new Date();
      scheduledDate.setHours(parseInt(hours), parseInt(mins), 0, 0);

      await supabase.from('insulin_logs').insert({
        child_profile_id: childProfileId,
        schedule_id: scheduleId,
        insulin_type: sched.insulin_type,
        dose_units: sched.dose_units,
        confirmed: true,
        confirmed_by: 'child',
        scheduled_for: scheduledDate.toISOString(),
        taken_at: now
      });
    }

    addPoints(MISSION_POINTS.medicine_confirmed);
    await completeMissionField(childProfileId, 'medicine_confirmed');
    await fetchData(); 
  };

  const addSchedule = async (insulinType: string, time: string, units: number) => {
    if (!childProfileId) return;
    
    const timeFormatted = time.length === 5 ? `${time}:00` : time;
    
    await supabase.from('insulin_schedules').insert({
      child_profile_id: childProfileId,
      insulin_type: insulinType,
      scheduled_time: timeFormatted,
      dose_units: units,
      is_active: true
    });
    
    await fetchData();
  };

  return { schedules, weeklyAdherence, confirmDose, addSchedule, refresh: fetchData };
}
