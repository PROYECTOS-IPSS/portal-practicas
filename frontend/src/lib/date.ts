export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const toDateInput = (iso: string): string => iso.slice(0, 10);
