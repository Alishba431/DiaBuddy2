import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { mockProfile, mockGlucoseReadings, characters } from '@/data/mockData';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import {
  MISSION_POINTS,
  awardBadge as awardBadgeDb,
  completeMissionField,
  fetchEarnedBadgeTypes,
  localDateString,
} from '@/lib/rewards';
import type { ChildProfile as DbChildProfile, Profile as DbProfile } from '@/types/database';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  role: 'child' | 'caretaker';
  childName?: string;
  childProfiles: DbChildProfile[];
}

export interface NotificationSettings {
  lowSugarAlert: boolean;
  highSugarAlert: boolean;
  insulinMorning: boolean;
  insulinMorningTime: string;
  insulinEvening: boolean;
  insulinEveningTime: string;
  snackReminder: boolean;
  snackTime: string;
  exerciseReminder: boolean;
  exerciseTime: string;
  sound: boolean;
  vibration: boolean;
  lowThreshold: number;
  highThreshold: number;
  hba1cReminderDays: number;
}

interface ChildProfile {
  name: string;
  age: number;
  character: 'gluco_lion' | 'insu_robot' | 'zara_panda';
  language: 'english' | 'urdu' | 'roman_urdu';
  points: number;
  level: number;
  streak: number;
}

interface GlucoseReading {
  id: string;
  time: string;
  value: number;
  type: string;
  date?: string;
}

interface Mission {
  id: string;
  icon: string;
  title: string;
  status: 'done' | 'pending';
  screen: string;
  points: number;
}

interface Settings {
  language: 'english' | 'urdu' | 'roman_urdu';
  fontSize: 'small' | 'medium' | 'large';
  sound: boolean;
  vibration: boolean;
  voice: boolean;
  colorblind: boolean;
}

const mapCharacterToDb = (char: string): string => {
  if (char === 'gluco_lion') return 'lion';
  if (char === 'insu_robot') return 'robot';
  if (char === 'zara_panda') return 'panda';
  return char;
};

const mapCharacterFromDb = (char: string): string => {
  if (char === 'lion') return 'gluco_lion';
  if (char === 'robot') return 'insu_robot';
  if (char === 'panda') return 'zara_panda';
  return char;
};

const mapLanguageToDb = (lang: string): string => {
  if (lang === 'english') return 'en';
  if (lang === 'urdu') return 'ur';
  if (lang === 'roman_urdu') return 'roman_ur';
  return lang;
};

const mapLanguageFromDb = (lang: string): string => {
  if (lang === 'en') return 'english';
  if (lang === 'ur') return 'urdu';
  if (lang === 'roman_ur') return 'roman_urdu';
  return lang;
};

// ─── Auth Context ─────────────────────────────────────────────────────────────

