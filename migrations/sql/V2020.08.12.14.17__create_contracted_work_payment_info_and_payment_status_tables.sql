CREATE TABLE IF NOT EXISTS contracted_work_payment_status
(
    contracted_work_payment_status_code varchar PRIMARY KEY,
    description varchar NOT NULL,
    long_description varchar NOT NULL,

    active boolean DEFAULT true NOT NULL,

    create_user varchar NOT NULL,
    create_timestamp timestamp NOT NULL DEFAULT now(),
    update_user varchar NOT NULL,
    update_timestamp timestamp NOT NULL DEFAULT now()
);

ALTER TABLE contracted_work_payment_status OWNER TO dsrp;

INSERT INTO contracted_work_payment_status (
    contracted_work_payment_status_code,
    description,
    long_description,
    create_user,
    update_user
)
VALUES 
    ('INFORMATION_REQUIRED', 'Information Required', 'The applicant is able to edit and provide information for this work item in order for it to be reviewed by an admin.', 'system', 'system'),
    ('READY_FOR_REVIEW', 'Ready for Review', 'The applicant has indicated that they have provided all required information and that this work item is ready to be reviewed by an admin.', 'system', 'system'),
    ('UNDER_REVIEW', 'Under Review', 'The admin has indicated that they have begun reviewing the provided information on the work item.', 'system', 'system'),
    ('APPROVED', 'Approved', 'The admin has indicated that the work item was approved and a payment request form was sent to Finance.', 'system', 'system')    
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS contracted_work_payment
(
    contracted_work_payment_id SERIAL PRIMARY KEY,
    application_guid uuid NOT NULL,
    work_id varchar NOT NULL UNIQUE,

    interim_actual_cost numeric(14, 2),
    final_actual_cost numeric(14, 2),

    interim_paid_amount numeric(14, 2),
    final_paid_amount numeric(14, 2),

    interim_total_hours_worked_to_date integer,
    final_total_hours_worked_to_date integer,

    interim_number_of_workers integer,
    final_number_of_workers integer,
    
    interim_eoc_application_document_guid uuid UNIQUE,
    final_eoc_application_document_guid uuid UNIQUE,

    interim_report varchar,
    final_report_application_document_guid uuid UNIQUE,

    work_completion_date date,

    create_user varchar NOT NULL,
    create_timestamp timestamp NOT NULL DEFAULT now(),
    update_user varchar NOT NULL,
    update_timestamp timestamp NOT NULL DEFAULT now(),

    FOREIGN KEY (application_guid) REFERENCES application(guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (interim_eoc_application_document_guid) REFERENCES application_document(application_document_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (final_eoc_application_document_guid) REFERENCES application_document(application_document_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (final_report_application_document_guid) REFERENCES application_document(application_document_guid) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE contracted_work_payment OWNER TO dsrp;

CREATE TABLE IF NOT EXISTS contracted_work_payment_type
(
    contracted_work_payment_code varchar PRIMARY KEY,
    description varchar NOT NULL,

    create_user varchar NOT NULL,
    create_timestamp timestamp NOT NULL DEFAULT now(),
    update_user varchar NOT NULL,
    update_timestamp timestamp NOT NULL DEFAULT now()
);

ALTER TABLE contracted_work_payment_type OWNER TO dsrp;

INSERT INTO contracted_work_payment_type (
    contracted_work_payment_code,
    create_user,
    update_user
)
VALUES 
    ('INTERIM', 'Interim', 'system', 'system'),
    ('FINAL', 'Final', 'system', 'system')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS contracted_work_payment_status_change
(
    contracted_work_payment_status_change_id SERIAL PRIMARY KEY,
    contracted_work_payment_id integer NOT NULL,
    contracted_work_payment_status_code varchar NOT NULL,
    contracted_work_payment_code varchar NOT NULL,
    change_timestamp timestamp NOT NULL DEFAULT now(),
    note varchar,

    create_user varchar NOT NULL,
    create_timestamp timestamp NOT NULL DEFAULT now(),
    update_user varchar NOT NULL,
    update_timestamp timestamp NOT NULL DEFAULT now(),

    FOREIGN KEY (contracted_work_payment_id) REFERENCES contracted_work_payment(contracted_work_payment_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (contracted_work_payment_status_code) REFERENCES contracted_work_payment_status(contracted_work_payment_status_code) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (contracted_work_payment_code) REFERENCES contracted_work_payment_type(contracted_work_payment_code) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE contracted_work_payment_status_change OWNER TO dsrp;
