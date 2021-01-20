ALTER TABLE application ADD COLUMN IF NOT EXISTS application_phase_code varchar REFERENCES application_phase_type(application_phase_code);

UPDATE application SET application_phase_code = 'INITIAL' WHERE application_phase_code IS NULL;

ALTER TABLE application ALTER COLUMN application_phase_code SET NOT NULL;
