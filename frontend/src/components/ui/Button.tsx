import type { ButtonHTMLAttributes } from 'react';

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-strong',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-paper',
  danger: 'bg-danger-soft text-danger hover:bg-danger/10',
  ghost: 'text-muted hover:bg-paper hover:text-ink',
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-field px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

export function Button({
  variant = 'primary',
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${className ?? ''}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? 'Guardando…' : children}
    </button>
  );
}
