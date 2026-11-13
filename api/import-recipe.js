// Función serverless de Vercel: importa una receta real a partir de un enlace (p. ej. Cookidoo, recetasthermomix.cl...).
// Descarga la página, extrae su texto y usa Google Gemini para estructurarlo en una receta.
// Requiere la variable de entorno GEMINI_API_KEY configurada en el proyecto de Vercel.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const RECIPE_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    time: { type: "NUMBER", description: "Tiempo total estimado en minutos" },
    baseServings: { type: "NUMBER" },
    difficulty: { type: "STRING", description: "Fácil, Media o Difícil" },
    isThermomix: { type: "BOOLEAN", description: "true si la receta está pensada para Thermomix (menciona vaso, velocidad, etc.)" },
    tags: { type: "ARRAY", items: { type: "STRING" } },
    ingredients: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          quantity: { type: "NUMBER" },
          unit: { type: "STRING" },
        },
        required: ["name", "quantity", "unit"],
      },
    },
    steps: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { text: { type: "STRING" } },
        required: ["text"],
      },
    },
  },
  required: ["name", "ingredients", "steps"],
};

// Evita que el servidor se use como proxy hacia direcciones internas/privadas (mitigación básica de SSRF).
function isSafeUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (!["http:", "https:"].includes(u.protocol)) return false;
  const host = u.hostname.toLowerCase();
  if (["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(host)) return false;
  if (/^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) || /^169\.254\./.test(host)) {
    return false;
  }
  return true;
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "El servidor no tiene configurada la API key de IA (GEMINI_API_KEY)." });
    return;
  }

  const { url } = req.body || {};
  if (!url || typeof url !== "string" || !isSafeUrl(url)) {
    res.status(400).json({ error: "El enlace no es válido" });
    return;
  }

  let pageText;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let pageRes;
    try {
      pageRes = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; CocinIA/1.0; +https://cocinia-seven.vercel.app)" },
      });
    } finally {
      clearTimeout(timeout);
    }
    if (!pageRes.ok) {
      res.status(502).json({ error: `No se pudo acceder a la página (${pageRes.status})` });
      return;
    }
    const html = (await pageRes.text()).slice(0, 500000);
    pageText = htmlToText(html).slice(0, 8000);
  } catch (err) {
    console.error("Error descargando la página a importar:", err);
    res.status(502).json({ error: "No se pudo descargar la página del enlace" });
    return;
  }

  if (!pageText) {
    res.status(502).json({ error: "La página no tiene contenido legible" });
    return;
  }

  const prompt = `Eres un experto extrayendo datos de recetas de páginas web de cocina. A continuación tienes el TEXTO extraído de una página web que debería contener una receta (puede incluir menús, pie de página u otro contenido que debes ignorar). Extrae: nombre de la receta, tiempo total estimado en minutos, número de raciones, dificultad (Fácil, Media o Difícil), si está pensada para Thermomix, de 2 a 4 etiquetas relevantes, la lista completa de ingredientes con cantidad y unidad (g, kg, ml, l o ud), y los pasos de preparación en orden, cada uno como una frase clara en español. Si la página no contiene una receta reconocible, responde con ingredients y steps como listas vacías. Responde solo con el JSON pedido.

TEXTO DE LA PÁGINA:
${pageText}`;

  const requestBody = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RECIPE_SCHEMA,
      temperature: 0.2,
    },
  });
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });
      if (response.ok || ![429, 503].includes(response.status)) break;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      let detail = errText;
      try {
        detail = JSON.parse(errText)?.error?.message || errText;
      } catch {
        // errText no era JSON, se usa tal cual
      }
      res.status(502).json({ error: `Gemini ${response.status}: ${String(detail).slice(0, 200)}` });
      return;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const finishReason = data?.candidates?.[0]?.finishReason;
    if (!text) {
      console.error("Gemini sin texto. finishReason:", finishReason, JSON.stringify(data).slice(0, 500));
      res.status(502).json({ error: `El modelo no devolvió resultado (finishReason: ${finishReason || "desconocido"})` });
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("Gemini devolvió JSON inválido:", text.slice(0, 500));
      res.status(502).json({ error: "El modelo devolvió un JSON inválido" });
      return;
    }
    if (!parsed.ingredients?.length && !parsed.steps?.length) {
      res.status(422).json({ error: "No se ha encontrado ninguna receta en ese enlace" });
      return;
    }
    res.status(200).json(parsed);
  } catch (err) {
    console.error("Error llamando a Gemini:", err);
    res.status(500).json({ error: "Error interno al importar la receta" });
  }
}
