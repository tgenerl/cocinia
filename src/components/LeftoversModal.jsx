import { useState } from "react";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { useStore } from "../store/useStore";
import { LEFTOVER_PHOTO_SAMPLE, RECIPES } from "../data/dummyData";

export default function LeftoversModal({ open, onClose }) {
  const navigate = useNavigate();
  const pushToast = useStore((s) => s.pushToast);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function simulate() {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(LEFTOVER_PHOTO_SAMPLE);
      setLoading(false);
    }, 1100);
  }

  const suggestions = result
    ? RECIPES.filter((r) => r.tags.some((t) => result.suggestionTags.includes(t))).slice(0, 2)
    : [];

  function close() {
    setResult(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={close} title="Reconocimiento de sobras">
      <p className="mb-3 text-sm text-stone-500">
        Haz una foto de ese tupper que sobró ayer y la IA te propone qué cocinar con ello.
      </p>
      {!result && (
        <button onClick={simulate} disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          {loading ? "Analizando sobras…" : "Simular foto del tupper"}
        </button>
      )}
      {result && (
        <div className="space-y-4">
          <div className="rounded-lg bg-stone-100 p-3 text-sm">
            Detectado: <strong>{result.detected.join(" + ")}</strong>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-stone-700">
              <Sparkles size={15} className="text-clay-500" /> Ideas para aprovecharlo
            </p>
            <div className="space-y-2">
              {suggestions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    close();
                    navigate(`/recetas/${r.id}`);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg border border-stone-200 p-2.5 text-left hover:bg-stone-50"
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="text-sm font-medium text-stone-700">{r.name}</span>
                </button>
              ))}
              {suggestions.length === 0 && (
                <p className="text-sm text-stone-500">
                  Con esto te sugerimos un salteado rápido: calienta el arroz con un poco de aceite y las verduras 5 minutos.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              pushToast("Sobras añadidas a tu despensa como 'ración lista'", "success");
              close();
            }}
            className="btn-secondary w-full"
          >
            Añadir sobras a mi despensa
          </button>
        </div>
      )}
    </Modal>
  );
}
