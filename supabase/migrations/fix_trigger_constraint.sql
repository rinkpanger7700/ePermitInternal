-- The database has a strict constraint that only allows specific stage names.
-- "For Inspection" is rejected by the database. We must use "Inspection".

CREATE OR REPLACE FUNCTION update_app_stage_on_review() RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'Completed' THEN
    UPDATE applications SET current_stage = 'Inspection' WHERE id = NEW.application_id;
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
