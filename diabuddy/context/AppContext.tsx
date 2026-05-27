import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockProfile, mockGlucoseReadings, mockMissions, characters } from '@/data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  role: 'child' | 'caretaker';
  childName: string;
  pin?: string;
  age?: number;
  character?: string;
  language?: string;
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

// ─── Auth Context ─────────────────────────────────────────────────────────────

const AuthContext = createContext<{
  currentUser: UserAccount | null;
  isLoading: boolean;
  login: (username: string, password: string, role: 'child' | 'caretaker', pin?: string) => Promise<boolean>;
  signup: (childName: string, username: string, password: string, age: number, character: string, pin: string, language?: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccounts: () => Promise<UserAccount[]>;
}>({
  currentUser: null,
  isLoading: true,
  login: async () => false,
  signup: async () => {},
  logout: async () => {},
  getAccounts: async () => [],
});

function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('diabuddy_current_user').then(raw => {
      if (raw) setCurrentUser(JSON.parse(raw));
      setIsLoading(false);
    });
  }, []);

  const getAccounts = async (): Promise<UserAccount[]> => {
    const raw = await AsyncStorage.getItem('diabuddy_accounts');
    return raw ? JSON.parse(raw) : [];
  };

  const login = async (username: string, password: string, role: 'child' | 'caretaker', pin?: string): Promise<boolean> => {
    const accounts = await getAccounts();
    const account = accounts.find(a => a.username.toLowerCase() === username.toLowerCase() && a.role === role);
    if (!account) return false;
    if (role === 'child' && account.password !== password) return false;
    if (role === 'caretaker' && account.pin !== pin) return false;
    await AsyncStorage.setItem('diabuddy_current_user', JSON.stringify(account));
    setCurrentUser(account);
    return true;
  };

  const signup = async (childName: string, username: string, password: string, age: number, character: string, pin: string, language = 'english') => {
    const accounts = await getAccounts();
    const id = Date.now().toString();
    const child: UserAccount = { id, username, password, role: 'child', childName, age, character, language };
    const caretaker: UserAccount = { id: id + '_c', username, password: '', role: 'caretaker', childName, pin, age };
    await AsyncStorage.setItem('diabuddy_accounts', JSON.stringify([...accounts, child, caretaker]));
    await AsyncStorage.setItem('diabuddy_current_user', JSON.stringify(child));
    setCurrentUser(child);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('diabuddy_current_user');
    setCurrentUser(null);
  };

  return <AuthContext.Provider value={{ currentUser, isLoading, login, signup, logout, getAccounts }}>{children}</AuthContext.Provider>;
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
  getCharacterEmoji: () => string;
}>({ profile: mockProfile, setProfile: () => {}, addPoints: () => {}, getCharacterEmoji: () => '🦁' });

function ChildProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ChildProfile>(mockProfile);
  const addPoints = (pts: number) => setProfile(p => ({ ...p, points: p.points + pts }));
  const getCharacterEmoji = () => characters.find(c => c.id === profile.character)?.emoji ?? '🦁';
  return <ChildProfileContext.Provider value={{ profile, setProfile, addPoints, getCharacterEmoji }}>{children}</ChildProfileContext.Provider>;
}

// ─── Glucose Context ──────────────────────────────────────────────────────────

const GlucoseContext = createContext<{
  readings: GlucoseReading[];
  addReading: (r: Omit<GlucoseReading, 'id'>) => void;
  lastReading: GlucoseReading | null;
  getZone: (val: number) => 'green' | 'yellow' | 'red_high' | 'red_low';
}>({ readings: mockGlucoseReadings, addReading: () => {}, lastReading: mockGlucoseReadings[mockGlucoseReadings.length - 1], getZone: () => 'green' });

function GlucoseProvider({ children }: { children: ReactNode }) {
  const [readings, setReadings] = useState<GlucoseReading[]>(mockGlucoseReadings);
  const addReading = (r: Omit<GlucoseReading, 'id'>) => setReadings(prev => [...prev, { ...r, id: Date.now().toString() }]);
  const lastReading = readings[readings.length - 1] ?? null;
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
  toggleMission: (id: string) => void;
  completedCount: number;
}>({ missions: mockMissions, toggleMission: () => {}, completedCount: 1 });

function MissionsProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const toggleMission = (id: string) =>
    setMissions(prev => prev.map(m => m.id === id ? { ...m, status: (m.status === 'done' ? 'pending' : 'done') as 'done' | 'pending' } : m));
  const completedCount = missions.filter(m => m.status === 'done').length;
  return <MissionsContext.Provider value={{ missions, toggleMission, completedCount }}>{children}</MissionsContext.Provider>;
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