const AuthContext = createContext<{
  currentUser: UserAccount | null;
  isLoading: boolean;
  login: (email: string, password: string, role: 'child' | 'caretaker', pin?: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (childName: string, email: string, password: string, age: number, character: string, pin: string, language?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}>({
  currentUser: null,
  isLoading: true,
  login: async () => ({ ok: false }),
  signup: async () => ({ ok: false }),
  logout: async () => {},
});

function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const deriveCaregiverEmail = (email: string) => {
    const [local, domain] = email.trim().toLowerCase().split('@');
    if (!local || !domain) return '';
    const caretakerSuffix = '+caregiver';
    const caregiverLocal = local.endsWith(caretakerSuffix) ? local : `${local}${caretakerSuffix}`;
    return `${caregiverLocal}@${domain}`;
  };

  const sanitizeUsername = (raw: string) => {
    // Supabase requires a valid email string; we only allow a safe subset for the synthetic email local-part.
    // Also handle cases where user accidentally types an email into the username field.
    const beforeAt = raw.trim().toLowerCase().split('@')[0];
    return beforeAt.replace(/[^a-z0-9]/g, '');
  };

  const pinToSupabasePassword = (rawPin: string) => {
    const pin = rawPin.replace(/\D/g, '').slice(0, 4);
    // Supabase Auth password requirements are stricter than a 4-digit PIN.
    // We transform the PIN into a deterministic longer string for signUp/signIn.
    return `${pin}_diabuddy`;
  };

  const usernameFromEmail = (email: string) => {
    const local = email.trim().toLowerCase().split('@')[0] ?? '';
    return sanitizeUsername(local);
  };

  const isValidEmail = (email: string) => {
    const v = email.trim().toLowerCase();
    // Basic client-side validation; Supabase still enforces the real rules server-side.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };
  const normalizeRole = (role: string): UserAccount['role'] =>
    role === 'caregiver' ? 'caretaker' : 'child';

  const fetchCurrentUser = async (userId: string, email: string): Promise<UserAccount | null> => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    const profile = (profileData ?? null) as DbProfile | null;

    if (profileError || !profile) return null;

    const role = normalizeRole(profile.role);
    let childProfiles: DbChildProfile[] = [];

    if (role === 'child') {
      const { data } = await supabase.from('child_profiles').select('*').eq('profile_id', profile.id);
      childProfiles = (data ?? []) as DbChildProfile[];
    } else {
      const { data: caregiverLinks } = await supabase
        .from('caregiver_accounts')
        .select('child_profile_id')
        .eq('profile_id', profile.id);

      const ids = (caregiverLinks ?? []).map(link => link.child_profile_id);
      if (ids.length > 0) {
        const { data } = await supabase.from('child_profiles').select('*').in('id', ids);
        childProfiles = (data ?? []) as DbChildProfile[];
      }
    }

    return {
      id: profile.id,
      username: profile.username,
      email,
      role,
      childName: childProfiles[0]?.display_name,
      childProfiles,
    };
  };

  const syncSessionState = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      setCurrentUser(null);
      return;
    }

    const email = session.user.email ?? '';
    const user = await fetchCurrentUser(session.user.id, email);
    setCurrentUser(user);
  };

  useEffect(() => {
    syncSessionState().finally(() => {
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      syncSessionState();
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string,
    role: 'child' | 'caretaker',
    pin?: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return { ok: false, error: 'Please enter a valid email address' };
    }
    const emailToUse = role === 'child' ? cleanEmail : deriveCaregiverEmail(cleanEmail);
    const roleSecret = role === 'child' ? password : pinToSupabasePassword(pin ?? '');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: roleSecret,
    });

    if (signInError) return { ok: false, error: signInError.message };

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) return { ok: false, error: 'Login failed. Please try again.' };

    const account = await fetchCurrentUser(session.user.id, session.user.email ?? '');
    if (!account || account.role !== role) {
      await supabase.auth.signOut();
      return { ok: false, error: 'This account is not registered for the selected role.' };
    }

    setCurrentUser(account);
    return { ok: true };
  };

  const signup = async (
    childName: string,
    email: string,
    password: string,
    age: number,
    character: string,
    pin: string,
    language = 'english'
  ): Promise<{ ok: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      return { ok: false, error: 'Please enter a valid email address' };
    }
    const profilesUsername = usernameFromEmail(cleanEmail);
    if (profilesUsername.length < 3) {
      return { ok: false, error: 'Email local-part must be at least 3 characters' };
    }

    const childEmail = cleanEmail;
    const caregiverEmail = deriveCaregiverEmail(cleanEmail);

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', profilesUsername)
      .eq('role', 'child')
      .maybeSingle();

    if (existingProfile) {
      return { ok: false, error: 'Email is already taken. Try another one.' };
    }

    console.log('[Signup] Starting signup for child email:', childEmail);
    await supabase.auth.signOut();

    const { data: childAuth, error: childAuthError } = await supabase.auth.signUp({
      email: childEmail,
      password,
    });
    if (childAuthError || !childAuth.user?.id) {
      console.error('[Signup] Child Auth Error:', childAuthError);
      if (childAuthError?.message.toLowerCase().includes('already registered') || childAuthError?.message.toLowerCase().includes('already exists')) {
        return { ok: false, error: 'Email is already taken. Try another one.' };
      }
      return { ok: false, error: childAuthError?.message ?? 'Could not create child account.' };
    }
    console.log('[Signup] Child Auth created successfully, user ID:', childAuth.user.id);
    if (!childAuth.session) {
      console.warn('[Signup] No session returned. Email confirmation might be enabled in Supabase.');
      return {
        ok: false,
        error: 'Email confirmation is enabled in Supabase. Disable it for immediate in-app signup/login.',
      };
    }

    const childUserId = childAuth.user.id;
    console.log('[Signup] Upserting child profile row in profiles table...');
    const { error: childProfileInsertError } = await supabase.from('profiles').upsert({
      id: childUserId,
      username: profilesUsername,
      role: 'child',
    });
    if (childProfileInsertError) {
      console.error('[Signup] Child Profile profiles upsert error:', childProfileInsertError);
      return { ok: false, error: childProfileInsertError.message };
    }
    console.log('[Signup] Child Profile profiles row upserted successfully.');

    console.log('[Signup] Inserting child profile choice row in child_profiles...');
    const { data: childProfile, error: childRowError } = await supabase
      .from('child_profiles')
      .insert({
        profile_id: childUserId,
        child_username: profilesUsername,
        display_name: childName,
        age,
        character_choice: mapCharacterToDb(character) as any,
        language: mapLanguageToDb(language) as any,
        dm_type: 'T1DM',
      })
      .select('*')
      .single();
    if (childRowError || !childProfile) {
      console.error('[Signup] child_profiles insert error:', childRowError);
      return { ok: false, error: childRowError?.message ?? 'Could not create child profile.' };
    }
    console.log('[Signup] child_profiles row inserted successfully:', childProfile.id);

    console.log('[Signup] Starting caregiver Auth creation for email:', caregiverEmail);
    await supabase.auth.signOut();

    const { data: caregiverAuth, error: caregiverAuthError } = await supabase.auth.signUp({
      email: caregiverEmail,
      password: pinToSupabasePassword(pin),
    });
    if (caregiverAuthError || !caregiverAuth.user?.id) {
      console.error('[Signup] Caregiver Auth Error:', caregiverAuthError);
      if (caregiverAuthError?.message.toLowerCase().includes('already registered') || caregiverAuthError?.message.toLowerCase().includes('already exists')) {
        return { ok: false, error: 'Email is already taken. Try another one.' };
      }
      return { ok: false, error: caregiverAuthError?.message ?? 'Could not create caregiver account.' };
    }
    console.log('[Signup] Caregiver Auth created successfully, user ID:', caregiverAuth.user.id);
    if (!caregiverAuth.session) {
      console.warn('[Signup] No session returned for caregiver. Email confirmation might be enabled.');
      return {
        ok: false,
        error: 'Email confirmation is enabled in Supabase. Disable it for immediate in-app signup/login.',
      };
    }

    const caregiverUserId = caregiverAuth.user.id;
    console.log('[Signup] Upserting caregiver profile row in profiles table...');
    const { error: caregiverProfileInsertError } = await supabase.from('profiles').upsert({
      id: caregiverUserId,
      username: `${profilesUsername}_caregiver`,
      role: 'caregiver',
    });
    if (caregiverProfileInsertError) {
      console.error('[Signup] Caregiver Profile profiles upsert error:', caregiverProfileInsertError);
      return { ok: false, error: caregiverProfileInsertError.message };
    }
    console.log('[Signup] Caregiver Profile profiles row upserted successfully.');

    const pinHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
    console.log('[Signup] Inserting caregiver account link in caregiver_accounts...');
    const { error: caregiverLinkError } = await supabase.from('caregiver_accounts').insert({
      child_profile_id: childProfile.id,
      profile_id: caregiverUserId,
      dashboard_pin: pinHash,
    });
    if (caregiverLinkError) {
      console.error('[Signup] caregiver_accounts insert error:', caregiverLinkError);
      return { ok: false, error: caregiverLinkError.message };
    }
    console.log('[Signup] caregiver_accounts row inserted successfully.');

    console.log('[Signup] Signing back in as child to log user into app...');
    const { error: childLoginError } = await supabase.auth.signInWithPassword({
      email: childEmail,
      password,
    });
    if (childLoginError) {
      console.error('[Signup] Final child login error:', childLoginError);
      return { ok: false, error: 'Accounts created, but automatic sign-in failed. Please log in manually.' };
    }

    const signedInUser = await fetchCurrentUser(childUserId, childEmail);
    setCurrentUser(signedInUser);
    console.log('[Signup] Signup complete and session synchronized.');
    return { ok: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  return <AuthContext.Provider value={{ currentUser, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

// ─── Notification Context ─────────────────────────────────────────────────────

const defaultNotifSettings: NotificationSettings = {
  lowSugarAlert: true,
  highSugarAlert: true,
  insulinMorning: true,
  insulinMorningTime: '08:00',
  insulinEvening: true,
  insulinEveningTime: '20:00',
  snackReminder: true,
  snackTime: '15:00',
  exerciseReminder: false,
  exerciseTime: '17:00',
  sound: true,
  vibration: true,
  lowThreshold: 70,
  highThreshold: 250,
  hba1cReminderDays: 90,
};

const NotifContext = createContext<{
  settings: NotificationSettings;
  updateSettings: (s: Partial<NotificationSettings>) => void;
}>({ settings: defaultNotifSettings, updateSettings: () => {} });

function NotifProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>(defaultNotifSettings);
  const updateSettings = (s: Partial<NotificationSettings>) => setSettings(p => ({ ...p, ...s }));
  return <NotifContext.Provider value={{ settings, updateSettings }}>{children}</NotifContext.Provider>;
}

// ─── Child Profile Context ────────────────────────────────────────────────────

const ChildProfileContext = createContext<{
  profile: ChildProfile;
  setProfile: (p: ChildProfile) => void;
  addPoints: (pts: number) => void;
  refreshProfile: () => Promise<void>;
  getCharacterEmoji: () => string;
}>({ profile: mockProfile, setProfile: () => {}, addPoints: () => {}, refreshProfile: async () => {}, getCharacterEmoji: () => '🦁' });

function ChildProfileProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<ChildProfile>(mockProfile);

  const fetchProfileData = useCallback(async () => {
    const activeChild = currentUser?.childProfiles?.[0];
    if (!activeChild) return;

    const { data: totals, error } = await supabase.from('reward_totals').select('*').eq('child_profile_id', activeChild.id).maybeSingle();
    
    let pts = 0;
    let streak = 0;
    let levelNum = 1;

    if (totals) {
      pts = totals.total_stars || 0;
      streak = totals.current_streak_days || 0;
      const lvlStr = totals.level;
      if (lvlStr === 'hero') levelNum = 2;
      else if (lvlStr === 'champion') levelNum = 3;
      else if (lvlStr === 'legend') levelNum = 4;
    } else if (!error) {
       await supabase.from('reward_totals').insert({ child_profile_id: activeChild.id });
    }

    setProfile({
      name: activeChild.display_name,
      age: activeChild.age,
      character: mapCharacterFromDb(activeChild.character_choice) as any,
      language: mapLanguageFromDb(activeChild.language) as any,
      points: pts,
      level: levelNum,
      streak: streak,
    });
  }, [currentUser]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const addPoints = async (pts: number) => {
    const activeChild = currentUser?.childProfiles?.[0];
    if (!activeChild) return;

    const { data: totals } = await supabase.from('reward_totals').select('*').eq('child_profile_id', activeChild.id).maybeSingle();
    
    if (totals) {
      const newPts = (totals.total_stars || 0) + pts;
      let newStreak = totals.current_streak_days || 0;
      
      const lastUpdate = totals.updated_at ? new Date(totals.updated_at) : null;
      const today = new Date();
      
      let isToday = false;
      let isYesterday = false;
      
      if (lastUpdate) {
         isToday = lastUpdate.toDateString() === today.toDateString();
         const yesterday = new Date();
         yesterday.setDate(yesterday.getDate() - 1);
         isYesterday = lastUpdate.toDateString() === yesterday.toDateString();
      }

      if (!isToday) {
         if (isYesterday) {
            newStreak += 1;
         } else {
            newStreak = 1;
         }
      }

      let newLevel = totals.level;
      if (newPts >= 800) newLevel = 'legend';
      else if (newPts >= 600) newLevel = 'champion';
      else if (newPts >= 400) newLevel = 'hero';
      else if (newPts >= 200) newLevel = 'apprentice';

      await supabase.from('reward_totals').update({ 
         total_stars: newPts,
         current_streak_days: newStreak,
         level: newLevel,
         updated_at: new Date().toISOString()
      }).eq('child_profile_id', activeChild.id);

      fetchProfileData();
    }
  };

  const getCharacterEmoji = () => characters.find(c => c.id === profile.character)?.emoji ?? '🦁';
  return <ChildProfileContext.Provider value={{ profile, setProfile, addPoints, refreshProfile: fetchProfileData, getCharacterEmoji }}>{children}</ChildProfileContext.Provider>;
}

// ─── Glucose Context ──────────────────────────────────────────────────────────

const mapBgTagFromDb = (tag: string): string => {
  if (tag === 'fasting') return 'Fasting';
  if (tag === 'post_meal') return 'After Meal';
  if (tag === 'bedtime') return 'Before Bed';
  if (tag === 'post_exercise') return 'After Exercise';
  if (tag === 'pre_exercise') return 'Before Exercise';
  if (tag === 'random') return 'Random';
  return tag;
};

// Maps UI display labels → actual DB enum values (probed from live DB)
// Valid bg_tag enum: fasting | post_meal | bedtime | post_exercise | pre_exercise | random
const mapBgTagToDb = (tag: string): string => {
  const cleaned = tag.trim();
  if (cleaned === 'Fasting') return 'fasting';
  if (cleaned === 'After Meal') return 'post_meal';
  if (cleaned === 'Before Bed') return 'bedtime';
  if (cleaned === 'After Exercise') return 'post_exercise';
  if (cleaned === 'Before Exercise') return 'pre_exercise';
  if (cleaned === 'Random') return 'random';
  // Fallback: try lowercase + underscore normalisation
  const normalized = cleaned.toLowerCase().replace(/[\s\-]+/g, '_');
  const validEnums = ['fasting', 'post_meal', 'bedtime', 'post_exercise', 'pre_exercise', 'random'];
  return validEnums.includes(normalized) ? normalized : 'fasting';
};

const parseRecordedAt = (recordedAtStr: string) => {
  const d = new Date(recordedAtStr);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const today = new Date();
  let date = 'Today';
  if (d.toDateString() !== today.toDateString()) {
    date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  return { time, date };
};

const GlucoseContext = createContext<{
  readings: GlucoseReading[];
  addReading: (r: Omit<GlucoseReading, 'id'>) => void;
  lastReading: GlucoseReading | null;
  getZone: (val: number) => 'green' | 'yellow' | 'red_high' | 'red_low';
}>({ readings: mockGlucoseReadings, addReading: () => {}, lastReading: mockGlucoseReadings[mockGlucoseReadings.length - 1], getZone: () => 'green' });

function GlucoseProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [readings, setReadings] = useState<GlucoseReading[]>([]);

  useEffect(() => {
    const childProfileId = currentUser?.childProfiles?.[0]?.id;
    if (!childProfileId) {
      setReadings([]);
      return;
    }

    const fetchReadings = async () => {
      const { data, error } = await supabase
        .from('glucose_readings')
        .select('*')
        .eq('child_profile_id', childProfileId)
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error("Error fetching readings:", error.message);
        return;
      }

      if (data) {
        const mapped = data.map((r: any) => {
          const { time, date } = parseRecordedAt(r.recorded_at);
            return {
              id: r.id,
              time,
              value: r.reading_value,
              type: mapBgTagFromDb(r.reading_tag),
              date
            };
        });
        setReadings(mapped);
      }
    };

    fetchReadings();

    const channel = supabase
      .channel(`glucose-changes-${childProfileId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'glucose_readings',
          filter: `child_profile_id=eq.${childProfileId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newReading = payload.new;
            const { time, date } = parseRecordedAt(newReading.recorded_at);
            const mapped = {
              id: newReading.id,
              time,
              value: newReading.reading_value,
              type: mapBgTagFromDb(newReading.reading_tag),
              date
            };
            setReadings(prev => {
              if (prev.some(r => r.id === mapped.id)) return prev;
              return [mapped, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            setReadings(prev => prev.filter(r => r.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            const updatedReading = payload.new;
            const { time, date } = parseRecordedAt(updatedReading.recorded_at);
            const mapped = {
              id: updatedReading.id,
              time,
              value: updatedReading.reading_value,
              type: mapBgTagFromDb(updatedReading.reading_tag),
              date
            };
            setReadings(prev => prev.map(r => r.id === mapped.id ? mapped : r));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const addReading = async (r: Omit<GlucoseReading, 'id'>) => {
    const childProfileId = currentUser?.childProfiles?.[0]?.id;
    if (!childProfileId) {
      console.error("No active child profile found to save reading.");
      return;
    }
    const readingTag = mapBgTagToDb(r.type);
    console.log('[addReading] Inserting reading_tag:', readingTag, 'from type:', r.type);
    const { data, error } = await supabase.from('glucose_readings').insert({
      child_profile_id: childProfileId,
      reading_value: r.value,
      reading_tag: readingTag,
      notes: null,
      recorded_at: new Date().toISOString()
    }).select();
    if (error) {
      console.error("Error inserting glucose reading:", error.message);
      return;
    }
    // Optimistically update local state with the new reading
    if (data && data.length > 0) {
      const newReading = data[0];
      const { time, date } = parseRecordedAt(newReading.recorded_at);
      const mapped = {
        id: newReading.id,
        time,
        value: newReading.reading_value,
        type: mapBgTagFromDb(newReading.reading_tag),
        date,
      };
      setReadings(prev => [mapped, ...prev]);

      await completeMissionField(childProfileId, 'bg_logged');
      await awardBadgeDb(childProfileId, 'first_log');
    }
  };

  const lastReading = readings[0] ?? null;
  const getZone = (val: number): 'green' | 'yellow' | 'red_high' | 'red_low' => {
    if (val < 70) return 'red_low';
    if (val <= 180) return 'green';
    if (val <= 250) return 'yellow';
    return 'red_high';
  };
  return <GlucoseContext.Provider value={{ readings, addReading, lastReading, getZone }}>{children}</GlucoseContext.Provider>;
}

// ─── Missions Context ─────────────────────────────────────────────────────────

const MissionsContext = createContext<{
  missions: Mission[];
  toggleMission: (id: string) => Promise<void>;
  completedCount: number;
  earnedBadgeIds: string[];
  awardBadge: (badgeType: string) => Promise<boolean>;
  refreshBadges: () => Promise<void>;
}>({ missions: [], toggleMission: async () => {}, completedCount: 0, earnedBadgeIds: [], awardBadge: async () => false, refreshBadges: async () => {} });

function MissionsProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const { addPoints } = useChildProfile();
  const childProfileId = currentUser?.childProfiles?.[0]?.id;
  const [missions, setMissions] = useState<Mission[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const completedCount = missions.filter(m => m.status === 'done').length;

  const refreshBadges = useCallback(async () => {
    if (!childProfileId) return;
    const ids = await fetchEarnedBadgeTypes(childProfileId);
    setEarnedBadgeIds(ids);
  }, [childProfileId]);

  const fetchMissions = useCallback(async () => {
    if (!childProfileId) return;
    const today = localDateString();
    const { data: mData, error } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('child_profile_id', childProfileId)
      .eq('mission_date', today)
      .maybeSingle();

    let dbMissions = mData;

    if (!dbMissions && !error) {
       const { data: newRow } = await supabase.from('daily_missions').upsert(
         { child_profile_id: childProfileId, mission_date: today },
         { onConflict: 'child_profile_id,mission_date' }
       ).select().single();
       dbMissions = newRow;
    }

    if (dbMissions) {
      const mapped: Mission[] = [
        { id: 'bg_logged', icon: 'pulse', title: 'Check your glucose', status: dbMissions.bg_logged ? 'done' : 'pending', screen: '/treatment/my-sugar', points: MISSION_POINTS.bg_logged },
        { id: 'medicine_confirmed', icon: 'medical', title: 'Take your insulin', status: dbMissions.medicine_confirmed ? 'done' : 'pending', screen: '/treatment/my-medicine', points: MISSION_POINTS.medicine_confirmed },
        { id: 'meal_logged', icon: 'nutrition', title: 'Log a meal', status: dbMissions.meal_logged ? 'done' : 'pending', screen: '/treatment/eat-smart', points: MISSION_POINTS.meal_logged },
        { id: 'activity_done', icon: 'play-circle', title: 'Move & Play', status: dbMissions.activity_done ? 'done' : 'pending', screen: '/treatment/move-play', points: MISSION_POINTS.activity_done },
        { id: 'video_watched', icon: 'videocam', title: 'Watch a Learn video', status: dbMissions.video_watched ? 'done' : 'pending', screen: '/learn', points: MISSION_POINTS.video_watched },
      ];
      setMissions(mapped);
    }
  }, [childProfileId]);

  useEffect(() => {
    fetchMissions();
    refreshBadges();
  }, [fetchMissions, refreshBadges]);

  useEffect(() => {
    if (!childProfileId) return;

    const badgesChannel = supabase
      .channel(`badges-${childProfileId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'badges_earned', filter: `child_profile_id=eq.${childProfileId}` },
        () => { refreshBadges(); }
      )
      .subscribe();

    const missionsChannel = supabase
      .channel(`missions-${childProfileId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_missions', filter: `child_profile_id=eq.${childProfileId}` },
        () => { fetchMissions(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(badgesChannel);
      supabase.removeChannel(missionsChannel);
    };
  }, [childProfileId, refreshBadges, fetchMissions]);

  const toggleMission = async (id: string) => {
    if (!childProfileId) return;
    const mission = missions.find(m => m.id === id);
    if (!mission || mission.status === 'done') return;

    await completeMissionField(childProfileId, id as keyof typeof MISSION_POINTS);
    addPoints(mission.points);
    await fetchMissions();
  };

  const awardBadge = async (badgeType: string) => {
    if (!childProfileId) return false;
    const ok = await awardBadgeDb(childProfileId, badgeType);
    if (ok) await refreshBadges();
    return ok;
  };

  return <MissionsContext.Provider value={{ missions, toggleMission, completedCount, earnedBadgeIds, awardBadge, refreshBadges }}>{children}</MissionsContext.Provider>;
}

// ─── Settings Context ─────────────────────────────────────────────────────────

const SettingsContext = createContext<{
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
}>({ settings: { language: 'english', fontSize: 'medium', sound: true, vibration: true, voice: false, colorblind: false }, updateSettings: () => {} });

function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({ language: 'english', fontSize: 'medium', sound: true, vibration: true, voice: false, colorblind: false });
  const updateSettings = (s: Partial<Settings>) => setSettings(prev => ({ ...prev, ...s }));
  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>;
}

// ─── Combined Provider ────────────────────────────────────────────────────────

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ChildProfileProvider>
        <GlucoseProvider>
          <MissionsProvider>
            <NotifProvider>
              <SettingsProvider>{children}</SettingsProvider>
            </NotifProvider>
          </MissionsProvider>
        </GlucoseProvider>
      </ChildProfileProvider>
    </AuthProvider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const useChildProfile = () => useContext(ChildProfileContext);
export const useGlucose = () => useContext(GlucoseContext);
export const useMissions = () => useContext(MissionsContext);
export const useNotifications = () => useContext(NotifContext);
export const useSettings = () => useContext(SettingsContext);
