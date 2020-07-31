CREATE TABLE IF NOT EXISTS payment_document_type (
	payment_document_code varchar NOT NULL,
	description varchar NOT NULL,
	active bool NOT NULL DEFAULT true,
	create_user varchar NOT NULL,
	create_timestamp timestamptz NOT NULL DEFAULT now(),
	update_user varchar NOT NULL,
	update_timestamp timestamptz NOT NULL DEFAULT now(),
	long_description varchar,
	CONSTRAINT payment_document_pkey PRIMARY KEY (payment_document_code)
);

ALTER TABLE payment_document_type OWNER TO dsrp;

INSERT INTO payment_document_type(
    payment_document_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('FIRST_PRF', 'First payment request form', 'system', 'system'),
    ('INTERIM_PRF', 'Interim payment request form', 'system', 'system'),
    ('FINAL_PRF', 'Final payment request form', 'system', 'system')
ON CONFLICT DO NOTHING;


CREATE TABLE IF NOT EXISTS payment_document (
	document_guid uuid NOT NULL DEFAULT gen_random_uuid(),
	application_guid uuid NOT NULL,
	active_ind bool NOT NULL DEFAULT true,
	create_user varchar(60) NOT NULL,
	create_timestamp timestamptz NOT NULL DEFAULT now(),
	update_user varchar(60) NOT NULL,
	update_timestamp timestamptz NOT NULL DEFAULT now(),
	document_name varchar NOT NULL,
	document_manager_guid uuid,
	upload_date timestamptz NOT NULL,
	object_store_path varchar,
	payment_document_type_code varchar NOT NULL,
    FOREIGN KEY (application_guid) REFERENCES application(guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (payment_document_type_code) REFERENCES payment_document_type(payment_document_code) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE payment_document OWNER TO dsrp;