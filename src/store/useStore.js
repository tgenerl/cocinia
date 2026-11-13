import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  RECIPES,
  CATALOG_BY_ID,
  DEFAULT_FAMILY_MEMBERS,
  SUPERMARKETS,
  buildInitialPantry,
} from "../data/dummyData";
import { addDays, daysUntil, generateInviteCode, scaleQuantity, todayISO, uid } from "../utils/helpers";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MEALS = ["comida", "cena"];

// Recetas extra "en Cookidoo" listas para simular una importación por enlace
const IMPORTABLE_POOL = [
  {
    id: "r-import-lentejas",
    name: "Lentejas estofadas con verduras",
    type: "thermomix",
    emoji: "🍲",
    time: 45,
    difficulty: "Fácil",
    tags: ["legumbre", "cuchara", "sin gluten"],
    baseServings: 4,
    ingredients: [
      { productId: "p-cebolla", name: "Cebolla", quantity: 1, unit: "ud", emoji: "🧅" },
      { productId: "p-ajo", name: "Ajo", quantity: 2, unit: "ud", emoji: "🧄" },
      { productId: "p-tomate", name: "Tomate maduro", quantity: 1, unit: "ud", emoji: "🍅" },
      { productId: "p-aceite", name: "Aceite de oliva virgen extra", quantity: 30, unit: "ml", emoji: "🫒" },
      { productId: "p-caldo", name: "Caldo de verduras", quantity: 600, unit: "ml", emoji: "🥫" },
    ],
    steps: [
      { text: "Sofríe el ajo, la cebolla y el tomate 5 min, 120º, velocidad 1.", duration: 300, speed: "1", temp: "120º" },
      { text: "Añade las lentejas y el caldo, cocina 25 min, 100º, giro a la izquierda velocidad cuchara.", duration: 1500, speed: "cuchara", temp: "100º" },
    ],
    ratingAvg: 4.5,
    timesCooked: 0,
    source: "cookidoo",
  },
  {
    id: "r-import-quiche",
    name: "Quiche de calabacín y bacon",
    type: "thermomix",
    emoji: "🥧",
    time: 50,
    difficulty: "Media",
    tags: ["horno", "comfort food"],
    baseServings: 6,
    ingredients: [
      { productId: "p-calabacin", name: "Calabacín", quantity: 2, unit: "ud", emoji: "🥒" },
      { productId: "p-bacon", name: "Bacon en lonchas", quantity: 120, unit: "g", emoji: "🥓" },
      { productId: "p-huevos", name: "Huevos L (docena)", quantity: 4, unit: "ud", emoji: "🥚" },
      { productId: "p-nata", name: "Nata para cocinar", quantity: 200, unit: "ml", emoji: "🥛" },
      { productId: "p-queso", name: "Queso rallado", quantity: 100, unit: "g", emoji: "🧀" },
    ],
    steps: [
      { text: "Trocea el calabacín 4 seg, velocidad 4.", duration: 4, speed: "4" },
      { text: "Mezcla huevos, nata y queso 15 seg, velocidad 3.", duration: 15, speed: "3" },
      { text: "Vierte sobre la base de masa quebrada y hornea 35 min a 180º.", duration: 2100, temp: "180º (horno)" },
    ],
    ratingAvg: 4.6,
    timesCooked: 0,
    source: "cookidoo",
  },
];

function emptyWeekPlan() {
  const plan = {};
  DAYS.forEach((day) => {
    plan[day] = { comida: null, cena: null };
  });
  return plan;
}

function expiryDaysLeftFor(pantryItem) {
  return daysUntil(pantryItem.expiryDate);
}

