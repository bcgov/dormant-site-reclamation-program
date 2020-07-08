ALTER TABLE application
ADD COLUMN "json_backup" jsonb;

UPDATE application SET "json_backup" = "json";