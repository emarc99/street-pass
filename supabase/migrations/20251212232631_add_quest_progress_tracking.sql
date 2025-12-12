/*
  # Add Quest Progress Tracking

  This migration adds automatic quest progress tracking functionality.

  ## Changes
  
  1. Functions
    - `update_quest_progress`: Automatically updates user quest progress when they check in
    - Creates user_quest entries for new users when quests are available
    
  2. Triggers
    - Trigger on check_ins table to update quest progress
    
  3. Notes
    - Progress is tracked automatically based on quest requirements
    - Quests are marked as completed when progress reaches requirement count
*/

-- Function to update quest progress when user checks in
CREATE OR REPLACE FUNCTION update_quest_progress()
RETURNS TRIGGER AS $$
DECLARE
  quest_record RECORD;
  location_category text;
  progress_count integer;
BEGIN
  -- Get the location category
  SELECT category INTO location_category
  FROM locations
  WHERE id = NEW.location_id;

  -- Loop through all active quests
  FOR quest_record IN 
    SELECT q.*, uq.id as user_quest_id, uq.progress, uq.status
    FROM quests q
    LEFT JOIN user_quests uq ON uq.quest_id = q.id AND uq.user_id = NEW.user_id
    WHERE q.active_until > NOW()
    AND q.active_from <= NOW()
  LOOP
    -- Create user_quest if it doesn't exist
    IF quest_record.user_quest_id IS NULL THEN
      INSERT INTO user_quests (user_id, quest_id, progress, status)
      VALUES (NEW.user_id, quest_record.id, 0, 'active')
      RETURNING id, progress, status INTO quest_record.user_quest_id, quest_record.progress, quest_record.status;
    END IF;

    -- Skip if already completed
    IF quest_record.status = 'completed' THEN
      CONTINUE;
    END IF;

    -- Update progress based on quest type
    IF quest_record.quest_type = 'visit_count' THEN
      -- Count total check-ins for this user
      SELECT COUNT(*) INTO progress_count
      FROM check_ins
      WHERE user_id = NEW.user_id
      AND timestamp >= quest_record.active_from;

      UPDATE user_quests
      SET progress = progress_count,
          status = CASE 
            WHEN progress_count >= (quest_record.requirements->>'count')::integer THEN 'completed'
            ELSE 'active'
          END,
          completed_at = CASE
            WHEN progress_count >= (quest_record.requirements->>'count')::integer THEN NOW()
            ELSE NULL
          END
      WHERE id = quest_record.user_quest_id;

    ELSIF quest_record.quest_type = 'visit_category' THEN
      -- Count check-ins for specific category
      SELECT COUNT(*) INTO progress_count
      FROM check_ins ci
      JOIN locations l ON l.id = ci.location_id
      WHERE ci.user_id = NEW.user_id
      AND l.category = (quest_record.requirements->>'category')
      AND ci.timestamp >= quest_record.active_from;

      UPDATE user_quests
      SET progress = progress_count,
          status = CASE 
            WHEN progress_count >= (quest_record.requirements->>'count')::integer THEN 'completed'
            ELSE 'active'
          END,
          completed_at = CASE
            WHEN progress_count >= (quest_record.requirements->>'count')::integer THEN NOW()
            ELSE NULL
          END
      WHERE id = quest_record.user_quest_id;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update quest progress after check-in
DROP TRIGGER IF EXISTS trigger_update_quest_progress ON check_ins;
CREATE TRIGGER trigger_update_quest_progress
  AFTER INSERT ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION update_quest_progress();