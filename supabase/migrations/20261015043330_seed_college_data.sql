/*
# Seed data for college administration

Populates courses, subjects, students, and student_subjects with sample data
so the application is immediately usable on first load.
*/

-- Courses
INSERT INTO courses (course_id, name, department, duration_years, num_semesters) VALUES
  ('CSE', 'B.Tech Computer Science', 'Computer Science & Engineering', 4, 8),
  ('ECE', 'B.Tech Electronics & Communication', 'Electronics & Communication', 4, 8),
  ('ME', 'B.Tech Mechanical Engineering', 'Mechanical Engineering', 4, 8),
  ('BBA', 'Bachelor of Business Administration', 'Management Studies', 3, 6),
  ('BCA', 'Bachelor of Computer Applications', 'Computer Applications', 3, 6)
ON CONFLICT (course_id) DO NOTHING;

-- Subjects for CSE
INSERT INTO subjects (subject_code, subject_name, course_id, semester, credits, faculty)
SELECT t.code, t.sname, c.id, t.sem, t.cr, t.fac
FROM courses c
CROSS JOIN (VALUES
  ('CS101', 'Programming Fundamentals', 1, 4, 'Dr. Rajesh Kumar'),
  ('CS102', 'Data Structures & Algorithms', 1, 4, 'Dr. Priya Sharma'),
  ('CS103', 'Database Management Systems', 1, 3, 'Prof. Amit Verma'),
  ('CS104', 'Computer Networks', 2, 3, 'Dr. Sunita Reddy'),
  ('CS105', 'Operating Systems', 2, 4, 'Dr. Manish Gupta'),
  ('CS201', 'Software Engineering', 3, 3, 'Prof. Kavitha Nair'),
  ('CS202', 'Web Technologies', 3, 4, 'Dr. Arjun Singh'),
  ('CS203', 'Artificial Intelligence', 4, 4, 'Dr. Neha Kapoor')
) AS t(code, sname, sem, cr, fac)
WHERE c.course_id = 'CSE'
ON CONFLICT (subject_code) DO NOTHING;

-- Subjects for ECE
INSERT INTO subjects (subject_code, subject_name, course_id, semester, credits, faculty)
SELECT t.code, t.sname, c.id, t.sem, t.cr, t.fac
FROM courses c
CROSS JOIN (VALUES
  ('EC101', 'Circuit Theory', 1, 4, 'Dr. Ramesh Iyer'),
  ('EC102', 'Digital Electronics', 1, 3, 'Prof. Suresh Babu'),
  ('EC103', 'Signals & Systems', 2, 4, 'Dr. Anjali Menon'),
  ('EC104', 'Microprocessors', 2, 3, 'Dr. Vivek Joshi')
) AS t(code, sname, sem, cr, fac)
WHERE c.course_id = 'ECE'
ON CONFLICT (subject_code) DO NOTHING;

-- Students (all CSE for now)
INSERT INTO students (student_id, enrollment_number, name, email, phone, date_of_birth, gender, address, photo_url, course_id, semester, section)
SELECT t.sid, t.enr, t.sname, t.email, t.phone, t.dob, t.gender, t.addr, t.photo, c.id, t.sem, t.sec
FROM courses c
CROSS JOIN (VALUES
  ('STU001', 'ENG2021001', 'Aarav Sharma', 'aarav.sharma@college.edu', '+91 98765 43210', '2003-05-14'::date, 'Male', '12 MG Road, Bangalore, KA', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', 3, 'A'),
  ('STU002', 'ENG2021002', 'Diya Patel', 'diya.patel@college.edu', '+91 98765 43211', '2003-08-22'::date, 'Female', '45 Park Street, Mumbai, MH', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', 3, 'A'),
  ('STU003', 'ENG2021003', 'Vikram Reddy', 'vikram.reddy@college.edu', '+91 98765 43212', '2003-01-10'::date, 'Male', '78 Civil Lines, Delhi, DL', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg', 3, 'B'),
  ('STU004', 'ENG2021004', 'Ananya Gupta', 'ananya.gupta@college.edu', '+91 98765 43213', '2003-11-03'::date, 'Female', '23 Marine Drive, Chennai, TN', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', 5, 'A'),
  ('STU005', 'ENG2021005', 'Rohan Mehta', 'rohan.mehta@college.edu', '+91 98765 43214', '2002-07-19'::date, 'Male', '56 CG Road, Ahmedabad, GJ', 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg', 5, 'A'),
  ('STU006', 'ENG2021006', 'Ishita Nair', 'ishita.nair@college.edu', '+91 98765 43215', '2003-03-28'::date, 'Female', '89 MG Road, Pune, MH', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg', 3, 'B')
) AS t(sid, enr, sname, email, phone, dob, gender, addr, photo, sem, sec)
WHERE c.course_id = 'CSE'
ON CONFLICT (student_id) DO NOTHING;

-- Student academic records
INSERT INTO student_subjects (student_id, subject_id, attendance_percentage, internal_marks, assignment_marks, exam_marks, overall_percentage, grade)
SELECT s.id, sub.id, t.att, t.im, t.am, t.em, t.op, t.gr
FROM students s
JOIN subjects sub ON sub.course_id = s.course_id AND sub.semester = s.semester
JOIN (VALUES
  ('STU001', 'CS201', 92, 18, 17, 72, 88, 'A'),
  ('STU001', 'CS202', 88, 17, 16, 68, 84, 'A'),
  ('STU001', 'CS203', 95, 19, 18, 78, 92, 'A+'),
  ('STU002', 'CS201', 85, 16, 15, 65, 80, 'A'),
  ('STU002', 'CS202', 90, 18, 17, 70, 86, 'A'),
  ('STU002', 'CS203', 82, 15, 14, 62, 77, 'B+'),
  ('STU003', 'CS201', 78, 14, 13, 58, 72, 'B+'),
  ('STU003', 'CS202', 80, 15, 14, 60, 74, 'B+'),
  ('STU003', 'CS203', 75, 13, 12, 55, 68, 'B'),
  ('STU004', 'CS101', 70, 12, 11, 50, 62, 'B'),
  ('STU004', 'CS102', 72, 13, 12, 52, 64, 'B'),
  ('STU005', 'CS101', 88, 17, 16, 68, 84, 'A'),
  ('STU005', 'CS102', 85, 16, 15, 65, 80, 'A')
) AS t(sid, scode, att, im, am, em, op, gr)
ON s.student_id = t.sid AND sub.subject_code = t.scode
ON CONFLICT (student_id, subject_id) DO NOTHING;
