export type AlertVariant = 'error' | 'info';

const STYLE: Record<AlertVariant, string> = {
  error: 'border-danger/30 bg-danger-soft text-danger',
  info: 'border-line bg-surface text-muted',
};

export function Alert({ variant = 'info', children }: { variant?: AlertVariant; children: string }) {
  return <div className={`rounded-field border px-4 py-3 text-sm ${STYLE[variant]}`}>{children}</div>;
}
