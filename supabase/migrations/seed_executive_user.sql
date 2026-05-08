-- Seed an Executive role user for testing Approvals module access
-- Email:    executive@dhsud.gov.ph
-- Password: password123

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Create the auth user (idempotent)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data, created_at, updated_at,
  confirmation_token, confirmation_sent_at, recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  extensions.gen_random_uuid(),
  'authenticated',
  'authenticated',
  'executive@dhsud.gov.ph',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  jsonb_build_object('role', 'Executive'),
  now(),
  now(),
  encode(extensions.gen_random_bytes(32), 'hex'),
  now(),
  encode(extensions.gen_random_bytes(32), 'hex')
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'executive@dhsud.gov.ph'
);

-- Create the linked identity (required for email/password sign-in)
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
)
SELECT
  extensions.gen_random_uuid(),
  id,
  jsonb_build_object('sub', id, 'email', email),
  'email',
  email,
  now(),
  now(),
  now()
FROM auth.users
WHERE email = 'executive@dhsud.gov.ph'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities
    WHERE provider_id = 'executive@dhsud.gov.ph' AND provider = 'email'
  );
