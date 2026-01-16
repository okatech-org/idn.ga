-- Fix unauthenticated feedback submission vulnerability
-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can submit role feedback" ON public.role_feedback;

-- Create a proper policy that requires authentication
-- and ensures the user_email matches the authenticated user's email
CREATE POLICY "Authenticated users can submit role feedback"
ON public.role_feedback FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_email = auth.email()
);