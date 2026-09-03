import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
        <div className="relative">
          <p className="font-display text-3xl font-semibold text-white">Portal de Prácticas TP</p>
        </div>
        <div className="relative">
          <p className="max-w-md text-white/70">
            Registra, da seguimiento y evalúa las prácticas profesionales de los egresados del
            colegio técnico.
          </p>
          <p className="mt-6 font-mono text-xs uppercase tracking-wide text-white/50">
            Colegio técnico · Práctica profesional
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-paper p-6 lg:p-12">
        <div className="w-full max-w-md space-y-4">
          <h1 className="font-display text-xl font-semibold lg:hidden">Portal de Prácticas TP</h1>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Iniciar sesión</h2>
            <p className="text-sm text-muted">Accede con tu cuenta para ver tus prácticas.</p>
          </div>
          {error ? <Alert variant="error">{error}</Alert> : null}
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Field>
            <Field label="Contraseña" htmlFor="password">
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Field>
            <Button type="submit" loading={loading} className="w-full">
              Iniciar sesión
            </Button>
          </form>
          <p className="text-sm text-muted">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-medium text-brand hover:text-brand-strong">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
