import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Play, Pause, ChevronLeft, ChevronRight, Mic, X, Check, Zap } from "lucide-react";
import { useStore } from "../store/useStore";
import { scaleQuantity, classNames } from "../utils/helpers";
import Modal from "../components/Modal";
import StarRating from "../components/StarRating";
import { VOICE_DEMO_COMMANDS } from "../data/dummyData";

function formatSeconds(total) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(total % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function GuidedCooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const servings = Number(searchParams.get("servings")) || 4;

  const getAllRecipes = useStore((s) => s.getAllRecipes);
  const cookRecipe = useStore((s) => s.cookRecipe);
  const pushToast = useStore((s) => s.pushToast);

  const recipe = getAllRecipes().find((r) => r.id === id);

  const [stepIndex, setStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(recipe?.steps[0]?.duration || 0);
  const [playing, setPlaying] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState(null);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const intervalRef = useRef(null);
  const recognitionRef = useRef(null);

  const step = recipe?.steps[stepIndex];
  const isLastStep = recipe && stepIndex === recipe.steps.length - 1;

  useEffect(() => {
    if (!recipe) return;
    setTimeLeft(recipe.steps[stepIndex].duration || 0);
    setPlaying(false);
  }, [stepIndex, recipe]);

  useEffect(() => {
    if (playing && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setPlaying(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  if (!recipe) return <p className="text-stone-500">Receta no encontrada.</p>;

  function goNext() {
    if (isLastStep) {
      setRatingOpen(true);
    } else {
      setStepIndex((i) => i + 1);
    }
  }
  function goPrev() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function confirmFinish() {
    cookRecipe({ recipeId: recipe.id, servings, rating });
    pushToast("¡Receta terminada! Tu despensa se ha actualizado automáticamente", "success");
    setRatingOpen(false);
    navigate("/recetas");
  }

  function handleVoiceCommand(phraseRaw) {
    const phrase = phraseRaw.toLowerCase();
    const matched = VOICE_DEMO_COMMANDS.find((c) => phrase.includes(c.keyword || c.phrase.split(" ")[0]) || phrase.includes(c.phrase));
    if (!matched) {
      setVoiceMessage("No he entendido bien, ¿puedes repetirlo?");
      return;
    }
    if (matched.type === "next") {
      goNext();
      setVoiceMessage("Pasando al siguiente paso");
    } else if (matched.type === "prev") {
      goPrev();
      setVoiceMessage("Volviendo al paso anterior");
    } else if (matched.type === "repeat") {
      setVoiceMessage(step.text);
    } else if (matched.type === "time") {
      setVoiceMessage(timeLeft > 0 ? `Quedan ${formatSeconds(timeLeft)}` : "Este paso no tiene temporizador");
    } else if (matched.type === "ingredient") {
      const ing = recipe.ingredients.find((i) => i.name.toLowerCase().includes(matched.keyword));
      setVoiceMessage(
        ing ? `Lleva ${scaleQuantity(ing.quantity, recipe.baseServings, servings)} ${ing.unit} de ${ing.name.toLowerCase()}` : "No encuentro ese ingrediente en la receta"
      );
    }
  }

  function startListening() {
    setVoiceMessage(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;
      setListening(true);
      recognition.onresult = (event) => {
        const said = event.results[0][0].transcript;
        handleVoiceCommand(said);
        setListening(false);
      };
      recognition.onerror = () => {
        // Sin permiso de micro o sin soporte real: mostramos una demo igualmente
        setListening(false);
        const demo = VOICE_DEMO_COMMANDS[Math.floor(Math.random() * VOICE_DEMO_COMMANDS.length)];
        handleVoiceCommand(demo.phrase);
      };
      recognition.onend = () => setListening(false);
      recognition.start();
    } else {
      // Fallback sin soporte de reconocimiento de voz: simulamos una pregunta de ejemplo
      setListening(true);
      setTimeout(() => {
        const demo = VOICE_DEMO_COMMANDS[Math.floor(Math.random() * VOICE_DEMO_COMMANDS.length)];
        handleVoiceCommand(demo.phrase);
        setListening(false);
      }, 1200);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn-ghost">
          <X size={18} /> Salir
        </button>
        <span className="flex items-center gap-1 text-sm font-semibold text-sage-700">
          <Zap size={14} /> {recipe.name}
        </span>
        <span className="text-sm text-stone-400">{servings} raciones</span>
      </div>

      <div className="flex justify-center gap-1.5">
        {recipe.steps.map((_, i) => (
          <span
            key={i}
            className={classNames("h-1.5 w-8 rounded-full", i <= stepIndex ? "bg-sage-600" : "bg-stone-200")}
          />
        ))}
      </div>

      <div className="card text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-wide text-stone-400">
          Paso {stepIndex + 1} de {recipe.steps.length}
        </p>
        <p className="mb-6 text-xl font-semibold text-stone-800">{step.text}</p>

        {(step.speed || step.temp) && (
          <div className="mb-6 flex justify-center gap-3">
            {step.speed && (
              <div className="rounded-xl bg-stone-100 px-4 py-2">
                <p className="text-[10px] uppercase text-stone-400">Velocidad</p>
                <p className="font-bold text-stone-700">{step.speed}</p>
              </div>
            )}
            {step.temp && (
              <div className="rounded-xl bg-stone-100 px-4 py-2">
                <p className="text-[10px] uppercase text-stone-400">Temperatura</p>
                <p className="font-bold text-stone-700">{step.temp}</p>
              </div>
            )}
          </div>
        )}

        {step.duration > 0 && (
          <div className="mb-2 flex flex-col items-center gap-3">
            <p className="text-4xl font-extrabold tabular-nums text-stone-800">{formatSeconds(timeLeft)}</p>
            <button
              onClick={() => setPlaying(!playing)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-600 text-white shadow-soft"
              disabled={timeLeft === 0}
            >
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button onClick={goPrev} disabled={stepIndex === 0} className="btn-secondary flex-1">
          <ChevronLeft size={16} /> Anterior
        </button>
        <button onClick={goNext} className="btn-primary flex-1">
          {isLastStep ? (
            <>
              <Check size={16} /> Finalizar
            </>
          ) : (
            <>
              Siguiente <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>

      {/* Asistente de voz */}
      <div className="fixed bottom-20 right-4 z-30 md:bottom-6">
        {voiceMessage && (
          <div className="mb-2 max-w-[240px] rounded-xl bg-stone-800 px-3 py-2 text-xs text-white shadow-card">{voiceMessage}</div>
        )}
        <button
          onClick={startListening}
          className={classNames(
            "flex h-14 w-14 items-center justify-center rounded-full shadow-card transition",
            listening ? "animate-pulse bg-red-500 text-white" : "bg-sage-600 text-white"
          )}
          title="Pregúntame mientras cocinas"
        >
          <Mic size={22} />
        </button>
      </div>

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
