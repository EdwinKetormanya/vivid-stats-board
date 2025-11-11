-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'school_admin', 'teacher');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, school_id)
);

-- Update schools table to add more fields
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  term TEXT,
  year TEXT,
  number_on_roll INTEGER,
  vacation_date DATE,
  reopening_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  
  -- Scores
  english_language INTEGER,
  mathematics INTEGER,
  natural_science INTEGER,
  history INTEGER,
  computing INTEGER,
  rme INTEGER,
  creative_arts INTEGER,
  owop INTEGER,
  ghanaian_language INTEGER,
  french INTEGER,
  
  -- Calculated fields
  total_raw_score INTEGER,
  average_score NUMERIC(5,2),
  total_aggregate INTEGER,
  position TEXT,
  
  -- Remarks per subject (stored as JSONB)
  remarks JSONB,
  
  -- Teacher remarks and assessments
  teacher_remark TEXT,
  conduct TEXT,
  interest TEXT,
  attendance INTEGER,
  attendance_out_of INTEGER,
  status TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's school
CREATE OR REPLACE FUNCTION public.get_user_school(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE id = _user_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "School admins can view profiles in their school"
  ON public.profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'school_admin') 
    AND school_id = public.get_user_school(auth.uid())
  );

CREATE POLICY "Super admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "School admins can view roles in their school"
  ON public.user_roles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'school_admin')
    AND school_id = public.get_user_school(auth.uid())
  );

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for schools
CREATE POLICY "School admins can update their school"
  ON public.schools FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'school_admin')
    AND id = public.get_user_school(auth.uid())
  );

CREATE POLICY "Teachers can view their school"
  ON public.schools FOR SELECT
  USING (
    id = public.get_user_school(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- RLS Policies for classes
CREATE POLICY "Teachers can view their classes"
  ON public.classes FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR (public.has_role(auth.uid(), 'school_admin') AND school_id = public.get_user_school(auth.uid()))
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Teachers can create classes in their school"
  ON public.classes FOR INSERT
  WITH CHECK (
    school_id = public.get_user_school(auth.uid())
    AND teacher_id = auth.uid()
  );

CREATE POLICY "Teachers can update their own classes"
  ON public.classes FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own classes"
  ON public.classes FOR DELETE
  USING (teacher_id = auth.uid());

-- RLS Policies for students
CREATE POLICY "Teachers can view students in their classes"
  ON public.students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
    )
    OR (public.has_role(auth.uid(), 'school_admin') AND school_id = public.get_user_school(auth.uid()))
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Teachers can create students in their classes"
  ON public.students FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update students in their classes"
  ON public.students FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete students in their classes"
  ON public.students FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Create trigger function for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for school logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-logos', 'school-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for school logos
CREATE POLICY "School logos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'school-logos');

CREATE POLICY "School admins can upload logos for their school"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'school-logos'
    AND public.has_role(auth.uid(), 'school_admin')
  );

CREATE POLICY "School admins can update their school logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'school-logos'
    AND public.has_role(auth.uid(), 'school_admin')
  );