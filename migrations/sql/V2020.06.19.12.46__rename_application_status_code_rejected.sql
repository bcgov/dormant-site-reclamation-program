UPDATE application_status SET application_status_code = 'NOT_APPROVED' WHERE application_status_code = 'REJECTED';
UPDATE application_status SET description = 'Not Approved' WHERE application_status_code = 'NOT_APPROVED';
UPDATE application_status_change SET application_status_code = 'NOT_APPROVED' WHERE application_status_code = 'REJECTED';
