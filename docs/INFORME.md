# Informe Final del Proyecto: Portal de Prácticas

## 1. Resumen Ejecutivo
El **Portal de Prácticas** es una plataforma web full-stack diseñada para la gestión, seguimiento y evaluación de las prácticas profesionales de los alumnos egresados. El sistema provee un entorno seguro basado en roles (`STUDENT` y `TEACHER`), garantizando que la lógica de negocio y la privacidad de los datos se apliquen estrictamente en el backend, cumpliendo a cabalidad con las directrices de los documentos base (`BRIEF.md` y `AGENTS.md`).

> **📸 IMAGEN SUGERIDA AQUÍ:** Captura de pantalla del Dashboard del Profesor, donde se vea la tabla poblada con múltiples registros. Esto muestra la plataforma en pleno funcionamiento desde el primer momento.
> `![Vista general del Portal de Prácticas](ruta/a/tu/imagen-dashboard.png)`

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

> **📸 CÓDIGO SUGERIDO AQUÍ (ARQUITECTURA Y RBAC):** Captura del archivo `src/middleware/rbac.middleware.ts` mostrando la función `requireRole`. Esto demuestra el uso de Middlewares para la capa de seguridad.
> `![Código del Middleware RBAC](ruta/a/tu/codigo-rbac.png)`

> **📸 CÓDIGO SUGERIDO AQUÍ (LÓGICA DE NEGOCIO):** Captura del archivo `src/services/internship.service.ts` mostrando el método `create` o `update`. Esto demuestra cómo los servicios aíslan la lógica y manejan las reglas de pertenencia.
> `![Código del Servicio de Prácticas](ruta/a/tu/codigo-servicio.png)`

## 3. Stack Tecnológico y Decisiones
* **Backend**: Node.js, Express 5, TypeScript (~6.0, para máxima compatibilidad del tooling).
* **Seguridad**: Se descartó JWT en favor de `express-session` con cookies `httpOnly`, `sameSite: 'lax'` y `secure` condicional. Las contraseñas se protegen con `bcryptjs` (10 rondas).
* **Persistencia**: PostgreSQL con **Prisma ORM 7** (utilizando el driver adapter `@prisma/adapter-pg` y un pool de conexiones optimizado con timeouts explícitos).

> **📸 CÓDIGO SUGERIDO AQUÍ (OPTIMIZACIÓN DE BD):** Captura del archivo `src/config/prisma.ts` donde se ve la configuración del `PrismaPg` y los `connectionTimeoutMillis`/`idleTimeoutMillis`. Esto demuestra la optimización de conexiones exigida en la rúbrica.
> `![Optimización del Pool de Prisma](ruta/a/tu/codigo-pool-prisma.png)`
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

> **📸 IMAGEN SUGERIDA AQUÍ:** Captura de pantalla del formulario de creación mostrando errores de validación de Zod en color rojo (ej: fechas mal ingresadas o campos vacíos). Esto demuestra que las reglas estrictas están funcionando.
> `![Validaciones estrictas de negocio](ruta/a/tu/imagen-validaciones.png)`
> **📸 CÓDIGO SUGERIDO AQUÍ (VALIDACIÓN E INTEGRIDAD):** Captura del archivo `src/schemas/internship.schema.ts` mostrando el uso de `.refine` para que `endDate >= startDate` y el `.strict()`, o bien el archivo `src/middleware/validate.middleware.ts`. Esto demuestra validación avanzada de datos.
> `![Código de Validación Zod](ruta/a/tu/codigo-zod.png)`

## 5. Diseño e Interfaz (UI/UX)
Se desarrolló un Sistema de Diseño propio documentado como fuente de verdad (`docs/design.md`), inspirado en el concepto de una **"ficha de expediente vivo"**.
* **Identidad Visual**: Paleta basada en *ink* (pizarra técnica), acentos *ámbar* (señalización) y *teal* institucional. La marca fue unificada bajo el nombre **Portal de Prácticas**, eliminando terminología institucional interna ("colegio técnico") de las vistas públicas.
* **Firma Visual**: Las pantallas de autenticación presentan una cuadrícula técnica y un *State Rail* (línea de estado) decorativo. En el dashboard, este *State Rail* permite al profesor avanzar visualmente las fases de la práctica.
* **Accesibilidad**: Componentes semánticos, contraste verificado AA, manejo de foco visible (`:focus-visible`) y respeto por `prefers-reduced-motion`.

