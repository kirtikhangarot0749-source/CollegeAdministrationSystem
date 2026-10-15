import { LayoutDashboard, Users, BookOpen, GraduationCap, Menu, X } from 'lucide-react';
import { type ReactNode, useState } from 'react';

export type Page = 'dashboard' | 'students' | 'courses' | 'subjects';

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems: { id: Page; label: string; icon: ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'students', label: 'Students', icon: <Users className="h-5 w-5" /> },
  { id: 'courses', label: 'Courses', icon: <GraduationCap className="h-5 w-5" /> },
  { id: 'subjects', label: 'Subjects', icon: <BookOpen className="h-5 w-5" /> },
];

export function Sidebar({ current, onNavigate, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 animate-sidebar-slide' : '-translate-x-full'
        }`}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">College Admin</p>
              <p className="text-[11px] text-slate-400 leading-tight">Management System</p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Menu
          </p>
          {navItems.map((item) => {
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onMobileClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-white text-sm font-semibold">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-slate-400 truncate">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface TopBarProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: ReactNode;
}

export function TopBar({ title, subtitle, onMenuClick, actions }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 h-16">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-slate-900 truncate">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </header>
  );
}

export function Layout({
  current,
  onNavigate,
  title,
  subtitle,
  actions,
  children,
}: {
  current: Page;
  onNavigate: (page: Page) => void;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        current={current}
        onNavigate={onNavigate}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="lg:pl-64">
        <TopBar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileOpen(true)}
          actions={actions}
        />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
