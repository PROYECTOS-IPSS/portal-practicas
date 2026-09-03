import { Fragment } from 'react';
import type { InternshipStatus } from '../../services/types';

const STEPS: readonly InternshipStatus[] = ['ACTIVA', 'FINALIZADA', 'EVALUADA'];

/**
 * Vía de estado: ACTIVA → FINALIZADA → EVALUADA (firma visual del portal).
 * Nodo actual en teal (brand); pasos completados en verde; pendientes neutros.
 */
export function StateRail({ status }: { status: InternshipStatus }) {
  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const nodeClass =
          index < currentIndex
            ? 'bg-success text-white'
            : index === currentIndex
              ? 'bg-brand text-white'
              : 'border border-line-strong bg-surface text-faint';
        const connectorClass = index <= currentIndex ? 'bg-success' : 'bg-line-strong';

        return (
          <Fragment key={step}>
            {index > 0 ? (
              <span className={`h-px w-8 sm:w-10 ${connectorClass}`} aria-hidden="true" />
            ) : null}
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs ${nodeClass}`}
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wide text-muted">{step}</span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
