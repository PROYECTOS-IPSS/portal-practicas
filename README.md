# Portal de Prácticas

Sistema web de gestión de **prácticas profesionales** para egresados de un colegio técnico.
Permite a los **estudiantes** registrar y seguir su práctica, y a los **profesores**
supervisar, filtrar, editar, transicionar estados y dar de baja los registros.

## Características

- **Autenticación** con sesión (`express-session`, cookie HTTP-only). Únicas rutas públicas: login y registro.
- **Dos roles** (`STUDENT` / `TEACHER`) con permisos reales aplicados en el backend (RBAC), nunca en el cliente.
- **Estudiante**: crea (`POST`) y consulta (`GET`) **solo sus propias** prácticas. Ver una práctica ajena responde `404` (no revela existencia). Sin botones de editar/eliminar.
- **Profesor**: crea en nombre de cualquier estudiante, lista todas con filtros y paginación, edita, **transiciona el estado** (`ACTIVA → FINALIZADA → EVALUADA`) y aplica **borrado lógico** (soft delete).
- **Reglas de negocio**: una sola práctica `ACTIVA` por estudiante, `studentId` inmutable, `teacherId` reasignable y validado contra rol, fechas coherentes (`endDate >= startDate`).
- **Validación** de `body`, `params` y `query` con **Zod** antes de tocar la base de datos.
- **Frontend** con sistema de diseño propio (ver `docs/design.md`), responsive y accesible.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Node.js, Express 5, TypeScript |
| Base de datos | PostgreSQL, Prisma ORM 7 |
| Frontend | React 19, TypeScript, Tailwind CSS v4, Vite |
| Validación | Zod 4 |
| Seguridad | bcryptjs, express-session |
| Tooling | Yarn, tsx watch, ESLint, oxlint (frontend), Prettier, Vitest |

## Arquitectura (MVC)

```
React / vistas
      ↓ HTTP / REST (JSON, credentials: 'include')
Routes + middlewares (rutas /api, sesión, RBAC, validación Zod, errores)
      ↓
Controllers (reciben la petición ya validada, responden JSON)
      ↓
Services (lógica de negocio: pertenencia, RBAC, estados, soft delete, auth)
      ↓
Models + Prisma (única capa con acceso a PostgreSQL)
      ↓
PostgreSQL
```

## Estructura

```
prisma/
├── migrations/          # migraciones aplicadas
├── schema.prisma        # modelos User e InternshipRecord
└── seed.ts              # datos demo: profesores, estudiantes, prácticas

src/                     # backend
├── app.ts · server.ts
├── config/              # cliente Prisma (adapter pg)
├── controllers/  middleware/  models/  routes/  schemas/  services/
└── types/               # augmentaciones (sesión, req.validated)

frontend/src/            # React
├── auth/                # contexto de autenticación
├── components/          # shell + primitivas ui (design system)
├── services/            # cliente HTTP + APIs
├── views/               # Login, Register, Dashboards, Form, Detalle
└── lib/                 # helpers (fechas)

docs/                    # BRIEF.md (qué) · AGENTS.md (cómo) · design.md
tests/                   # Vitest (backend)
```

## Requisitos

- Node.js ≥ 22
- Yarn (1.22 classic)
- Docker + Docker Compose (para PostgreSQL)

## Puesta en marcha

### 1. Variables de entorno

Crea `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/portal_practicas?schema=public"
SESSION_SECRET="cambia-esto-por-un-secreto-largo-y-aleatorio"
NODE_ENV="development"
```

> `SESSION_SECRET` firma la cookie de sesión; usa un valor propio y nunca lo subas al repo (`.env` está gitignored).

### 2. Levantar PostgreSQL (Docker)

```bash
docker compose up -d
```

Esto crea un contenedor `postgres:17` con la base `portal_practicas`, un volumen
persistente y healthcheck. Verificar estado:

```bash
docker compose ps
```

### 3. Instalar dependencias

```bash
yarn install          # backend (raíz)
cd frontend && yarn   # frontend
```

