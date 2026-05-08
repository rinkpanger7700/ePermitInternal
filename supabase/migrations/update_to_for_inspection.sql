-- Update the function to set 'For Inspection' instead of 'Inspection'
CREATE OR REPLACE FUNCTION update_app_stage_on_review() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Completed' THEN
    UPDATE applications SET current_stage = 'For Inspection' WHERE id = NEW.application_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Also rename any existing 'Inspection' to 'For Inspection'
UPDATE applications SET current_stage = 'For Inspection' WHERE current_stage = 'Inspection';
