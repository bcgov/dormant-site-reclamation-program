
INSERT INTO application_status(
    application_status_code,
    description,
    long_description,
    create_user,
    update_user
    )
VALUES
    ('NOT_STARTED','Not Started','Application has been received but nobody has looked at it yet','system','system'),
    ('IN_PROGRESS','In Progress','Application is being reviewed by branch','system','system'),
    ('WAIT_FOR_DOCS','Waiting for Documents','Application has been reviewed and some or all of the work has been approved. Applicant needs to send in required documents' ,'system','system'),
    ('DOC_SUBMITTED','Documents Submitted','Set automatically when the applicant uploads their files and confirms that they have attached everything','system','system'),
    ('FIRST_PAY_APPROVED','First Payment Approved ', 'the application is complete enough to satisfy the requirements for increment 1 and payment can be processed by Finance','system','system'),
    ('REJECTED','Rejected','Application has been rejected in its entirety (unqualified applicant, duplicate work for every site etc)' ,'system','system'),
    ('WITHDRAWN','Withdrawn','set by admin to indicate that the applicant no longer wants to the application in the system','system','system')
ON CONFLICT DO NOTHING;

