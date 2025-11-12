-- Create audit log table for profile access tracking
CREATE TABLE IF NOT EXISTS public.profile_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accessed_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'export', 'bulk_query')),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS on audit logs
ALTER TABLE public.profile_access_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view all audit logs"
ON public.profile_access_logs
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- System can insert audit logs (via trigger)
CREATE POLICY "Allow system inserts for audit logs"
ON public.profile_access_logs
FOR INSERT
WITH CHECK (true);

-- Create index for efficient queries
CREATE INDEX idx_profile_access_logs_accessed_by ON public.profile_access_logs(accessed_by, accessed_at DESC);
CREATE INDEX idx_profile_access_logs_profile ON public.profile_access_logs(accessed_profile_id, accessed_at DESC);

-- Function to log profile access
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log when a school admin accesses other users' profiles
  IF has_role(auth.uid(), 'school_admin'::app_role) AND auth.uid() != NEW.id THEN
    INSERT INTO public.profile_access_logs (
      accessed_by,
      accessed_profile_id,
      access_type
    ) VALUES (
      auth.uid(),
      NEW.id,
      'view'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Note: We'll implement client-side logging for actual SELECT queries since triggers don't fire on SELECT