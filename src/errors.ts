// Errores de aplicación con código HTTP para la respuesta final.
// Se propagan con next(err) y el middleware de errores los convierte en JSON.
export class HttpError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string> | undefined;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}
