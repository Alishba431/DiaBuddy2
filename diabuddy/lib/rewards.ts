import { supabase } from '@/lib/supabase';

export const MISSION_POINTS = {
  bg_logged: 10,
  medicine_confirmed: 10,
  meal_logged: 10,
  activity_done: 10,
  video_watched: 25,
} as const;

export type MissionField = keyof typeof MISSION_POINTS;

export const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export function localDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Last 7 calendar days ending today, for streak UI. */
export function buildRollingWeek(streakDays: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const active = Math.min(Math.max(streakDays, 0), 7);

  return Array.from({ length: 7 }, (_, i) => {
    const daysAgo = 6 - i;
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return {
      label: DAY_LETTERS[d.getDay()],
      filled: daysAgo < active,
      isToday: daysAgo === 0,
    };
  });
}

export async function ensureDailyMissionRow(childProfileId: string, missionDate = localDateString()) {
  const { data } = await supabase
    .from('daily_missions')
    .upsert({ child_profile_id: childProfileId, mission_date: missionDate }, { onConflict: 'child_profile_id,mission_date' })
    .select('id')
    .maybeSingle();
  return data?.id ?? null;
}

export async function completeMissionField(childProfileId: string, field: MissionField) {
  const missionDate = localDateString();
  await ensureDailyMissionRow(childProfileId, missionDate);
  await supabase
    .from('daily_missions')
    .upsert(
      { child_profile_id: childProfileId, mission_date: missionDate, [field]: true },
      { onConflict: 'child_profile_id,mission_date' }
    );
}

export async function awardBadge(childProfileId: string, badgeType: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('badges_earned')
    .select('id')
    .eq('child_profile_id', childProfileId)
    .eq('badge_type', badgeType)
    .maybeSingle();

  if (existing) return true;

  const { error: insertError } = await supabase.from('badges_earned').insert({
    child_profile_id: childProfileId,
    badge_type: badgeType,
  });

  if (!insertError) return true;
  if (insertError.code === '23505') return true;

  const rlsBlocked =
    insertError.message.includes('row-level security') || insertError.code === '42501';

  if (rlsBlocked) {
    const { data, error: rpcError } = await supabase.rpc('award_badge', {
      p_child_profile_id: childProfileId,
      p_badge_type: badgeType,
    });
    if (!rpcError && data === true) return true;

    if (rpcError?.code === 'PGRST202' || rpcError?.message?.includes('award_badge')) {
      console.warn(
        '[awardBadge] Badges need a one-time DB setup. In Supabase → SQL Editor, run the file:\n' +
          'supabase/migrations/20250614_badges_rls_and_award_rpc.sql'
      );
      return false;
    }
    if (rpcError) {
      console.error(`[awardBadge] RPC failed for ${badgeType}:`, rpcError.message);
      return false;
    }
  }

  console.error(`[awardBadge] Failed to award ${badgeType}:`, insertError.message);
  return false;
}

export async function fetchEarnedBadgeTypes(childProfileId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('badges_earned')
    .select('badge_type')
    .eq('child_profile_id', childProfileId);
  if (error) {
    console.error('[fetchEarnedBadgeTypes]', error.message);
    return [];
  }
  return (data ?? []).map(b => b.badge_type);
}

export async function checkAndAwardBadges(
  childProfileId: string,
  ctx: { totalStars: number; streakDays: number; earned: string[] }
): Promise<string[]> {
  const earned = new Set(ctx.earned);
  const toAward: string[] = [];

  if (ctx.totalStars >= 500 && !earned.has('diabetes_star')) toAward.push('diabetes_star');
  if (ctx.streakDays >= 7 && !earned.has('week_streak')) toAward.push('week_streak');
  if (ctx.streakDays >= 30 && !earned.has('month_streak')) toAward.push('month_streak');

  for (const badge of toAward) {
    const ok = await awardBadge(childProfileId, badge);
    if (ok) earned.add(badge);
  }

  return Array.from(earned);
}
