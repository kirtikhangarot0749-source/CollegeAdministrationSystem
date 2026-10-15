import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User as UserIcon,
  Pencil,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Award,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, getGradeColor, getAttendanceColor } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/lib/toast';
import type { StudentWithRelations, StudentSubjectWithSubject, Course } from '@/lib/types';

type Tab = 'overview' | 'attendance' | 'marks' | 'subjects' | 'assignments';

const tabs: { id: Tab; label: string; icon: typeof UserIcon }[] = [
  { id: 'overview', label: 'Overview', icon: ClipboardList },
  { id: 'attendance', label: 'Attendance', icon: TrendingUp },
  { id: 'marks', label: 'Marks', icon: BarChart3 },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'assignments', label: 'Assignments', icon: Award },
];

interface StudentProfileProps {
  studentId: string;
  onBack: () => void;
}

export function StudentProfile({ studentId, onBack }: StudentProfileProps) {
  const { showToast } = useToast();
  const [student, setStudent] = useState<StudentWithRelations | null>(null);
  const [academicRecords, setAcademicRecords] = useState<StudentSubjectWithSubject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadStudent = useCallback(async () => {
    const [studentRes, academicsRes, coursesRes] = await Promise.all([
      supabase
        .from('students')
        .select('*, course:courses(*)')
        .eq('id', studentId)
        .maybeSingle(),
      supabase
        .from('student_subjects')
        .select('*, subject:subjects(*)')
        .eq('student_id', studentId),
      supabase.from('courses').select('*').order('name'),
    ]);

    if (studentRes.data) {
      setStudent(studentRes.data as unknown as StudentWithRelations);
    }
    setAcademicRecords((academicsRes.data ?? []) as unknown as StudentSubjectWithSubject[]);
    setCourses((coursesRes.data ?? []) as Course[]);
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  const avgAttendance =
    academicRecords.length > 0
      ? Math.round(academicRecords.reduce((s, r) => s + Number(r.attendance_percentage), 0) / academicRecords.length)
      : 0;
  const avgOverall =
    academicRecords.length > 0
      ? Math.round(academicRecords.reduce((s, r) => s + Number(r.overall_percentage), 0) / academicRecords.length)
      : 0;
  const bestGrade = academicRecords.reduce((best, r) => {
    if (!best || r.overall_percentage > best.overall_percentage) return r;
    return best;
  }, academicRecords[0] ?? null);

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!student) {
    return (
      <EmptyState
        icon={<UserIcon className="h-8 w-8" />}
        title="Student not found"
        message="The student you're looking for doesn't exist."
        action={<Button onClick={onBack} variant="outline"><ArrowLeft className="h-4 w-4" /> Back to Students</Button>}
      />
    );
  }

  const photoUrl = student.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&size=200&background=2563eb&color=fff`;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </button>

      {/* Profile header card */}
      <Card>
        <CardBody className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={photoUrl}
            alt={student.name}
            className="h-24 w-24 rounded-2xl object-cover bg-slate-200 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-slate-900">{student.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><UserIcon className="h-4 w-4" /> {student.student_id}</span>
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {student.email}</span>
              <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {student.course?.name ?? 'No course'}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="blue">Semester {student.semester}</Badge>
              <Badge variant="slate">Section {student.section}</Badge>
              <Badge variant="purple">{student.enrollment_number}</Badge>
            </div>
          </div>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        </CardBody>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{academicRecords.length}</p>
              <p className="text-xs text-slate-500">Subjects</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{avgAttendance}%</p>
              <p className="text-xs text-slate-500">Avg Attendance</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{avgOverall}%</p>
              <p className="text-xs text-slate-500">Overall Score</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{bestGrade?.grade ?? '—'}</p>
              <p className="text-xs text-slate-500">Best Grade</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab student={student} academicRecords={academicRecords} avgAttendance={avgAttendance} avgOverall={avgOverall} />}
      {activeTab === 'attendance' && <AttendanceTab academicRecords={academicRecords} avgAttendance={avgAttendance} />}
      {activeTab === 'marks' && <MarksTab academicRecords={academicRecords} />}
      {activeTab === 'subjects' && <SubjectsTab academicRecords={academicRecords} />}
      {activeTab === 'assignments' && <AssignmentsTab academicRecords={academicRecords} />}

      {/* Edit Modal */}
      {editOpen && (
        <EditStudentModal
          student={student}
          courses={courses}
          saving={saving}
          onClose={() => setEditOpen(false)}
          onSave={async (formData) => {
            setSaving(true);
            const { error } = await supabase.from('students').update(formData).eq('id', student.id);
            setSaving(false);
            if (error) {
              showToast('Failed to update student profile', 'error');
            } else {
              showToast('Student profile updated successfully');
              setEditOpen(false);
              loadStudent();
            }
          }}
        />
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | undefined }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-900 break-words">{value || '—'}</p>
      </div>
    </div>
  );
}

function OverviewTab({
  student,
  academicRecords,
  avgAttendance,
  avgOverall,
}: {
  student: StudentWithRelations;
  academicRecords: StudentSubjectWithSubject[];
  avgAttendance: number;
  avgOverall: number;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information */}
      <Card>
        <CardHeader title="Personal Information" icon={<UserIcon className="h-5 w-5" />} />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
            <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Student ID" value={student.student_id} />
            <InfoRow icon={<ClipboardList className="h-4 w-4" />} label="Enrollment No." value={student.enrollment_number} />
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={student.email} />
            <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={student.phone} />
            <InfoRow icon={<Calendar className="h-4 w-4" />} label="Date of Birth" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined} />
            <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Gender" value={student.gender} />
          </div>
          <div className="pt-2">
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Address" value={student.address} />
          </div>
        </CardBody>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader title="Academic Information" icon={<GraduationCap className="h-5 w-5" />} />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
            <InfoRow icon={<GraduationCap className="h-4 w-4" />} label="Course" value={student.course?.name} />
            <InfoRow icon={<BookOpen className="h-4 w-4" />} label="Semester" value={String(student.semester)} />
            <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Section" value={student.section} />
            <InfoRow icon={<BookOpen className="h-4 w-4" />} label="Subjects Enrolled" value={String(academicRecords.length)} />
            <InfoRow icon={<TrendingUp className="h-4 w-4" />} label="Avg Attendance" value={`${avgAttendance}%`} />
            <InfoRow icon={<BarChart3 className="h-4 w-4" />} label="Overall Percentage" value={`${avgOverall}%`} />
          </div>
          <div className="pt-2">
            <InfoRow icon={<Award className="h-4 w-4" />} label="Best Grade" value={academicRecords.reduce((best, r) => (!best || r.overall_percentage > best.overall_percentage ? r : best), academicRecords[0] ?? undefined)?.grade} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function AttendanceTab({
  academicRecords,
  avgAttendance,
}: {
  academicRecords: StudentSubjectWithSubject[];
  avgAttendance: number;
}) {
  if (academicRecords.length === 0) {
    return (
      <Card>
        <EmptyState icon={<TrendingUp className="h-8 w-8" />} title="No attendance data" message="No subject attendance records found for this student." />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700">Overall Attendance</p>
            <Badge variant={getAttendanceColor(avgAttendance)}>{avgAttendance}%</Badge>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                avgAttendance >= 85 ? 'bg-emerald-500' : avgAttendance >= 75 ? 'bg-blue-500' : avgAttendance >= 65 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${avgAttendance}%` }}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Subject-wise Attendance" icon={<BookOpen className="h-5 w-5" />} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-3 text-left font-semibold text-slate-600">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden sm:table-cell">Code</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Attendance</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {academicRecords.map((record) => {
                const att = Number(record.attendance_percentage);
                return (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900">{record.subject?.subject_name ?? '—'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Badge variant="slate">{record.subject?.subject_code}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge variant={getAttendanceColor(att)}>{att}%</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${att >= 85 ? 'bg-emerald-500' : att >= 75 ? 'bg-blue-500' : att >= 65 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${att}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function MarksTab({ academicRecords }: { academicRecords: StudentSubjectWithSubject[] }) {
  if (academicRecords.length === 0) {
    return (
      <Card>
        <EmptyState icon={<BarChart3 className="h-8 w-8" />} title="No marks data" message="No examination records found for this student." />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Academic Marks Breakdown" subtitle="Internal, Assignment, and Examination marks per subject" icon={<BarChart3 className="h-5 w-5" />} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="px-6 py-3 text-left font-semibold text-slate-600">Subject</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600">Internal (20)</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600">Assignment (20)</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600">Exam (80)</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600">Overall %</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {academicRecords.map((record) => (
              <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3">
                  <p className="font-medium text-slate-900">{record.subject?.subject_name ?? '—'}</p>
                  <p className="text-xs text-slate-500">{record.subject?.subject_code}</p>
                </td>
                <td className="px-4 py-3 text-center text-slate-700">{record.internal_marks}</td>
                <td className="px-4 py-3 text-center text-slate-700">{record.assignment_marks}</td>
                <td className="px-4 py-3 text-center text-slate-700">{record.exam_marks}</td>
                <td className="px-4 py-3 text-center font-semibold text-slate-900">{record.overall_percentage}%</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={getGradeColor(record.grade)}>{record.grade}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SubjectsTab({ academicRecords }: { academicRecords: StudentSubjectWithSubject[] }) {
  if (academicRecords.length === 0) {
    return (
      <Card>
        <EmptyState icon={<BookOpen className="h-8 w-8" />} title="No subjects enrolled" message="This student is not enrolled in any subjects yet." />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {academicRecords.map((record) => (
        <Card key={record.id} className="hover:shadow-md transition-shadow">
          <CardBody>
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <Badge variant={getGradeColor(record.grade)}>{record.grade}</Badge>
            </div>
            <p className="font-semibold text-slate-900 text-sm leading-snug">{record.subject?.subject_name ?? '—'}</p>
            <p className="text-xs text-slate-500 mt-1">{record.subject?.subject_code} · {record.subject?.credits} Credits</p>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">Faculty: <span className="text-slate-600 font-medium">{record.subject?.faculty ?? '—'}</span></p>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function AssignmentsTab({ academicRecords }: { academicRecords: StudentSubjectWithSubject[] }) {
  if (academicRecords.length === 0) {
    return (
      <Card>
        <EmptyState icon={<Award className="h-8 w-8" />} title="No assignment data" message="No assignment marks found for this student." />
      </Card>
    );
  }

  const maxAssignment = 20;

  return (
    <Card>
      <CardHeader title="Assignment Marks" subtitle="Out of 20 per subject" icon={<Award className="h-5 w-5" />} />
      <div className="space-y-4 p-6">
        {academicRecords.map((record) => {
          const marks = Number(record.assignment_marks);
          const pct = (marks / maxAssignment) * 100;
          return (
            <div key={record.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-sm font-medium text-slate-900">{record.subject?.subject_name ?? '—'}</span>
                  <span className="text-xs text-slate-400 ml-2">{record.subject?.subject_code}</span>
                </div>
                <span className="text-sm font-semibold text-slate-700">{marks}/{maxAssignment}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

interface EditFormData {
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
}

function EditStudentModal({
  student,
  courses,
  saving,
  onClose,
  onSave,
}: {
  student: StudentWithRelations;
  courses: Course[];
  saving: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState<EditFormData>({
    name: student.name,
    email: student.email,
    phone: student.phone || '',
    date_of_birth: student.date_of_birth || '',
    gender: student.gender || '',
    address: student.address || '',
    photo_url: student.photo_url || '',
    course_id: student.course_id || '',
    semester: student.semester,
    section: student.section,
  });

  const update = (field: keyof EditFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal open={true} onClose={onClose} title="Edit Student Profile" subtitle={student.name} size="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name" value={form.name} onChange={(e) => update('name', e.target.value)} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <Input label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        <Input label="Date of Birth" type="date" value={form.date_of_birth} onChange={(e) => update('date_of_birth', e.target.value)} />
        <Select label="Gender" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </Select>
        <Select label="Course" value={form.course_id} onChange={(e) => update('course_id', e.target.value)}>
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <Select label="Semester" value={String(form.semester)} onChange={(e) => update('semester', Number(e.target.value))}>
          {Array.from({ length: 8 }, (_, i) => (
            <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
          ))}
        </Select>
        <Select label="Section" value={form.section} onChange={(e) => update('section', e.target.value)}>
          {['A', 'B', 'C', 'D'].map((s) => (
            <option key={s} value={s}>Section {s}</option>
          ))}
        </Select>
        <div className="sm:col-span-2">
          <Textarea label="Address" value={form.address} onChange={(e) => update('address', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Input label="Photo URL" value={form.photo_url} onChange={(e) => update('photo_url', e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button loading={saving} onClick={() => onSave(form as unknown as Record<string, unknown>)}>
          Save Changes
        </Button>
      </div>
    </Modal>
  );
}
