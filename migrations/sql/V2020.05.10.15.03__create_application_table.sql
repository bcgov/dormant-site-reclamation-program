CREATE TABLE application_status (
    application_status_code          varchar                                NOT NULL PRIMARY KEY,
    description                      varchar                                NOT NULL            ,
    active                           boolean                  DEFAULT true  NOT NULL            ,
    create_user                      varchar                                NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      varchar                                NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE application_status OWNER TO dsrp;

INSERT INTO application_status(
    application_status_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('SUBMITTED', 'Submitted', 'system', 'system'),
    ('UNDER_REVIEW', 'Under Review', 'system', 'system'),
    ('APPROVED', 'Approved', 'system', 'system'),
    ('REJECTED', 'Rejected', 'system', 'system')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS application (
    id                                                               SERIAL PRIMARY KEY,
    guid                             uuid DEFAULT gen_random_uuid()     UNIQUE NOT NULL,
    application_status_code          varchar DEFAULT 'SUBMITTED'               NOT NULL,
    reference_number                 uuid DEFAULT gen_random_uuid()     UNIQUE NOT NULL,
	submission_date                  timestamp with time zone DEFAULT now()    NOT NULL,
	"json"                           jsonb                                     NOT NULL,
    create_user                      varchar                                   NOT NULL,
    create_timestamp                 timestamp with time zone DEFAULT now()    NOT NULL,
    update_user                      varchar                                   NOT NULL,
    update_timestamp                 timestamp with time zone DEFAULT now()    NOT NULL,

    FOREIGN KEY (application_status_code) REFERENCES application_status(application_status_code) DEFERRABLE INITIALLY DEFERRED

);

ALTER TABLE application OWNER TO dsrp;
