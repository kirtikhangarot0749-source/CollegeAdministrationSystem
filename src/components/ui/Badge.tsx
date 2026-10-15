import { type ReactNode } from 'react';

type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'purple';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  purple: 'bg-violet-50 text-violet-700 border-violet-200',
};

export function Badge({ children, variant = 'slate', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function getGradeColor(grade: string): BadgeVariant {
  if (grade.startsWith('A')) return 'green';
  if (grade.startsWith('B')) return 'blue';
  if (grade.startsWith('C')) return 'amber';
  return 'red';
}

export function getAttendanceColor(percentage: number): BadgeVariant {
  if (percentage >= 85) return 'green';
  if (percentage >= 75) return 'blue';
  if (percentage >= 65) return 'amber';
  return 'red';
}
