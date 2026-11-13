import { useRef, useState } from "react";
import { Mic, Square, Send } from "lucide-react";
import Modal from "./Modal";
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
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState(null);
  const recognitionRef = useRef(null);
  const consumeProduct = useStore((s) => s.consumeProduct);
  const pushToast = useStore((s) => s.pushToast);

  function process(phrase) {
    const parsed = parseConsumptionPhrase(phrase);
    if (!parsed) {
      const msg = "No he reconocido ningún producto. Prueba, por ejemplo, \"me he comido un plátano\".";
      setFeedback({ ok: false, message: msg });
      speak("No entendido");
      return;
    }
    if (parsed.needsQuantity) {
      const msg = `¿Cuánto ${parsed.name.toLowerCase()} te has comido? Dime la cantidad, por ejemplo "200 gramos de ${parsed.name.toLowerCase()}".`;
      setFeedback({ ok: false, message: msg });
      speak("¿Cantidad?");
      return;
    }
    const result = consumeProduct(parsed);
    if (!result.found) {
      const msg = `No tienes ${parsed.name.toLowerCase()} en tu despensa.`;
      setFeedback({ ok: false, message: msg });
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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      pushToast("Tu navegador no soporta dictado por voz; escribe la frase abajo", "info");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const said = e.results[0][0].transcript;
      setText(said);
      process(said);
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

  function submitText(e) {
    e.preventDefault();
    if (!text.trim()) return;
    process(text.trim());
  }

  function closeModal() {
    if (listening) stopListening();
    setOpen(false);
    setFeedback(null);
    setText("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-sage-600 text-white shadow-card transition hover:bg-sage-700 md:bottom-6"
        title="Dime qué te has comido"
      >
        <Mic size={22} />
      </button>

      <Modal open={open} onClose={closeModal} title="Me he comido...">
        <p className="mb-3 text-sm text-stone-500">
          Di o escribe algo como <strong>"me he comido un plátano"</strong> o <strong>"se ha acabado la leche"</strong> y lo
          resto automáticamente de tu despensa.
        </p>
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          className={`btn-primary mb-3 w-full ${listening ? "!bg-red-600 hover:!bg-red-700" : ""}`}
        >
          {listening ? <Square size={16} /> : <Mic size={16} />}
          {listening ? "Escuchando… toca para parar" : "Hablar"}
        </button>
        <form onSubmit={submitText} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input flex-1"
            placeholder="O escribe aquí lo que te has comido…"
          />
          <button type="submit" className="btn-secondary px-3">
            <Send size={16} />
          </button>
        </form>
        {feedback && (
          <p className={`mt-3 rounded-lg p-2.5 text-sm ${feedback.ok ? "bg-sage-50 text-sage-700" : "bg-red-50 text-red-600"}`}>
            {feedback.message}
          </p>
        )}
      </Modal>
    </>
  );
}
