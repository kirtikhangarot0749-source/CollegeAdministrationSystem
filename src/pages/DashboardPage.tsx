import { useEffect, useState } from 'react';
import { Users, GraduationCap, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge, getAttendanceColor } from '@/components/ui/Badge';
import type { Page } from '@/components/Layout';

interface DashboardStats {
  studentCount: number;
  courseCount: number;
  subjectCount: number;
  avgAttendance: number;
}

interface RecentStudent {
  id: string;
  student_id: string;
  name: string;
  semester: number;
  section: string;
  photo_url: string;
  course?: { name: string };
}

export function DashboardPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [students, courses, subjects, attendance] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase.from('student_subjects').select('attendance_percentage'),
      ]);

      const avgAttendance =
        attendance.data && attendance.data.length > 0
          ? Math.round(
              attendance.data.reduce((sum: number, r: { attendance_percentage: number }) => sum + r.attendance_percentage, 0) /
                attendance.data.length,
            )
          : 0;

      setStats({
        studentCount: students.count ?? 0,
        courseCount: courses.count ?? 0,
        subjectCount: subjects.count ?? 0,
        avgAttendance,
      });

      const { data: recent } = await supabase
        .from('students')
        .select('id, student_id, name, semester, section, photo_url, course:courses(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentStudents((recent ?? []) as unknown as RecentStudent[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !stats) {
    return <Spinner size="lg" />;
  }

  const statCards = [
    {
      label: 'Total Students',
      value: stats.studentCount,
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      page: 'students' as Page,
    },
    {
      label: 'Active Courses',
      value: stats.courseCount,
      icon: <GraduationCap className="h-6 w-6" />,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      page: 'courses' as Page,
    },
    {
      label: 'Total Subjects',
      value: stats.subjectCount,
      icon: <BookOpen className="h-6 w-6" />,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      page: 'subjects' as Page,
    },
    {
      label: 'Avg Attendance',
      value: `${stats.avgAttendance}%`,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-violet-500',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      page: 'students' as Page,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-20 bottom-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl font-bold mb-1">Welcome back, Admin</h2>
          <p className="text-slate-300 text-sm max-w-lg">
            Here's an overview of your college administration system. Manage students, courses, and
            academic records all in one place.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <button
            key={stat.label}
            onClick={() => onNavigate(stat.page)}
            className="group text-left"
          >
            <Card className="hover:shadow-md hover:border-slate-300 transition-all duration-200 group-hover:-translate-y-0.5">
              <CardBody className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor} ${stat.textColor}`}
                >
                  {stat.icon}
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              </CardBody>
            </Card>
          </button>
        ))}
      </div>

      {/* Recent students */}
      <Card>
        <CardHeader
          title="Recently Added Students"
          subtitle="Latest enrollments in the system"
          icon={<Users className="h-5 w-5" />}
          action={
            <button
              onClick={() => onNavigate('students')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </button>
          }
        />
        {recentStudents.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">No students enrolled yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors"
              >
                <img
                  src={student.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=e2e8f0&color=475569`}
                  alt={student.name}
                  className="h-10 w-10 rounded-full object-cover bg-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{student.name}</p>
                  <p className="text-xs text-slate-500">
                    {student.course?.name ?? 'No course'} · Sem {student.semester} · Section {student.section}
                  </p>
                </div>
                <Badge variant="slate">{student.student_id}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
