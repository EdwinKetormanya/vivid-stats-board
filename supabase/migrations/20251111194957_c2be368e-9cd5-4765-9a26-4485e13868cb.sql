-- Fix profiles table to completely block anonymous access
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "deny_all_anonymous_access" ON public.profiles;
DROP POLICY IF EXISTS "School admins can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "deny_anonymous_access" ON public.profiles;

-- Create a RESTRICTIVE policy that blocks all anonymous access
CREATE POLICY "deny_all_anonymous_access"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Recreate SELECT policies with explicit authentication requirements for authenticated role only
CREATE POLICY "Authenticated users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "School admins can view profiles in their school"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'school_admin'::app_role) 
  AND school_id = get_user_school(auth.uid())
);

CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));