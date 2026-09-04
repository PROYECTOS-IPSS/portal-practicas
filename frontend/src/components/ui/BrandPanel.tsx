import { Fragment } from 'react';

const RAIL_STEPS = ['ACTIVA', 'FINALIZADA', 'EVALUADA'];

export interface BrandPanelProps {
  eyebrow: string;
  code: string;
  titleA: string;
  /** Palabra del título resaltada con el bloque ámbar (marca). */
  mark: string;
  description: string;
  footer: string;
}

/**
 * Panel de marca de las pantallas de autenticación: evoca la "ficha de
 * expediente" de una práctica, con el rail de estados del producto como
 * artefacto (la luz ámbar = práctica ACTIVA).
 */
export function BrandPanel({ eyebrow, code, titleA, mark, description, footer }: BrandPanelProps) {
  return (
    <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-10">
      <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-1 signal-strip" aria-hidden="true" />

      <div className="relative">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/60">{eyebrow}</p>
        <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{code}</p>
        <h1 className="mt-8 font-display text-4xl font-semibold leading-[1.05] text-white xl:text-5xl">
          {titleA}
          <br />
          <span className="mt-2 inline-block -rotate-1 rounded-sm bg-accent px-3 pb-1 font-display text-white">
            {mark}
          </span>
        </h1>
      </div>

      <div className="relative space-y-8">
        <p className="max-w-md text-white/70">{description}</p>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
            Seguimiento de la práctica
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-2">
            {RAIL_STEPS.map((step, index) => (
              <Fragment key={step}>
                {index > 0 ? (
                  <span
                    className={`h-px w-8 ${index === 1 ? 'bg-accent/50' : 'bg-white/15'}`}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">
                  <span
                    className={
                      index === 0
                        ? 'h-2 w-2 rounded-full bg-accent signal-glow'
                        : 'h-2 w-2 rounded-full border border-white/25'
                    }
                    aria-hidden="true"
                  />
                  {step}
                </span>
              </Fragment>
            ))}
          </div>
        </div>

        <p className="font-mono text-xs uppercase tracking-wide text-white/50">{footer}</p>
      </div>
    </div>
  );
}
