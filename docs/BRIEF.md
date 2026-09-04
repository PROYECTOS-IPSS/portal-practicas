# Brief — Portal de Prácticas

## Objetivo

Crear una aplicación web para gestionar el registro de prácticas profesionales de los estudiantes egresados de un colegio técnico, con autenticación y dos perfiles de acceso: estudiante y profesor.

Este documento define únicamente el MVP (**qué**). `AGENTS.md` define **cómo** debe construirse. Si hay contradicción, informar antes de implementar.

## Usuarios

### Estudiante

Se registra, inicia sesión y puede:

- crear un registro de práctica profesional;
- consultar los detalles de sus propias prácticas.

No puede editar ni eliminar registros. Tampoco puede ver prácticas de otros estudiantes (la API responde `404`, sin revelar si el registro existe).

### Profesor

Inicia sesión y puede:

- crear prácticas en nombre de cualquier estudiante;
- consultar todos los registros para supervisión y seguimiento, con filtros y paginación;
- actualizar cualquier registro (información incorrecta o desactualizada);
- eliminar registros obsoletos o incorrectos;
- transicionar el estado de las prácticas (`ACTIVA` → `FINALIZADA` → `EVALUADA`).

Las cuentas de profesor se cargan mediante `prisma/seed.ts` (no existe registro público de profesores). El seed también precarga estudiantes y prácticas de demostración (ver anexo al final).

## Flujo de registro de práctica

### Estudiante

1. Se registra (rol `STUDENT`) o inicia sesión.
2. Entra al Dashboard, donde ve "Mis prácticas" y un formulario para agregar.
3. Completa datos de la empresa (nombre, dirección, teléfono), del jefe directo (nombre, contacto), el profesor supervisor (`teacherId`, de la lista de profesores) y fechas y descripción de las actividades.
4. Envía `POST /api/internships` con `teacherId` obligatorio.
5. El servidor valida la sesión y fija `studentId` desde la sesión activa (nunca del `body`).
6. Zod valida los datos; el service verifica que `teacherId` exista y sea rol `TEACHER` (si no, `400`) y que el estudiante no tenga ya una práctica `ACTIVA` (si la tiene, `400`).
7. Crea el registro con estado `ACTIVA` y responde `201` con el registro creado.

### Profesor

1. Inicia sesión con una cuenta precargada (seed).
2. Ve el listado completo de prácticas y un formulario que incluye selector de estudiante y de profesor supervisor (por defecto, él mismo).
3. Envía `POST /api/internships` con `studentId` y `teacherId` explícitos.
4. El servidor valida que `studentId` exista y sea rol `STUDENT` y que `teacherId` exista y sea rol `TEACHER`; si no, responde `400`. Si ese estudiante ya tiene una práctica `ACTIVA`, responde `400`.
5. Crea el registro y responde `201`.

## Reglas del sistema

