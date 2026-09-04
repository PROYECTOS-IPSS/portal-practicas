import type { InternshipStatus } from '../services/types';

// Próximo estado permitido en la secuencia del producto
// (ACTIVA → FINALIZADA → EVALUADA). Fuente única para la UI.
export const NEXT_STATUS: Partial<Record<InternshipStatus, InternshipStatus>> = {
  ACTIVA: 'FINALIZADA',
  FINALIZADA: 'EVALUADA',
};
