-- Fix the SECURITY DEFINER view issue by recreating oauth_clients_public as SECURITY INVOKER
DROP VIEW IF EXISTS oauth_clients_public;

-- Recreate the view without SECURITY DEFINER (uses SECURITY INVOKER by default)
CREATE VIEW oauth_clients_public 
WITH (security_invoker = true)
AS
SELECT 
    id,
    client_id,
    client_name,
    client_description,
    client_logo_url,
    client_website,
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

-- Add documentation
COMMENT ON VIEW oauth_clients_public IS 'Public view of OAuth clients without secrets. Uses SECURITY INVOKER to respect RLS policies of the querying user.';

-- Grant select only to authenticated users
REVOKE ALL ON oauth_clients_public FROM anon;
GRANT SELECT ON oauth_clients_public TO authenticated;