- Todo el sistema requiere sesión activa (`express-session`, cookie HTTP-only). Únicas rutas públicas: Login y Registro.
- **Estudiante:** solo puede crear (`POST`) y leer (`GET`) sus propios registros. El frontend oculta botones de edición/eliminación para este rol.
- **Profesor:** puede crear (en nombre de estudiantes), leer, actualizar y eliminar cualquier registro.
- **Exclusividad de práctica activa:** un estudiante solo puede tener UNA práctica con estado `ACTIVA` a la vez. Crear una segunda (como estudiante o como profesor) responde `400`.
- **Estado inmutable por el estudiante:** solo el profesor transiciona el estado vía `PUT` (`ACTIVA` → `FINALIZADA` → `EVALUADA`). El estudiante nunca modifica el estado, ni siquiera el de su propia práctica.
- **`studentId` inmutable:** el estudiante dueño de una práctica no puede cambiar después de creada. El esquema `PUT` no acepta `studentId`; si el profesor asignó mal el registro, lo elimina y crea uno nuevo.
- **`teacherId` obligatorio al crear:** tanto el estudiante como el profesor envían `teacherId` en el `POST`. El backend valida que el ID exista y pertenezca a un usuario rol `TEACHER`; si no, `400`. En el `PUT` del profesor, `teacherId` es modificable (reasignar supervisor) y se vuelve a validar.
- Al crear como profesor, `studentId` debe existir y tener rol `STUDENT`; si no, `400`.
- Al crear como estudiante, `studentId` se toma de la sesión. El `body` nunca decide el dueño del registro, pero sí decide `teacherId` (el supervisor elegido).
- **Privacidad:** un estudiante que accede a una práctica ajena (por `GET /:id`) recibe `404`, no `403`: no se revela si el registro existe.
- Zod valida `body`, `params` y `query` en el servidor, antes de tocar la base de datos.
- Actualizar (`PUT`) vuelve a ejecutar la validación Zod completa.
- No se puede leer, modificar ni eliminar un registro ya eliminado (`404`).
- Eliminar es **borrado lógico**: el registro se marca con `deletedAt` y deja de aparecer en listados, pero permanece en la base de datos.
- El estado de la práctica (`ACTIVA`, `FINALIZADA`, `EVALUADA`) es independiente de la eliminación. Al crear, el estado inicial es `ACTIVA`.
- `endDate` debe ser mayor o igual a `startDate`. Se admiten fechas pasadas (una práctica ya realizada puede registrarse después).
- Los datos de contacto del estudiante (nombre, email) se obtienen de su perfil `User`; no se duplican en el registro de práctica.
- El rol lo decide siempre el servidor. React solo oculta o muestra acciones según el rol; nunca define permisos reales.

## Arquitectura MVC

```
React / vistas (Login, Registro, Dashboard Estudiante, Dashboard Profesor)
      ↓ HTTP / REST (JSON, credentials: 'include')
Routes + middlewares (rutas /api, sesión, RBAC, validación Zod, manejo de errores)
      ↓
Controllers (reciben la petición ya validada, llaman al service, responden JSON)
      ↓
Services (lógica de negocio: pertenencia, RBAC, estados, soft delete, autenticación)
      ↓
Models + Prisma (única capa con acceso a PostgreSQL)
      ↓
PostgreSQL
```

### Responsabilidades por capa

- **Frontend (React):** vistas, componentes y estado de interfaz. Formularios, listados y navegación condicional por rol. No valida permisos de forma definitiva ni accede a Prisma.
- **Routes:** definen los endpoints y conectan middlewares con controllers. Sin lógica de negocio ni consultas.
- **Middlewares:** verifican sesión (`requireAuth`), aplican RBAC (`requireTeacher`), validan esquemas Zod y centralizan errores.
- **Controllers:** reciben `req` con datos ya validados, delegan en services y responden JSON con códigos HTTP correctos (`200`, `201`, `400`, `401`, `403`, `404`, `500`).
- **Services:** contienen las reglas de negocio (¿el registro le pertenece al estudiante?, ¿puede el profesor editar esto?, exclusividad de práctica activa, transiciones de estado, soft delete, login/registro).
- **Models:** único acceso a Prisma/PostgreSQL. No conocen Express ni React.
- **Schemas:** esquemas Zod para `body`, `params` y `query`.

### Recorrido de una petición (ejemplo: estudiante crea práctica)

1. React envía `POST /api/internships` con `credentials: 'include'` y el JSON del formulario.
2. Middleware `requireAuth`: valida la cookie de sesión. Sin sesión → `401`.
3. Middleware de validación: Zod valida el `body`. Inválido → `400`, sin tocar la BD.
4. Route delega en el controller correspondiente.
5. El controller llama al service `createInternship` pasando `userId` de la sesión.
6. El service fija `studentId = userId` de la sesión, valida `teacherId` (rol `TEACHER`) y aplica reglas de negocio (exclusividad `ACTIVA`, fechas coherentes, estado inicial `ACTIVA`).
7. El service invoca al model, que ejecuta `prisma.internshipRecord.create`.
8. El controller responde `201` con el registro; React actualiza el listado.

## Endpoints (MVP)

### Auth (`/api/auth`)

