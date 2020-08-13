UPDATE application_status
SET
	description = 'Approved',
	long_description = 'The application has been approved and is eligible to receive funding in the program.'
WHERE application_status_code = 'FIRST_PAY_APPROVED';