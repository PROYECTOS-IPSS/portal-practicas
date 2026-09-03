Actúa como un Arquitecto de Software y Agente Principal de Desarrollo. A partir de ahora, te regirás estrictamente por el siguiente documento de directrices para este proyecto.

Imprime "Entendido. He cargado las directrices del Portal de Prácticas y estoy listo para comenzar" y espera mis instrucciones.

# AGENTS.md — Portal de Prácticas

## Propósito

Esta guía define cómo implementar el sistema de gestión de prácticas profesionales para el colegio técnico.

- `docs/BRIEF.md` (o los requerimientos del usuario) definen **qué** debe hacer el producto.
- `AGENTS.md` define **cómo** debe construirse.
  Si hay una contradicción, informar antes de implementar. No agregar alcance por iniciativa propia.

## Stack obligatorio

- Backend: Node.js, Express.js y TypeScript.
- Base de datos: PostgreSQL y Prisma ORM.
- Frontend: React, TypeScript, TailwindCSS y Vite.
- Validación: Zod.
- Seguridad: `bcryptjs` y `express-session`.
- Desarrollo: Yarn, `tsx watch`, ESLint, Prettier y Vitest.
- Docker Compose es opcional.
  Nodemon puede reemplazar `tsx watch`, pero no se deben usar ambos. No agregar dependencias innecesarias.

## Linting

- Backend: ESLint (config flat). Se corre en la raíz del proyecto.
- Frontend: `oxlint` (linter oficial de los templates de Vite, implementado en Rust). Config en `frontend/.oxlintrc.json`; se corre con `yarn lint` dentro de `frontend/`.
- No instalar ESLint en el frontend ni oxlint en el backend: cada capa conserva su linter actual.

## Arquitectura MVC

React / vistas
↓ HTTP / REST
Routes + middlewares
↓
Controllers
↓
Services
↓
Models + Prisma
↓
PostgreSQL

### Frontend

React contiene vistas, componentes y estado de interfaz. No decide de forma definitiva disponibilidad de recursos, permisos ni estado de los registros.
Las vistas nuevas deben ser responsive, accesibles y construidas con TailwindCSS.

### Routes

Define endpoints y conecta middlewares con controllers. No contiene lógica de negocio ni acceso a Prisma.

### Controllers

Recibe la petición HTTP, usa datos validados por Zod, llama al service y devuelve JSON. No contiene consultas Prisma ni reglas complejas.

### Services

Contiene la lógica de negocio: validación de propiedad de los registros, aplicación de reglas de roles (RBAC), creación, edición, y autenticación.

### Models

Contiene todo acceso a Prisma y PostgreSQL. No conoce Express ni React.

### Schemas

Contiene esquemas Zod para validar `body`, `params` y `query`.

### Middleware

Contiene validación de esquemas, verificación de sesión, control de acceso por roles (RBAC) y manejo de errores.

## Estructura mínima

prisma/
├── migrations/
├── schema.prisma
└── seed.ts

src/
├── app.ts
├── server.ts
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── schemas/
└── services/

frontend/src/
├── App.tsx
├── components/
├── views/
└── services/

Crear archivos solo cuando una funcionalidad los necesite. Reutilizar patrones existentes.

## Reglas técnicas del MVP implementado

- Todo el sistema requiere autenticación. No hay rutas públicas a excepción del Login/Registro.
- Los roles disponibles son `STUDENT` y `TEACHER`.
- El acceso al Dashboard requiere una sesión válida.
- `User` contiene `id`, `name`, `email`, `passwordHash`, `role` y `major` (nullable, carrera/especialidad; solo aplica a estudiantes).
- `InternshipRecord` (Práctica) relaciona un `User` (estudiante) con los datos de su práctica.
- **Regla de negocio ESTUDIANTES:** Un estudiante SOLO puede crear (POST) y leer (GET) sus propios registros de práctica. El frontend debe ocultar botones de edición/eliminación para este rol.
- **Regla de negocio PROFESORES:** Un profesor puede crear (POST) registros en nombre de cualquier estudiante, y leer (GET), actualizar (PUT) y eliminar (DELETE) CUALQUIER registro de práctica del sistema. Al crear, el `studentId` enviado debe existir y pertenecer a un usuario con rol `STUDENT`; si no, el service responde 400/404.
- **Regla de negocio ESTUDIANTES (creación):** Al crear un registro, el `studentId` se toma de la sesión activa, nunca del `body`. Esto impide que un estudiante cree prácticas en nombre de otro. El `teacherId` sí viaja en el `body`: el estudiante elige al profesor que lo supervisará, y el backend lo valida.
- **Regla de negocio TEACHER ID:** Tanto el estudiante como el profesor deben enviar `teacherId` al crear (POST). El backend valida que ese ID exista y pertenezca a un usuario con rol `TEACHER`; si no, responde 400. En el PUT del profesor, `teacherId` es modificable (reasignar supervisor) y se vuelve a validar contra rol `TEACHER`.
- El cliente (React) no define permisos. La seguridad real se aplica en los middlewares del backend.
- La sesión usa `express-session` y cookie HTTP-only. En React, las peticiones HTTP deben incluir `credentials: 'include'`.
- Las contraseñas se almacenan con `bcryptjs`.
- Preferir borrado lógico (soft delete) cambiando un estado en lugar de hacer hard delete en la base de datos, a menos que se indique lo contrario.
- No implementar funciones fuera del brief.

