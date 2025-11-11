-- Add policy to explicitly deny anonymous access to profiles table
-- This prevents unauthenticated users from accessing user email addresses

CREATE POLICY "deny_anonymous_access" 
ON public.profiles 
FOR SELECT 
TO anon 
USING (false);