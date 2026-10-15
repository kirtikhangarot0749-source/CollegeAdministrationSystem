export interface Course {
  id: string;
  course_id: string;
  name: string;
  department: string;
  duration_years: number;
  num_semesters: number;
  created_at: string;
}

export interface Subject {
  id: string;
  subject_code: string;
  subject_name: string;
  course_id: string;
  semester: number;
  credits: number;
  faculty: string;
  created_at: string;
  course?: Course;
}

export interface Student {
  id: string;
  student_id: string;
  enrollment_number: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  photo_url: string;
  course_id: string;
  semester: number;
  section: string;
  created_at: string;
  course?: Course;
}

export interface StudentSubject {
  id: string;
  student_id: string;
  subject_id: string;
  attendance_percentage: number;
  internal_marks: number;
  assignment_marks: number;
  exam_marks: number;
  overall_percentage: number;
  grade: string;
  subject?: Subject;
}

export type StudentWithRelations = Student & {
  course?: Course;
};

export type SubjectWithCourse = Subject & {
  course?: Course;
};

export type StudentSubjectWithSubject = StudentSubject & {
  subject?: Subject;
};
