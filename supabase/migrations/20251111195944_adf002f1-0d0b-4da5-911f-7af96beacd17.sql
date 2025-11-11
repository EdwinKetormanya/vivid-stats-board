-- Add INSERT policy to schools table to restrict creation to super admins only
CREATE POLICY "Only super admins can create schools"
ON public.schools
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));