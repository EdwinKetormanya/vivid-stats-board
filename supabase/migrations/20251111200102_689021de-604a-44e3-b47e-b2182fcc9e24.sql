-- Add DELETE policy and anonymous access denial to schools table

-- Add explicit anonymous access denial (RESTRICTIVE policy)
CREATE POLICY "deny_all_anonymous_access"
ON public.schools
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Add DELETE policy restricted to super admins only
CREATE POLICY "Only super admins can delete schools"
ON public.schools
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));