CREATE TABLE dsrp_settings (
    id                               SERIAL PRIMARY KEY,
    setting                          varchar NOT NULL  ,
    setting_value                    boolean DEFAULT false NOT NULL  ,
    create_user                      varchar                                NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      varchar                                NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL   
);

ALTER TABLE dsrp_settings OWNER TO dsrp;

INSERT INTO dsrp_settings(
    setting,
    setting_value,
    create_user,
    update_user
    )
VALUES
    ('disable_applications', False, 'system', 'system')
ON CONFLICT DO NOTHING;