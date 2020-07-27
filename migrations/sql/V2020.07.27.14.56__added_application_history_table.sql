DO
$$
BEGIN
    if NOT EXISTS(SELECT FROM pg_tables WHERE tablename   = 'application_history') THEN
            CREATE TABLE application_history (
                history_id serial NOT NULL,
                id int4 NOT NULL,
                guid uuid NOT NULL DEFAULT gen_random_uuid(),
                submission_date timestamptz NOT NULL DEFAULT now(),
                "json" jsonb NOT NULL,
                create_user varchar NOT NULL,
                create_timestamp timestamptz NOT NULL DEFAULT now(),
                update_user varchar NOT NULL,
                update_timestamp timestamptz NOT NULL DEFAULT now(),
                review_json jsonb NULL,
                submitter_ip varchar NULL,
                edit_notes varchar NULL,
                CONSTRAINT application_history_guid_key UNIQUE (guid),
                CONSTRAINT application_history_pkey PRIMARY KEY (history_id)
            );
            CREATE INDEX application_history_json_idx ON application_history USING gin (json);

            ALTER TABLE application_history ADD CONSTRAINT application_history_id_fkey FOREIGN KEY (id) REFERENCES application(id) DEFERRABLE INITIALLY DEFERRED;
    END IF;
END
$$;