-- Drop policy if it exists and recreate it
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;

-- Add policy for super admins to update profiles
CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));