-- Drop and recreate the view policy to include shared templates
DROP POLICY IF EXISTS "School admins can view templates for their school" ON public.bulk_import_templates;

CREATE POLICY "School admins can view templates for their school"
ON public.bulk_import_templates
FOR SELECT
USING (
  has_role(auth.uid(), 'school_admin'::app_role) 
  AND school_id = get_user_school(auth.uid())
  AND (created_by = auth.uid() OR is_shared = true)
);