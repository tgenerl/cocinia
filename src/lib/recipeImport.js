// Importación real de una receta a partir de un enlace (vía /api/import-recipe), sin datos de muestra como respaldo:
// si falla, se lanza el error para que la pantalla lo muestre tal cual.
export async function importRecipeFromUrl(url) {
  const res = await fetch("/api/import-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `API respondió ${res.status}`);
  }
  return res.json();
}
