-- Create module tables
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  review_date DATE NOT NULL,
  evaluation_remarks TEXT,
  key_issues_observed TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  inspector_name TEXT NOT NULL,
  inspection_date DATE NOT NULL,
  findings TEXT,
  inspection_remarks TEXT,
  key_issues_observed TEXT,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  approver_name TEXT NOT NULL,
  resolution TEXT,
  remarks TEXT,
  e_signature TEXT,
  approval_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS releasing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  released_by TEXT NOT NULL,
  release_date DATE NOT NULL,
  tracking_no TEXT,
  delivery_method TEXT,
  status TEXT NOT NULL DEFAULT 'Ready',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE releasing ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Authenticated users can read reviews" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update reviews" ON reviews FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read inspections" ON inspections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update inspections" ON inspections FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert inspections" ON inspections FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read approvals" ON approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update approvals" ON approvals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert approvals" ON approvals FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read releasing" ON releasing FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update releasing" ON releasing FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert releasing" ON releasing FOR INSERT TO authenticated WITH CHECK (true);

-- Triggers to update `applications.current_stage`
CREATE OR REPLACE FUNCTION update_app_stage_on_review() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Completed' THEN
    UPDATE applications SET current_stage = 'Inspection' WHERE id = NEW.application_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stage_review
AFTER UPDATE OF status ON reviews
FOR EACH ROW EXECUTE FUNCTION update_app_stage_on_review();

CREATE OR REPLACE FUNCTION update_app_stage_on_inspection() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Completed' THEN
    UPDATE applications SET current_stage = 'For Approval' WHERE id = NEW.application_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stage_inspection
AFTER UPDATE OF status ON inspections
FOR EACH ROW EXECUTE FUNCTION update_app_stage_on_inspection();

CREATE OR REPLACE FUNCTION update_app_stage_on_approval() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Approved' THEN
    UPDATE applications SET current_stage = 'Ready for Release' WHERE id = NEW.application_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stage_approval
AFTER UPDATE OF status ON approvals
FOR EACH ROW EXECUTE FUNCTION update_app_stage_on_approval();

CREATE OR REPLACE FUNCTION update_app_stage_on_releasing() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Released' THEN
    UPDATE applications SET current_stage = 'Released' WHERE id = NEW.application_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stage_releasing
AFTER UPDATE OF status ON releasing
FOR EACH ROW EXECUTE FUNCTION update_app_stage_on_releasing();

-- Seed mock data using DO block to fetch application IDs
DO $$
DECLARE
  app_412 UUID;
  app_408 UUID;
  app_415 UUID;
  app_407 UUID;
  app_418 UUID;
  app_419 UUID;
BEGIN
  SELECT id INTO app_412 FROM applications_with_queue_status WHERE reference_no = 'DP-2026-0412';
  SELECT id INTO app_408 FROM applications_with_queue_status WHERE reference_no = 'DP-2026-0408';
  SELECT id INTO app_415 FROM applications_with_queue_status WHERE reference_no = 'DP-2026-0415';
  SELECT id INTO app_407 FROM applications_with_queue_status WHERE reference_no = 'DP-2026-0407';
  SELECT id INTO app_418 FROM applications_with_queue_status WHERE reference_no = 'DP-2026-0418';
  SELECT id INTO app_419 FROM applications_with_queue_status WHERE reference_no = 'DP-2026-0419';

  -- Seed reviews
  IF app_412 IS NOT NULL THEN
    INSERT INTO reviews (application_id, reviewer_name, review_date, evaluation_remarks, status) 
    VALUES (app_412, 'Maria Reyes', '2026-04-10', 'Initial intake verified. Documents are complete.', 'Completed');
  END IF;

  IF app_408 IS NOT NULL THEN
    INSERT INTO reviews (application_id, reviewer_name, review_date, evaluation_remarks, status) 
    VALUES (app_408, 'Juan Dela Cruz', '2026-04-12', 'Payment verified successfully.', 'Completed');
  END IF;

  -- Seed inspections
  IF app_415 IS NOT NULL THEN
    INSERT INTO inspections (application_id, inspector_name, inspection_date, findings, inspection_remarks, key_issues_observed, status)
    VALUES (app_415, 'Engr. Smith', '2026-05-05', 'Site boundaries match the submitted plan.', 'Site visit completed with no major issues.', 'None observed', 'Completed');
  END IF;

END $$;
