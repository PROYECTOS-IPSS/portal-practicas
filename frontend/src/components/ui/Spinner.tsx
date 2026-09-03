export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper" role="status" aria-label="Cargando">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-brand" />
    </div>
  );
}
