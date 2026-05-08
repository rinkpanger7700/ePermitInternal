-- Add email_address and applicant_name to the view
DROP VIEW IF EXISTS applications_with_queue_status CASCADE;
CREATE VIEW applications_with_queue_status AS
SELECT
  id,
  reference_no,
  company_name      AS applicant_name,
  email_address     AS applicant_email,
  project_name,
  project_location,
  current_stage     AS status,
  priority,
  due_date,
  status            AS queue_status,
  created_at,
  updated_at
FROM applications;

GRANT SELECT ON applications_with_queue_status TO authenticated;
