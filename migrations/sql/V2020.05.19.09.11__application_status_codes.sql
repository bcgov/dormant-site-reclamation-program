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