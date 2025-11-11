-- Fix all policies to use 'authenticated' role instead of 'public' role
-- The 'public' role includes anonymous users, which is why the scanner detects public access

-- FIX PROFILES TABLE POLICIES
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- FIX STUDENTS TABLE POLICIES
DROP POLICY IF EXISTS "Teachers can view students in their classes" ON public.students;
DROP POLICY IF EXISTS "Teachers can create students in their school classes" ON public.students;
DROP POLICY IF EXISTS "Teachers can update students in their school classes" ON public.students;
DROP POLICY IF EXISTS "Teachers can delete students in their school classes" ON public.students;

CREATE POLICY "Teachers can view students in their classes"
ON public.students
FOR SELECT
TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = students.class_id 
      AND classes.teacher_id = auth.uid()
  )) 
  OR (has_role(auth.uid(), 'school_admin'::app_role) AND school_id = get_user_school(auth.uid())) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Teachers can create students in their school classes"
ON public.students
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
      AND classes.school_id = students.school_id
      AND classes.school_id = get_user_school(auth.uid())
  )
);

CREATE POLICY "Teachers can update students in their school classes"
ON public.students
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
      AND classes.school_id = students.school_id
      AND classes.school_id = get_user_school(auth.uid())
  )
);

CREATE POLICY "Teachers can delete students in their school classes"
ON public.students
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
      AND classes.school_id = students.school_id
      AND classes.school_id = get_user_school(auth.uid())
  )
);