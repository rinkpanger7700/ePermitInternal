-- Update all trigger functions to use SECURITY DEFINER
-- This ensures they bypass any Row Level Security (RLS) restrictions 
-- and successfully update the applications table.

CREATE OR REPLACE FUNCTION update_app_stage_on_review() RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'Completed' THEN
    UPDATE applications SET current_stage = 'For Inspection' WHERE id = NEW.application_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_app_stage_on_inspection() RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'Completed' THEN
    UPDATE applications SET current_stage = 'For Approval' WHERE id = NEW.application_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_app_stage_on_approval() RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'Approved' THEN
    UPDATE applications SET current_stage = 'Ready for Release' WHERE id = NEW.application_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_app_stage_on_releasing() RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'Released' THEN
    UPDATE applications SET current_stage = 'Released' WHERE id = NEW.application_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Rename any existing 'Inspection' to 'For Inspection' just in case
UPDATE applications SET current_stage = 'For Inspection' WHERE current_stage = 'Inspection';
