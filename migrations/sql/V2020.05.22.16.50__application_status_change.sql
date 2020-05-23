CREATE TABLE application_status_change (
    application_status_change_id     SERIAL PRIMARY KEY,
    application_guid                 uuid NOT NULL,
    application_status_code          varchar NOT NULL,
    change_date                      timestamp with time zone DEFAULT now() NOT NULL            ,
    note                             varchar                                NOT NULL            ,
    create_user                      varchar                                NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      varchar                                NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    
    FOREIGN KEY (application_guid) REFERENCES application(guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (application_status_code) REFERENCES application_status(application_status_code) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE application_status_change OWNER TO dsrp;

ALTER TABLE application drop column application_status_code;
ALTER TABLE application_status ADD COLUMN long_description varchar;


