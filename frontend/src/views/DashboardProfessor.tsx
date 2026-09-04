import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import { internshipsApi } from '../services/internships';
import { studentsApi } from '../services/people';
import type { Internship, InternshipList, InternshipStatus, Student } from '../services/types';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Field';
import { FullPageSpinner } from '../components/ui/Spinner';
import { StatusChip } from '../components/ui/StatusChip';
import { formatDate } from '../lib/date';
import { NEXT_STATUS } from '../lib/status';

const STATUS_OPTIONS: InternshipStatus[] = ['ACTIVA', 'FINALIZADA', 'EVALUADA'];

export function DashboardProfessor() {
  const [data, setData] = useState<InternshipList | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'' | InternshipStatus>('');
  const [studentId, setStudentId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await internshipsApi.list({ page, status: status || undefined, studentId: studentId || undefined, companyName: search });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar las prácticas.');
    }
  }, [page, status, studentId, search]);

  useEffect(() => {
    studentsApi.list().then(setStudents).catch(() => setStudents([]));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(companyName);
  };

  const advance = async (record: Internship) => {
    const next = NEXT_STATUS[record.status];
    if (!next) return;
    if (!window.confirm(`¿Avanzar "${record.companyName}" de ${record.status} a ${next}?`)) return;
    try {
      await internshipsApi.update(record.id, { status: next });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos actualizar el estado.');
    }
  };

  const remove = async (record: Internship) => {
    if (!window.confirm(`¿Eliminar la práctica de "${record.companyName}"? Esta acción no se puede deshacer.`)) return;
    try {
      await internshipsApi.remove(record.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos eliminar la práctica.');
    }
  };

  if (!data && !error) return <FullPageSpinner />;

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Prácticas</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Seguimiento de prácticas</h1>
        </div>
        <Link to="/internships/new">
          <Button>Nueva práctica</Button>
        </Link>
      </div>

      <form
        onSubmit={applyFilters}
        className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-card sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Field label="Empresa" htmlFor="companyName">
            <Input
              id="companyName"
              placeholder="Buscar por nombre…"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
          </Field>
        </div>
        <div>
          <Field label="Estado" htmlFor="status">
            <Select
              id="status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as '' | InternshipStatus);
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div>
          <Field label="Estudiante" htmlFor="studentId">
            <Select
              id="studentId"
              value={studentId}
              onChange={(event) => {
                setStudentId(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {data && data.records.length === 0 ? (
        <p className="text-sm text-muted">No hay prácticas que coincidan con los filtros.</p>
      ) : null}

      {data && data.records.length > 0 ? (
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-line bg-paper">
                <tr className="font-mono text-xs uppercase tracking-wide text-muted">
                  <th scope="col" className="px-5 py-3 font-medium">Estudiante</th>
                  <th scope="col" className="px-5 py-3 font-medium">Empresa</th>
                  <th scope="col" className="px-5 py-3 font-medium">Estado</th>
                  <th scope="col" className="px-5 py-3 font-medium">Periodo</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((record) => (
                  <tr key={record.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{record.student.name}</p>
                      <p className="font-mono text-xs text-muted">{record.student.email}</p>
                    </td>
                    <td className="px-5 py-3 font-medium text-ink">{record.companyName}</td>
                    <td className="px-5 py-3">
                      <StatusChip status={record.status} />
                    </td>
                    <td className="px-5 py-3 font-mono text-sm text-muted">
                      {formatDate(record.startDate)} – {formatDate(record.endDate)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-3 text-sm">
                        <Link to={`/internships/${record.id}`} className="font-medium text-brand hover:text-brand-strong">
                          Ver
                        </Link>
                        <Link to={`/internships/${record.id}/edit`} className="font-medium text-brand hover:text-brand-strong">
                          Editar
                        </Link>
                        {NEXT_STATUS[record.status] ? (
                          <button
                            type="button"
                            onClick={() => void advance(record)}
                            className="font-medium text-muted hover:text-ink"
                          >
                            Avanzar
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void remove(record)}
                          className="font-medium text-danger hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-line bg-paper px-5 py-3">
            <p className="font-mono text-xs text-muted">
              {data.total} registro{data.total === 1 ? '' : 's'} · página {data.page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <Button variant="secondary" disabled={data.page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
