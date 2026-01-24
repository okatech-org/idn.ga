-- =====================================================
-- Add Digitalium OAuth Client for SSO Integration
-- =====================================================

-- Register Digitalium as an OAuth client for sovereign identity SSO
INSERT INTO public.oauth_clients (
  client_id,
  client_secret,
  client_name,
  client_description,
  client_website,
  redirect_uris,
  allowed_scopes,
  is_confidential,
  is_active,
  is_verified
) VALUES (
  'digitalium',
  'digitalium-secret-dev-2026',
  'Digitalium',
  'Plateforme de gestion documentaire souveraine - Archivage intelligent et génératif',
  'https://digitalium.ga',
  ARRAY[
    'https://digitalium.ga/auth/idn/callback',
    'https://app.digitalium.ga/auth/idn/callback',
    'http://localhost:8080/auth/idn/callback',
    'http://localhost:5173/auth/idn/callback'
  ],
  ARRAY['openid', 'profile', 'email', 'nip', 'verify'],
  true,
  true,
  true
) ON CONFLICT (client_id) DO UPDATE SET
  client_secret = EXCLUDED.client_secret,
  client_name = EXCLUDED.client_name,
  client_description = EXCLUDED.client_description,
  redirect_uris = EXCLUDED.redirect_uris,
  allowed_scopes = EXCLUDED.allowed_scopes,
  is_active = EXCLUDED.is_active,
  is_verified = EXCLUDED.is_verified,
  updated_at = NOW();
