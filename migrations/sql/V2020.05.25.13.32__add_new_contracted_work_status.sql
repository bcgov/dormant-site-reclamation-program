-- Add the contracted work status codes.
INSERT INTO contracted_work_status (
    contracted_work_status_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('WITHDRAWN','Withdrawn', 'system', 'system')
ON CONFLICT DO NOTHING;