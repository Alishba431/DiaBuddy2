-- Recreate daily_missions to store boolean fields instead of rows per mission
DROP TABLE IF EXISTS daily_missions;

CREATE TABLE daily_missions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  child_profile_id uuid REFERENCES child_profiles(id) ON DELETE CASCADE,
  mission_date date NOT NULL,
  bg_logged boolean DEFAULT false,
  medicine_confirmed boolean DEFAULT false,
  meal_logged boolean DEFAULT false,
  activity_done boolean DEFAULT false,
  video_watched boolean DEFAULT false,
  stars_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(child_profile_id, mission_date)
);

ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their children's missions" ON daily_missions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM child_profiles cp
      WHERE cp.id = daily_missions.child_profile_id
      AND cp.profile_id = auth.uid()
    )
  );

-- Also fix badges_earned if not done yet
CREATE UNIQUE INDEX IF NOT EXISTS badges_earned_child_profile_badge_type_idx ON badges_earned (child_profile_id, badge_type);
