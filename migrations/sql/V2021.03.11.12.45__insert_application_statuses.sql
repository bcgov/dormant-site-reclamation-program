INSERT INTO application_status
    (
    application_status_code,
    description,
    long_description,
    create_user,
    update_user
    )
VALUES
    ('AMENDMENT_STARTED', 'Amendment Started', 'The application amendment process has started. The applicant must sign and upload their amended agreement document.' , 'system', 'system'),
    ('AMENDMENT_SUBMITTED', 'Amendment Submitted', 'Set automatically when the applicant uploads their amended agreement document and has indicated that they have finished uploading everything.', 'system', 'system')
ON CONFLICT DO NOTHING;
