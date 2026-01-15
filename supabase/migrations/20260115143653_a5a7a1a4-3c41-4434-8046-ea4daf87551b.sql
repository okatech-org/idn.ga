-- Fix the SECURITY DEFINER view issue - drop and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.oauth_clients_public;

CREATE VIEW public.oauth_clients_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  client_id,
  client_name,
  client_description,
  client_website,
  client_logo_url,
  redirect_uris,
  allowed_scopes,
  grant_types,
  is_active,
  is_verified,
  is_confidential,
  owner_id,
  created_at,
  updated_at
FROM oauth_clients
WHERE is_active = true;

-- Grant authenticated users read access to the safe view
GRANT SELECT ON public.oauth_clients_public TO authenticated;