### Modelo de Práctica (InternshipRecord)

InternshipRecord
├── id
├── studentId → Relación con User (rol STUDENT, inmutable tras la creación)
├── teacherId → Relación con User (rol TEACHER, profesor supervisor)
├── companyName → Nombre de la empresa
├── companyAddress → Dirección de la empresa
├── companyPhone → Teléfono de la empresa
├── bossName → Nombre del jefe/supervisor directo
├── bossContact → Email o teléfono del jefe directo
├── startDate → Fecha de inicio
├── endDate → Fecha de término
├── description → Actividades a realizar
├── status → ACTIVA, FINALIZADA, EVALUADA
└── deletedAt → Soft delete (nullable)

- Validar con Zod todo `req.body`, `req.params` y `req.query`.
- Nunca confiar en datos enviados por React.
- No usar `any` sin justificación.
- Guardar contraseñas solo como hash con `bcryptjs`.
- No registrar contraseñas, sesiones ni secretos en logs.
- Mantener secretos (como la SESSION_SECRET) en variables de entorno.
- Usar Prisma Client; SQL manual solo con justificación.

## Principios de calidad

El código debe ser:

- limpio y autoexplicativo;
- ordenado y fácil de leer;
- guiado por los principios SOLID;
- Preferir composición sobre herencia.
- Mantener funciones pequeñas, con un solo propósito.
- Nombrar variables, funciones y archivos de forma descriptiva.
- Evitar comentarios que repitan lo que el código ya dice.
- Eliminar código muerto, imports sin usar y variables no referenciadas.

## Git y trabajo colaborativo

- Usar ramas descriptivas según el cambio, por ejemplo `feat/auth`, `feat/crud-practicas`, `feat/dashboard-ui` o `fix/rbac-middleware`.
- Mantener commits pequeños, atómicos y descriptivos.
- Coordinar cambios en `prisma/schema.prisma` y ejecutar migraciones antes de testear.

## Protocolo de agentes

Antes de editar:

1. Leer `AGENTS.md` (este documento).
2. Revisar código relacionado y patrones existentes.
3. Localizar referencias afectadas.

Al implementar:

1. Mantener el flujo MVC estricto.
2. Validar entradas en servidor con Zod ANTES de tocar la BD.
3. Colocar reglas en services.
4. Colocar Prisma en models.
5. Mantener el alcance mínimo del brief.
6. No dejar stubs, mocks, no-ops ni código muerto.

## Definition of Done

- [ ] Entradas validadas con Zod.
- [ ] Tipado TypeScript correcto y estricto.
- [ ] Routes sin lógica de negocio ni Prisma.
- [ ] Services con reglas de negocio.
- [ ] Controladores responden con HTTP status codes correctos (200, 201, 401, 403, 404, 500).
- [ ] Rutas protegidas con sesión (`express-session`).
- [ ] RBAC implementado: Estudiantes bloqueados de PUT/DELETE a nivel de API.
- [ ] Interfaz renderiza condicionalmente según el rol.
- [ ] Typecheck, lint y pruebas relevantes pasan.

## Prohibiciones

No:

- romper MVC;
- acceder a Prisma desde routes, controllers o React;
- omitir validación Zod;
- guardar contraseñas sin hash;
- permitir a un estudiante editar/eliminar datos, ni ver datos de otros estudiantes;
- usar JSON Web Tokens (JWT) (se exige express-session);
- agregar dependencias sin necesidad;
- dejar implementaciones falsas o incompletas.
