// Datos de demostración (dummy) para que CocinIA funcione de punta a punta sin backend real.
import { addDays, todayISO } from "../utils/helpers";

export const CATEGORIES = [
  "Frutas y verduras",
  "Carnes",
  "Pescados",
  "Lácteos y huevos",
  "Panadería",
  "Despensa seca",
  "Congelados",
  "Bebidas",
  "Condimentos",
];

// Catálogo de productos conocidos (para autocompletar y para el "lector" de tiques/código de barras)
export const PRODUCT_CATALOG = [
  { id: "p-leche", name: "Leche semidesnatada", category: "Lácteos y huevos", unit: "l", aisle: "Lácteos", shelfLifeDays: 10, emoji: "🥛" },
  { id: "p-huevos", name: "Huevos L (docena)", category: "Lácteos y huevos", unit: "ud", aisle: "Lácteos", shelfLifeDays: 21, emoji: "🥚" },
  { id: "p-harina", name: "Harina de trigo", category: "Despensa seca", unit: "g", aisle: "Despensa", shelfLifeDays: 365, emoji: "🌾" },
  { id: "p-salmon", name: "Salmón fresco", category: "Pescados", unit: "g", aisle: "Pescadería", shelfLifeDays: 2, emoji: "🐟" },
  { id: "p-pollo", name: "Pechuga de pollo", category: "Carnes", unit: "g", aisle: "Carnicería", shelfLifeDays: 3, emoji: "🍗" },
  { id: "p-tomate", name: "Tomate maduro", category: "Frutas y verduras", unit: "g", aisle: "Frutería", shelfLifeDays: 6, emoji: "🍅" },
  { id: "p-cebolla", name: "Cebolla", category: "Frutas y verduras", unit: "ud", aisle: "Frutería", shelfLifeDays: 20, emoji: "🧅" },
  { id: "p-ajo", name: "Ajo", category: "Frutas y verduras", unit: "ud", aisle: "Frutería", shelfLifeDays: 60, emoji: "🧄" },
  { id: "p-arroz", name: "Arroz redondo", category: "Despensa seca", unit: "g", aisle: "Despensa", shelfLifeDays: 365, emoji: "🍚" },
  { id: "p-pasta", name: "Pasta (macarrón)", category: "Despensa seca", unit: "g", aisle: "Despensa", shelfLifeDays: 365, emoji: "🍝" },
  { id: "p-queso", name: "Queso rallado", category: "Lácteos y huevos", unit: "g", aisle: "Lácteos", shelfLifeDays: 15, emoji: "🧀" },
  { id: "p-platano", name: "Plátano", category: "Frutas y verduras", unit: "ud", aisle: "Frutería", shelfLifeDays: 5, emoji: "🍌" },
  { id: "p-manzana", name: "Manzana", category: "Frutas y verduras", unit: "ud", aisle: "Frutería", shelfLifeDays: 14, emoji: "🍎" },
  { id: "p-pan", name: "Pan de molde", category: "Panadería", unit: "ud", aisle: "Panadería", shelfLifeDays: 7, emoji: "🍞" },
  { id: "p-yogur", name: "Yogur natural (pack 4)", category: "Lácteos y huevos", unit: "ud", aisle: "Lácteos", shelfLifeDays: 12, emoji: "🥣" },
  { id: "p-aceite", name: "Aceite de oliva virgen extra", category: "Condimentos", unit: "ml", aisle: "Despensa", shelfLifeDays: 540, emoji: "🫒" },
  { id: "p-sal", name: "Sal fina", category: "Condimentos", unit: "g", aisle: "Despensa", shelfLifeDays: 1000, emoji: "🧂" },
  { id: "p-pimienta", name: "Pimienta negra molida", category: "Condimentos", unit: "g", aisle: "Despensa", shelfLifeDays: 1000, emoji: "🌶️" },
  { id: "p-caldo", name: "Caldo de verduras", category: "Despensa seca", unit: "ml", aisle: "Despensa", shelfLifeDays: 300, emoji: "🥫" },
  { id: "p-guisantes", name: "Guisantes congelados", category: "Congelados", unit: "g", aisle: "Congelados", shelfLifeDays: 180, emoji: "🫛" },
  { id: "p-gambas", name: "Gambas congeladas", category: "Congelados", unit: "g", aisle: "Congelados", shelfLifeDays: 150, emoji: "🦐" },
  { id: "p-limon", name: "Limón", category: "Frutas y verduras", unit: "ud", aisle: "Frutería", shelfLifeDays: 15, emoji: "🍋" },
  { id: "p-calabacin", name: "Calabacín", category: "Frutas y verduras", unit: "ud", aisle: "Frutería", shelfLifeDays: 8, emoji: "🥒" },
  { id: "p-pimiento", name: "Pimiento rojo", category: "Frutas y verduras", unit: "ud", aisle: "Frutería", shelfLifeDays: 9, emoji: "🫑" },
  { id: "p-azucar", name: "Azúcar blanco", category: "Despensa seca", unit: "g", aisle: "Despensa", shelfLifeDays: 1000, emoji: "🍬" },
  { id: "p-mantequilla", name: "Mantequilla", category: "Lácteos y huevos", unit: "g", aisle: "Lácteos", shelfLifeDays: 30, emoji: "🧈" },
  { id: "p-nata", name: "Nata para cocinar", category: "Lácteos y huevos", unit: "ml", aisle: "Lácteos", shelfLifeDays: 12, emoji: "🥛" },
  { id: "p-champi", name: "Champiñones", category: "Frutas y verduras", unit: "g", aisle: "Frutería", shelfLifeDays: 5, emoji: "🍄" },
  { id: "p-bacon", name: "Bacon en lonchas", category: "Carnes", unit: "g", aisle: "Carnicería", shelfLifeDays: 6, emoji: "🥓" },
  { id: "p-vino", name: "Vino blanco para cocinar", category: "Bebidas", unit: "ml", aisle: "Bebidas", shelfLifeDays: 365, emoji: "🍷" },
];

