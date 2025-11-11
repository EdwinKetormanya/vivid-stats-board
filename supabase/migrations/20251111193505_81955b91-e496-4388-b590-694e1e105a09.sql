-- Fix security warning: Remove public access to schools table
-- Only authenticated users with proper roles should access school data

DROP POLICY IF EXISTS "Anyone can view schools" ON public.schools;

-- The existing "Teachers can view their school" policy already provides
-- proper access control for authenticated users with appropriate roles