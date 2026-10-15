import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/toast';
import type { Course } from '@/lib/types';

interface AddStudentModalProps {
  courses: Course[];
  onClose: () => void;
  onSaved: () => void;
}

export function AddStudentModal({ courses, onClose, onSaved }: AddStudentModalProps) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    student_id: '',
    enrollment_number: '',
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    photo_url: '',
    course_id: courses[0]?.id ?? '',
    semester: 1,
    section: 'A',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!form.student_id.trim()) errs.student_id = 'Student ID is required';
    if (!form.enrollment_number.trim()) errs.enrollment_number = 'Enrollment number is required';
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('students').insert(form);
    setSaving(false);
    if (error) {
      const msg = error.code === '23505' ? 'A student with this ID or enrollment number already exists' : 'Failed to add student';
      showToast(msg, 'error');
    } else {
      showToast('Student added successfully');
      onSaved();
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Add New Student" subtitle="Create a new student record" size="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Student ID" placeholder="e.g. STU007" value={form.student_id} onChange={(e) => update('student_id', e.target.value)} error={errors.student_id} />
        <Input label="Enrollment Number" placeholder="e.g. ENG2021007" value={form.enrollment_number} onChange={(e) => update('enrollment_number', e.target.value)} error={errors.enrollment_number} />
        <Input label="Full Name" placeholder="e.g. John Doe" value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} />
        <Input label="Email" type="email" placeholder="e.g. john@college.edu" value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} />
        <Input label="Phone" placeholder="e.g. +91 98765 43210" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
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
          {Array.from({ length: 8 }, (_, i) => <option key={i + 1} value={i + 1}>Semester {i + 1}</option>)}
        </Select>
        <Select label="Section" value={form.section} onChange={(e) => update('section', e.target.value)}>
          {['A', 'B', 'C', 'D'].map((s) => <option key={s} value={s}>Section {s}</option>)}
        </Select>
        <div className="sm:col-span-2">
          <Input label="Address" placeholder="e.g. 123 Main St, City, State" value={form.address} onChange={(e) => update('address', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Input label="Photo URL" placeholder="https://..." value={form.photo_url} onChange={(e) => update('photo_url', e.target.value)} />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button loading={saving} onClick={handleSubmit}>Add Student</Button>
      </div>
    </Modal>
  );
}
