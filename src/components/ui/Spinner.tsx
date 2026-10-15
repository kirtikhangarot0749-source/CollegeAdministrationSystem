import { Loader2 } from 'lucide-react';

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className={`${sizes[size]} animate-spin text-blue-500`} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <p className="mt-3 text-sm text-slate-400">Loading...</p>
    </div>
  );
}
