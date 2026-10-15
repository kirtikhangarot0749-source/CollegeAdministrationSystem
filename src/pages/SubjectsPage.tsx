import { useEffect, useState, useCallback } from 'react';
import { Search, BookOpen, Pencil, Trash2, Plus, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/lib/toast';
import type { SubjectWithCourse, Course } from '@/lib/types';

export function SubjectsPage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState<SubjectWithCourse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectWithCourse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubjectWithCourse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    const [{ data: subData }, { data: courseData }] = await Promise.all([
      supabase.from('subjects').select('*, course:courses(*)').order('subject_name'),
      supabase.from('courses').select('*').order('name'),
    ]);
    setSubjects((subData ?? []) as unknown as SubjectWithCourse[]);
    setCourses((courseData ?? []) as Course[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const filtered = subjects.filter((s) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || s.subject_name.toLowerCase().includes(q) || s.subject_code.toLowerCase().includes(q) || s.faculty.toLowerCase().includes(q);
    const matchesCourse = filterCourse === 'all' || s.course_id === filterCourse;
    return matchesSearch && matchesCourse;
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('subjects').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    if (error) {
      showToast('Failed to delete subject', 'error');
    } else {
      showToast(`Subject "${deleteTarget.subject_name}" deleted successfully`);
      setDeleteTarget(null);
      loadSubjects();
    }
  }

  async function handleSave(formData: Record<string, unknown>) {
    setSaving(true);
    if (editingSubject) {
      const { error } = await supabase.from('subjects').update(formData).eq('id', editingSubject.id);
      setSaving(false);
      if (error) {
        showToast('Failed to update subject', 'error');
      } else {
        showToast('Subject updated successfully');
        setModalOpen(false);
        setEditingSubject(null);
        loadSubjects();
      }
    } else {
      const { error } = await supabase.from('subjects').insert(formData);
      setSaving(false);
      if (error) {
        showToast('Failed to add subject', 'error');
      } else {
        showToast('Subject added successfully');
        setModalOpen(false);
        loadSubjects();
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Search + filter + Add */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by name, code, or faculty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="sm:w-52">
            <Select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
        </div>
        <Button onClick={() => { setEditingSubject(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-8 w-8" />}
            title={search || filterCourse !== 'all' ? 'No subjects found' : 'No subjects yet'}
            message={search || filterCourse !== 'all' ? 'Try adjusting your search or filter.' : 'Add your first subject to get started.'}
            action={
              !search && filterCourse === 'all' && (
                <Button onClick={() => { setEditingSubject(null); setModalOpen(true); }}>
                  <Plus className="h-4 w-4" />
                  Add Subject
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-3 text-left font-semibold text-slate-600">Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Subject Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden lg:table-cell">Course</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 hidden sm:table-cell">Semester</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 hidden sm:table-cell">Credits</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden md:table-cell">Faculty</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((subject) => (
                  <tr key={subject.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3"><Badge variant="blue">{subject.subject_code}</Badge></td>
                    <td className="px-4 py-3 font-medium text-slate-900">{subject.subject_name}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-600">{subject.course?.name ?? '—'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-center text-slate-600">{subject.semester}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-center"><Badge variant="amber">{subject.credits}</Badge></td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600">{subject.faculty}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => { setEditingSubject(subject); setModalOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(subject)} className="text-red-500 hover:bg-red-50">
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
        <SubjectFormModal
          subject={editingSubject}
          courses={courses}
          saving={saving}
          onClose={() => { setModalOpen(false); setEditingSubject(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deleteTarget?.subject_name}"? This will also remove all student academic records for this subject. This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

function SubjectFormModal({
  subject,
  courses,
  saving,
  onClose,
  onSave,
}: {
  subject: SubjectWithCourse | null;
  courses: Course[];
  saving: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState({
    subject_code: subject?.subject_code || '',
    subject_name: subject?.subject_name || '',
    course_id: subject?.course_id || (courses[0]?.id ?? ''),
    semester: subject?.semester ?? 1,
    credits: subject?.credits ?? 3,
    faculty: subject?.faculty || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const errs: Record<string, string> = {};
    if (!form.subject_code.trim()) errs.subject_code = 'Subject code is required';
    if (!form.subject_name.trim()) errs.subject_name = 'Subject name is required';
    if (!form.faculty.trim()) errs.faculty = 'Faculty name is required';
    if (!form.course_id) errs.course_id = 'Please select a course';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(form as unknown as Record<string, unknown>);
  };

  return (
    <Modal open={true} onClose={onClose} title={subject ? 'Edit Subject' : 'Add New Subject'} subtitle={subject ? subject.subject_name : 'Create a new subject'} size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Subject Code" placeholder="e.g. CS201" value={form.subject_code} onChange={(e) => update('subject_code', e.target.value)} error={errors.subject_code} disabled={!!subject} />
          <Input label="Subject Name" placeholder="e.g. Software Engineering" value={form.subject_name} onChange={(e) => update('subject_name', e.target.value)} error={errors.subject_name} />
        </div>
        <Select label="Course" value={form.course_id} onChange={(e) => update('course_id', e.target.value)} error={errors.course_id}>
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Semester" value={String(form.semester)} onChange={(e) => update('semester', Number(e.target.value))}>
            {Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>Sem {i + 1}</option>)}
          </Select>
          <Select label="Credits" value={String(form.credits)} onChange={(e) => update('credits', Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((c) => <option key={c} value={c}>{c} Credit{c > 1 ? 's' : ''}</option>)}
          </Select>
          <Input label="Faculty" placeholder="e.g. Dr. Smith" value={form.faculty} onChange={(e) => update('faculty', e.target.value)} error={errors.faculty} icon={<User className="h-4 w-4" />} />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button loading={saving} onClick={handleSubmit}>{subject ? 'Save Changes' : 'Add Subject'}</Button>
      </div>
    </Modal>
  );
}
