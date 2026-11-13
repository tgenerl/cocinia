import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, ShoppingCart, AlertTriangle, Search } from "lucide-react";
import { useStore, DAYS, MEALS } from "../store/useStore";
import Modal from "../components/Modal";

export default function PlanSemanal() {
  const navigate = useNavigate();
  const weekPlan = useStore((s) => s.weekPlan);
  const setPlanSlot = useStore((s) => s.setPlanSlot);
  const clearPlanSlot = useStore((s) => s.clearPlanSlot);
  const getAllRecipes = useStore((s) => s.getAllRecipes);
  const regenerateShoppingList = useStore((s) => s.regenerateShoppingList);
  const pushToast = useStore((s) => s.pushToast);

  const allRecipes = getAllRecipes();
  const [picker, setPicker] = useState(null); // { day, meal }
  const [search, setSearch] = useState("");

  const varietyWarning = useMemo(() => {
    const tagCount = {};
    Object.values(weekPlan).forEach((day) => {
      MEALS.forEach((meal) => {
        const recipe = allRecipes.find((r) => r.id === day[meal]);
        recipe?.tags.forEach((t) => {
          tagCount[t] = (tagCount[t] || 0) + 1;
        });
      });
    });
    const repeated = Object.entries(tagCount).find(([, count]) => count >= 3);
    return repeated ? `Llevas ${repeated[1]} platos con "${repeated[0]}" esta semana, ¿probamos algo distinto?` : null;
  }, [weekPlan, allRecipes]);

  function assign(recipeId) {
    setPlanSlot(picker.day, picker.meal, recipeId);
    setPicker(null);
    setSearch("");
  }

  function handleGenerateList() {
    regenerateShoppingList();
    pushToast("Lista de la compra generada a partir de tu plan semanal", "success");
    navigate("/compra");
  }

  const filteredRecipes = allRecipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-stone-800">Plan semanal</h1>
        <button onClick={handleGenerateList} className="btn-primary">
          <ShoppingCart size={16} /> Generar lista de la compra
        </button>
      </div>

      {varietyWarning && (
        <div className="flex items-center gap-2 rounded-xl bg-clay-50 px-4 py-3 text-sm font-medium text-clay-700">
          <AlertTriangle size={16} /> {varietyWarning}
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="grid min-w-[760px] grid-cols-7 gap-3">
          {DAYS.map((day) => (
            <div key={day} className="space-y-2">
              <p className="text-center text-sm font-bold text-stone-700">{day}</p>
              {MEALS.map((meal) => {
                const recipeId = weekPlan[day][meal];
                const recipe = allRecipes.find((r) => r.id === recipeId);
                return (
                  <div key={meal} className="card min-h-[110px] p-2.5">
                    <p className="mb-1 text-[10px] font-bold uppercase text-stone-400">{meal}</p>
                    {recipe ? (
                      <div className="relative rounded-lg bg-stone-50 p-2">
                        <button
                          onClick={() => clearPlanSlot(day, meal)}
                          className="absolute right-1 top-1 rounded-full bg-white p-0.5 text-stone-400 shadow-sm hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                        <p className="text-xl">{recipe.emoji}</p>
                        <p className="line-clamp-2 text-[11px] font-semibold text-stone-700">{recipe.name}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPicker({ day, meal })}
                        className="flex h-16 w-full items-center justify-center rounded-lg border border-dashed border-stone-300 text-stone-300 hover:border-sage-400 hover:text-sage-500"
                      >
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Modal open={!!picker} onClose={() => setPicker(null)} title="Elige una receta" maxWidth="max-w-lg">
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar receta…" className="input pl-9" />
        </div>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {filteredRecipes.map((r) => (
            <button
              key={r.id}
              onClick={() => assign(r.id)}
              className="flex w-full items-center gap-3 rounded-lg border border-stone-200 p-2.5 text-left hover:bg-stone-50"
            >
              <span className="text-2xl">{r.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-stone-700">{r.name}</p>
                <p className="text-xs text-stone-400">{r.time} min · {r.difficulty}</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
