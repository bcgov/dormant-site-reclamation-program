CREATE TABLE IF NOT EXISTS application_history (
    history_id SERIAL PRIMARY KEY,
    id int4 NOT NULL,
    guid uuid NOT NULL DEFAULT gen_random_uuid(),
    "json" jsonb NOT NULL,
    create_user varchar NOT NULL,
    create_timestamp timestamptz NOT NULL DEFAULT now(),
    update_user varchar NOT NULL,
    update_timestamp timestamptz NOT NULL DEFAULT now(),
    review_json jsonb,
    edit_note varchar,
    CONSTRAINT application_history_guid_key UNIQUE (guid),
    FOREIGN KEY (id) REFERENCES application(id) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX application_history_json_idx ON application_history USING gin (json);
