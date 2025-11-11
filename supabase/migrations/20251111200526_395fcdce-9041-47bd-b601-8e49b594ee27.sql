-- Secure user_roles table to prevent privilege escalation
-- Add explicit policies to ensure only super admins can create role assignments

-- Add anonymous access denial (RESTRICTIVE policy)
CREATE POLICY "deny_all_anonymous_access"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Add explicit INSERT restriction for authenticated users who are not super admins
CREATE POLICY "Only super admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Add explicit UPDATE restriction for authenticated users who are not super admins
CREATE POLICY "Only super admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Add explicit DELETE restriction for authenticated users who are not super admins
CREATE POLICY "Only super admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));