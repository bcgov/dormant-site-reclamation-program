-- Add the new application status codes.
INSERT INTO application_status (
    application_status_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('NOT_STARTED', 'Not Started', 'system', 'system'),
    ('IN_PROGRESS', 'In Progress', 'system', 'system'),
    ('COMPLETE', 'Complete', 'system', 'system')
ON CONFLICT DO NOTHING;

-- Change the new default application status.
ALTER TABLE application ALTER COLUMN application_status_code SET DEFAULT 'NOT_STARTED';

-- Transfer any existing application statuses to their new equivalent status values.
UPDATE application SET application_status_code = 'NOT_STARTED' WHERE application_status_code = 'SUBMITTED';
UPDATE application SET application_status_code = 'IN_PROGRESS' WHERE application_status_code = 'UNDER_REVIEW';
UPDATE application SET application_status_code = 'COMPLETE' WHERE application_status_code IN ('APPROVED', 'REJECTED');

-- Delete the old status values (rather than set active indicator) as they haven't made it into production.
DELETE FROM application_status WHERE application_status_code IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- Create the contracted work status code table.
CREATE TABLE contracted_work_status (
    contracted_work_status_code            varchar                                NOT NULL PRIMARY KEY,
    description                      varchar                                NOT NULL            ,
    active                           boolean                  DEFAULT true  NOT NULL            ,
    create_user                      varchar                                NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      varchar                                NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE contracted_work_status OWNER TO dsrp;

-- Add the contracted work status codes.
INSERT INTO contracted_work_status (
    contracted_work_status_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('NOT_STARTED', 'Not Started', 'system', 'system'),
    ('IN_PROGRESS', 'In Progress', 'system', 'system'),
    ('APPROVED', 'Approved', 'system', 'system'),
    ('REJECTED', 'Rejected', 'system', 'system')
ON CONFLICT DO NOTHING;

-- Add a new column for application review JSON.
-- ALTER TABLE application ADD COLUMN review_json jsonb;