> **📸 IMAGEN SUGERIDA AQUÍ:** Captura de pantalla de la vista de **Login**, destacando el panel izquierdo oscuro con la cuadrícula técnica, el sello coral rotado y la línea de estado decorativa.
> `![Firma visual en el Login](ruta/a/tu/imagen-login.png)`

> **📸 IMAGEN SUGERIDA AQUÍ:** Captura de pantalla de la vista de **Detalle de Práctica** (vista profesor), mostrando el *State Rail* interactivo (los botones de "Avanzar a...") y los chips de estado.
> `![Línea de estado y controles de expediente](ruta/a/tu/imagen-detalle-rail.png)`

## 6. Datos de Demostración (Seed)
Para facilitar la evaluación y revisión, se diseñó un script de *seed* (`prisma/seed.ts`) **idempotente** que puebla la base de datos de manera segura con:
* 3 Profesores supervisores.
* 3 Estudiantes egresados.
* 6 Prácticas en estados variados (ACTIVA, FINALIZADA, EVALUADA) para ejercitar inmediatamente los filtros, la paginación y las transiciones.

## 7. Conclusión

El **Portal de Prácticas** se entrega como una solución completa, funcional y verificada de
extremo a extremo, construida íntegramente sobre la base normativa del proyecto
(`AGENTS.md` y `BRIEF.md`) y alineada, punto por punto, con los criterios de evaluación
solicitados. No se trata únicamente de un conjunto de vistas y endpoints operativos, sino
de un sistema de software con criterio de ingeniería, pensado para ser comprendido,
auditado y evolucionado.

En el **plano de la arquitectura**, el patrón MVC se respeta de manera estricta: las rutas
definen la superficie de la API sin contener lógica, los controladores se limitan a
orquestar, los servicios concentran las reglas de negocio y los modelos constituyen la
única frontera de acceso a la persistencia. Esta separación de responsabilidades convierte
cada capa en una unidad testeable y reemplazable, y convierte la incorporación de nuevas
funcionalidades en un ejercicio de adición antes que de modificación.

En el **plano de la seguridad**, el sistema delega la autoridad exclusivamente en el
servidor. La sesión se gestiona con `express-session` sobre cookies `httpOnly`, las
contraseñas se almacenan con hash `bcrypt`, y el control de acceso basado en roles se
impone en el middleware antes de que cualquier petición alcance la lógica de negocio. La
privacidad se trata como un requisito de producto: un estudiante que accede a un registro
ajeno recibe un `404`, de modo que la API no revela ni siquiera la existencia del dato.

En el **plano de la integridad de los datos**, toda entrada (`body`, `params` y `query`) es
validada con **Zod** antes de tocar la base de datos, y el modelo relacional en
**Prisma/PostgreSQL** refuerza esas garantías con claves únicas, claves foráneas con
restricción de borrado, enumerados y los índices necesarios sobre las relaciones más
consultadas. El ciclo de vida del registro (estados unidireccionales, exclusividad de la
práctica activa, inmutabilidad del estudiante y borrado lógico) queda protegido tanto en
la capa de aplicación como en la de datos.

En el **plano de la calidad**, el código se acompaña de una suite de **86 pruebas
automáticas** que cubren las reglas de negocio, los middlewares de seguridad y los flujos
de autenticación, junto con verificación estática de tipos, lint y formateo en ambas capas.
La revisión final aplicó criterios de simplicidad deliberada (sin dependencias muertas ni
abstracciones prematuras), lo que se traduce en un mantenimiento de bajo costo.

En el **plano de la experiencia**, la interfaz dispone de un sistema de diseño propio y
documentado, responsive y accesible, que comunica el estado del expediente de manera
visual e intuitiva, y de una retroalimentación de validación moderna, con errores
contextualizados campo a campo.

Como resultado, el proyecto queda en un estado listo para demostración y despliegue:
reproducible mediante Docker, documentado en su totalidad y respaldado por evidencia
funcional real. Constituye una base sólida sobre la cual incorporar, de manera natural, las
capacidades que queden fuera del alcance del MVP (reportes, notificaciones, restauración
de registros, entre otras), sin comprometer lo ya construido.