const cat = (id) => PRODUCT_CATALOG.find((p) => p.id === id);

// Simulación de "lector de tiques" (OCR): varias líneas tal cual las escupe un ticket de súper
export const TICKET_SAMPLES = [
  {
    store: "Mercadona",
    rawLines: [
      { raw: "LECHE SEMI 1L", matchId: "p-leche", quantity: 2, unit: "l" },
      { raw: "HUEVOS L DOCENA", matchId: "p-huevos", quantity: 1, unit: "ud" },
      { raw: "TOMATE RAMA KG", matchId: "p-tomate", quantity: 500, unit: "g" },
      { raw: "PECH POLLO FILETE", matchId: "p-pollo", quantity: 600, unit: "g" },
      { raw: "YOGUR NATURAL PK4", matchId: "p-yogur", quantity: 1, unit: "ud" },
      { raw: "PAN MOLDE GRANDE", matchId: "p-pan", quantity: 1, unit: "ud" },
    ],
  },
  {
    store: "Carrefour",
    rawLines: [
      { raw: "SALMON FRESCO", matchId: "p-salmon", quantity: 400, unit: "g" },
      { raw: "ARROZ REDONDO 1KG", matchId: "p-arroz", quantity: 1000, unit: "g" },
      { raw: "QUESO RALLADO MEZCLA", matchId: "p-queso", quantity: 200, unit: "g" },
      { raw: "LIMON MALLA", matchId: "p-limon", quantity: 3, unit: "ud" },
      { raw: "ACEITE OLIVA VE 1L", matchId: "p-aceite", quantity: 1000, unit: "ml" },
    ],
  },
];

// Simulación de "visión por IA" sobre una foto de nevera/despensa
export const FRIDGE_PHOTO_SAMPLE = [
  { matchId: "p-calabacin", quantity: 2, unit: "ud" },
  { matchId: "p-pimiento", quantity: 1, unit: "ud" },
  { matchId: "p-champi", quantity: 150, unit: "g" },
  { matchId: "p-mantequilla", quantity: 80, unit: "g" },
  { matchId: "p-bacon", quantity: 100, unit: "g" },
];

// Base de datos de códigos de barras de ejemplo
export const BARCODE_DB = {
  "8410000000012": { matchId: "p-leche", quantity: 1, unit: "l" },
  "8410000000029": { matchId: "p-huevos", quantity: 1, unit: "ud" },
  "8410000000036": { matchId: "p-queso", quantity: 250, unit: "g" },
  "8410000000043": { matchId: "p-yogur", quantity: 1, unit: "ud" },
  "8410000000050": { matchId: "p-aceite", quantity: 750, unit: "ml" },
};

