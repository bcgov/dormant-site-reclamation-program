CREATE TABLE IF NOT EXISTS application_history (
    history_id SERIAL PRIMARY KEY,
    application_id int4 NOT NULL,
    "json" jsonb NOT NULL,
    edit_note varchar,
    create_user varchar NOT NULL,
    create_timestamp timestamptz NOT NULL DEFAULT now(),
    update_user varchar NOT NULL,
    update_timestamp timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (application_id) REFERENCES application(id) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX application_history_json_idx ON application_history USING gin (json);
