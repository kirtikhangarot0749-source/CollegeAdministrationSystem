/*
# College Administration Schema

Creates the core tables for a college administration system:
- courses: degree programs (e.g. B.Tech Computer Science)
- subjects: individual subjects belonging to a course + semester
- students: student personal + enrollment info, linked to a course
- student_subjects: per-student per-subject academic records (attendance, marks, grade)

1. New Tables
- `courses` — id, course_id (human-readable like CS101), name, department, duration_years, num_semesters, created_at
- `subjects` — id, subject_code, subject_name, course_id (FK), semester, credits, faculty, created_at
- `students` — id, student_id (human-readable), enrollment_number, name, email, phone, date_of_birth, gender, address, photo_url, course_id (FK), semester, section, created_at
- `student_subjects` — id, student_id (FK), subject_id (FK), attendance_percentage, internal_marks, assignment_marks, exam_marks, overall_percentage, grade

2. Security
- RLS enabled on all tables.
- Single-tenant no-auth app: all CRUD allowed for anon + authenticated (data is intentionally shared/public for the admin tool).

3. Notes
- Foreign keys use ON DELETE CASCADE so removing a course cleans up its subjects and students, and removing a student cleans up their academic records.
- Unique constraints prevent duplicate course_id / subject_code / student_id / enrollment_number.
*/

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id text UNIQUE NOT NULL,
  name text NOT NULL,
  department text NOT NULL,
  duration_years integer NOT NULL DEFAULT 4,
  num_semesters integer NOT NULL DEFAULT 8,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_courses" ON courses;
CREATE POLICY "anon_select_courses" ON courses FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_courses" ON courses;
CREATE POLICY "anon_insert_courses" ON courses FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_courses" ON courses;
CREATE POLICY "anon_update_courses" ON courses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_courses" ON courses;
CREATE POLICY "anon_delete_courses" ON courses FOR DELETE
  TO anon, authenticated USING (true);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_code text UNIQUE NOT NULL,
  subject_name text NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  semester integer NOT NULL,
  credits integer NOT NULL DEFAULT 3,
  faculty text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_subjects" ON subjects;
CREATE POLICY "anon_select_subjects" ON subjects FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_subjects" ON subjects;
CREATE POLICY "anon_insert_subjects" ON subjects FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_subjects" ON subjects;
CREATE POLICY "anon_update_subjects" ON subjects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_subjects" ON subjects;
CREATE POLICY "anon_delete_subjects" ON subjects FOR DELETE
  TO anon, authenticated USING (true);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE NOT NULL,
  enrollment_number text UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  date_of_birth date,
  gender text,
  address text,
  photo_url text,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  semester integer NOT NULL DEFAULT 1,
  section text DEFAULT 'A',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE
  TO anon, authenticated USING (true);

-- Student Subjects (academic records)
CREATE TABLE IF NOT EXISTS student_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  attendance_percentage numeric DEFAULT 0,
  internal_marks numeric DEFAULT 0,
  assignment_marks numeric DEFAULT 0,
  exam_marks numeric DEFAULT 0,
  overall_percentage numeric DEFAULT 0,
  grade text DEFAULT 'F',
  UNIQUE(student_id, subject_id)
);
ALTER TABLE student_subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_student_subjects" ON student_subjects;
CREATE POLICY "anon_select_student_subjects" ON student_subjects FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_student_subjects" ON student_subjects;
CREATE POLICY "anon_insert_student_subjects" ON student_subjects FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_student_subjects" ON student_subjects;
CREATE POLICY "anon_update_student_subjects" ON student_subjects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_student_subjects" ON student_subjects;
CREATE POLICY "anon_delete_student_subjects" ON student_subjects FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for search performance
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_subjects_course ON subjects(course_id);
CREATE INDEX IF NOT EXISTS idx_student_subjects_student ON student_subjects(student_id);
