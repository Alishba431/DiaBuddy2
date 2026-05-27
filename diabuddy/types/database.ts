export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enums ────────────────────────────────────────────────────────────────────

export type DmType = 'T1DM' | 'T2DM';

export type CharacterType = 'lion' | 'robot' | 'panda';

export type LanguageType = 'en' | 'ur' | 'roman_ur';

export type BgTag =
  | 'fasting'
  | 'after_meal'
  | 'before_bed'
  | 'after_exercise'
  | 'pre_snack'
  | 'post_meal'
  | 'before_snack';

export type BgZone =
  | 'critical_low'
  | 'low'
  | 'normal'
  | 'high'
  | 'critical_high';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type AlertType =
  | 'low_glucose'
  | 'high_glucose'
  | 'insulin_morning'
  | 'insulin_evening'
  | 'snack_reminder'
  | 'exercise_reminder'
  | 'hypo'
  | 'hyper'
  | 'missed_dose'
  | 'hba1c';

export type BadgeType =
  | 'first_log'
  | 'streak_3'
  | 'quiz_master'
  | 'veggie_hero'
  | 'streak_7'
  | 'insulin_hero'
  | 'sugar_detective'
  | 'move_champion';

export type UserRole = 'child' | 'caregiver';

export type InsulinLogStatus = 'taken' | 'due' | 'missed';

export type MissionStatus = 'done' | 'pending';

export type FoodCategory = 'everyday' | 'sometimes';

export type PushPlatform = 'ios' | 'android' | 'web';

export type FontSize = 'small' | 'medium' | 'large';

// ─── Row types ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  username: string;
  role: UserRole;
  created_at: string;
}

export interface ChildProfile {
  id: string;
  profile_id: string;
  child_username: string;
  display_name: string;
  age: number;
  dm_type: DmType;
  character_choice: CharacterType;
  language: LanguageType;
  show_numeric_bg: boolean;
  target_bg_min: number;
  target_bg_max: number;
  bg_review_days: number;
  hba1c_review_days: number;
  created_at: string;
}

export interface CaregiverAccount {
  id: string;
  profile_id: string;
  child_profile_id: string;
  dashboard_pin: string;
  relationship: string;
  notify_critical: boolean;
  notify_missed_doses: boolean;
  notify_low_adherence: boolean;
  notify_weekly_report: boolean;
  created_at: string;
}

export interface GlucoseReading {
  id: string;
  child_profile_id: string;
  value_mg_dl: number;
  bg_tag: BgTag;
  /** Read-only computed column in Postgres */
  bg_zone: BgZone;
  notes: string | null;
  recorded_at: string;
  created_at: string;
}

export interface InsulinSchedule {
  id: string;
  child_profile_id: string;
  label: string;
  scheduled_time: string;
  dose_units: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InsulinLog {
  id: string;
  child_profile_id: string;
  schedule_id: string | null;
  label: string;
  dose_units: number;
  status: InsulinLogStatus;
  scheduled_at: string;
  logged_at: string | null;
  created_at: string;
}

export interface Alert {
  id: string;
  child_profile_id: string;
  alert_type: AlertType;
  title: string;
  body: string | null;
  glucose_value_mg_dl: number | null;
  is_read: boolean;
  created_at: string;
}

export interface PushToken {
  id: string;
  profile_id: string;
  token: string;
  platform: PushPlatform;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  profile_id: string;
  low_sugar_alert: boolean;
  high_sugar_alert: boolean;
  insulin_morning: boolean;
  insulin_morning_time: string;
  insulin_evening: boolean;
  insulin_evening_time: string;
  snack_reminder: boolean;
  snack_time: string;
  exercise_reminder: boolean;
  exercise_time: string;
  sound: boolean;
  vibration: boolean;
  low_threshold: number;
  high_threshold: number;
  hba1c_reminder_days: number;
  updated_at: string;
}

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  carbs_g: number;
  category: FoodCategory;
  is_system: boolean;
  created_at: string;
}

export interface MealLog {
  id: string;
  child_profile_id: string;
  meal_type: MealType;
  food_names: string[];
  logged_at: string;
  pre_glucose_mg_dl: number | null;
  post_glucose_mg_dl: number | null;
  created_at: string;
}

