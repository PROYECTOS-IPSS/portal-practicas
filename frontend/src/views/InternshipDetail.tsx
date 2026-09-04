import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { internshipsApi } from '../services/internships';
import type { Internship } from '../services/types';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FullPageSpinner } from '../components/ui/Spinner';
import { StateRail } from '../components/ui/StateRail';
import { StatusChip } from '../components/ui/StatusChip';
import { formatDate } from '../lib/date';
import { NEXT_STATUS } from '../lib/status';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="text-[15px] text-ink">{value}</p>
    </div>
  );
}

export function InternshipDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Internship | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isTeacher = user?.role === 'TEACHER';

  const load = useCallback(async () => {
    try {
      setRecord(await internshipsApi.get(id ?? ''));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar la práctica.');
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="error">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Volver
        </Button>
      </div>
    );
  }
  if (!record) return <FullPageSpinner />;

  const next = NEXT_STATUS[record.status];

  const advance = async () => {
    if (!next) return;
    if (!window.confirm(`¿Avanzar de ${record.status} a ${next}?`)) return;
    try {
      await internshipsApi.update(record.id, { status: next });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos actualizar el estado.');
    }
  };

  const remove = async () => {
    if (!window.confirm('¿Eliminar esta práctica? Esta acción no se puede deshacer.')) return;
    try {
      await internshipsApi.remove(record.id);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos eliminar la práctica.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Práctica</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{record.companyName}</h1>
          <div className="flex items-center gap-2">
            <StatusChip status={record.status} />
            <span className="font-mono text-xs text-muted">Profesor: {record.teacher.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Volver
          </Button>
        </div>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card>
        <StateRail status={record.status} />
        {isTeacher && next ? (
          <div className="mt-4">
            <Button onClick={() => void advance()}>Avanzar a {next}</Button>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Empresa</h2>
        <DetailRow label="Razón social" value={record.companyName} />
        <DetailRow label="Dirección" value={record.companyAddress} />
        <DetailRow label="Teléfono" value={record.companyPhone} />
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Jefe directo</h2>
        <DetailRow label="Nombre" value={record.bossName} />
        <DetailRow label="Contacto" value={record.bossContact} />
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Práctica</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailRow label="Inicio" value={formatDate(record.startDate)} />
          <DetailRow label="Término" value={formatDate(record.endDate)} />
          <DetailRow label="Estudiante" value={`${record.student.name} (${record.student.email})`} />
          <DetailRow label="Supervisor" value={record.teacher.name} />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-muted">Actividades</p>
          <p className="text-[15px] text-ink">{record.description}</p>
        </div>
      </Card>

      {isTeacher ? (
        <div className="flex items-center justify-end gap-3">
          <Link to={`/internships/${record.id}/edit`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <Button variant="danger" onClick={() => void remove()}>
            Eliminar
          </Button>
        </div>
      ) : null}
    </div>
  );
}
