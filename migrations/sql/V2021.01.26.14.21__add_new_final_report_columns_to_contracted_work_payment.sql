ALTER TABLE contracted_work_payment
ADD COLUMN IF NOT EXISTS abandonment_downhole_completed boolean,
ADD COLUMN IF NOT EXISTS abandonment_equipment_decommissioning_completed boolean;
