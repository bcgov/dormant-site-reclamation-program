UPDATE application_status
SET
	application_status_code = 'APPROVED',
	description = 'Approved',
	long_description = 'The application has been approved and is eligible to receive funding in the program.'
WHERE application_status_code = 'FIRST_PAY_APPROVED';

UPDATE application_status_change
SET application_status_code = 'APPROVED'
WHERE application_status_code = 'FIRST_PAY_APPROVED';
