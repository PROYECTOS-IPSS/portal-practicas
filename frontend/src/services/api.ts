export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Convierte un error capturado en: un mensaje general (para banners) y un mapa
 * de errores por campo (para mostrarlos inline bajo cada input).
 */
export function errorInfo(err: unknown): { general: string | null; fields: Record<string, string> } {
  if (err instanceof ApiError) {
    return err.fieldErrors
      ? { general: null, fields: err.fieldErrors }
      : { general: err.message, fields: {} };
  }
  return { general: err instanceof Error ? err.message : 'Ocurrió un error', fields: {} };
}

const BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const data = (await res.json().catch(() => null)) as
    | { error?: string; fieldErrors?: Record<string, string> }
    | null;

  if (!res.ok) {
    const message = typeof data?.error === 'string' ? data.error : `Error ${res.status}`;
    throw new ApiError(res.status, message, data?.fieldErrors);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
