-- Create table for import history
CREATE TABLE public.import_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  imported_by UUID NOT NULL,
  import_type TEXT NOT NULL CHECK (import_type IN ('single', 'bulk')),
  teachers_imported JSONB NOT NULL,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- Create policies for import history
CREATE POLICY "School admins can view import history for their school"
ON public.import_history
FOR SELECT
USING (
  has_role(auth.uid(), 'school_admin'::app_role) 
  AND school_id = get_user_school(auth.uid())
);

CREATE POLICY "School admins can create import history for their school"
ON public.import_history
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'school_admin'::app_role) 
  AND school_id = get_user_school(auth.uid())
  AND imported_by = auth.uid()
);

-- Create index for better query performance
CREATE INDEX idx_import_history_school_id ON public.import_history(school_id);
CREATE INDEX idx_import_history_created_at ON public.import_history(created_at DESC);