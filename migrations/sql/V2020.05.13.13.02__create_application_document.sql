CREATE TABLE application_document (
    application_document_guid uuid DEFAULT gen_random_uuid() NOT NULL,
    application_guid uuid NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    document_name character varying(40) NOT NULL,
    document_manager_guid uuid NOT NULL,
    upload_date timestamp with time zone NOT NULL,

    FOREIGN KEY (application_guid) REFERENCES application(guid) DEFERRABLE INITIALLY DEFERRED
);


ALTER TABLE application_document OWNER TO dsrp;