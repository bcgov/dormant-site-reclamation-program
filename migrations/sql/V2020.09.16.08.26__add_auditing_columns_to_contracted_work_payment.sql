ALTER TABLE contracted_work_payment
ADD COLUMN IF NOT EXISTS audit_ind boolean,
ADD COLUMN IF NOT EXISTS audit_user varchar,
ADD COLUMN IF NOT EXISTS audit_timestamp timestamp;
