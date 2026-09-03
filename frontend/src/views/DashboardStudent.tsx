import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { internshipsApi } from '../services/internships';
import type { Internship } from '../services/types';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { FullPageSpinner } from '../components/ui/Spinner';
import { StatusChip } from '../components/ui/StatusChip';
import { formatDate } from '../lib/date';

export function DashboardStudent() {
  const [records, setRecords] = useState<Internship[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    internshipsApi
      .list()
      .then((result) => setRecords(result.records))
      .catch((err) => setError(err instanceof Error ? err.message : 'No pudimos cargar tus prácticas.'));
  }, []);

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }
  if (records === null) {
    return <FullPageSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Prácticas</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Tu práctica profesional</h1>
        <p className="text-sm text-muted">Registra y consulta el avance de tu práctica.</p>
      </div>

      {records.length === 0 ? (
        <EmptyState
          title="Aún no registras tu práctica"
          description="Crea el primer registro de práctica profesional para que tu profesor pueda supervisarla."
          action={
            <Link to="/internships/new">
              <Button>Registrar mi práctica</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
            <table className="w-full text-left">
              <thead className="border-b border-line bg-paper">
                <tr className="font-mono text-xs uppercase tracking-wide text-muted">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Empresa
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Estado
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Periodo
                  </th>
                  <th scope="col" className="px-5 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                    <td className="px-5 py-3 font-medium text-ink">{record.companyName}</td>
                    <td className="px-5 py-3">
                      <StatusChip status={record.status} />
                    </td>
                    <td className="px-5 py-3 font-mono text-sm text-muted">
                      {formatDate(record.startDate)} – {formatDate(record.endDate)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/internships/${record.id}`}
                        className="font-medium text-brand hover:text-brand-strong"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <Link to="/internships/new">
              <Button variant="secondary">Nueva práctica</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