export const useStore = create(
  persist(
    (set, get) => ({
      // ---------- AUTH ----------
      users: {
        "demo@cocinia.app": { password: "cocinia123", name: "Tú", avatar: "🧑‍🍳" },
      },
      currentUser: null,
      isAuthenticated: false,
      authError: null,

      register: ({ name, email, password, householdName, inviteCode }) => {
        const { users } = get();
        if (users[email]) {
          set({ authError: "Ya existe una cuenta con ese email." });
          return false;
        }
        const newUsers = { ...users, [email]: { password, name, avatar: "🙂" } };
        set({ users: newUsers, authError: null });

        const joiningExisting = inviteCode && inviteCode.trim().toUpperCase() === get().group.inviteCode;
        if (joiningExisting) {
          const newMember = { id: uid("m"), name, avatar: "🙂", diet: "omnivoro", allergies: [], dislikes: [], role: "miembro" };
          set((state) => ({
            familyMembers: [...state.familyMembers, newMember],
          }));
        } else if (householdName) {
          // Demo de un solo hogar compartido: renombramos el hogar pero conservamos la despensa de ejemplo
          set((state) => ({ group: { ...state.group, name: householdName } }));
        }

        set({
          currentUser: { email, name, avatar: "🙂" },
          isAuthenticated: true,
        });
        return true;
      },

      login: (email, password) => {
        const { users } = get();
        const u = users[email];
        if (!u || u.password !== password) {
          set({ authError: "Email o contraseña incorrectos." });
          return false;
        }
        set({ currentUser: { email, name: u.name, avatar: u.avatar }, isAuthenticated: true, authError: null });
        return true;
      },

      loginDemo: () => {
        get().login("demo@cocinia.app", "cocinia123");
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      clearAuthError: () => set({ authError: null }),

      // ---------- GRUPO FAMILIAR ----------
      group: { id: "grp-demo", name: "Familia García", inviteCode: "FAM247" },
      familyMembers: DEFAULT_FAMILY_MEMBERS,

      renameGroup: (name) => set((state) => ({ group: { ...state.group, name } })),

      regenerateInviteCode: () =>
        set((state) => ({ group: { ...state.group, inviteCode: generateInviteCode() } })),

      addFamilyMember: (member) =>
        set((state) => ({
          familyMembers: [
            ...state.familyMembers,
            { id: uid("m"), role: "miembro", allergies: [], dislikes: [], diet: "omnivoro", ...member },
          ],
        })),

      updateFamilyMember: (id, patch) =>
        set((state) => ({
          familyMembers: state.familyMembers.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),

      removeFamilyMember: (id) =>
        set((state) => ({ familyMembers: state.familyMembers.filter((m) => m.id !== id) })),

      // ---------- DESPENSA ----------
      pantry: buildInitialPantry(),

      addPantryItem: (item) =>
        set((state) => ({
          pantry: [...state.pantry, { id: uid("pantry"), addedAt: todayISO(), ...item }],
        })),

      updatePantryItem: (id, patch) =>
        set((state) => ({
          pantry: state.pantry.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      removePantryItem: (id) => set((state) => ({ pantry: state.pantry.filter((p) => p.id !== id) })),

      markPantryItemWasted: (id) => {
        get().removePantryItem(id);
        set((state) => ({
          streak: { weeksWithoutWaste: 0, lastWasteAt: todayISO(), wastedCount: (state.streak.wastedCount || 0) + 1 },
        }));
      },

      // Añade productos reconocidos (tique, foto nevera, código de barras) fusionando con lo ya existente
      addParsedItems: (parsedItems, location = "despensa") =>
        set((state) => {
          let pantry = [...state.pantry];
          parsedItems.forEach((parsed) => {
            const catEntry = CATALOG_BY_ID[parsed.matchId];
            if (!catEntry) return;
            const existingIdx = pantry.findIndex((p) => p.productId === parsed.matchId && p.location === location);
            const expiry = addDays(todayISO(), catEntry.shelfLifeDays);
            if (existingIdx >= 0) {
              pantry[existingIdx] = {
                ...pantry[existingIdx],
                quantity: pantry[existingIdx].quantity + parsed.quantity,
                expiryDate: expiry,
              };
            } else {
              pantry.push({
                id: uid("pantry"),
                productId: parsed.matchId,
                name: catEntry.name,
                emoji: catEntry.emoji,
                category: catEntry.category,
                aisle: catEntry.aisle,
                unit: parsed.unit || catEntry.unit,
                quantity: parsed.quantity,
                location,
                expiryDate: expiry,
                addedAt: todayISO(),
              });
            }
          });
          return { pantry };
        }),

      getMissingForIngredients: (ingredients) => {
        const { pantry } = get();
        return ingredients.map((ing) => {
          const have = pantry
            .filter((p) => p.productId === ing.productId)
            .reduce((sum, p) => sum + p.quantity, 0);
          const missing = Math.max(0, Math.round((ing.quantity - have) * 100) / 100);
          return { ...ing, have, missing };
        });
      },

      decrementPantryByIngredients: (ingredients) =>
        set((state) => {
          let pantry = [...state.pantry];
          ingredients.forEach((ing) => {
            let remaining = ing.quantity;
            const matches = pantry
              .map((p, idx) => ({ ...p, idx }))
              .filter((p) => p.productId === ing.productId)
              .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));
            matches.forEach((m) => {
              if (remaining <= 0) return;
              const used = Math.min(m.quantity, remaining);
              pantry[m.idx] = { ...pantry[m.idx], quantity: Math.round((pantry[m.idx].quantity - used) * 100) / 100 };
              remaining -= used;
            });
          });
          return { pantry };
        }),

      // ---------- RECETAS ----------
      importedRecipes: [],
      favoriteRecipeIds: [],

      getAllRecipes: () => [...RECIPES, ...get().importedRecipes],

      importRecipeFromLink: (url) => {
        const { importedRecipes } = get();
        const alreadyImportedIds = importedRecipes.map((r) => r.id);
        const next = IMPORTABLE_POOL.find((r) => !alreadyImportedIds.includes(r.id));
        if (!next) return null;
        const imported = { ...next, importedFrom: url || "https://cookidoo.es/recipes/demo" };
        set({ importedRecipes: [...importedRecipes, imported] });
        return imported;
      },

      toggleFavorite: (recipeId) =>
        set((state) => ({
          favoriteRecipeIds: state.favoriteRecipeIds.includes(recipeId)
            ? state.favoriteRecipeIds.filter((id) => id !== recipeId)
            : [...state.favoriteRecipeIds, recipeId],
        })),

      // Añade una receta creada a mano o reconocida por foto de una receta escrita
      addCustomRecipe: (draft) => {
        const recipe = {
          id: uid("r-custom"),
          ratingAvg: null,
          timesCooked: 0,
          ...draft,
        };
        set((state) => ({ importedRecipes: [...state.importedRecipes, recipe] }));
        return recipe;
      },

      // ---------- HISTORIAL DE COCINA ----------
      cookingHistory: [],
      timesCookedOverrides: {},

      cookRecipe: ({ recipeId, servings, rating, note }) => {
        const recipe = get().getAllRecipes().find((r) => r.id === recipeId);
        if (!recipe) return;
        const scaledIngredients = recipe.ingredients.map((ing) => ({
          ...ing,
          quantity: scaleQuantity(ing.quantity, recipe.baseServings, servings),
        }));
        get().decrementPantryByIngredients(scaledIngredients);
        set((state) => ({
          cookingHistory: [
            { id: uid("hist"), recipeId, date: todayISO(), servings, rating: rating || null, note: note || "" },
            ...state.cookingHistory,
          ],
          timesCookedOverrides: {
            ...state.timesCookedOverrides,
            [recipeId]: (state.timesCookedOverrides[recipeId] || 0) + 1,
          },
          streak: { ...state.streak, weeksWithoutWaste: state.streak.weeksWithoutWaste },
        }));
      },

      rateHistoryEntry: (historyId, rating) =>
        set((state) => ({
          cookingHistory: state.cookingHistory.map((h) => (h.id === historyId ? { ...h, rating } : h)),
        })),

      // ---------- PLAN SEMANAL ----------
      weekPlan: emptyWeekPlan(),

      setPlanSlot: (day, meal, recipeId) =>
        set((state) => ({
          weekPlan: { ...state.weekPlan, [day]: { ...state.weekPlan[day], [meal]: recipeId } },
        })),

      clearPlanSlot: (day, meal) =>
        set((state) => ({
          weekPlan: { ...state.weekPlan, [day]: { ...state.weekPlan[day], [meal]: null } },
        })),

      resetWeekPlan: () => set({ weekPlan: emptyWeekPlan() }),

      // ---------- LISTA DE LA COMPRA ----------
      shoppingList: [],

      addManualShoppingItem: (item) =>
        set((state) => ({
          shoppingList: [
            { id: uid("shop"), checked: false, source: "manual", ...item },
            ...state.shoppingList,
          ],
        })),

      toggleShoppingItem: (id) =>
        set((state) => ({
          shoppingList: state.shoppingList.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
        })),

      removeShoppingItem: (id) =>
        set((state) => ({ shoppingList: state.shoppingList.filter((i) => i.id !== id) })),

      clearCheckedShoppingItems: () =>
        set((state) => ({ shoppingList: state.shoppingList.filter((i) => !i.checked) })),

      regenerateShoppingList: () => {
        const { pantry, weekPlan } = get();
        const allRecipes = get().getAllRecipes();
        const manualItems = get().shoppingList.filter((i) => i.source === "manual");
        const aggregated = {};

        // 1) Bajo mínimos / agotado en despensa
        pantry.forEach((p) => {
          const lowThreshold = p.unit === "ud" ? 1 : p.unit === "g" || p.unit === "ml" ? 100 : 1;
          if (p.quantity <= lowThreshold) {
            const key = p.productId;
            aggregated[key] = aggregated[key] || {
              name: p.name,
              unit: p.unit,
              quantity: 0,
              category: p.category,
              aisle: p.aisle,
              source: "stock-bajo",
            };
            aggregated[key].quantity += p.unit === "ud" ? 1 : 200;
          }
        });

        // 2) Lo que falta para el plan semanal
        Object.values(weekPlan).forEach((day) => {
          MEALS.forEach((meal) => {
            const recipeId = day[meal];
            if (!recipeId) return;
            const recipe = allRecipes.find((r) => r.id === recipeId);
            if (!recipe) return;
            const missing = get().getMissingForIngredients(recipe.ingredients);
            missing.forEach((m) => {
              if (m.missing <= 0) return;
              const catEntry = CATALOG_BY_ID[m.productId];
              const key = m.productId;
              aggregated[key] = aggregated[key] || {
                name: m.name,
                unit: m.unit,
                quantity: 0,
                category: catEntry?.category || "Otros",
                aisle: catEntry?.aisle || "Otros",
                source: "plan-semanal",
              };
              aggregated[key].quantity = Math.round((aggregated[key].quantity + m.missing) * 100) / 100;
            });
          });
        });

        const generated = Object.entries(aggregated).map(([productId, data]) => ({
          id: uid("shop"),
          productId,
          checked: false,
          ...data,
        }));

        set({ shoppingList: [...generated, ...manualItems] });
      },

      orderedSupermarket: null,
      orderOnline: (supermarketId) => {
        set({ orderedSupermarket: supermarketId });
        setTimeout(() => set({ orderedSupermarket: null }), 4000);
      },

      // ---------- AJUSTES / SUPERMERCADOS ----------
      supermarkets: SUPERMARKETS.map((s) => ({ ...s, connected: s.id === "mercadona" })),
      toggleSupermarketConnection: (id) =>
        set((state) => ({
          supermarkets: state.supermarkets.map((s) => (s.id === id ? { ...s, connected: !s.connected } : s)),
        })),

      // ---------- GAMIFICACIÓN ----------
      streak: { weeksWithoutWaste: 4, lastWasteAt: null, wastedCount: 0 },

      // ---------- TOASTS (no persistido) ----------
      toasts: [],
      pushToast: (message, tone = "info") => {
        const id = uid("toast");
        set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 3500);
      },
      dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "cocinia-store",
      partialize: (state) => {
        const { toasts, authError, ...rest } = state;
        return rest;
      },
    }
  )
);

export { DAYS, MEALS, expiryDaysLeftFor };
