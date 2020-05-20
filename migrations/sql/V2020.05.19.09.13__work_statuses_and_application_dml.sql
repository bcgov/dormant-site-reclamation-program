-- Transfer any existing application statuses to their new equivalent status values.
UPDATE application SET application_status_code = 'NOT_STARTED' WHERE application_status_code = 'SUBMITTED';
UPDATE application SET application_status_code = 'IN_PROGRESS' WHERE application_status_code = 'UNDER_REVIEW';
UPDATE application SET application_status_code = 'COMPLETE' WHERE application_status_code IN ('APPROVED', 'REJECTED');

-- Delete the old status values (rather than set active indicator) as they haven't made it into production.
DELETE FROM application_status WHERE application_status_code IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

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
