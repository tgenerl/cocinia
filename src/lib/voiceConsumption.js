// Interpreta frases como "me he comido un plátano" o "se ha acabado la leche" para restar de la despensa.
import { PRODUCT_CATALOG } from "../data/dummyData";

const NUMBER_WORDS = {
  un: 1,
  una: 1,
  uno: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
};

const UNIT_ALIASES = [
  { re: /\b(kilos?|kg)\b/, unit: "kg" },
  { re: /\b(gramos?|grs?|g)\b/, unit: "g" },
  { re: /\b(mililitros?|ml)\b/, unit: "ml" },
  { re: /\b(litros?|l)\b/, unit: "l" },
  { re: /\b(unidades?|uds?)\b/, unit: "ud" },
];

const DEPLETION_PATTERNS = [/se\s+(ha|han)\s*acabado/, /ya no (me )?queda/, /no (me )?queda/, /se\s+termin/];

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function singularize(word) {
  if (word.endsWith("es") && word.length > 4) return word.slice(0, -2);
  if (word.endsWith("s") && word.length > 3) return word.slice(0, -1);
  return word;
}

const STOPWORDS = new Set(["de", "del", "la", "el", "los", "las", "en", "con", "para", "y"]);

function significantWords(nameNorm) {
  return nameNorm
    .replace(/[()]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w))
    .map(singularize);
}

function findProduct(phraseNorm) {
  let best = null;
  let bestScore = 0;
  for (const p of PRODUCT_CATALOG) {
    const nameNorm = normalize(p.name);
    let score = 0;
    for (const word of significantWords(nameNorm)) {
      if (new RegExp(`\\b${word}\\w*\\b`).test(phraseNorm)) score++;
    }
    if (score > 0 && (score > bestScore || (score === bestScore && best && nameNorm.length > normalize(best.name).length))) {
      best = p;
      bestScore = score;
    }
  }
  return best;
}

// Devuelve null si no reconoce ningún producto del catálogo en la frase.
export function parseConsumptionPhrase(phraseRaw) {
  const phrase = normalize(phraseRaw.trim());
  const product = findProduct(phrase);
  if (!product) return null;

  const consumedAll = DEPLETION_PATTERNS.some((re) => re.test(phrase));

  let unit = null;
  for (const { re, unit: u } of UNIT_ALIASES) {
    if (re.test(phrase)) {
      unit = u;
      break;
    }
  }

  let quantity = null;
  const numMatch = phrase.match(/(\d+(?:[.,]\d+)?)/);
  if (numMatch) {
    quantity = parseFloat(numMatch[1].replace(",", "."));
  } else {
    for (const [word, val] of Object.entries(NUMBER_WORDS)) {
      if (new RegExp(`\\b${word}\\b`).test(phrase)) {
        quantity = val;
        break;
      }
    }
  }

  const finalUnit = unit || product.unit;
  if (quantity == null && !consumedAll) {
    if (product.unit !== "ud") {
      return { matchId: product.id, name: product.name, unit: finalUnit, needsQuantity: true };
    }
    quantity = 1;
  }

  return {
    matchId: product.id,
    name: product.name,
    emoji: product.emoji,
    quantity: consumedAll ? null : quantity,
    unit: finalUnit,
    consumedAll,
  };
}
