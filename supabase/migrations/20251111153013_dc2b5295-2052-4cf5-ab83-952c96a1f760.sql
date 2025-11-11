-- Create table for bulk import templates
CREATE TABLE public.bulk_import_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  created_by UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  teachers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bulk_import_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for templates
CREATE POLICY "School admins can view templates for their school"
ON public.bulk_import_templates
FOR SELECT
USING (
  has_role(auth.uid(), 'school_admin'::app_role) 
  AND school_id = get_user_school(auth.uid())
);

CREATE POLICY "School admins can create templates for their school"
ON public.bulk_import_templates
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'school_admin'::app_role) 
  AND school_id = get_user_school(auth.uid())
  AND created_by = auth.uid()
);

CREATE POLICY "School admins can delete their own templates"
ON public.bulk_import_templates
FOR DELETE
USING (
  has_role(auth.uid(), 'school_admin'::app_role) 
  AND created_by = auth.uid()
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bulk_import_templates_updated_at
BEFORE UPDATE ON public.bulk_import_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();