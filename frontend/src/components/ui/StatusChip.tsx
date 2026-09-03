import type { InternshipStatus } from '../../services/types';

const STYLE: Record<InternshipStatus, string> = {
  ACTIVA: 'bg-amber-soft text-amber-strong',
  FINALIZADA: 'bg-slate-soft text-slate-status',
  EVALUADA: 'bg-success-soft text-success',
};

export function StatusChip({ status }: { status: InternshipStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-chip px-2.5 py-0.5 font-mono text-xs font-medium uppercase tracking-wide ${STYLE[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}
