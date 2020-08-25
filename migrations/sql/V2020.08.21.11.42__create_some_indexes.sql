CREATE INDEX ON contracted_work_payment_status_change (contracted_work_payment_id, change_timestamp desc);
CREATE INDEX ON application_status_change (application_guid, change_date desc);
CREATE INDEX ON contracted_work_payment (application_guid);
CREATE INDEX ON application_document (application_guid);
CREATE INDEX ON payment_document (application_guid);
CREATE INDEX ON application_history (application_id);
CREATE INDEX ON application USING GIN (review_json);