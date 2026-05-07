-- Create the applications table for ePermits Internal Portal
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  permit_no TEXT NOT NULL UNIQUE,
  applicant_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  current_stage TEXT NOT NULL DEFAULT 'Initial Review',
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Overdue', 'Due Today', 'Due Soon', 'Pending')),
  assigned_to UUID REFERENCES auth.users(id),
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can read all applications
CREATE POLICY "Authenticated users can read applications"
  ON applications FOR SELECT
  TO authenticated
  USING (true);

-- Policy: authenticated users can update applications
CREATE POLICY "Authenticated users can update applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (true);

-- Insert sample data matching the screenshot
INSERT INTO applications (permit_no, applicant_name, project_name, current_stage, priority, due_date, status) VALUES
  ('DP-2026-0412', 'ABC Builders Inc.', 'ABC Residences', 'Evaluation', 'High', '2026-04-13', 'Overdue'),
  ('DP-2026-0408', 'Prime Land Development Corp.', 'Prime Heights', 'Payment Verification', 'High', '2026-04-15', 'Overdue'),
  ('DP-2026-0415', 'Green Valley Properties Inc.', 'Green Valley', 'Evaluation', 'Medium', '2026-05-07', 'Due Today'),
  ('DP-2026-0407', 'Sunset Homes Corp.', 'Sunset Villas', 'Initial Review', 'Medium', '2026-05-08', 'Due Soon'),
  ('DP-2026-0418', 'Riverside Developments Inc.', 'Riverside Tower', 'Evaluation', 'Low', '2026-05-12', 'Pending'),
  ('DP-2026-0419', 'Maple Grove Realty Co.', 'Maple Grove', 'Payment Verification', 'Low', '2026-05-14', 'Pending');
