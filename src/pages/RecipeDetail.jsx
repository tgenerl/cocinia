import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Zap, Minus, Plus, Users, ShoppingCart, Check, ChefHat, ArrowRight, Trash2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { formatQuantity, scaleQuantity } from "../utils/helpers";
import Modal from "../components/Modal";
import StarRating from "../components/StarRating";
import { CATALOG_BY_ID } from "../data/dummyData";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getAllRecipes = useStore((s) => s.getAllRecipes);
  const getMissingForIngredients = useStore((s) => s.getMissingForIngredients);
  const addManualShoppingItem = useStore((s) => s.addManualShoppingItem);
  const cookRecipe = useStore((s) => s.cookRecipe);
  const pushToast = useStore((s) => s.pushToast);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const removeRecipe = useStore((s) => s.removeRecipe);
  const favoriteRecipeIds = useStore((s) => s.favoriteRecipeIds);

  const recipe = getAllRecipes().find((r) => r.id === id);

  const [servings, setServings] = useState(recipe?.baseServings || 4);
  const [guestMode, setGuestMode] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [ratingOpen, setRatingOpen] = useState(false);
  const [rating, setRating] = useState(5);

  const scaledIngredients = useMemo(
    () =>
      recipe
        ? recipe.ingredients.map((ing) => ({ ...ing, quantity: scaleQuantity(ing.quantity, recipe.baseServings, servings) }))
        : [],
    [recipe, servings]
  );

  const withStock = getMissingForIngredients(scaledIngredients);
  const missingItems = withStock.filter((i) => i.missing > 0);
  const isFavorite = recipe && favoriteRecipeIds.includes(recipe.id);

  if (!recipe) {
    return <p className="text-stone-500">Receta no encontrada.</p>;
  }

  function addMissingToShoppingList() {
    missingItems.forEach((item) => {
      const catEntry = CATALOG_BY_ID[item.productId];
      addManualShoppingItem({
        productId: item.productId,
        name: item.name,
        quantity: item.missing,
        unit: item.unit,
        category: catEntry?.category || "Otros",
        aisle: catEntry?.aisle || "Otros",
      });
    });
    pushToast(`${missingItems.length} ingredientes añadidos a la lista de la compra`, "success");
  }

  function startCooking() {
    if (recipe.type === "thermomix") {
      navigate(`/recetas/${recipe.id}/guiado?servings=${servings}`);
    } else {
      document.getElementById("checklist-section")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function finishNormalCooking() {
    setRatingOpen(true);
  }

  function confirmFinish() {
    cookRecipe({ recipeId: recipe.id, servings, rating });
    pushToast("¡Recetas terminada! Tu despensa se ha actualizado automáticamente", "success");
    setRatingOpen(false);
    navigate("/recetas");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{recipe.emoji}</span>
            <div>
              <h1 className="text-xl font-extrabold text-stone-800">{recipe.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Clock size={13} /> {recipe.time} min
                </span>
                <span>· {recipe.difficulty}</span>
                {recipe.type === "thermomix" && (
                  <span className="flex items-center gap-1 rounded-full bg-sage-600 px-2 py-0.5 font-bold text-white">
                    <Zap size={10} /> Thermomix
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(recipe.id)}
              className="rounded-full bg-stone-100 p-2 text-stone-500 hover:bg-stone-200"
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
            <button
              onClick={() => {
                removeRecipe(recipe.id);
                pushToast(`"${recipe.name}" eliminada`, "info");
                navigate("/recetas");
              }}
              className="rounded-full bg-stone-100 p-2 text-stone-500 hover:bg-red-100 hover:text-red-600"
              title="Eliminar receta"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Raciones */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold text-stone-800">Raciones</p>
            <p className="text-xs text-stone-400">Ajusta y recalculamos las cantidades al momento.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200"
            >
              <Minus size={16} />
            </button>
            <span className="w-10 text-center text-lg font-bold">{servings}</span>
            <button
              onClick={() => setServings(servings + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            setGuestMode(!guestMode);
            if (!guestMode) setServings(6);
          }}
          className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            guestMode ? "bg-clay-100 text-clay-700" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          <Users size={16} /> Modo invitados {guestMode ? "activado" : ""}
        </button>
      </div>

      {/* Ingredientes */}
      <div className="card">
        <p className="mb-3 font-bold text-stone-800">Ingredientes</p>
        <div className="space-y-2">
          {withStock.map((item) => (
            <div key={item.productId} className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2">
              <span className="flex items-center gap-2 text-sm">
                <span>{item.emoji}</span> {item.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-stone-700">{formatQuantity(item.quantity, item.unit)}</span>
                {item.missing > 0 ? (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                    Faltan {formatQuantity(item.missing, item.unit)}
                  </span>
                ) : (
                  <Check size={16} className="text-sage-600" />
                )}
              </div>
            </div>
          ))}
        </div>
        {missingItems.length > 0 && (
          <button onClick={addMissingToShoppingList} className="btn-secondary mt-3 w-full">
            <ShoppingCart size={16} /> Añadir lo que falta a la lista de la compra
          </button>
        )}
      </div>

      {/* Acción principal */}
      <button onClick={startCooking} className="btn-primary w-full py-3 text-base">
        <ChefHat size={18} /> {recipe.type === "thermomix" ? "Empezar modo guiado" : "Empezar a cocinar"}
        <ArrowRight size={16} />
      </button>

      {/* Checklist modo normal */}
      {recipe.type === "normal" && (
        <div id="checklist-section" className="card">
          <p className="mb-3 font-bold text-stone-800">Pasos</p>
          <div className="space-y-2">
            {recipe.steps.map((step, i) => (
              <label key={i} className="flex items-start gap-3 rounded-lg border border-stone-100 p-3">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={!!checkedSteps[i]}
                  onChange={(e) => setCheckedSteps({ ...checkedSteps, [i]: e.target.checked })}
                />
                <span className={`text-sm ${checkedSteps[i] ? "text-stone-400 line-through" : "text-stone-700"}`}>{step.text}</span>
              </label>
            ))}
          </div>
          <button onClick={finishNormalCooking} className="btn-primary mt-4 w-full">
            <Check size={16} /> Terminar y descontar de mi despensa
          </button>
        </div>
      )}

      <Modal open={ratingOpen} onClose={() => setRatingOpen(false)} title="¿Qué tal ha salido?">
        <div className="space-y-4 text-center">
          <p className="text-sm text-stone-500">Valora la receta para que CocinIA aprenda tus gustos reales.</p>
          <div className="flex justify-center">
            <StarRating value={rating} onChange={setRating} size={32} />
          </div>
          <button onClick={confirmFinish} className="btn-primary w-full">
            Guardar y actualizar despensa
          </button>
        </div>
      </Modal>
    </div>
  );
}
