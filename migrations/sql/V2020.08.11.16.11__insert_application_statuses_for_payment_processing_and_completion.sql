INSERT INTO application_status
	(
	application_status_code,
	description,
	long_description,
	create_user,
	update_user
	)
VALUES
	('INTERIM_AND_FINAL_PAY_PROCESSING', 'Processing Interim and Final Payments', 'The applicant is able to submit interim and final-phase payment documents and those documents are being processed for payment.', 'system', 'system'),
	('ALL_PAYMENTS_RECEIVED', 'All Payments Received', 'The applicant has received all of their approved payments.', 'system', 'system')
ON CONFLICT DO NOTHING;
