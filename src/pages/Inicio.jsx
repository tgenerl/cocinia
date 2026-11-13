import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, Camera, ScanBarcode, Utensils, AlertTriangle, Sparkles, Clock, Zap, ChefHat } from "lucide-react";
import { useStore } from "../store/useStore";
import { getRecommendations } from "../utils/recommend";
import { daysUntil } from "../utils/helpers";
import ExpiryBadge from "../components/ExpiryBadge";
import AddProductModal from "../components/AddProductModal";
import LeftoversModal from "../components/LeftoversModal";

const QUICK_ACTIONS = [
  { id: "tique", label: "Foto de tique", icon: Receipt },
  { id: "nevera", label: "Foto de nevera", icon: Camera },
  { id: "barcode", label: "Código de barras", icon: ScanBarcode },
  { id: "sobras", label: "Foto de sobras", icon: Utensils },
];

export default function Inicio() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const pantry = useStore((s) => s.pantry);
  const getAllRecipes = useStore((s) => s.getAllRecipes);
  const cookingHistory = useStore((s) => s.cookingHistory);
  const favoriteRecipeIds = useStore((s) => s.favoriteRecipeIds);
  const weekPlan = useStore((s) => s.weekPlan);

  const [addModalTab, setAddModalTab] = useState(null);
  const [leftoversOpen, setLeftoversOpen] = useState(false);
  const [thermomixOnly, setThermomixOnly] = useState(false);
  const [maxTime, setMaxTime] = useState(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const expiringSoon = useMemo(
    () =>
      pantry
        .filter((p) => p.quantity > 0 && daysUntil(p.expiryDate) <= 3)
        .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate)),
    [pantry]
  );

  const recommendations = useMemo(
    () =>
      getRecommendations(getAllRecipes(), pantry, {
        cookingHistory,
        favoriteRecipeIds,
        filters: { thermomixOnly, maxTime, onlyAvailable },
      }).slice(0, 3),
    [pantry, cookingHistory, favoriteRecipeIds, thermomixOnly, maxTime, onlyAvailable]
  );

  const todayLabel = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm capitalize text-stone-400">{todayLabel}</p>
        <h1 className="text-2xl font-extrabold text-stone-800">Hola, {currentUser?.name?.split(" ")[0] || ""} 👋</h1>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => (id === "sobras" ? setLeftoversOpen(true) : setAddModalTab(id))}
            className="card flex flex-col items-center gap-2 py-5 text-center transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-50 text-sage-700">
              <Icon size={20} />
            </div>
            <span className="text-xs font-semibold text-stone-600">{label}</span>
          </button>
        ))}
      </div>

      {/* Caduca pronto */}
      {expiringSoon.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-bold text-stone-800">
            <AlertTriangle size={18} className="text-clay-500" /> Caduca pronto
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {expiringSoon.map((item) => (
              <div key={item.id} className="card min-w-[170px] shrink-0">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl">{item.emoji}</span>
                  <ExpiryBadge date={item.expiryDate} />
                </div>
                <p className="text-sm font-semibold text-stone-700">{item.name}</p>
                <p className="text-xs text-stone-400">
                  {item.quantity} {item.unit} · {item.location}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Qué cocino hoy */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-bold text-stone-800">
            <Sparkles size={18} className="text-sage-600" /> ¿Qué cocino hoy?
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setThermomixOnly(!thermomixOnly)}
              className={`chip transition ${thermomixOnly ? "bg-sage-600 text-white" : "hover:bg-stone-200"}`}
            >
              <Zap size={12} /> Thermomix
            </button>
            <button
              onClick={() => setMaxTime(maxTime === 30 ? null : 30)}
              className={`chip transition ${maxTime === 30 ? "bg-sage-600 text-white" : "hover:bg-stone-200"}`}
            >
              <Clock size={12} /> Menos de 30 min
            </button>
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`chip transition ${onlyAvailable ? "bg-sage-600 text-white" : "hover:bg-stone-200"}`}
            >
              <ChefHat size={12} /> Despensa cero compra
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map(({ recipe, reasons, missingCount }) => (
            <div
              key={recipe.id}
              onClick={() => navigate(`/recetas/${recipe.id}`)}
              className="card cursor-pointer transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-4xl">{recipe.emoji}</span>
                {recipe.type === "thermomix" && (
                  <span className="flex items-center gap-1 rounded-full bg-sage-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    <Zap size={10} /> Thermomix
                  </span>
                )}
              </div>
              <h4 className="mb-1 font-bold text-stone-800">{recipe.name}</h4>
              <p className="mb-2 flex items-center gap-1 text-xs text-stone-400">
                <Clock size={12} /> {recipe.time} min · {recipe.difficulty}
              </p>
              <p className="text-xs text-sage-700">{reasons[0]}</p>
              {missingCount > 0 && (
                <p className="mt-1 text-xs text-clay-600">
                  Te falta{missingCount > 1 ? "n" : ""} {missingCount} ingrediente{missingCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          ))}
          {recommendations.length === 0 && (
            <p className="col-span-full text-sm text-stone-400">
              No encontramos recetas con esos filtros. Prueba a quitar alguno.
            </p>
          )}
        </div>
      </section>

      <AddProductModal open={!!addModalTab} initialTab={addModalTab || "tique"} onClose={() => setAddModalTab(null)} />
      <LeftoversModal open={leftoversOpen} onClose={() => setLeftoversOpen(false)} />
    </div>
  );
}
