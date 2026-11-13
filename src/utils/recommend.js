import { daysUntil } from "./helpers";

// Motor sencillo de recomendación: puntúa recetas según caducidades, disponibilidad e historial.
export function getRecommendations(allRecipes, pantry, { cookingHistory = [], favoriteRecipeIds = [], filters = {} } = {}) {
  const expiringProductIds = pantry.filter((p) => p.quantity > 0 && daysUntil(p.expiryDate) <= 3).map((p) => p.productId);

  const stockByProduct = pantry.reduce((acc, p) => {
    acc[p.productId] = (acc[p.productId] || 0) + p.quantity;
    return acc;
  }, {});

  return allRecipes
    .map((recipe) => {
      let score = 0;
      const reasons = [];

      const matchedExpiring = recipe.ingredients.filter((ing) => expiringProductIds.includes(ing.productId));
      if (matchedExpiring.length > 0) {
        score += matchedExpiring.length * 25;
        reasons.push(`Usa ${matchedExpiring.map((i) => i.name.toLowerCase()).join(", ")}, que caduca pronto`);
      }

      const missingCount = recipe.ingredients.filter((ing) => (stockByProduct[ing.productId] || 0) < ing.quantity).length;
      const availableRatio = 1 - missingCount / recipe.ingredients.length;
      score += availableRatio * 20;
      if (missingCount === 0) reasons.push("Ya tienes todo lo necesario en la despensa");

      const history = cookingHistory.filter((h) => h.recipeId === recipe.id);
      const avgRating = history.length ? history.reduce((s, h) => s + (h.rating || 0), 0) / history.length : 0;
      if (avgRating >= 4) {
        score += 15;
        reasons.push("Repites esta receta a menudo y te encanta");
      }

      if (favoriteRecipeIds.includes(recipe.id)) score += 10;

      if (filters.thermomixOnly && recipe.type !== "thermomix") score -= 1000;
      if (filters.maxTime && recipe.time > filters.maxTime) score -= 1000;
      if (filters.onlyAvailable && missingCount > 0) score -= 1000;

      return { recipe, score, missingCount, reasons };
    })
    .filter((r) => r.score > -500)
    .sort((a, b) => b.score - a.score);
}
