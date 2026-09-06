import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

const FIELD_BASE =
  'w-full rounded-field border bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-faint focus:outline-none focus:ring-2';
const FIELD_NORMAL = 'border-line-strong focus:border-brand focus:ring-brand/40';
const FIELD_INVALID = 'border-danger focus:border-danger focus:ring-danger/40';

interface ControlProps {
  invalid?: boolean;
}

export function Input({ className, invalid, ...rest }: InputHTMLAttributes<HTMLInputElement> & ControlProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={`${FIELD_BASE} ${invalid ? FIELD_INVALID : FIELD_NORMAL} ${className ?? ''}`}
      {...rest}
    />
  );
}

export function Select({
  className,
  invalid,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & ControlProps) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={`${FIELD_BASE} appearance-none pr-9 ${invalid ? FIELD_INVALID : FIELD_NORMAL} ${className ?? ''}`}
        {...rest}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

export function Textarea({
  className,
  invalid,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & ControlProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={`${FIELD_BASE} min-h-[6rem] resize-y ${invalid ? FIELD_INVALID : FIELD_NORMAL} ${className ?? ''}`}
      {...rest}
    />
  );
}

export interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-sm text-muted">{hint}</p> : null}
      {error ? (
        <p className="flex items-start gap-1.5 text-sm text-danger" role="alert">
          <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-4.75a.75.75 0 0 1 1.5 0 .75.75 0 0 1-1.5 0Zm.75-7a.75.75 0 0 1 .75.75V11a.75.75 0 0 1-1.5 0V7a.75.75 0 0 1 .75-.75Z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
