-- Fix Issue 1: Mail system RLS - Replace permissive INSERT policies with service-based ones

-- Create proper service-based INSERT policies for mail tables
-- Only users with appropriate service roles can create mails

-- Policy for mails: Only service roles (courrier, reception, etc.) or admins can create
CREATE POLICY "Service users can create mails" ON mails
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('courrier', 'reception', 'sec_gen', 'cabinet_private', 'admin', 'president')
  )
);

-- Policy for mail_attachments: Same service roles can create attachments
CREATE POLICY "Service users can create attachments" ON mail_attachments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('courrier', 'reception', 'sec_gen', 'cabinet_private', 'admin', 'president')
  )
);

-- Policy for mail_ai_analysis: Service roles can create analysis
CREATE POLICY "Service users can create mail analysis" ON mail_ai_analysis
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('courrier', 'reception', 'sec_gen', 'cabinet_private', 'admin', 'president')
  )
);

-- Policy for mail_routing: Service roles can create routing records
CREATE POLICY "Service users can create routing" ON mail_routing
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('courrier', 'reception', 'sec_gen', 'cabinet_private', 'admin', 'president')
  )
);

-- Add SELECT policies for attachments, analysis, and routing
-- Service users can view attachments for mails in their service
CREATE POLICY "Service users can view attachments" ON mail_attachments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM mails m
    JOIN user_roles ur ON ur.user_id = auth.uid()
    WHERE m.id = mail_attachments.mail_id
    AND (m.current_holder_service = ur.role::text OR m.user_id = auth.uid())
  )
);

-- Service users can view AI analysis for mails in their service
CREATE POLICY "Service users can view mail analysis" ON mail_ai_analysis
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM mails m
    JOIN user_roles ur ON ur.user_id = auth.uid()
    WHERE m.id = mail_ai_analysis.mail_id
    AND (m.current_holder_service = ur.role::text OR m.user_id = auth.uid())
  )
);

-- Service users can view routing for mails in their service
CREATE POLICY "Service users can view routing" ON mail_routing
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM mails m
    JOIN user_roles ur ON ur.user_id = auth.uid()
    WHERE m.id = mail_routing.mail_id
    AND (m.current_holder_service = ur.role::text OR m.user_id = auth.uid())
  )
);