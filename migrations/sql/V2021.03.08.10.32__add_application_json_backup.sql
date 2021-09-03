-- Create a backup of the "original" application JSON (as it exists at the time of this migration running).
ALTER TABLE application ADD COLUMN IF NOT EXISTS original_json jsonb;
UPDATE application SET original_json = json;
