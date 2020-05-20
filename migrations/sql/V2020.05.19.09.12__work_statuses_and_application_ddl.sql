-- Change the new default application status.
ALTER TABLE application ALTER COLUMN application_status_code SET DEFAULT 'NOT_STARTED';

-- Add a new column for application review JSON.
ALTER TABLE application ADD COLUMN review_json jsonb;

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
