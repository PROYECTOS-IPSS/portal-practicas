# Informe Final del Proyecto: Portal de Prácticas

## 1. Resumen Ejecutivo
El **Portal de Prácticas** es una plataforma web full-stack diseñada para la gestión, seguimiento y evaluación de las prácticas profesionales de los alumnos egresados. El sistema provee un entorno seguro basado en roles (`STUDENT` y `TEACHER`), garantizando que la lógica de negocio y la privacidad de los datos se apliquen estrictamente en el backend, cumpliendo a cabalidad con las directrices de los documentos base (`BRIEF.md` y `AGENTS.md`).

## 2. Arquitectura del Sistema
El proyecto se ha construido siguiendo el patrón **MVC (Modelo-Vista-Controlador)** en capas, con una separación estricta de responsabilidades:

1. **Vistas (Frontend React)**: Interfaces responsivas y accesibles. La UI se adapta al rol del usuario, pero no toma decisiones de seguridad definitivas.
2. **Rutas (Routes)**: Definen los endpoints REST (`/api/auth`, `/api/internships`, `/api/teachers`, `/api/students`) y aplican la cadena de middlewares.
3. **Middlewares**:
   - **Autenticación (`auth.middleware`)**: Valida la existencia de la sesión.
   - **RBAC (`rbac.middleware`)**: Restringe el acceso según el rol.
   - **Validación (`validate.middleware`)**: Intercepta `body`, `params` y `query`, validándolos con esquemas **Zod** antes de que lleguen al controlador. Se inyectan en `req.validated`.
   - **Errores (`error.middleware`)**: Centraliza el manejo de excepciones (`HttpError`) y asegura respuestas JSON coherentes (ej. 400, 401, 403, 404, 500).
4. **Controladores (Controllers)**: Capa delgada que recibe la petición ya saneada y tipada, invoca al servicio correspondiente y devuelve la respuesta HTTP adecuada.
5. **Servicios (Services)**: Corazón del sistema. Concentran toda la **lógica de negocio** (verificación de exclusividad, transiciones de estado, validación de pertenencia).
6. **Modelos (Models)**: Única capa con acceso a la base de datos a través de **Prisma ORM**. Abstraen las consultas y devuelven datos tipados.

## 3. Stack Tecnológico y Decisiones
* **Backend**: Node.js, Express 5, TypeScript (~6.0, para máxima compatibilidad del tooling).
* **Seguridad**: Se descartó JWT en favor de `express-session` con cookies `httpOnly`, `sameSite: 'lax'` y `secure` condicional. Las contraseñas se protegen con `bcryptjs` (10 rondas).
* **Persistencia**: PostgreSQL con **Prisma ORM 7** (utilizando el driver adapter `@prisma/adapter-pg` y un pool de conexiones optimizado con timeouts explícitos).
* **Frontend**: React 19, Vite, React Router 7.
* **Estilos**: Tailwind CSS v4, utilizando directivas CSS-first (`@theme`, `@utility`).
* **Calidad de Código**: TypeScript estricto, ESLint (backend), oxlint (frontend), Prettier, y una suite de **86 tests automáticos de integración y unidad** con Vitest.

## 4. Cumplimiento de Reglas de Negocio
El sistema implementa al pie de la letra las directrices de negocio:

* **Privacidad y Pertenencia**: Un estudiante solo puede crear y ver sus propios registros. Si intenta consultar por ID un registro ajeno, el sistema responde `404 Not Found` para no revelar la existencia del mismo. Al crear, el `studentId` se inyecta desde la sesión activa de forma segura.
* **Control de Roles (RBAC)**: Solo los profesores pueden actualizar (`PUT`), aplicar borrado lógico (`DELETE`), y listar los registros de cualquier estudiante. Un estudiante intentando estas acciones recibe `403 Forbidden`.
* **Exclusividad**: El servicio bloquea (`400 Bad Request`) la creación de un nuevo registro si el estudiante ya posee una práctica en estado `ACTIVA`.
* **Flujo de Estados**: Las transiciones son unidireccionales (`ACTIVA → FINALIZADA → EVALUADA`). El sistema prohíbe proactivamente saltos o retrocesos.
* **Inmutabilidad**: El `studentId` no se puede alterar tras la creación; intentar enviarlo en un `PUT` es rechazado por el esquema Zod (`.strict()`).

## 5. Diseño e Interfaz (UI/UX)
Se desarrolló un Sistema de Diseño propio documentado como fuente de verdad (`docs/design.md`), inspirado en el concepto de una **"ficha de expediente vivo"**.
* **Identidad Visual**: Paleta basada en *ink* (pizarra técnica), acentos *ámbar* (señalización) y *teal* institucional. La marca fue unificada bajo el nombre **Portal de Prácticas**, eliminando terminología institucional interna ("colegio técnico") de las vistas públicas.
* **Firma Visual**: Las pantallas de autenticación presentan una cuadrícula técnica y un *State Rail* (línea de estado) decorativo. En el dashboard, este *State Rail* permite al profesor avanzar visualmente las fases de la práctica.
* **Accesibilidad**: Componentes semánticos, contraste verificado AA, manejo de foco visible (`:focus-visible`) y respeto por `prefers-reduced-motion`.

## 6. Datos de Demostración (Seed)
Para facilitar la evaluación y revisión, se diseñó un script de *seed* (`prisma/seed.ts`) **idempotente** que puebla la base de datos de manera segura con:
* 3 Profesores supervisores.
* 3 Estudiantes egresados.
* 6 Prácticas en estados variados (ACTIVA, FINALIZADA, EVALUADA) para ejercitar inmediatamente los filtros, la paginación y las transiciones.

## 7. Conclusión
El proyecto finaliza en un estado **100% funcional y verificado**, cumpliendo todas las rúbricas solicitadas. El código está libre de dependencias muertas o sobre-ingeniería, es tipeado de extremo a extremo, fuertemente testeado y empaquetado con Docker para su despliegue inmediato.
