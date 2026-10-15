import { useEffect, useState, useCallback } from 'react';
import { Search, Users, Eye, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { StudentWithRelations } from '@/lib/types';

interface StudentsListProps {
  onViewStudent: (id: string) => void;
  onAddStudent: () => void;
  refreshKey?: number;
}

const PAGE_SIZE = 10;

export function StudentsList({ onViewStudent, onAddStudent, refreshKey }: StudentsListProps) {
  const [students, setStudents] = useState<StudentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('students')
      .select('id, student_id, enrollment_number, name, email, phone, photo_url, semester, section, course:courses(name)', { count: 'exact' })
      .order('name', { ascending: true });

    if (search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,student_id.ilike.%${search.trim()}%,enrollment_number.ilike.%${search.trim()}%,email.ilike.%${search.trim}%`);
    }

    query = query.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    const { data, count, error } = await query;

    if (error) {
      setStudents([]);
      setTotal(0);
    } else {
      setStudents((data ?? []) as unknown as StudentWithRelations[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      loadStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents, refreshKey]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Search bar + Add button */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="max-w-md w-full">
          <Input
            placeholder="Search by name, ID, enrollment, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <Button onClick={onAddStudent}>
          <UserPlus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Students table */}
      <Card className="overflow-hidden">
        {loading ? (
          <Spinner />
        ) : students.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title={search ? 'No students found' : 'No students yet'}
            message={search ? 'Try adjusting your search terms.' : 'Add your first student to get started.'}
            action={
              !search && (
                <Button onClick={onAddStudent}>
                  <UserPlus className="h-4 w-4" />
                  Add Student
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">Student</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden md:table-cell">Student ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden lg:table-cell">Course</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden sm:table-cell">Semester</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden sm:table-cell">Section</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=e2e8f0&color=475569`}
                            alt={student.name}
                            className="h-9 w-9 rounded-full object-cover bg-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">{student.name}</p>
                            <p className="text-xs text-slate-500 truncate">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge variant="slate">{student.student_id}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-600">
                        {student.course?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-slate-600">
                        {student.semester}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-slate-600">
                        {student.section}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewStudent(student.id)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Showing {page * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE + PAGE_SIZE, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-slate-600 px-2">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
