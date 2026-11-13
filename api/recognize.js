// Función serverless de Vercel: reconocimiento de fotos (tique, nevera/despensa, receta) con Google Gemini.
// Requiere la variable de entorno GEMINI_API_KEY configurada en el proyecto de Vercel.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

// Debe coincidir con los nombres de PRODUCT_CATALOG en src/data/dummyData.js
const CATALOG_NAMES = [
  "Leche semidesnatada",
  "Huevos L (docena)",
  "Harina de trigo",
  "Salmón fresco",
  "Pechuga de pollo",
  "Tomate maduro",
  "Cebolla",
  "Ajo",
  "Arroz redondo",
  "Pasta (macarrón)",
  "Queso rallado",
  "Plátano",
  "Manzana",
  "Pan de molde",
  "Yogur natural (pack 4)",
  "Aceite de oliva virgen extra",
  "Sal fina",
  "Pimienta negra molida",
  "Caldo de verduras",
  "Guisantes congelados",
  "Gambas congeladas",
  "Limón",
  "Calabacín",
  "Pimiento rojo",
  "Azúcar blanco",
  "Mantequilla",
  "Nata para cocinar",
  "Champiñones",
  "Bacon en lonchas",
  "Vino blanco para cocinar",
];

const ITEM_SCHEMA = {
  type: "OBJECT",
  properties: {
    rawName: { type: "STRING", description: "Nombre del producto tal y como aparece o se ve en la imagen" },
    catalogName: {
      type: "STRING",
      nullable: true,
      description:
        "Uno de los nombres EXACTOS de la lista de catálogo si corresponde claramente, o null si no hay coincidencia clara",
    },
    quantity: { type: "NUMBER" },
    unit: { type: "STRING", description: "Unidad: g, kg, ml, l o ud" },
  },
  required: ["rawName", "quantity", "unit"],
};

const SCHEMAS = {
  ticket: {
    type: "OBJECT",
    properties: {
      store: { type: "STRING", nullable: true },
      items: { type: "ARRAY", items: ITEM_SCHEMA },
    },
    required: ["items"],
  },
  fridge: {
    type: "OBJECT",
    properties: {
      items: { type: "ARRAY", items: ITEM_SCHEMA },
    },
    required: ["items"],
  },
  recipe: {
    type: "OBJECT",
    properties: {
      name: { type: "STRING" },
      time: { type: "NUMBER", description: "Tiempo total estimado en minutos" },
      baseServings: { type: "NUMBER" },
      difficulty: { type: "STRING", description: "Fácil, Media o Difícil" },
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
  },
};

function promptFor(kind) {
  const catalogList = CATALOG_NAMES.map((n) => `- ${n}`).join("\n");
  if (kind === "ticket") {
    return `Eres un experto leyendo tiques de compra de supermercados españoles. Analiza la imagen del tique y extrae cada línea de producto comprado.
Para cada producto, si corresponde claramente a uno de estos nombres de catálogo, usa ese nombre EXACTO en "catalogName" (si no hay coincidencia clara, pon null):
${catalogList}
Ignora totales, descuentos, IVA, puntos y líneas que no sean productos. Estima la cantidad y la unidad (g, kg, ml, l o ud) a partir del propio tique. Responde solo con el JSON pedido, en español.`;
  }
  if (kind === "fridge") {
    return `Eres un experto en visión por ordenador para reconocer alimentos. Analiza esta foto de una nevera, congelador o despensa y lista cada alimento o producto distinto que veas, con una estimación razonable de la cantidad visible.
Para cada producto, si corresponde claramente a uno de estos nombres de catálogo, usa ese nombre EXACTO en "catalogName" (si no hay coincidencia clara, pon null):
${catalogList}
Responde solo con el JSON pedido, en español.`;
  }
  return `Transcribe esta foto de una receta de cocina (manuscrita o impresa) a una estructura de datos. Interpreta la letra lo mejor posible. Incluye nombre de la receta, tiempo total estimado en minutos, número de raciones, dificultad, de 2 a 4 etiquetas relevantes (tipo de plato, técnica...), la lista completa de ingredientes con cantidad y unidad, y los pasos de preparación en orden, cada uno como una frase clara en español. Responde solo con el JSON pedido.`;
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

  const { kind, image, mimeType } = req.body || {};
  if (!SCHEMAS[kind]) {
    res.status(400).json({ error: "kind inválido" });
    return;
  }
  if (!image || typeof image !== "string") {
    res.status(400).json({ error: "Falta la imagen" });
    return;
  }
  // Margen de seguridad por debajo del límite de 4.5MB del cuerpo de la petición en Vercel
  if (image.length > 4 * 1024 * 1024) {
    res.status(413).json({ error: "La imagen es demasiado grande" });
    return;
  }
  const safeMimeType = typeof mimeType === "string" && mimeType.startsWith("image/") ? mimeType : "image/jpeg";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: promptFor(kind) }, { inlineData: { mimeType: safeMimeType, data: image } }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: SCHEMAS[kind],
            temperature: 0.2,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      res.status(502).json({ error: "El modelo de IA no pudo procesar la imagen" });
      return;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      res.status(502).json({ error: "El modelo de IA no devolvió resultado" });
      return;
    }
    res.status(200).json(JSON.parse(text));
  } catch (err) {
    console.error("Error llamando a Gemini:", err);
    res.status(500).json({ error: "Error interno al analizar la imagen" });
  }
}
