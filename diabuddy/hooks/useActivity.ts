import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth, useChildProfile } from '@/context/AppContext';
import { MISSION_POINTS, completeMissionField, localDateString } from '@/lib/rewards';

export const ACTIVITY_DEFS = [
  { id: 'walk', emoji: '🚶', name: 'Walking', met: 1 },
  { id: 'run', emoji: '🏃', name: 'Running', met: 3 },
  { id: 'swim', emoji: '🏊', name: 'Swimming', met: 3 },
  { id: 'cycle', emoji: '🚴', name: 'Cycling', met: 2 },
  { id: 'dance', emoji: '💃', name: 'Dancing', met: 2 },
  { id: 'play', emoji: '⚽', name: 'Sports', met: 3 },
] as const;

export type ActivityDef = (typeof ACTIVITY_DEFS)[number];

export type ActivityLog = {
  id: string;
  activity_type: string;
  activity_name: string;
  duration_mins: number;
  intensity: string;
  met_level: number | null;
  notes: string | null;
  logged_at: string;
};

export type WeeklyActivityDay = {
  day: string;
  minutes: number;
  goalMet: boolean;
};

const INTENSITY_TO_DB: Record<string, string> = {
  Light: 'light',
  Medium: 'medium',
  Intense: 'intense',
};

const WEEKLY_GOAL_MINUTES = 30;
const WEEKLY_GOAL_DAYS = 5;

let activityTableWarned = false;

function isMissingActivityTable(message: string) {
  return message.includes('Could not find the table') || message.includes('activity_logs');
}

function warnMissingTableOnce() {
  if (activityTableWarned) return;
  activityTableWarned = true;
  console.warn(
    '[useActivity] activity_logs table not found. Run supabase/migrations/20250615_activity_logs.sql in Supabase → SQL Editor.'
  );
}

function startOfLocalDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function useActivity() {
  const { currentUser } = useAuth();
  const { addPoints } = useChildProfile();
  const childProfileId = currentUser?.childProfiles?.[0]?.id;

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableReady, setTableReady] = useState(true);

  const fetchData = useCallback(async () => {
    if (!childProfileId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const weekStart = startOfLocalDay();
    weekStart.setDate(weekStart.getDate() - 6);

    const { data, error } = await supabase
      .from('activity_logs')
      .select('id, activity_type, activity_name, duration_mins, intensity, met_level, notes, logged_at')
      .eq('child_profile_id', childProfileId)
      .gte('logged_at', weekStart.toISOString())
      .order('logged_at', { ascending: false });

    if (error) {
      if (isMissingActivityTable(error.message)) {
        warnMissingTableOnce();
        setTableReady(false);
        setLogs([]);
      } else {
        console.error('[useActivity] fetch error:', error.message);
      }
    } else {
      setTableReady(true);
      setLogs((data ?? []) as ActivityLog[]);
    }
    setLoading(false);
  }, [childProfileId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const todayMinutes = useMemo(() => {
    const todayStart = startOfLocalDay().getTime();
    const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;
    return logs
      .filter(l => {
        const t = new Date(l.logged_at).getTime();
        return t >= todayStart && t < tomorrowStart;
      })
      .reduce((sum, l) => sum + l.duration_mins, 0);
  }, [logs]);

  const weeklyDays = useMemo((): WeeklyActivityDay[] => {
    const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = startOfLocalDay();
    const buckets: WeeklyActivityDay[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStart = d.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const minutes = logs
        .filter(l => {
          const t = new Date(l.logged_at).getTime();
          return t >= dayStart && t < dayEnd;
        })
        .reduce((sum, l) => sum + l.duration_mins, 0);

      buckets.push({
        day: dayLetters[d.getDay()],
        minutes,
        goalMet: minutes >= WEEKLY_GOAL_MINUTES,
      });
    }
    return buckets;
  }, [logs]);

  const weeklyGoalDays = useMemo(
    () => weeklyDays.filter(d => d.goalMet).length,
    [weeklyDays]
  );

  const logActivity = async (input: {
    activityType: string;
    activityName: string;
    durationMins: number;
    intensity: string;
    metLevel: number;
    notes?: string;
  }): Promise<{ ok: false } | { ok: true; pointsAwarded: number }> => {
    if (!childProfileId) return { ok: false };

    const intensityDb = INTENSITY_TO_DB[input.intensity] ?? 'medium';

    const { error } = await supabase.from('activity_logs').insert({
      child_profile_id: childProfileId,
      activity_type: input.activityType,
      activity_name: input.activityName,
      duration_mins: input.durationMins,
      intensity: intensityDb,
      met_level: input.metLevel,
      notes: input.notes ?? null,
      logged_at: new Date().toISOString(),
    });

    if (error) {
      if (isMissingActivityTable(error.message)) {
        warnMissingTableOnce();
        setTableReady(false);
      } else {
        console.error('[useActivity] insert error:', error.message);
      }
      return { ok: false };
    }

    addPoints(MISSION_POINTS.activity_done);

    const today = localDateString();
    const { data: mission } = await supabase
      .from('daily_missions')
      .select('activity_done')
      .eq('child_profile_id', childProfileId)
      .eq('mission_date', today)
      .maybeSingle();

    if (!mission?.activity_done) {
      await completeMissionField(childProfileId, 'activity_done');
    }

    await fetchData();
    return { ok: true as const, pointsAwarded: MISSION_POINTS.activity_done };
  };

  return {
    logs,
    loading,
    tableReady,
    todayMinutes,
    weeklyDays,
    weeklyGoalDays,
    weeklyGoalTarget: WEEKLY_GOAL_DAYS,
    weeklyGoalMinutes: WEEKLY_GOAL_MINUTES,
    logActivity,
    refresh: fetchData,
  };
}

export function formatActivityTime(loggedAt: string) {
  const d = new Date(loggedAt);
  const hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${mins} ${ampm}`;
}
