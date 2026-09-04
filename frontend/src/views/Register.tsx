import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/ui/Alert';
import { BrandMarks } from '../components/ui/BrandMarks';
import { BrandPanel } from '../components/ui/BrandPanel';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [major, setMajor] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ name, email, password, major: major || undefined });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear tu cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel
        eyebrow="Alumnos egresados"
        code="Exp. 0001/26"
        titleA="Portal de"
        mark="Prácticas"
        description="Crea tu cuenta de egresado para registrar tu práctica profesional."
        footer="Registro de egresado"
      />

      <div className="flex items-center justify-center bg-paper p-6 lg:p-12">
        <div className="relative w-full max-w-md">
          <BrandMarks />
          <div className="corner-notch relative space-y-5 rounded-card border border-line bg-surface p-8 shadow-pop">
            <h1 className="font-display text-xl font-semibold lg:hidden">Portal de Prácticas</h1>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Registro</p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">Crear cuenta</h2>
              <p className="mt-1 text-sm text-muted">Regístrate como estudiante para comenzar.</p>
            </div>
            {error ? <Alert variant="error">{error}</Alert> : null}
            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="Nombre completo" htmlFor="name">
                <Input
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </Field>
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
              <Field label="Contraseña" htmlFor="password" hint="Mínimo 8 caracteres.">
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Field>
              <Field
                label="Carrera / especialidad"
                htmlFor="major"
                hint="Opcional. Ej.: Telecomunicaciones."
              >
                <Input id="major" value={major} onChange={(event) => setMajor(event.target.value)} />
              </Field>
              <Button type="submit" loading={loading} className="w-full">
                Crear cuenta
              </Button>
            </form>
            <p className="text-sm text-muted">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-medium text-brand hover:text-brand-strong">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
