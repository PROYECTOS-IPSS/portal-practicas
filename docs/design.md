# Portal de Prácticas — Sistema de Diseño (Design System)

Documento fuente única del estilo del frontend. Toda la UI se construye **solo** con las
clases y tokens definidos aquí. No inventar colores, espaciados ni tipografías nuevas:
si un componente necesita algo que no está, se añade a este documento primero.

Stack: React 19 + Vite + Tailwind CSS v4 (`@tailwindcss/vite`, ya configurado en
`frontend/vite.config.ts`). Tailwind v4 es CSS-first: los tokens se declaran con `@theme`.

---

## 1. Dirección de diseño

**Tesis:** el portal es el *expediente de seguimiento* de la práctica profesional. Cada
práctica es un trámite que avanza por estados reales (`ACTIVA → FINALIZADA → EVALUADA`),
así que la pieza central de la interfaz es la **vía de estado** (state rail): un stepper
horizontal que muestra en qué punto del proceso está cada práctica. No es decoración: los
estados son una secuencia real que el usuario necesita leer de un vistazo.

**Audiencia:** alumnos egresados que registran su práctica profesional, y profesores que
supervisan. Lenguaje de "gestión", sin jerga de sistema.

> **Marca:** el producto se llama "Portal de Prácticas". No usar "TP" ni "colegio técnico"
> en la UI ni en los textos visibles.

**Paleta — decisión de identidad:** base *ink* (pizarra técnica, no azul corporativo) con
un acento *ámbar* de señalización (la práctica en curso es una "luz ámbar") y un *teal*
institucional para las acciones primarias. El verde solo significa "EVALUADA/aprobada",
el rojo solo "error". Evita el azul por defecto de los dashboards y el verde ácido genérico.

**Firma visual (signature):** en autenticación, la **ficha de expediente**: panel ink con
cuadrícula técnica, título display con la palabra clave en **sello ámbar** rotado
(ej. *Portal de [Prácticas]*), código `Exp. 0001/26` en mono y el **state rail** del
producto con la luz ámbar de "ACTIVA" encendida (`signal-glow`). Dentro de la app, el
**state rail** ámbar/teal/verde es la pieza central. Solo estos momentos llevan carácter;
el resto se mantiene disciplinado.

**Tipografía:** *Space Grotesk* (display, técnica con carácter) para títulos y marca;
*Inter* para texto; *JetBrains Mono* para datos (IDs, emails, fechas, cifras). La mono está
justificada: el sistema muestra IDs reales (cuid), emails y estados que se leen mejor
alineados en mono.

---

## 2. Tokens (`@theme`)

Reemplazar el contenido de `frontend/src/index.css` por este bloque (y los estilos base
de la sección 3). Los valores hex son la fuente de verdad; no re-declararlos en componentes.

```css
@import "tailwindcss";

@theme {
  /* Paleta */
  --color-ink: #14232f;          /* texto principal / títulos */
  --color-ink-soft: #2c3f4e;     /* texto de apoyo sobre paper */
  --color-muted: #5b6b76;        /* texto secundario */
  --color-faint: #8a99a3;        /* placeholders / etiquetas inactivas */

  --color-paper: #f6f7f4;        /* fondo general */
  --color-surface: #ffffff;      /* tarjetas / paneles */
  --color-line: #e3e7ea;         /* bordes */
  --color-line-strong: #cdd5da;  /* bordes de énfasis */

  --color-brand: #116466;        /* acción primaria (teal institucional) */
  --color-brand-strong: #0c5052; /* hover/activo */
  --color-brand-soft: #e2efef;   /* fondo suave de marca */

  --color-amber: #e08a1e;        /* ACTIVA / señal de "en curso" */
  --color-amber-strong: #9a5a00; /* texto ámbar accesible sobre claro */
  --color-amber-soft: #fdf1e0;   /* fondo de chip ACTIVA */

  --color-success: #2e7d4f;      /* EVALUADA / éxito */
  --color-success-soft: #e6f2ea;

  --color-slate-status: #5b6b76; /* FINALIZADA (neutro "cerrado") */
  --color-slate-soft: #edf0f2;

  --color-danger: #b23a3a;       /* error */
  --color-danger-soft: #fbeaea;

  /* Tipografía */
  --font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", monospace;

  /* Radios */
  --radius-field: 0.5rem;   /* inputs / botones */
  --radius-card: 0.75rem;   /* tarjetas / paneles */
  --radius-chip: 9999px;    /* chips de estado */

  /* Sombras (solo dos niveles, mantener planas) */
  --shadow-card: 0 1px 2px rgb(20 35 47 / 0.04), 0 1px 3px rgb(20 35 47 / 0.06);
  --shadow-pop: 0 10px 30px -8px rgb(20 35 47 / 0.18);

  /* Curvas de motion */
  --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
}
```

