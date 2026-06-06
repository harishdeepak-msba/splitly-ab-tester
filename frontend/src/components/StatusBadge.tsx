import type { ExperimentStatus } from '../types';

const config: Record<ExperimentStatus, { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'bg-slate-100 text-slate-600' },
  active:    { label: 'Active',    className: 'bg-emerald-100 text-emerald-700' },
  paused:    { label: 'Paused',    className: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', className: 'bg-blue-100 text-blue-700' },
};

export default function StatusBadge({ status }: { status: ExperimentStatus }) {
  const { label, className } = config[status] ?? config.draft;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {status === 'active' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
      )}
      {label}
    </span>
  );
}
