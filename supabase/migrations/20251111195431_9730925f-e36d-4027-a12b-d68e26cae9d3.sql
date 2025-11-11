-- Add explicit restrictive policy for SELECT by anonymous users on profiles
-- Reason: Some scanners and clients require operation-specific denies, even if a general RESTRICTIVE policy exists

DROP POLICY IF EXISTS "deny_anonymous_select" ON public.profiles;

CREATE POLICY "deny_anonymous_select"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);