| Método | Ruta        | Acceso  | Función                                       |
| ------ | ----------- | ------- | --------------------------------------------- |
| POST   | `/register` | Público | Crea cuenta rol `STUDENT`                     |
| POST   | `/login`    | Público | Inicia sesión                                 |
| POST   | `/logout`   | Sesión  | Cierra sesión                                 |
| GET    | `/session`  | Sesión  | Devuelve usuario autenticado (para Dashboard) |

### Prácticas (`/api/internships`)

| Método | Ruta   | Acceso   | Función                                                                                                                          |
| ------ | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/`    | Sesión   | Listado paginado. Estudiante: solo sus prácticas. Profesor: todas, con filtros                                                   |
| POST   | `/`    | Sesión   | Estudiante: propia (estado `ACTIVA`). Profesor: en nombre de un estudiante. Ambos envían `teacherId` obligatorio (rol `TEACHER`) |
| GET    | `/:id` | Sesión   | Estudiante: solo si es suya (ajena → `404`). Profesor: cualquiera                                                                |
| PUT    | `/:id` | Profesor | Actualiza cualquier registro (sin `studentId`; `teacherId` reasignable)                                                          |
| DELETE | `/:id` | Profesor | Soft delete de cualquier registro                                                                                                |

**Listado (`GET /`) — query params validados con Zod:**

- `page` (default `1`) y `pageSize` (default `10`, máximo `50`) para ambos roles.
- `status` y `companyName` (coincidencia parcial, case-insensitive) para ambos roles.
- `studentId` solo para `TEACHER`. Si un `STUDENT` lo envía → `400`.
- Respuesta: `{ records: [...], total, page, pageSize }`. Los registros eliminados (soft delete) nunca aparecen.

### Estudiantes (`/api/students`)

| Método | Ruta | Acceso   | Función                                                                |
| ------ | ---- | -------- | ---------------------------------------------------------------------- |
| GET    | `/`  | Profesor | Lista `id`, `name`, `email` de estudiantes (para el selector al crear) |

### Profesores (`/api/teachers`)

| Método | Ruta | Acceso | Función                                                                             |
| ------ | ---- | ------ | ----------------------------------------------------------------------------------- |
| GET    | `/`  | Sesión | Lista `id`, `name` de profesores (para que el estudiante elija supervisor al crear) |

## Datos mínimos

### User

- `id`;
- `name`;
- `email` único;
- `passwordHash` (bcryptjs);
- `role`: `STUDENT` o `TEACHER`;
- `major` (nullable): carrera o especialidad (ej. Telecomunicaciones). Solo aplica a estudiantes;
- `createdAt`, `updatedAt`.

### InternshipRecord (Práctica)

- `id`;
- `studentId` → relación con `User` rol `STUDENT` (inmutable tras la creación);
- `teacherId` → relación con `User` rol `TEACHER`, profesor encargado de supervisar;
- `companyName` → nombre de la empresa;
- `companyAddress` → dirección de la empresa;
- `companyPhone` → teléfono de la empresa;
- `bossName` → nombre del jefe/supervisor directo;
- `bossContact` → email o teléfono del jefe directo;
- `startDate` → fecha de inicio;
- `endDate` → fecha de término;
- `description` → descripción de las actividades a realizar;
- `status`: `ACTIVA`, `FINALIZADA` o `EVALUADA`;
- `deletedAt` (nullable) → soft delete;
- `createdAt`, `updatedAt`.

El nombre y email del estudiante y del profesor supervisor se obtienen desde sus `User`; no se duplican en la práctica.

## Criterios de aceptación

- [ ] Un visitante puede registrarse (rol estudiante), iniciar sesión y cerrar sesión.
- [ ] Las rutas protegidas rechazan peticiones sin sesión con `401`.
- [ ] Un estudiante autenticado puede crear un registro de práctica y consultar sus propias prácticas.
- [ ] Un estudiante no puede ver prácticas de otros estudiantes: la API responde `404` (no revela existencia) y la UI no ofrece cómo acceder a ellas.
- [ ] Un estudiante no puede actualizar ni eliminar registros: la API lo bloquea (`403`) y la UI oculta las acciones.
- [ ] Un estudiante con una práctica `ACTIVA` recibe `400` al intentar crear otra.
- [ ] Un profesor puede listar todas las prácticas (paginado), crear en nombre de cualquier estudiante, actualizar y eliminar cualquier práctica.
- [ ] Un profesor puede filtrar el listado por `status`, `companyName` y `studentId`.
- [ ] Al crear como profesor, un `studentId` inexistente o que no sea rol `STUDENT` responde `400`.
- [ ] Un `POST` (de estudiante o profesor) sin `teacherId`, o con `teacherId` que no sea rol `TEACHER`, responde `400`.
- [ ] Al crear como profesor para un estudiante con práctica `ACTIVA` existente, responde `400`.
- [ ] Entradas inválidas (`body`, `params`, `query`, incluido `page`/`pageSize` fuera de rango) se rechazan con `400` por Zod, antes de la base de datos.
- [ ] Al crear como estudiante, el `studentId` del registro es el de la sesión, aunque el `body` intente enviar otro.
- [ ] El `PUT` no permite cambiar `studentId`: si se envía, responde `400`. Sí permite reasignar `teacherId`, validado como rol `TEACHER`.
- [ ] Solo el profesor puede cambiar el estado de una práctica (`ACTIVA` → `FINALIZADA` → `EVALUADA`).
- [ ] Eliminar un registro lo marca como eliminado (soft delete); no desaparece físicamente ni aparece en listados.
- [ ] `endDate` anterior a `startDate` se rechaza con `400`.
- [ ] El registro de práctica creado responde `201`; errores de negocio usan `400`, `401`, `403`, `404` y `500` según corresponda.
- [ ] La interfaz funciona en móvil y escritorio, con acciones visibles según el rol.

## Fuera del MVP

- Recuperación o cambio de contraseña y envío de emails.
- Registro público de profesores o panel de administración de usuarios.
- Reportes y estadísticas.
- Archivos adjuntos (certificados, informes de práctica).
- Calendario visual o notificaciones.
- API pública o aplicación móvil.
- Restauración de registros eliminados (soft delete es irreversible en el MVP).

## Anexo — Datos de ejemplo (seed)

`yarn prisma db seed` carga los datos de demostración del sistema. Es idempotente:
los usuarios se actualizan por `email` (sin pisar datos) y las prácticas demo solo
se insertan si no existe una idéntica. Contraseñas de demostración: profesores
`profesor123`, estudiantes `egresado123`.

### Profesores

| Nombre | Email |
|---|---|
| María González | `maria.gonzalez@colegio.cl` |
| Carlos Pérez | `carlos.perez@colegio.cl` |
| Lucía Fernández | `lucia.fernandez@colegio.cl` |

### Estudiantes (de demostración)

| Nombre | Email | Carrera |
|---|---|---|
| Joaquín Rojas | `joaquin.rojas@alumno.cl` | Telecomunicaciones |
| Valentina Soto | `valentina.soto@alumno.cl` | Programación |
| Benjamín Cifuentes | `benjamin.cifuentes@alumno.cl` | Redes y Seguridad |

### Prácticas de demostración

| Estudiante | Empresa | Estado | Periodo |
|---|---|---|---|
| Joaquín Rojas | Telecom Sur Ltda. | EVALUADA | 2025-03-03 → 2025-08-29 |
| Joaquín Rojas | Fibra Andina SpA | ACTIVA | 2026-09-01 → 2027-02-28 |
| Valentina Soto | Softlandia SPA | EVALUADA | 2025-01-06 → 2025-06-27 |
| Valentina Soto | DataCore Chile | FINALIZADA | 2026-03-02 → 2026-08-28 |
| Benjamín Cifuentes | NetSecure Consultores | EVALUADA | 2024-08-05 → 2024-12-20 |
| Benjamín Cifuentes | RedLan Empresas | FINALIZADA | 2025-07-07 → 2025-12-19 |

Los estados están mezclados a propósito (1 ACTIVA, 2 FINALIZADA, 3 EVALUADA) para
ejercitar filtros, paginación y transiciones. Solo un estudiante (Joaquín) tiene
práctica ACTIVA, respetando la exclusividad del sistema.