export interface DailyMission {
  id: string;
  child_profile_id: string;
  mission_date: string;
  icon: string;
  title: string;
  status: MissionStatus;
  screen_path: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface RewardTotals {
  child_profile_id: string;
  total_points: number;
  level: number;
  streak_days: number;
  updated_at: string;
}

export interface BadgeEarned {
  id: string;
  child_profile_id: string;
  badge_type: BadgeType;
  earned_at: string;
}

export interface AiReport {
  id: string;
  child_profile_id: string;
  report_period_start: string;
  report_period_end: string;
  summary: string;
  recommendations: Json;
  generated_at: string;
}

export interface MlPrediction {
  id: string;
  child_profile_id: string;
  prediction_type: string;
  predicted_value: number | null;
  confidence: number | null;
  features: Json;
  created_at: string;
}

// ─── Insert types (omit generated / default columns) ──────────────────────────

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type ChildProfileInsert = Omit<ChildProfile, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type CaregiverAccountInsert = Omit<CaregiverAccount, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type GlucoseReadingInsert = Omit<GlucoseReading, 'id' | 'bg_zone' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type InsulinScheduleInsert = Omit<InsulinSchedule, 'id' | 'is_active' | 'created_at' | 'updated_at'> & {
  id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type InsulinLogInsert = Omit<InsulinLog, 'id' | 'logged_at' | 'created_at'> & {
  id?: string;
  logged_at?: string | null;
  created_at?: string;
};

export type AlertInsert = Omit<Alert, 'id' | 'is_read' | 'created_at'> & {
  id?: string;
  is_read?: boolean;
  created_at?: string;
};

export type PushTokenInsert = Omit<PushToken, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type NotificationPreferencesInsert = Omit<NotificationPreferences, 'updated_at'> & {
  updated_at?: string;
};

export type FoodItemInsert = Omit<FoodItem, 'id' | 'is_system' | 'created_at'> & {
  id?: string;
  is_system?: boolean;
  created_at?: string;
};

export type MealLogInsert = Omit<MealLog, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type DailyMissionInsert = Omit<DailyMission, 'id' | 'status' | 'created_at' | 'updated_at'> & {
  id?: string;
  status?: MissionStatus;
  created_at?: string;
  updated_at?: string;
};

export type RewardTotalsInsert = Omit<RewardTotals, 'updated_at'> & {
  updated_at?: string;
};

export type BadgeEarnedInsert = Omit<BadgeEarned, 'id' | 'earned_at'> & {
  id?: string;
  earned_at?: string;
};

export type AiReportInsert = Omit<AiReport, 'id' | 'generated_at'> & {
  id?: string;
  generated_at?: string;
};

export type MlPredictionInsert = Omit<MlPrediction, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

// ─── Update types (all fields optional except PK where required) ──────────────

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;

export type ChildProfileUpdate = Partial<Omit<ChildProfile, 'id' | 'user_id' | 'created_at'>>;

export type CaregiverAccountUpdate = Partial<Omit<CaregiverAccount, 'id' | 'created_at'>>;

export type GlucoseReadingUpdate = Partial<
  Omit<GlucoseReading, 'id' | 'child_profile_id' | 'bg_zone' | 'created_at'>
>;

export type InsulinScheduleUpdate = Partial<Omit<InsulinSchedule, 'id' | 'child_profile_id' | 'created_at'>>;

export type InsulinLogUpdate = Partial<Omit<InsulinLog, 'id' | 'child_profile_id' | 'created_at'>>;

export type AlertUpdate = Partial<Omit<Alert, 'id' | 'child_profile_id' | 'created_at'>>;

export type PushTokenUpdate = Partial<Omit<PushToken, 'id' | 'profile_id' | 'created_at'>>;

export type NotificationPreferencesUpdate = Partial<
  Omit<NotificationPreferences, 'profile_id'>
>;

export type FoodItemUpdate = Partial<Omit<FoodItem, 'id' | 'created_at'>>;

export type MealLogUpdate = Partial<Omit<MealLog, 'id' | 'child_profile_id' | 'created_at'>>;

export type DailyMissionUpdate = Partial<Omit<DailyMission, 'id' | 'child_profile_id' | 'created_at'>>;

export type RewardTotalsUpdate = Partial<Omit<RewardTotals, 'child_profile_id'>>;

export type BadgeEarnedUpdate = Partial<Omit<BadgeEarned, 'id' | 'child_profile_id' | 'earned_at'>>;

export type AiReportUpdate = Partial<Omit<AiReport, 'id' | 'child_profile_id' | 'generated_at'>>;

export type MlPredictionUpdate = Partial<Omit<MlPrediction, 'id' | 'child_profile_id' | 'created_at'>>;

// ─── Supabase Database generic (for typed client) ─────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      child_profiles: {
        Row: ChildProfile;
        Insert: ChildProfileInsert;
        Update: ChildProfileUpdate;
        Relationships: [
          {
            foreignKeyName: 'child_profiles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      caregiver_accounts: {
        Row: CaregiverAccount;
        Insert: CaregiverAccountInsert;
        Update: CaregiverAccountUpdate;
        Relationships: [
          {
            foreignKeyName: 'caregiver_accounts_child_profile_id_fkey';
            columns: ['child_profile_id'];
            isOneToOne: false;
            referencedRelation: 'child_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'caregiver_accounts_caregiver_profile_id_fkey';
            columns: ['caregiver_profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      glucose_readings: {
        Row: GlucoseReading;
        Insert: GlucoseReadingInsert;
        Update: GlucoseReadingUpdate;
        Relationships: [
          {
            foreignKeyName: 'glucose_readings_child_profile_id_fkey';
            columns: ['child_profile_id'];
            isOneToOne: false;
            referencedRelation: 'child_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      insulin_schedules: {
        Row: InsulinSchedule;
        Insert: InsulinScheduleInsert;
        Update: InsulinScheduleUpdate;
        Relationships: [
          {
            foreignKeyName: 'insulin_schedules_child_profile_id_fkey';
            columns: ['child_profile_id'];
            isOneToOne: false;
            referencedRelation: 'child_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      insulin_logs: {
        Row: InsulinLog;
        Insert: InsulinLogInsert;
        Update: InsulinLogUpdate;
        Relationships: [
          {
            foreignKeyName: 'insulin_logs_child_profile_id_fkey';
            columns: ['child_profile_id'];
            isOneToOne: false;
            referencedRelation: 'child_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'insulin_logs_schedule_id_fkey';
            columns: ['schedule_id'];
            isOneToOne: false;
            referencedRelation: 'insulin_schedules';
            referencedColumns: ['id'];
          },
        ];
      };
      alerts: {
        Row: Alert;
        Insert: AlertInsert;
        Update: AlertUpdate;
        Relationships: [
          {
            foreignKeyName: 'alerts_child_profile_id_fkey';
            columns: ['child_profile_id'];
            isOneToOne: false;
            referencedRelation: 'child_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      push_tokens: {
        Row: PushToken;
        Insert: PushTokenInsert;
        Update: PushTokenUpdate;
        Relationships: [
          {
            foreignKeyName: 'push_tokens_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      notification_preferences: {
        Row: NotificationPreferences;
        Insert: NotificationPreferencesInsert;
        Update: NotificationPreferencesUpdate;
        Relationships: [
          {
            foreignKeyName: 'notification_preferences_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      food_items: {
        Row: FoodItem;
        Insert: FoodItemInsert;
        Update: FoodItemUpdate;
        Relationships: [];
      };
      meal_logs: {
        Row: MealLog;
        Insert: MealLogInsert;
        Update: MealLogUpdate;
        Relationships: [
          {
            foreignKeyName: 'meal_logs_child_profile_id_fkey';
            columns: ['child_profile_id'];
            isOneToOne: false;
            referencedRelation: 'child_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      daily_missions: {
        Row: DailyMission;
        Insert: DailyMissionInsert;
        Update: DailyMissionUpdate;
        Relationships: [
          {
            foreignKeyName: 'daily_missions_child_profile_id_fkey';
            columns: ['child_profile_id'];
            isOneToOne: false;
            referencedRelation: 'child_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      reward_totals: {
        Row: RewardTotals;
        Insert: RewardTotalsInsert;
        Update: RewardTotalsUpdate;
        Relationships: [
          {
            foreignKeyName: 'reward_totals_child_profile_id_fkey';
            columns: ['child_profile_id'];
            isOneToOne: true;
            referencedRelation: 'child_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      badges_earned: {
        Row: BadgeEarned;
        Insert: BadgeEarnedInsert;
        Update: BadgeEarnedUpdate;
        Relationships: [
          {
            foreignKeyName: 'badges_earned_child_profile_id_fkey';
            columns: ['child_profile_id'];
            isOneToOne: false;
            referencedRelation: 'child_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_reports: {
        Row: AiReport;
        Insert: AiReportInsert;
        Update: AiReportUpdate;
        Relationships: [
          {
            foreignKeyName: 'ai_reports_child_profile_id_fkey';
            columns: ['child_profile_id'];
            isOneToOne: false;
            referencedRelation: 'child_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      ml_predictions: {
        Row: MlPrediction;
        Insert: MlPredictionInsert;
        Update: MlPredictionUpdate;
        Relationships: [
          {
            foreignKeyName: 'ml_predictions_child_profile_id_fkey';
            columns: ['child_profile_id'];
            isOneToOne: false;
            referencedRelation: 'child_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      dm_type: DmType;
      character_type: CharacterType;
      language_type: LanguageType;
      bg_tag: BgTag;
      bg_zone: BgZone;
      meal_type: MealType;
      alert_type: AlertType;
      badge_type: BadgeType;
      user_role: UserRole;
      insulin_log_status: InsulinLogStatus;
      mission_status: MissionStatus;
      food_category: FoodCategory;
      push_platform: PushPlatform;
      font_size: FontSize;
    };
    CompositeTypes: Record<string, never>;
  };
}

// ─── Convenience aliases ────────────────────────────────────────────────────────

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
