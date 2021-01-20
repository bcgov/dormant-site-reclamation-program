CREATE TABLE IF NOT EXISTS application_phase_type (
	application_phase_code varchar PRIMARY KEY,
	description varchar NOT NULL,
	create_user varchar NOT NULL,
	create_timestamp timestamp NOT NULL DEFAULT now(),
	update_user varchar NOT NULL,
	update_timestamp timestamp NOT NULL DEFAULT now()
);

ALTER TABLE application_phase_type OWNER TO dsrp;

INSERT INTO application_phase_type (
    application_phase_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('INITIAL', 'Initial', 'system', 'system'),
    ('NOMINATION', 'Nomination', 'system', 'system')
ON CONFLICT DO NOTHING;
