import { useMemo, useState } from "react";
import { Zap, Link2, Heart, History, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import RecipeCard from "../components/RecipeCard";
import StarRating from "../components/StarRating";
import RecipeFormModal from "../components/RecipeFormModal";
import { importRecipeFromUrl } from "../lib/recipeImport";
import { PRODUCT_CATALOG } from "../data/dummyData";
import { classNames } from "../utils/helpers";

const TABS = [
  { id: "todas", label: "Todas" },
  { id: "thermomix", label: "Thermomix" },
  { id: "normal", label: "A fuego/sartén" },
  { id: "favoritas", label: "Favoritas" },
  { id: "historial", label: "Historial" },
];

export default function Recetas() {
  const navigate = useNavigate();
  const getAllRecipes = useStore((s) => s.getAllRecipes);
  const favoriteRecipeIds = useStore((s) => s.favoriteRecipeIds);
  const cookingHistory = useStore((s) => s.cookingHistory);
  const addCustomRecipe = useStore((s) => s.addCustomRecipe);
  const rateHistoryEntry = useStore((s) => s.rateHistoryEntry);
  const pushToast = useStore((s) => s.pushToast);

  const [tab, setTab] = useState("todas");
  const [search, setSearch] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [showRecipeForm, setShowRecipeForm] = useState(false);

  const allRecipes = getAllRecipes();

  const filtered = useMemo(() => {
    return allRecipes
      .filter((r) => {
        if (tab === "thermomix") return r.type === "thermomix";
        if (tab === "normal") return r.type === "normal";
        if (tab === "favoritas") return favoriteRecipeIds.includes(r.id);
        return true;
      })
      .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  }, [allRecipes, tab, search, favoriteRecipeIds]);

  async function handleImport() {
    if (!importUrl.trim()) return;
    setImporting(true);
    try {
      const data = await importRecipeFromUrl(importUrl.trim());
      const matchedIngredients = (data.ingredients || []).map((ing) => {
        const match = PRODUCT_CATALOG.find((p) => p.name.toLowerCase() === ing.name.trim().toLowerCase());
        return {
          productId: match?.id,
          name: ing.name.trim(),
          quantity: ing.quantity,
          unit: ing.unit,
          emoji: match?.emoji,
        };
      });
      const recipe = addCustomRecipe({
        name: data.name || "Receta importada",
        type: data.isThermomix ? "thermomix" : "normal",
        emoji: data.isThermomix ? "🍽️" : "🍳",
        time: data.time || 30,
        difficulty: data.difficulty || "Media",
        tags: data.tags || [],
        baseServings: data.baseServings || 4,
        ingredients: matchedIngredients,
        steps: data.steps || [],
        source: "import",
        importedFrom: importUrl.trim(),
      });
      pushToast(`"${recipe.name}" importada del enlace`, "success");
      setImportUrl("");
    } catch (err) {
      pushToast(`No se pudo importar la receta (${err.message})`, "error");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-stone-800">Recetas</h1>
        <button onClick={() => setShowRecipeForm(true)} className="btn-secondary whitespace-nowrap">
          <Plus size={16} /> Añadir receta
        </button>
      </div>

      <div className="card flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link2 size={18} className="hidden text-stone-400 sm:block" />
        <input
          value={importUrl}
          onChange={(e) => setImportUrl(e.target.value)}
          placeholder="Pega un enlace de Cookidoo/Thermomix para importar la receta…"
          className="input flex-1"
        />
        <button onClick={handleImport} disabled={importing} className="btn-primary whitespace-nowrap">
          {importing ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
          Importar
        </button>
      </div>

      <RecipeFormModal open={showRecipeForm} onClose={() => setShowRecipeForm(false)} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl bg-stone-100 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={classNames(
                "flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition",
                tab === t.id ? "bg-white text-sage-700 shadow-sm" : "text-stone-500"
              )}
            >
              {t.id === "thermomix" && <Zap size={12} />}
              {t.id === "favoritas" && <Heart size={12} />}
              {t.id === "historial" && <History size={12} />}
              {t.label}
            </button>
          ))}
        </div>
        {tab !== "historial" && (
          <div className="max-w-xs flex-1">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar receta…" className="input" />
          </div>
        )}
      </div>

      {tab === "historial" ? (
        <div className="space-y-2">
          {cookingHistory.length === 0 && <p className="text-sm text-stone-400">Todavía no has cocinado ninguna receta.</p>}
          {cookingHistory.map((h) => {
            const recipe = allRecipes.find((r) => r.id === h.recipeId);
            if (!recipe) return null;
            return (
              <div key={h.id} className="card flex items-center gap-3">
                <span className="text-2xl">{recipe.emoji}</span>
                <div className="flex-1">
                  <button onClick={() => navigate(`/recetas/${recipe.id}`)} className="font-semibold text-stone-800 hover:underline">
                    {recipe.name}
                  </button>
                  <p className="text-xs text-stone-400">
                    {h.date} · {h.servings} raciones
                  </p>
                </div>
                <StarRating value={h.rating || 0} onChange={(v) => rateHistoryEntry(h.id, v)} size={18} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
          {filtered.length === 0 && <p className="col-span-full text-sm text-stone-400">No hay recetas que coincidan.</p>}
        </div>
      )}
    </div>
  );
}
