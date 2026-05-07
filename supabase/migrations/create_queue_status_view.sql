-- ============================================================
-- View: applications_with_queue_status
-- Maps the applications table columns to the names expected
-- by the Regional Dashboard component.
--
--   applications column  →  view column
--   permit_no            →  reference_no
--   current_stage        →  status        (Current Stage in UI)
--   status               →  queue_status  (Queue Status badge in UI)
-- ============================================================

CREATE OR REPLACE VIEW applications_with_queue_status AS
SELECT
  id,
  permit_no        AS reference_no,
  applicant_name,
  project_name,
  current_stage    AS status,       -- "Current Stage" column in the dashboard
  priority,
  due_date,
  status           AS queue_status, -- "Status" badge column in the dashboard
  assigned_to,
  region,
  created_at,
  updated_at
FROM applications;

-- Grant read access to authenticated users (RLS on the base table still applies)
GRANT SELECT ON applications_with_queue_status TO authenticated;