// Sobras de ejemplo para "reconocimiento de sobras"
export const LEFTOVER_PHOTO_SAMPLE = {
  detected: ["Arroz cocido", "Verduras salteadas"],
  suggestionTags: ["arroz", "verduras"],
};

function ing(matchId, quantity, unit) {
  const p = cat(matchId);
  return { productId: matchId, name: p.name, quantity, unit: unit || p.unit, emoji: p.emoji };
}

export const RECIPES = [
  {
    id: "r-salmon-verduras",
    name: "Salmón al vapor con verduras",
    type: "thermomix",
    emoji: "🐟",
    time: 25,
    difficulty: "Fácil",
    tags: ["pescado", "sin gluten", "ligero"],
    baseServings: 4,
    ingredients: [
      ing("p-salmon", 500, "g"),
      ing("p-calabacin", 1, "ud"),
      ing("p-pimiento", 1, "ud"),
      ing("p-limon", 1, "ud"),
      ing("p-aceite", 20, "ml"),
      ing("p-sal", 5, "g"),
    ],
    steps: [
      { text: "Pon 500 g de agua en el vaso.", duration: 0 },
      { text: "Coloca las verduras troceadas en el Varoma.", duration: 60 },
      { text: "Coloca el salmón sobre las verduras, sal y un chorrito de aceite.", duration: 60 },
      { text: "Programa Varoma, 20 minutos, velocidad 1.", duration: 1200, speed: "1", temp: "Varoma" },
      { text: "Emplata con un toque de limón.", duration: 0 },
    ],
    ratingAvg: 4.6,
    timesCooked: 12,
  },
  {
    id: "r-tortilla-patata",
    name: "Tortilla de patatas clásica",
    type: "normal",
    emoji: "🍳",
    time: 35,
    difficulty: "Media",
    tags: ["vegetariano", "económico"],
    baseServings: 4,
    ingredients: [
      ing("p-huevos", 6, "ud"),
      ing("p-cebolla", 1, "ud"),
      ing("p-aceite", 100, "ml"),
      ing("p-sal", 5, "g"),
    ],
    steps: [
      { text: "Pela y corta las patatas y la cebolla en láminas finas." },
      { text: "Fríe a fuego medio en abundante aceite 20 minutos." },
      { text: "Bate los huevos con sal y mezcla con las patatas." },
      { text: "Cuaja la tortilla por ambos lados en la sartén." },
    ],
    ratingAvg: 4.8,
    timesCooked: 20,
  },
  {
    id: "r-pasta-bacon",
    name: "Pasta cremosa con bacon y champiñones",
    type: "thermomix",
    emoji: "🍝",
    time: 30,
    difficulty: "Fácil",
    tags: ["rápido", "comfort food"],
    baseServings: 4,
    ingredients: [
      ing("p-pasta", 400, "g"),
      ing("p-bacon", 150, "g"),
      ing("p-champi", 200, "g"),
      ing("p-nata", 200, "ml"),
      ing("p-queso", 50, "g"),
      ing("p-ajo", 1, "ud"),
    ],
    steps: [
      { text: "Trocea el ajo 3 seg, velocidad 5.", duration: 3, speed: "5" },
      { text: "Sofríe el bacon y los champiñones 5 min, Varoma, velocidad 1.", duration: 300, speed: "1", temp: "Varoma" },
      { text: "Añade la nata y el queso, mezcla 2 min, 90º, velocidad 2.", duration: 120, speed: "2", temp: "90º" },
      { text: "Incorpora la pasta cocida y mezcla 1 min, velocidad 1.", duration: 60, speed: "1" },
    ],
    ratingAvg: 4.5,
    timesCooked: 18,
  },
  {
    id: "r-arroz-caldoso",
    name: "Arroz caldoso con gambas",
    type: "thermomix",
    emoji: "🦐",
    time: 40,
    difficulty: "Media",
    tags: ["pescado", "cuchara"],
    baseServings: 4,
    ingredients: [
      ing("p-arroz", 320, "g"),
      ing("p-gambas", 300, "g"),
      ing("p-tomate", 2, "ud"),
      ing("p-ajo", 2, "ud"),
      ing("p-caldo", 800, "ml"),
      ing("p-aceite", 30, "ml"),
    ],
    steps: [
      { text: "Trocea ajo y tomate 4 seg, velocidad 5.", duration: 4, speed: "5" },
      { text: "Sofríe 5 min, 120º, velocidad 1.", duration: 300, speed: "1", temp: "120º" },
      { text: "Añade caldo, arroz y gambas. Cocina 18 min, 100º, velocidad cuchara (giro a la izquierda).", duration: 1080, speed: "cuchara", temp: "100º" },
      { text: "Deja reposar 5 minutos antes de servir.", duration: 300 },
    ],
    ratingAvg: 4.7,
    timesCooked: 9,
  },
  {
    id: "r-crema-calabacin",
    name: "Crema de calabacín",
    type: "thermomix",
    emoji: "🥣",
    time: 20,
    difficulty: "Fácil",
    tags: ["vegetariano", "ligero", "sin gluten"],
    baseServings: 4,
    ingredients: [
      ing("p-calabacin", 3, "ud"),
      ing("p-cebolla", 1, "ud"),
      ing("p-caldo", 500, "ml"),
      ing("p-nata", 100, "ml"),
      ing("p-sal", 5, "g"),
    ],
    steps: [
      { text: "Trocea la cebolla y el calabacín 5 seg, velocidad 5.", duration: 5, speed: "5" },
      { text: "Sofríe 5 min, 120º, velocidad 1.", duration: 300, speed: "1", temp: "120º" },
      { text: "Añade el caldo y cocina 15 min, 100º, velocidad 1.", duration: 900, speed: "1", temp: "100º" },
      { text: "Tritura 1 min, velocidad 5-10 en subida progresiva.", duration: 60, speed: "5-10" },
    ],
    ratingAvg: 4.4,
    timesCooked: 7,
  },
  {
    id: "r-pollo-limon",
    name: "Pollo al limón con guisantes",
    type: "normal",
    emoji: "🍗",
    time: 30,
    difficulty: "Fácil",
    tags: ["proteína", "rápido"],
    baseServings: 4,
    ingredients: [
      ing("p-pollo", 600, "g"),
      ing("p-limon", 2, "ud"),
      ing("p-guisantes", 200, "g"),
      ing("p-aceite", 20, "ml"),
      ing("p-ajo", 2, "ud"),
    ],
    steps: [
      { text: "Corta el pollo en tacos y dóralo en una sartén con aceite." },
      { text: "Añade el ajo picado y el zumo de limón." },
      { text: "Incorpora los guisantes y cocina 10 minutos más." },
    ],
    ratingAvg: 4.3,
    timesCooked: 15,
  },
  {
    id: "r-bizcocho-platano",
    name: "Bizcocho de plátano",
    type: "thermomix",
    emoji: "🍌",
    time: 55,
    difficulty: "Fácil",
    tags: ["dulce", "postre", "aprovechamiento"],
    baseServings: 8,
    ingredients: [
      ing("p-platano", 3, "ud"),
      ing("p-harina", 250, "g"),
      ing("p-azucar", 150, "g"),
      ing("p-huevos", 3, "ud"),
      ing("p-mantequilla", 100, "g"),
    ],
    steps: [
      { text: "Tritura el plátano con el azúcar 10 seg, velocidad 5.", duration: 10, speed: "5" },
      { text: "Añade huevos y mantequilla, mezcla 15 seg, velocidad 4.", duration: 15, speed: "4" },
      { text: "Incorpora la harina y mezcla 10 seg, velocidad 3.", duration: 10, speed: "3" },
      { text: "Hornea 40 min a 180º en horno precalentado.", duration: 2400, temp: "180º (horno)" },
    ],
    ratingAvg: 4.9,
    timesCooked: 11,
  },
];

