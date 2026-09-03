// Crucetas de registro (alineación de imprenta): enmarcan la ficha del formulario.
const POSITIONS = ['-left-2 -top-2', '-right-2 -top-2', '-bottom-2 -left-2', '-bottom-2 -right-2'];

export function BrandMarks() {
  return (
    <>
      {POSITIONS.map((position) => (
        <svg
          key={position}
          aria-hidden="true"
          viewBox="0 0 16 16"
          className={`pointer-events-none absolute h-4 w-4 text-faint ${position}`}
        >
          <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ))}
    </>
  );
}
