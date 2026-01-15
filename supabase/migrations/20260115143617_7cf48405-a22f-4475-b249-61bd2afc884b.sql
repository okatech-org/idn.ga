-- =====================================================
-- SECURITY FIXES MIGRATION
-- Fixes critical RLS policy vulnerabilities
-- =====================================================

-- 1. FIX MAIL SYSTEM: Remove overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view mails" ON mails;
DROP POLICY IF EXISTS "Authenticated users can view mail analysis" ON mail_ai_analysis;
DROP POLICY IF EXISTS "Authenticated users can view attachments" ON mail_attachments;
DROP POLICY IF EXISTS "Authenticated users can view routing" ON mail_routing;

-- 2. FIX AUDIT LOGS: Prevent forgery by restricting INSERT
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Create proper audit log policies for service role only
CREATE POLICY "Service role can insert audit logs" 
ON audit_logs FOR INSERT TO service_role WITH CHECK (true);

-- Make audit logs immutable (prevent tampering)
CREATE POLICY "Audit logs are immutable" 
ON audit_logs FOR UPDATE USING (false);

CREATE POLICY "Audit logs cannot be deleted" 
ON audit_logs FOR DELETE USING (false);

-- 3. FIX OAUTH CLIENT SECRETS: Restrict access
DROP POLICY IF EXISTS "Active clients are readable for auth" ON oauth_clients;

-- Create view without client_secret for public queries
CREATE OR REPLACE VIEW public.oauth_clients_public AS
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

-- Only owners and admins can see their full client details (including secret)
CREATE POLICY "Owners can view their clients with secrets" 
ON oauth_clients FOR SELECT USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- 4. FIX STORAGE BUCKET POLICIES
-- Create storage bucket policies for vault bucket
CREATE POLICY "Users can upload to own vault folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vault' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can read own vault files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vault' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own vault files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vault' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own vault files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vault' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policies for generated-documents bucket
CREATE POLICY "Users can upload generated documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'generated-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can read own generated documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'generated-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. RESTRICT log_audit_event FUNCTION
REVOKE EXECUTE ON FUNCTION log_audit_event FROM PUBLIC;
GRANT EXECUTE ON FUNCTION log_audit_event TO service_role;