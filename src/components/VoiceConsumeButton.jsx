import { useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { useStore } from "../store/useStore";
import { parseConsumptionPhrase } from "../lib/voiceConsumption";

let cachedVoices = [];
function loadVoices() {
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

// Elige la voz española más natural disponible (prioriza es-ES, voces de red y motores de calidad)
function pickSpanishVoice() {
  const voices = cachedVoices.length ? cachedVoices : loadVoices();
  const esVoices = voices.filter((v) => v.lang?.toLowerCase().startsWith("es"));
  if (!esVoices.length) return null;
  const score = (v) => {
    let s = 0;
    if (v.lang?.toLowerCase() === "es-es") s += 3;
    if (!v.localService) s += 2;
    if (/google|microsoft|natural|premium|online/i.test(v.name)) s += 2;
    return s;
  };
  return [...esVoices].sort((a, b) => score(b) - score(a))[0];
}

function speak(message) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  const voice = pickSpanishVoice();
  utterance.lang = voice?.lang || "es-ES";
  if (voice) utterance.voice = voice;
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export default function VoiceConsumeButton() {
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const recognitionRef = useRef(null);
  const consumeProduct = useStore((s) => s.consumeProduct);
  const pushToast = useStore((s) => s.pushToast);

  function process(phrase) {
    const parsed = parseConsumptionPhrase(phrase);
    if (!parsed) {
      const msg = "No he reconocido ningún producto. Prueba, por ejemplo, \"me he comido un plátano\".";
      setFeedback({ ok: false, message: msg });
      pushToast(msg, "error");
      speak("No entendido");
      return;
    }
    if (parsed.needsQuantity) {
      const msg = `¿Cuánto ${parsed.name.toLowerCase()} te has comido? Dime la cantidad, por ejemplo "200 gramos de ${parsed.name.toLowerCase()}".`;
      setFeedback({ ok: false, message: msg });
      pushToast(msg, "error");
      speak("¿Cantidad?");
      return;
    }
    const result = consumeProduct(parsed);
    if (!result.found) {
      const msg = `No tienes ${parsed.name.toLowerCase()} en tu despensa.`;
      setFeedback({ ok: false, message: msg });
      pushToast(msg, "error");
      speak("No encontrado");
      return;
    }
    const msg = parsed.consumedAll
      ? `Listo, he quitado todo el ${parsed.name.toLowerCase()} de tu despensa.`
      : `Listo, he restado ${parsed.quantity} ${parsed.unit} de ${parsed.name.toLowerCase()} de tu despensa.`;
    setFeedback({ ok: true, message: msg });
    pushToast(msg, "success");
    speak("Ok");
  }

  function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      process(e.results[0][0].transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setFeedback(null);
    setListening(true);
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function handleMicClick() {
    if (listening) {
      stopListening();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      pushToast("Tu navegador no soporta dictado por voz.", "error");
      return;
    }
    startListening();
  }

  return (
    <div className="fixed bottom-20 right-4 z-30 flex flex-col items-end gap-2 md:bottom-6">
      {feedback && (
        <p
          className={`max-w-[240px] rounded-lg p-2.5 text-sm shadow-card ${
            feedback.ok ? "bg-sage-50 text-sage-700" : "bg-red-50 text-red-600"
          }`}
        >
          {feedback.message}
        </p>
      )}
      <button
        onClick={handleMicClick}
        className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-card transition ${
          listening ? "animate-pulse bg-red-600 hover:bg-red-700" : "bg-sage-600 hover:bg-sage-700"
        }`}
        title="Dime qué te has comido"
      >
        {listening ? <Square size={22} /> : <Mic size={22} />}
      </button>
    </div>
  );
}
