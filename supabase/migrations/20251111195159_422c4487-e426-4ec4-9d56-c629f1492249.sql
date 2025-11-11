-- Add explicit deny policy for anonymous access to students table
-- This prevents any unauthorized access to sensitive student academic records

CREATE POLICY "deny_all_anonymous_access"
ON public.students
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);