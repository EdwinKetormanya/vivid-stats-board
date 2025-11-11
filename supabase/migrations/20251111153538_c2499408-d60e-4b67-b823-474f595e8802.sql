-- Add sharing functionality to bulk_import_templates
ALTER TABLE public.bulk_import_templates
ADD COLUMN is_shared BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policy to allow viewing shared templates from same school
DROP POLICY IF EXISTS "School admins can view templates for their school" ON public.bulk_import_templates;

CREATE POLICY "School admins can view templates for their school"
ON public.bulk_import_templates
FOR SELECT
USING (
  has_role(auth.uid(), 'school_admin'::app_role) 
  AND school_id = get_user_school(auth.uid())
  AND (created_by = auth.uid() OR is_shared = true)
);

-- Allow updating own templates (for sharing toggle)
CREATE POLICY "School admins can update their own templates"
ON public.bulk_import_templates
FOR UPDATE
USING (
  has_role(auth.uid(), 'school_admin'::app_role) 
  AND created_by = auth.uid()
)
WITH CHECK (
  has_role(auth.uid(), 'school_admin'::app_role) 
  AND created_by = auth.uid()
);