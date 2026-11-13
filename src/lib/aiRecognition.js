// Reconocimiento de fotos con IA real (Gemini) a través de /api/recognize, con datos de muestra como
// respaldo si el modelo no está disponible (p. ej. en desarrollo local, donde no corren las funciones de Vercel).
import { compressImageFile } from "./image";
import { PRODUCT_CATALOG, TICKET_SAMPLES, FRIDGE_PHOTO_SAMPLE, HANDWRITTEN_RECIPE_SAMPLE } from "../data/dummyData";

function nameFor(matchId) {
  return PRODUCT_CATALOG.find((p) => p.id === matchId)?.name || null;
}

function sampleTicket() {
  const sample = TICKET_SAMPLES[Math.floor(Math.random() * TICKET_SAMPLES.length)];
  return {
    store: sample.store,
    items: sample.rawLines.map((l) => ({
      rawName: l.raw,
      catalogName: nameFor(l.matchId),
      quantity: l.quantity,
      unit: l.unit,
    })),
    simulated: true,
  };
}

function sampleFridge() {
  return {
    items: FRIDGE_PHOTO_SAMPLE.map((item) => ({
      rawName: nameFor(item.matchId),
      catalogName: nameFor(item.matchId),
      quantity: item.quantity,
      unit: item.unit,
    })),
    simulated: true,
  };
}

function sampleRecipe() {
  return { ...HANDWRITTEN_RECIPE_SAMPLE, simulated: true };
}

const FALLBACKS = { ticket: sampleTicket, fridge: sampleFridge, recipe: sampleRecipe };

// kind: "ticket" | "fridge" | "recipe"
export async function recognizePhoto(kind, file) {
  const { base64, mimeType } = await compressImageFile(file);
  try {
    const res = await fetch("/api/recognize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, image: base64, mimeType }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || `API respondió ${res.status}`);
    }
    const data = await res.json();
    return { ...data, simulated: false };
  } catch (err) {
    console.warn("Reconocimiento con IA real no disponible, usando datos de muestra:", err);
    return { ...FALLBACKS[kind](), errorMessage: err.message };
  }
}
