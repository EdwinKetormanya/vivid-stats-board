-- Fix RLS policies on students table to prevent cross-school access
-- Drop existing policies that lack school validation
DROP POLICY IF EXISTS "Teachers can create students in their classes" ON public.students;
DROP POLICY IF EXISTS "Teachers can update students in their classes" ON public.students;
DROP POLICY IF EXISTS "Teachers can delete students in their classes" ON public.students;

-- Recreate policies with school_id validation
CREATE POLICY "Teachers can create students in their school classes"
ON public.students
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
      AND classes.school_id = students.school_id
      AND classes.school_id = get_user_school(auth.uid())
  )
);

CREATE POLICY "Teachers can update students in their school classes"
ON public.students
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
      AND classes.school_id = students.school_id
      AND classes.school_id = get_user_school(auth.uid())
  )
);

CREATE POLICY "Teachers can delete students in their school classes"
ON public.students
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = students.class_id
      AND classes.teacher_id = auth.uid()
      AND classes.school_id = students.school_id
      AND classes.school_id = get_user_school(auth.uid())
  )
);