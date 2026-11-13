import { useState } from "react";
import { Camera, PencilLine, Plus, Trash2, Check, Loader2 } from "lucide-react";
import Modal from "./Modal";
import { useStore } from "../store/useStore";
import { PRODUCT_CATALOG, HANDWRITTEN_RECIPE_SAMPLE } from "../data/dummyData";

const TABS = [
  { id: "manual", label: "Manual", icon: PencilLine },
  { id: "foto", label: "Foto de receta", icon: Camera },
];

const EMPTY_INGREDIENT = { name: "", productId: "", quantity: "", unit: "" };
const EMPTY_STEP = { text: "" };

export default function RecipeFormModal({ open, onClose }) {
  const [tab, setTab] = useState("manual");
  const addCustomRecipe = useStore((s) => s.addCustomRecipe);
  const pushToast = useStore((s) => s.pushToast);

  // --- Manual ---
  const [name, setName] = useState("");
  const [type, setType] = useState("normal");
  const [time, setTime] = useState("30");
  const [baseServings, setBaseServings] = useState("4");
  const [tags, setTags] = useState("");
  const [ingredients, setIngredients] = useState([{ ...EMPTY_INGREDIENT }]);
  const [steps, setSteps] = useState([{ ...EMPTY_STEP }]);

  function resetManual() {
    setName("");
    setType("normal");
    setTime("30");
    setBaseServings("4");
    setTags("");
    setIngredients([{ ...EMPTY_INGREDIENT }]);
    setSteps([{ ...EMPTY_STEP }]);
  }

  function updateIngredient(idx, patch) {
    setIngredients(ingredients.map((ing, i) => (i === idx ? { ...ing, ...patch } : ing)));
  }

  function updateStep(idx, patch) {
    setSteps(steps.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function submitManual(e) {
    e.preventDefault();
    const cleanIngredients = ingredients
      .filter((ing) => ing.name.trim())
      .map((ing) => ({
        productId: ing.productId || undefined,
        name: ing.name.trim(),
        quantity: Number(ing.quantity) || 0,
        unit: ing.unit.trim() || "ud",
      }));
    const cleanSteps = steps.filter((s) => s.text.trim()).map((s) => ({ text: s.text.trim() }));
    const recipe = addCustomRecipe({
      name: name.trim(),
      type,
      emoji: type === "thermomix" ? "🍽️" : "🍳",
      time: Number(time) || 30,
      difficulty: "Media",
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      baseServings: Number(baseServings) || 4,
      ingredients: cleanIngredients,
      steps: cleanSteps,
      source: "manual",
    });
    pushToast(`"${recipe.name}" añadida a tus recetas`, "success");
    resetManual();
    onClose();
  }

  // --- Foto de receta ---
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoResult, setPhotoResult] = useState(null);

  function simulatePhotoScan() {
    setPhotoLoading(true);
    setPhotoResult(null);
    setTimeout(() => {
      setPhotoResult(HANDWRITTEN_RECIPE_SAMPLE);
      setPhotoLoading(false);
    }, 1200);
  }

  function confirmPhoto() {
    const recipe = addCustomRecipe({ ...photoResult, source: "foto" });
    pushToast(`"${recipe.name}" reconocida y añadida a tus recetas`, "success");
    setPhotoResult(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Añadir receta" maxWidth="max-w-xl">
      <div className="mb-4 flex gap-1 rounded-xl bg-stone-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${
              tab === t.id ? "bg-white text-sage-700 shadow-sm" : "text-stone-500"
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "manual" && (
        <form onSubmit={submitManual} className="space-y-3">
          <p className="text-sm text-stone-500">Escribe tu propia receta o cópiala de la que ya tengas apuntada.</p>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-600">Nombre</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-600">Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="input">
                <option value="normal">A fuego/sartén</option>
                <option value="thermomix">Thermomix</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-600">Minutos</label>
              <input type="number" min="1" value={time} onChange={(e) => setTime(e.target.value)} className="input" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-600">Raciones</label>
              <input
                type="number"
                min="1"
                value={baseServings}
                onChange={(e) => setBaseServings(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-600">Etiquetas (separadas por coma)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="input" placeholder="casero, ligero…" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-600">Ingredientes</label>
            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    list="recipe-catalog-list"
                    className="input flex-1"
                    placeholder="Ingrediente"
                    value={ing.name}
                    onChange={(e) => {
                      const match = PRODUCT_CATALOG.find((p) => p.name === e.target.value);
                      updateIngredient(idx, { name: e.target.value, productId: match?.id || "" });
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="input w-20"
                    placeholder="Cant."
                    value={ing.quantity}
                    onChange={(e) => updateIngredient(idx, { quantity: e.target.value })}
                  />
                  <input
                    className="input w-20"
                    placeholder="Ud."
                    value={ing.unit}
                    onChange={(e) => updateIngredient(idx, { unit: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                    className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <datalist id="recipe-catalog-list">
              {PRODUCT_CATALOG.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={() => setIngredients([...ingredients, { ...EMPTY_INGREDIENT }])}
              className="btn-ghost mt-2 text-sm"
            >
              <Plus size={14} /> Añadir ingrediente
            </button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-600">Pasos</label>
            <div className="space-y-2">
              {steps.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 text-sm font-semibold text-stone-400">{idx + 1}.</span>
                  <input
                    className="input flex-1"
                    placeholder="Describe el paso"
                    value={s.text}
                    onChange={(e) => updateStep(idx, { text: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                    className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setSteps([...steps, { ...EMPTY_STEP }])} className="btn-ghost mt-2 text-sm">
              <Plus size={14} /> Añadir paso
            </button>
          </div>

          <button type="submit" className="btn-primary w-full">
            <Check size={16} /> Guardar receta
          </button>
        </form>
      )}

      {tab === "foto" && (
        <div className="space-y-3">
          <p className="text-sm text-stone-500">
            Haz una foto a una receta escrita a mano o impresa y CocinIA la reconocerá automáticamente.
          </p>
          {!photoResult && (
            <button onClick={simulatePhotoScan} disabled={photoLoading} className="btn-primary w-full">
              {photoLoading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              {photoLoading ? "Reconociendo receta…" : "Simular foto de receta"}
            </button>
          )}
          {photoResult && (
            <div className="space-y-3">
              <div className="rounded-lg border border-stone-200 p-3">
                <p className="text-sm font-bold text-stone-800">
                  {photoResult.emoji} {photoResult.name}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {photoResult.time} min · {photoResult.baseServings} raciones
                </p>
                <p className="mt-2 text-xs font-semibold uppercase text-stone-400">Ingredientes detectados</p>
                <ul className="mt-1 space-y-0.5 text-sm text-stone-600">
                  {photoResult.ingredients.map((ing, i) => (
                    <li key={i}>
                      {ing.emoji} {ing.name} — {ing.quantity} {ing.unit}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs font-semibold uppercase text-stone-400">Pasos detectados</p>
                <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-sm text-stone-600">
                  {photoResult.steps.map((s, i) => (
                    <li key={i}>{s.text}</li>
                  ))}
                </ol>
              </div>
              <button onClick={confirmPhoto} className="btn-primary w-full">
                <Check size={16} /> Añadir a mis recetas
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