export const SUPERMARKETS = [
  { id: "mercadona", name: "Mercadona", emoji: "🛒", connectable: true },
  { id: "carrefour", name: "Carrefour", emoji: "🛍️", connectable: true },
  { id: "dia", name: "DIA", emoji: "🧺", connectable: true },
];

export const DEFAULT_FAMILY_MEMBERS = [
  { id: "m-tu", name: "Tú", avatar: "🧑‍🍳", diet: "omnivoro", allergies: [], dislikes: [], role: "admin" },
  { id: "m-pareja", name: "Pareja", avatar: "👩", diet: "vegetariano", allergies: [], dislikes: ["pescado"], role: "miembro" },
  { id: "m-peque", name: "Peque", avatar: "🧒", diet: "omnivoro", allergies: ["frutos secos"], dislikes: [], role: "miembro" },
];

export function buildInitialPantry() {
  const today = todayISO();
  const items = [
    { productId: "p-leche", quantity: 1.5, unit: "l", location: "nevera", daysLeft: 6 },
    { productId: "p-huevos", quantity: 8, unit: "ud", location: "nevera", daysLeft: 14 },
    { productId: "p-salmon", quantity: 350, unit: "g", location: "nevera", daysLeft: 2 },
    { productId: "p-pollo", quantity: 400, unit: "g", location: "nevera", daysLeft: 3 },
    { productId: "p-tomate", quantity: 600, unit: "g", location: "nevera", daysLeft: 5 },
    { productId: "p-cebolla", quantity: 4, unit: "ud", location: "despensa", daysLeft: 18 },
    { productId: "p-ajo", quantity: 6, unit: "ud", location: "despensa", daysLeft: 45 },
    { productId: "p-arroz", quantity: 900, unit: "g", location: "despensa", daysLeft: 300 },
    { productId: "p-pasta", quantity: 200, unit: "g", location: "despensa", daysLeft: 300 },
    { productId: "p-queso", quantity: 120, unit: "g", location: "nevera", daysLeft: 10 },
    { productId: "p-platano", quantity: 5, unit: "ud", location: "despensa", daysLeft: 1 },
    { productId: "p-manzana", quantity: 4, unit: "ud", location: "despensa", daysLeft: 10 },
    { productId: "p-pan", quantity: 1, unit: "ud", location: "congelador", daysLeft: 60 },
    { productId: "p-yogur", quantity: 4, unit: "ud", location: "nevera", daysLeft: 8 },
    { productId: "p-aceite", quantity: 400, unit: "ml", location: "despensa", daysLeft: 400 },
    { productId: "p-sal", quantity: 500, unit: "g", location: "despensa", daysLeft: 900 },
    { productId: "p-caldo", quantity: 200, unit: "ml", location: "despensa", daysLeft: 120 },
    { productId: "p-guisantes", quantity: 300, unit: "g", location: "congelador", daysLeft: 150 },
    { productId: "p-gambas", quantity: 0, unit: "g", location: "congelador", daysLeft: 0 },
    { productId: "p-limon", quantity: 2, unit: "ud", location: "nevera", daysLeft: 12 },
    { productId: "p-calabacin", quantity: 1, unit: "ud", location: "nevera", daysLeft: 2 },
    { productId: "p-pimiento", quantity: 0, unit: "ud", location: "nevera", daysLeft: 0 },
    { productId: "p-azucar", quantity: 600, unit: "g", location: "despensa", daysLeft: 800 },
    { productId: "p-mantequilla", quantity: 40, unit: "g", location: "nevera", daysLeft: 20 },
    { productId: "p-nata", quantity: 0, unit: "ml", location: "nevera", daysLeft: 0 },
    { productId: "p-champi", quantity: 0, unit: "g", location: "nevera", daysLeft: 0 },
    { productId: "p-bacon", quantity: 0, unit: "g", location: "nevera", daysLeft: 0 },
  ];

  return items.map((it, idx) => {
    const p = cat(it.productId);
    return {
      id: `pantry-${idx}-${it.productId}`,
      productId: it.productId,
      name: p.name,
      emoji: p.emoji,
      category: p.category,
      aisle: p.aisle,
      unit: it.unit,
      quantity: it.quantity,
      location: it.location,
      expiryDate: addDays(today, it.daysLeft),
      addedAt: addDays(today, -Math.min(it.daysLeft, 3)),
    };
  });
}

export const CATALOG_BY_ID = PRODUCT_CATALOG.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});

export const VOICE_DEMO_COMMANDS = [
  { phrase: "cuánta sal lleva", type: "ingredient", keyword: "sal" },
  { phrase: "pasa al siguiente paso", type: "next" },
  { phrase: "paso anterior", type: "prev" },
  { phrase: "repite el paso", type: "repeat" },
  { phrase: "cuánto tiempo queda", type: "time" },
];