### 4. Migrar la base de datos

```bash
yarn prisma migrate dev
```

Aplica las migraciones de `prisma/migrations/`.

### 5. Cargar datos de demostración (seed)

```bash
yarn prisma db seed
```

Carga 3 profesores, 3 estudiantes de ejemplo y 6 prácticas demo con estados
variados. Es idempotente: puedes re-ejecutarlo sin duplicar ni pisar datos.

## Datos de ejemplo (seed)

Contraseñas de demostración: profesores `profesor123` · estudiantes `egresado123`.

### Profesores

| Nombre | Email |
|---|---|
| María González | `maria.gonzalez@colegio.cl` |
| Carlos Pérez | `carlos.perez@colegio.cl` |
| Lucía Fernández | `lucia.fernandez@colegio.cl` |

### Estudiantes (demostración)

| Nombre | Email | Carrera |
|---|---|---|
| Joaquín Rojas | `joaquin.rojas@alumno.cl` | Telecomunicaciones |
| Valentina Soto | `valentina.soto@alumno.cl` | Programación |
| Benjamín Cifuentes | `benjamin.cifuentes@alumno.cl` | Redes y Seguridad |

### Prácticas (demostración)

| Estudiante | Empresa | Estado | Periodo |
|---|---|---|---|
| Joaquín Rojas | Telecom Sur Ltda. | EVALUADA | 2025-03-03 → 2025-08-29 |
| Joaquín Rojas | Fibra Andina SpA | ACTIVA | 2026-09-01 → 2027-02-28 |
| Valentina Soto | Softlandia SPA | EVALUADA | 2025-01-06 → 2025-06-27 |
| Valentina Soto | DataCore Chile | FINALIZADA | 2026-03-02 → 2026-08-28 |
| Benjamín Cifuentes | NetSecure Consultores | EVALUADA | 2024-08-05 → 2024-12-20 |
| Benjamín Cifuentes | RedLan Empresas | FINALIZADA | 2025-07-07 → 2025-12-19 |

> Los estados están mezclados (1 ACTIVA · 2 FINALIZADA · 3 EVALUADA) para ejercitar
> filtros, paginación y transiciones. Los estudiantes también pueden crearse desde
> la interfaz (registro público).

### 6. Ejecutar

Backend (puerto 3000):

```bash
yarn dev
```

Frontend (puerto 5173, proxy `/api → :3000`):

```bash
cd frontend && yarn dev
```

Abre **http://localhost:5173**.

## Scripts

**Backend**

| Comando | Acción |
|---|---|
| `yarn dev` | servidor con recarga (`tsx watch`) |
| `yarn build` | compila a `dist/` |
| `yarn start` | ejecuta `dist/server.js` |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn lint` | ESLint |
| `yarn test` | Vitest |
| `yarn format` | Prettier |

**Frontend** (dentro de `frontend/`)

| Comando | Acción |
|---|---|
| `yarn dev` | servidor Vite |
| `yarn build` | `tsc -b && vite build` |
| `yarn lint` | oxlint |

## Endpoints (resumen)

**Auth** (`/api/auth`) — register/login públicos; logout/session con sesión.

**Prácticas** (`/api/internships`) — GET/POST con sesión; GET `/:id`; PUT/DELETE `/:id`
solo profesor (soft delete). Listado con `page`, `pageSize`, `status`, `companyName` y `studentId`.

**Personas** — `GET /api/teachers` (sesión) y `GET /api/students` (solo profesor).

## Testing

```bash
yarn test        # 86 tests (Vitest)
yarn typecheck   # TypeScript estricto
yarn lint        # ESLint backend
```

## Notas de diseño

- **Prisma 7** usa `prisma7.config.ts` (URL desde `.env` vía `dotenv`) y driver adapter `@prisma/adapter-pg`.
- **TypeScript ~6.0** en backend (el ecosistema `typescript-eslint` aún no soporta TS 7 nativo).
- El sistema de diseño del frontend está congelado en `docs/design.md`.
