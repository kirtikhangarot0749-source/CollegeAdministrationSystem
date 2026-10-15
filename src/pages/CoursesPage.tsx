import { useEffect, useState, useCallback } from 'react';
import { Search, GraduationCap, Pencil, Trash2, Plus, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/lib/toast';
import type { Course } from '@/lib/types';

export function CoursesPage() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({});
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('courses').select('*').order('name');
    const courseList = (data ?? []) as Course[];
    setCourses(courseList);

    if (courseList.length > 0) {
      const [subCounts, stuCounts] = await Promise.all([
        supabase.from('subjects').select('course_id'),
        supabase.from('students').select('course_id'),
      ]);
      const subMap: Record<string, number> = {};
      (subCounts.data ?? []).forEach((r: { course_id: string }) => {
        if (r.course_id) subMap[r.course_id] = (subMap[r.course_id] || 0) + 1;
      });
      const stuMap: Record<string, number> = {};
      (stuCounts.data ?? []).forEach((r: { course_id: string }) => {
        if (r.course_id) stuMap[r.course_id] = (stuMap[r.course_id] || 0) + 1;
      });
      setSubjectCounts(subMap);
      setStudentCounts(stuMap);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const filtered = courses.filter((c) => {
    const q = search.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.course_id.toLowerCase().includes(q) || c.department.toLowerCase().includes(q);
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('courses').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    if (error) {
      showToast('Failed to delete course', 'error');
    } else {
      showToast(`Course "${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
      loadCourses();
    }
  }

  async function handleSave(formData: Record<string, unknown>) {
    setSaving(true);
    if (editingCourse) {
      const { error } = await supabase.from('courses').update(formData).eq('id', editingCourse.id);
      setSaving(false);
      if (error) {
        showToast('Failed to update course', 'error');
      } else {
        showToast('Course updated successfully');
        setModalOpen(false);
        setEditingCourse(null);
        loadCourses();
      }
    } else {
      const { error } = await supabase.from('courses').insert(formData);
      setSaving(false);
      if (error) {
        showToast('Failed to add course', 'error');
      } else {
        showToast('Course added successfully');
        setModalOpen(false);
        loadCourses();
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="max-w-md w-full">
          <Input
            placeholder="Search courses by name, ID, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <Button onClick={() => { setEditingCourse(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="h-8 w-8" />}
            title={search ? 'No courses found' : 'No courses yet'}
            message={search ? 'Try adjusting your search.' : 'Add your first course to get started.'}
            action={
              !search && (
                <Button onClick={() => { setEditingCourse(null); setModalOpen(true); }}>
                  <Plus className="h-4 w-4" />
                  Add Course
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-3 text-left font-semibold text-slate-600">Course ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Course Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden md:table-cell">Department</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 hidden sm:table-cell">Duration</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 hidden sm:table-cell">Semesters</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 hidden lg:table-cell">Subjects</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 hidden lg:table-cell">Students</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3"><Badge variant="blue">{course.course_id}</Badge></td>
                    <td className="px-4 py-3 font-medium text-slate-900">{course.name}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600">{course.department}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-center text-slate-600">{course.duration_years} yrs</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-center text-slate-600">{course.num_semesters}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-center"><Badge variant="purple">{subjectCounts[course.id] || 0}</Badge></td>
                    <td className="px-4 py-3 hidden lg:table-cell text-center"><Badge variant="green">{studentCounts[course.id] || 0}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => { setEditingCourse(course); setModalOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(course)} className="text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <CourseFormModal
          course={editingCourse}
          saving={saving}
          onClose={() => { setModalOpen(false); setEditingCourse(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove all subjects and student records associated with this course. This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

function CourseFormModal({
  course,
  saving,
  onClose,
  onSave,
}: {
  course: Course | null;
  saving: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState({
    course_id: course?.course_id || '',
    name: course?.name || '',
    department: course?.department || '',
    duration_years: course?.duration_years ?? 4,
    num_semesters: course?.num_semesters ?? 8,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const errs: Record<string, string> = {};
    if (!form.course_id.trim()) errs.course_id = 'Course ID is required';
    if (!form.name.trim()) errs.name = 'Course name is required';
    if (!form.department.trim()) errs.department = 'Department is required';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(form as unknown as Record<string, unknown>);
  };

  return (
    <Modal open={true} onClose={onClose} title={course ? 'Edit Course' : 'Add New Course'} subtitle={course ? course.name : 'Create a new degree program'} size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Course ID" placeholder="e.g. CSE" value={form.course_id} onChange={(e) => update('course_id', e.target.value)} error={errors.course_id} disabled={!!course} />
          <Input label="Department" placeholder="e.g. Computer Science" value={form.department} onChange={(e) => update('department', e.target.value)} error={errors.department} />
        </div>
        <Input label="Course Name" placeholder="e.g. B.Tech Computer Science" value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Duration (Years)" value={String(form.duration_years)} onChange={(e) => update('duration_years', Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>{y} Year{y > 1 ? 's' : ''}</option>)}
          </Select>
          <Select label="Number of Semesters" value={String(form.num_semesters)} onChange={(e) => update('num_semesters', Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((s) => <option key={s} value={s}>{s} Semester{s > 1 ? 's' : ''}</option>)}
          </Select>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button loading={saving} onClick={handleSubmit}>{course ? 'Save Changes' : 'Add Course'}</Button>
      </div>
    </Modal>
  );
}
