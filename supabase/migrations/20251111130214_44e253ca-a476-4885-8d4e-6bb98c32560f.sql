-- Create schools table
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  region TEXT,
  district TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read schools (for selection)
CREATE POLICY "Anyone can view schools" 
ON public.schools 
FOR SELECT 
USING (true);

-- Create an index on name for faster lookups
CREATE INDEX idx_schools_name ON public.schools(name);
CREATE INDEX idx_schools_region ON public.schools(region);