import { useState, useEffect } from 'react';
import { ToastProvider } from '@/lib/toast';
import { Layout, type Page } from '@/components/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { StudentsList } from '@/pages/StudentsList';
import { StudentProfile } from '@/pages/StudentProfile';
import { CoursesPage } from '@/pages/CoursesPage';
import { SubjectsPage } from '@/pages/SubjectsPage';
import { AddStudentModal } from '@/pages/AddStudentModal';
import { supabase } from '@/lib/supabase';
import type { Course } from '@/lib/types';

type View =
  | { type: 'page'; page: Page }
  | { type: 'student'; studentId: string };

const pageMeta: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your college administration system' },
  students: { title: 'Students', subtitle: 'Manage student records and profiles' },
  courses: { title: 'Courses', subtitle: 'Manage degree programs and courses' },
  subjects: { title: 'Subjects', subtitle: 'Manage subjects across all courses' },
};

function AppContent() {
  const [view, setView] = useState<View>({ type: 'page', page: 'dashboard' });
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabase.from('courses').select('*').order('name').then(({ data }) => {
      setCourses((data ?? []) as Course[]);
    });
  }, []);

  const currentPage: Page = view.type === 'page' ? view.page : 'students';
  const meta = pageMeta[currentPage];

  const handleNavigate = (page: Page) => {
    setView({ type: 'page', page });
  };

  const handleViewStudent = (id: string) => {
    setView({ type: 'student', studentId: id });
  };

  const handleAddStudent = () => {
    setAddStudentOpen(true);
  };

  const topBarActions =
    currentPage === 'students' && view.type === 'page'
      ? undefined
      : undefined;

  return (
    <>
      <Layout
        current={currentPage}
        onNavigate={handleNavigate}
        title={view.type === 'student' ? 'Student Profile' : meta.title}
        subtitle={view.type === 'student' ? 'Detailed academic information' : meta.subtitle}
        actions={topBarActions}
      >
        {view.type === 'page' && view.page === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {view.type === 'page' && view.page === 'students' && (
          <StudentsList
            onViewStudent={handleViewStudent}
            onAddStudent={handleAddStudent}
            refreshKey={refreshKey}
          />
        )}
        {view.type === 'student' && (
          <StudentProfile studentId={view.studentId} onBack={() => setView({ type: 'page', page: 'students' })} />
        )}
        {view.type === 'page' && view.page === 'courses' && <CoursesPage />}
        {view.type === 'page' && view.page === 'subjects' && <SubjectsPage />}
      </Layout>

      {addStudentOpen && (
        <AddStudentModal
          courses={courses}
          onClose={() => setAddStudentOpen(false)}
          onSaved={() => {
            setAddStudentOpen(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
