import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { internshipsApi } from '../services/internships';
import { studentsApi, teachersApi } from '../services/people';
import type { Student, Teacher } from '../services/types';
import { errorInfo } from '../services/api';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Field, Input, Select, Textarea } from '../components/ui/Field';
import { FullPageSpinner } from '../components/ui/Spinner';
import { toDateInput } from '../lib/date';

interface FormState {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  bossName: string;
  bossContact: string;
  startDate: string;
  endDate: string;
  description: string;
  teacherId: string;
  studentId: string;
}

const EMPTY: FormState = {
  companyName: '',
  companyAddress: '',
  companyPhone: '',
  bossName: '',
  bossContact: '',
  startDate: '',
  endDate: '',
  description: '',
  teacherId: '',
  studentId: '',
};

export function InternshipForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(!isEdit);

  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    if (!user) return;
    teachersApi.list().then(setTeachers).catch(() => setTeachers([]));
    if (user.role === 'TEACHER') {
      studentsApi.list().then(setStudents).catch(() => setStudents([]));
    }
  }, [user]);

  useEffect(() => {
    if (!isEdit) {
      setForm((prev) => ({ ...prev, teacherId: user?.role === 'TEACHER' ? (user.id ?? '') : '' }));
      setReady(true);
      return;
    }
    internshipsApi
      .get(id ?? '')
      .then((record) => {
        setForm({
          companyName: record.companyName,
          companyAddress: record.companyAddress,
          companyPhone: record.companyPhone,
          bossName: record.bossName,
          bossContact: record.bossContact,
          startDate: toDateInput(record.startDate),
          endDate: toDateInput(record.endDate),
          description: record.description,
          teacherId: record.teacherId,
          studentId: record.studentId,
        });
        setReady(true);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'No pudimos cargar la práctica.'));
  }, [id, isEdit, user]);

  const updateField = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      if (isEdit) {
        await internshipsApi.update(id ?? '', {
          companyName: form.companyName,
          companyAddress: form.companyAddress,
          companyPhone: form.companyPhone,
          bossName: form.bossName,
          bossContact: form.bossContact,
          startDate: form.startDate,
          endDate: form.endDate,
          description: form.description,
          teacherId: form.teacherId,
        });
        navigate(`/internships/${id}`);
      } else {
        const created = await internshipsApi.create({
          companyName: form.companyName,
          companyAddress: form.companyAddress,
          companyPhone: form.companyPhone,
          bossName: form.bossName,
          bossContact: form.bossContact,
          startDate: form.startDate,
          endDate: form.endDate,
          description: form.description,
          teacherId: form.teacherId,
          ...(isTeacher ? { studentId: form.studentId } : {}),
        });
        navigate(`/internships/${created.id}`);
      }
    } catch (err) {
      const { general, fields } = errorInfo(err);
      setError(general);
      setFieldErrors(fields);
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return <FullPageSpinner />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
          {isEdit ? 'Editar' : 'Nueva'}
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {isEdit ? 'Editar práctica' : 'Registrar práctica'}
        </h1>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Datos de la empresa</h2>
          <Field label="Nombre de la empresa" htmlFor="companyName" error={fieldErrors.companyName}>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(event) => updateField('companyName', event.target.value)}
              invalid={Boolean(fieldErrors.companyName)}
            />
          </Field>
          <Field label="Dirección" htmlFor="companyAddress" error={fieldErrors.companyAddress}>
            <Input
              id="companyAddress"
              value={form.companyAddress}
              onChange={(event) => updateField('companyAddress', event.target.value)}
              invalid={Boolean(fieldErrors.companyAddress)}
            />
          </Field>
          <Field label="Teléfono" htmlFor="companyPhone" error={fieldErrors.companyPhone}>
            <Input
              id="companyPhone"
              value={form.companyPhone}
              onChange={(event) => updateField('companyPhone', event.target.value)}
              invalid={Boolean(fieldErrors.companyPhone)}
            />
          </Field>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Jefe directo</h2>
          <Field label="Nombre del jefe" htmlFor="bossName" error={fieldErrors.bossName}>
            <Input
              id="bossName"
              value={form.bossName}
              onChange={(event) => updateField('bossName', event.target.value)}
              invalid={Boolean(fieldErrors.bossName)}
            />
          </Field>
          <Field
            label="Contacto (email o teléfono)"
            htmlFor="bossContact"
            error={fieldErrors.bossContact}
          >
            <Input
              id="bossContact"
              value={form.bossContact}
              onChange={(event) => updateField('bossContact', event.target.value)}
              invalid={Boolean(fieldErrors.bossContact)}
            />
          </Field>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Práctica</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha de inicio" htmlFor="startDate" error={fieldErrors.startDate}>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(event) => updateField('startDate', event.target.value)}
                invalid={Boolean(fieldErrors.startDate)}
              />
            </Field>
            <Field label="Fecha de término" htmlFor="endDate" error={fieldErrors.endDate}>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(event) => updateField('endDate', event.target.value)}
                invalid={Boolean(fieldErrors.endDate)}
              />
            </Field>
          </div>
          <Field label="Actividades a realizar" htmlFor="description" error={fieldErrors.description}>
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              invalid={Boolean(fieldErrors.description)}
            />
          </Field>
          {isTeacher && !isEdit ? (
            <Field label="Estudiante" htmlFor="studentId" error={fieldErrors.studentId}>
              <Select
                id="studentId"
                value={form.studentId}
                onChange={(event) => updateField('studentId', event.target.value)}
                invalid={Boolean(fieldErrors.studentId)}
              >
                <option value="">Selecciona un estudiante</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} — {student.email}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Field label="Profesor supervisor" htmlFor="teacherId" error={fieldErrors.teacherId}>
            <Select
              id="teacherId"
              value={form.teacherId}
              onChange={(event) => updateField('teacherId', event.target.value)}
              invalid={Boolean(fieldErrors.teacherId)}
            >
              <option value="">Selecciona un profesor</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </Select>
          </Field>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? 'Guardar cambios' : 'Guardar práctica'}
          </Button>
        </div>
      </form>
    </div>
  );
}
