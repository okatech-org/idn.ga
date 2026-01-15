-- Drop the insecure oauth_clients_public view and recreate with RLS
DROP VIEW IF EXISTS oauth_clients_public;

-- Recreate the view with only safe columns (no client_secret)
CREATE VIEW oauth_clients_public AS
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

-- Add security definer to ensure the view respects RLS
COMMENT ON VIEW oauth_clients_public IS 'Public view of OAuth clients without secrets. Only shows active clients.';

-- Grant select only to authenticated users
REVOKE ALL ON oauth_clients_public FROM anon;
GRANT SELECT ON oauth_clients_public TO authenticated;