### Utilidades propias (`index.css`, fuera de `@theme`)

```css
/* Esquina de "ficha": recorta la esquina superior derecha del elemento. */
@utility corner-notch {
  clip-path: polygon(0 0, calc(100% - 1.25rem) 0, 100% 1.25rem, 100% 100%, 0 100%);
}

/* Cinta de señalización (ámbar → teal), borde superior de marca. */
@utility signal-strip {
  background: linear-gradient(90deg, var(--color-amber), var(--color-brand));
}

/* Luz de señal encendida (estado ACTIVA) sobre fondo ink. */
@utility signal-glow {
  box-shadow: 0 0 0 4px rgb(224 138 30 / 0.22), 0 0 18px rgb(224 138 30 / 0.45);
}
```

**Carga de fuentes** — añadir en `frontend/index.html` (antes de `</head>`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap"
  rel="stylesheet"
/>
```

---

## 3. Base global

```css
@layer base {
  * {
    border-color: var(--color-line);
  }
  body {
    background-color: var(--color-paper);
    color: var(--color-ink);
    font-family: var(--font-sans);
    font-size: 0.9375rem; /* 15px */
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3 {
    font-family: var(--font-display);
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-ink);
  }
  /* Foco visible siempre (accesibilidad) */
  :focus-visible {
    outline: 2px solid var(--color-brand);
    outline-offset: 2px;
  }
  ::selection {
    background: var(--color-brand-soft);
    color: var(--color-ink);
  }
}
```

---

## 4. Escala tipográfica

| Rol | Clases | Uso |
|---|---|---|
| Display / título de página | `font-display text-2xl font-semibold tracking-tight` | Título de vista |
| Título de sección | `font-display text-lg font-semibold` | Encabezado de panel |
| Texto base | `text-[15px] text-ink` (o `text-muted` para secundario) | Cuerpo |
| Texto pequeño | `text-sm text-muted` | Ayudas, metadatos |
| Eyebrow (etiqueta de sección) | `font-mono text-xs uppercase tracking-[0.12em] text-muted` | Etiquetas tipo "PRÁCTICAS", "MIS DATOS" |
| Dato (ID/email/fecha/cifra) | `font-mono text-sm` | Valores técnicos |
| Estado | `font-mono text-xs font-medium uppercase tracking-wide` | Chips de estado |

---

## 5. Componentes (recetas congeladas)

### 5.1 Botones

- **Primario**: `inline-flex items-center gap-2 rounded-field bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50`
- **Secundario**: `inline-flex items-center gap-2 rounded-field border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper`
- **Peligro (solo profesor: eliminar)**: `inline-flex items-center gap-2 rounded-field bg-danger-soft px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10`
- **Ghost**: `inline-flex items-center gap-2 rounded-field px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-paper hover:text-ink`

### 5.2 Campos de formulario

- **Label**: `block text-sm font-medium text-ink`
- **Input**: `w-full rounded-field border border-line-strong bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand`
- **Select**: igual que Input + `appearance-none` con chevrón (envolver en `relative` con icono `absolute right-3`).
- **Textarea**: igual que Input + `min-h-[6rem] resize-y`
- **Error de campo**: `mt-1 text-sm text-danger`
- **Ayuda**: `mt-1 text-sm text-muted`
- **Grupo de formulario**: `space-y-4`

### 5.3 Tarjeta / panel

`rounded-card border border-line bg-surface p-5 shadow-card`

### 5.4 Chips de estado (firma semántica)

| Estado | Clases |
|---|---|
| ACTIVA | `inline-flex items-center gap-1.5 rounded-chip bg-amber-soft px-2.5 py-0.5 font-mono text-xs font-medium uppercase tracking-wide text-amber-strong` |
| FINALIZADA | `... bg-slate-soft ... text-slate-status` (mismo esqueleto) |
| EVALUADA | `... bg-success-soft ... text-success` |

El punto de señal lleva un `h-1.5 w-1.5 rounded-full` con `bg-current`.

### 5.5 State rail (stepper — pieza central)

Estados: **ACTIVA → FINALIZADA → EVALUADA**. Solo lectura para estudiantes; el profesor
avanza vía `PUT`. Tres nodos conectados por segmentos; el estado actual es ámbar (ACTIVA),
gris (FINALIZADA) o verde (EVALUADA); los no alcanzados quedan `text-faint`.

```
[ ACTIVA ]───[ FINALIZADA ]───[ EVALUADA ]
```

- **Contenedor**: `flex items-center gap-2`
- **Nodo activo/actual**: `flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white`
- **Nodo completado**: `flex h-8 w-8 items-center justify-center rounded-full bg-success text-white`
- **Nodo pendiente**: `flex h-8 w-8 items-center justify-center rounded-full border border-line-strong bg-surface text-faint`
- **Segmento**: `h-px w-10 bg-line-strong` (verde `bg-success` si ya completado)
- **Etiqueta**: `font-mono text-xs uppercase tracking-wide` debajo o al costado del nodo.

### 5.6 Tabla de registros (vista profesor / estudiante)

- **Contenedor**: `overflow-hidden rounded-card border border-line bg-surface shadow-card`
- **Header**: `border-b border-line bg-paper px-5 py-3 text-left font-mono text-xs uppercase tracking-wide text-muted`
- **Fila**: `border-b border-line last:border-0 hover:bg-paper/60 transition-colors`
- **Celda**: `px-5 py-3 align-middle`
- **Empresa (columna principal)**: `font-medium text-ink`
- **Subtexto (estudiante/empresa)**: `text-sm text-muted`
- **Fechas/IDs**: `font-mono text-sm text-muted`
- **Fila vacía**: ver 5.9.

### 5.7 Barra de filtros

`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`
— contiene un `<input>` de búsqueda por empresa (5.2) y `<select>` de estado (5.2),
además del CTA "Nueva práctica" (botón primario).

### 5.8 Navegación (shell de app)

- **Sidebar (escritorio ≥1024px)**: `fixed inset-y-0 left-0 flex w-64 flex-col border-r border-line bg-surface px-4 py-6`
- **Top bar**: `flex items-center justify-between border-b border-line bg-surface px-6 py-3`
- **Item activo**: `flex items-center gap-3 rounded-field bg-brand-soft px-3 py-2 text-sm font-medium text-brand-strong`
- **Item inactivo**: `flex items-center gap-3 rounded-field px-3 py-2 text-sm font-medium text-muted hover:bg-paper hover:text-ink`
- **Identidad (top bar)**: `text-sm text-muted` con `font-mono` para el email.
- **Móvil (<1024px)**: la nav colapsa a un menú superior; mismas clases de item.

### 5.9 Estado vacío

`flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line-strong bg-surface px-6 py-12 text-center`
— Título: `font-display text-lg font-semibold`; texto: `text-sm text-muted`; acción: botón primario.
Copy estudiante: "Aún no registras tu práctica. Crea la primera." Copy profesor:
"No hay prácticas que coincidan con los filtros." (Ver sección 8.)

### 5.10 Alerta / error global

`rounded-field border px-4 py-3 text-sm`
- Error: `border-danger/30 bg-danger-soft text-danger`
- Info: `border-line bg-surface text-muted`
Mensaje siempre explica qué pasó y qué hacer (ver sección 8).

### 5.11 Spinner / carga

Botón en carga: `disabled` + texto "Guardando…". Listado en carga: fila fantasma
`animate-pulse rounded bg-paper` (una sola línea gris).

### 5.12 BrandPanel (autenticación)

Panel de marca tipo "ficha de expediente" (ver 6.1). Fichero: `components/ui/BrandPanel.tsx`.
Estructura y clases:
- Contenedor: `relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-10`
- Fondo: `absolute inset-0 bg-blueprint`; cinta: `absolute inset-x-0 top-0 h-1 signal-strip`
- Eyebrow: `font-mono text-xs uppercase tracking-[0.22em] text-white/60`
- Código: `font-mono text-[11px] uppercase tracking-[0.18em] text-amber` ("Exp. 0001/26")
- Título: `font-display text-4xl font-semibold leading-[1.05] text-white xl:text-5xl`
- Sello (palabra clave): `mt-2 inline-block -rotate-1 rounded-sm bg-amber px-3 pb-1 text-ink`
- Descripción: `max-w-md text-white/70`
- Rail onDark: etiquetas `font-mono text-[10px] uppercase tracking-[0.14em] text-white/60`;
  punto ACTIVA `h-2 w-2 rounded-full bg-amber signal-glow`, pendientes
  `h-2 w-2 rounded-full border border-white/25`; segmentos `h-px w-8 bg-amber/50` (completado)
  o `bg-white/15` (pendiente)
- Footer: `font-mono text-xs uppercase tracking-wide text-white/50`

Props: `eyebrow`, `code`, `titleA`, `mark` (palabra del sello), `description`, `footer`.
Mismo panel (mismo `titleA`/`mark`) en Login y Register; cambia solo la descripción.

### 5.13 BrandMarks (crucetas de registro)

Enmarca la ficha del formulario de auth con 4 cruces de imprenta. Fichero:
`components/ui/BrandMarks.tsx`. Cada cruz: SVG `pointer-events-none absolute h-4 w-4
text-faint` con trazo `+`, posiciones `-left-2 -top-2`, `-right-2 -top-2`,
`-bottom-2 -left-2`, `-bottom-2 -right-2`. Decorativas (`aria-hidden="true"`).

---

## 6. Pantallas

### 6.1 Autenticación (Login / Registro) — ficha de expediente

- **Contenedor**: `grid min-h-screen lg:grid-cols-2`
- **Panel de marca** (izq., solo ≥1024px): componente `BrandPanel` (5.12). Fondo ink +
  cuadrícula (`bg-blueprint`), cinta `signal-strip` en el borde superior, título
  "Portal de **[Prácticas]**" con sello ámbar, `Exp. 0001/26` y rail de estados onDark
  con luz ACTIVA. Copy: eyebrow "Alumnos egresados"; login footer "Práctica profesional";
  registro footer "Registro de egresado".
- **Panel de formulario** (der.): `flex items-center justify-center bg-paper p-6 lg:p-12`
  - Wrapper de la ficha: `relative w-full max-w-md` con `BrandMarks` (5.13).
  - Tarjeta: `corner-notch relative space-y-5 rounded-card border border-line bg-surface p-8 shadow-pop`
  - Eyebrow: `font-mono text-xs uppercase tracking-[0.2em] text-muted` ("ACCESO"/"REGISTRO")
  - Título: `font-display text-2xl font-semibold tracking-tight`; subtítulo `text-sm text-muted`
  - Error (5.10), campos (5.2), botón primario `w-full`
  - Móvil (<1024px, sin panel): `h1 font-display text-xl font-semibold` "Portal de Prácticas"

### 6.2 Dashboard (shell de app, ambos roles)

Estructura: Sidebar (5.8) + área principal `lg:pl-64`:
- **Cabecera de página**: `mb-6 space-y-1`
  - Eyebrow: `font-mono text-xs uppercase tracking-[0.12em] text-muted` → "PRÁCTICAS"
  - Título: `font-display text-2xl font-semibold tracking-tight`
  - Subtítulo por rol: estudiante "Tu práctica profesional" / profesor "Seguimiento de prácticas".

### 6.3 Vista Estudiante

- Bloque "Mis prácticas": tabla (5.6) con columnas **Empresa · Estado · Periodo**.
- Sin práctica: estado vacío con CTA "Registrar mi práctica" (5.9).
- Formulario de creación (nuevo/edición modal o vista): campos 5.2 — datos de empresa,
  jefe directo, **selector de profesor supervisor** (lista `GET /api/teachers`, `select`),
  fechas (`input type="date"`), descripción. Sin selector de estudiante (va desde sesión).
- Acciones visibles: solo **ver** su registro. Sin botones editar/eliminar.

### 6.4 Vista Profesor

- Tabla completa (5.6) con columnas **Estudiante · Empresa · Estado · Periodo · Acciones**.
- Filtros (5.7): `status`, `companyName`; selector de estudiante (`studentId`).
- CTA "Nueva práctica" (botón primario) → formulario con selector de **estudiante** y de
  **profesor supervisor** (por defecto él mismo).
- Acciones por fila: **ver**, **editar** (PUT), **avanzar estado** (state rail interactivo),
  **eliminar** (soft delete, botón peligro con confirmación).

---

## 7. Responsive y motion

- **Breakpoints** (defaults de Tailwind): `sm 640 · md 768 · lg 1024 · xl 1280`.
- **Móvil primero**: tablas → tarjetas apiladas en <768px (cada fila se vuelve tarjeta con
  etiqueta + valor); la barra de filtros se apila (5.7); la nav colapsa (5.8).
- **Motion**: transiciones solo en `color/background/opacity` con `--ease-out-soft`
  (`duration-150`). El state rail no anima de forma gratuita. Respeta
  `@media (prefers-reduced-motion: reduce)` → `transition: none`.
- **Foco**: `:focus-visible` visible (3). Todos los controles alcanzables por teclado.

---

## 8. Voz y mensajes (copy)

- Acciones con verbo explícito: "Guardar práctica", "Iniciar sesión", "Cerrar sesión".
  Nunca "Submit" ni "OK".
- Errores de API se muestran tal cual del backend (ya explican causa y fix): `error` →
  alerta 5.10. En fallos de red: "No pudimos conectar con el servidor. Intenta de nuevo."
- Estado vacío invita a actuar (5.9). Un error nunca pide disculpas ni es vago.
- Estado del botón coherente: el botón "Guardar" produce el toast/estado "Guardado".

---

## 9. Accesibilidad (floor de calidad)

- Contraste AA en todos los pares (paleta verificada en sección 2; ámbar usa
  `amber-strong` para texto, nunca ámbar puro sobre blanco).
- Formularios: cada input con `label` asociado (`htmlFor`/`id`); errores con
  `aria-describedby`.
- Tabla: `<th scope="col">`; filas clicables con rol/teclado si corresponde.
- Estado comunicado por texto + color, nunca solo color (los chips incluyen la palabra
  ACTIVA/FINALIZADA/EVALUADA).
- Iconos decorativos con `aria-hidden="true"`; los informativos con `aria-label`.
- `prefers-reduced-motion` respetado (7).

---

## 10. Convenciones de archivos

```
frontend/src/
├── components/ui/      # primitivas congeladas: Button, Input, Select, Card, Chip,
│                       #   StatusChip, StateRail, Table, EmptyState, Alert
├── views/              # Login, Register, DashboardStudent, DashboardProfessor,
│                       #   InternshipForm, InternshipDetail
└── services/           # cliente HTTP (fetch, credentials:'include', baseURL '/api')
```

- Ninguna vista define colores/espaciados ad hoc: usa las primitivas de `components/ui`.
- Los tokens viven solo en `index.css` (`@theme`). Si un valor no está aquí, se añade aquí.
