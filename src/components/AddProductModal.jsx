import { useState } from "react";
import { Receipt, Camera, ScanBarcode, Plus, Check, Trash2, Loader2 } from "lucide-react";
import Modal from "./Modal";
import CameraCapture from "./CameraCapture";
import { useStore } from "../store/useStore";
import { BARCODE_DB, PRODUCT_CATALOG, CATALOG_BY_ID } from "../data/dummyData";
import { addDays, todayISO } from "../utils/helpers";
import { recognizePhoto } from "../lib/aiRecognition";

function locationForCategory(category) {
  if (category === "Congelados") return "congelador";
  if (["Lácteos y huevos", "Carnes", "Pescados"].includes(category)) return "nevera";
  return "despensa";
}

function emptyLine() {
  return { matchId: "", name: "", quantity: "", unit: "" };
}

function linesFromRecognition(items) {
  return items.map((it) => {
    const match = PRODUCT_CATALOG.find((p) => p.name === it.catalogName);
    return {
      matchId: match?.id || "",
      name: it.catalogName || it.rawName || "",
      quantity: it.quantity ?? "",
      unit: it.unit || match?.unit || "",
    };
  });
}

const TABS = [
  { id: "tique", label: "Foto de tique", icon: Receipt },
  { id: "nevera", label: "Foto de nevera", icon: Camera },
  { id: "barcode", label: "Código de barras", icon: ScanBarcode },
  { id: "manual", label: "Manual", icon: Plus },
];

export default function AddProductModal({ open, onClose, initialTab = "tique" }) {
  const [tab, setTab] = useState(initialTab);
  const addParsedItems = useStore((s) => s.addParsedItems);
  const addPantryItem = useStore((s) => s.addPantryItem);
  const pushToast = useStore((s) => s.pushToast);

  // --- Tique ---
  const [ticketPhotoUrl, setTicketPhotoUrl] = useState(null);
  const [ticketAnalyzing, setTicketAnalyzing] = useState(false);
  const [ticketStore, setTicketStore] = useState(null);
  const [ticketLines, setTicketLines] = useState(null);

  async function captureTicketPhoto(file, url) {
    setTicketPhotoUrl(url);
    setTicketAnalyzing(true);
    setTicketLines(null);
    try {
      const result = await recognizePhoto("ticket", file);
      setTicketStore(result.store || "tu tique");
      setTicketLines(linesFromRecognition(result.items || []));
      if (result.simulated) {
        pushToast("No se pudo conectar con el modelo de IA; mostrando un tique de muestra", "info");
      }
    } catch (err) {
      pushToast("No se pudo analizar la foto del tique. Inténtalo de nuevo.", "error");
      setTicketPhotoUrl(null);
    } finally {
      setTicketAnalyzing(false);
    }
  }

  function retakeTicketPhoto() {
    setTicketPhotoUrl(null);
    setTicketLines(null);
    setTicketStore(null);
  }

  function updateTicketLine(idx, patch) {
    setTicketLines(ticketLines.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  function confirmTicket() {
    const lines = ticketLines.filter((l) => l.matchId && l.quantity !== "");
    const byLocation = {};
    lines.forEach((l) => {
      const catEntry = CATALOG_BY_ID[l.matchId];
      const loc = locationForCategory(catEntry.category);
      byLocation[loc] = byLocation[loc] || [];
      byLocation[loc].push({ ...l, quantity: Number(l.quantity) });
    });
    Object.entries(byLocation).forEach(([loc, items]) => addParsedItems(items, loc));
    pushToast(`${lines.length} productos del tique de ${ticketStore} añadidos a tu despensa`, "success");
    retakeTicketPhoto();
    onClose();
  }

  // --- Nevera / despensa foto ---
  const [fridgePhotoUrl, setFridgePhotoUrl] = useState(null);
  const [fridgeAnalyzing, setFridgeAnalyzing] = useState(false);
  const [fridgeLines, setFridgeLines] = useState(null);

  async function captureFridgePhoto(file, url) {
    setFridgePhotoUrl(url);
    setFridgeAnalyzing(true);
    setFridgeLines(null);
    try {
      const result = await recognizePhoto("fridge", file);
      setFridgeLines(
        linesFromRecognition(result.items || []).map((line) => ({
          ...line,
          location: locationForCategory(CATALOG_BY_ID[line.matchId]?.category),
        }))
      );
      if (result.simulated) {
        pushToast("No se pudo conectar con el modelo de IA; mostrando productos de muestra", "info");
      }
    } catch (err) {
      pushToast("No se pudo analizar la foto. Inténtalo de nuevo.", "error");
      setFridgePhotoUrl(null);
    } finally {
      setFridgeAnalyzing(false);
    }
  }

  function retakeFridgePhoto() {
    setFridgePhotoUrl(null);
    setFridgeLines(null);
  }

  function updateFridgeLine(idx, patch) {
    setFridgeLines(fridgeLines.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  function confirmFridge() {
    const lines = fridgeLines.filter((l) => l.matchId && l.quantity !== "");
    const byLocation = {};
    lines.forEach((l) => {
      byLocation[l.location] = byLocation[l.location] || [];
      byLocation[l.location].push({ ...l, quantity: Number(l.quantity) });
    });
    Object.entries(byLocation).forEach(([loc, items]) => addParsedItems(items, loc));
    pushToast(`${lines.length} productos detectados añadidos a tu despensa`, "success");
    retakeFridgePhoto();
    onClose();
  }

  // --- Barcode ---
  const [barcode, setBarcode] = useState("");
  const [barcodeResult, setBarcodeResult] = useState(null);

  function lookupBarcode(code) {
    const found = BARCODE_DB[code];
    setBarcode(code);
    setBarcodeResult(found ? { ...found, code } : { notFound: true, code });
  }

  function confirmBarcode() {
    const catEntry = CATALOG_BY_ID[barcodeResult.matchId];
    addParsedItems([barcodeResult], locationForCategory(catEntry.category));
    pushToast(`${catEntry.name} añadido a tu despensa`, "success");
    setBarcodeResult(null);
    setBarcode("");
    onClose();
  }

  // --- Manual ---
  const [manual, setManual] = useState({ productId: "", quantity: "", location: "despensa" });

  function submitManual(e) {
    e.preventDefault();
    const catEntry = CATALOG_BY_ID[manual.productId];
    if (!catEntry || !manual.quantity) return;
    addPantryItem({
      productId: catEntry.id,
      name: catEntry.name,
      emoji: catEntry.emoji,
      category: catEntry.category,
      aisle: catEntry.aisle,
      unit: catEntry.unit,
      quantity: Number(manual.quantity),
      location: manual.location,
      expiryDate: addDays(todayISO(), catEntry.shelfLifeDays),
    });
    pushToast(`${catEntry.name} añadido manualmente`, "success");
    setManual({ productId: "", quantity: "", location: "despensa" });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Añadir productos a la despensa" maxWidth="max-w-xl">
      <div className="mb-4 grid grid-cols-4 gap-1 rounded-xl bg-stone-100 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-semibold transition ${
              tab === id ? "bg-white text-sage-700 shadow-sm" : "text-stone-500"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === "tique" && (
        <div className="space-y-3">
          <p className="text-sm text-stone-500">
            Haz una foto a tu tique de compra. La IA reconocerá los productos y podrás corregir lo que haga falta antes de
            guardar.
          </p>
          <CameraCapture
            label="Hacer foto de tique"
            photoUrl={ticketPhotoUrl}
            onCapture={captureTicketPhoto}
            onRetake={retakeTicketPhoto}
            disabled={ticketAnalyzing}
          />
          {ticketAnalyzing && (
            <p className="flex items-center justify-center gap-2 py-2 text-sm text-stone-500">
              <Loader2 size={16} className="animate-spin" /> Analizando tique…
            </p>
          )}
          {ticketLines && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-stone-400">Tique de {ticketStore} · revisa y edita</p>
              {ticketLines.map((l, i) => (
                <LineEditor
                  key={i}
                  line={l}
                  onChange={(patch) => updateTicketLine(i, patch)}
                  onRemove={() => setTicketLines(ticketLines.filter((_, idx) => idx !== i))}
                />
              ))}
              <button
                type="button"
                onClick={() => setTicketLines([...ticketLines, emptyLine()])}
                className="btn-ghost w-full text-sm"
              >
                <Plus size={14} /> Añadir línea
              </button>
              <button onClick={confirmTicket} className="btn-primary w-full">
                <Check size={16} /> Añadir a mi despensa
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "nevera" && (
        <div className="space-y-3">
          <p className="text-sm text-stone-500">
            Haz una foto de tu nevera o despensa para detectar lo que ya tienes, sin necesidad de tique de compra.
          </p>
          <CameraCapture
            label="Hacer foto de nevera/despensa"
            photoUrl={fridgePhotoUrl}
            onCapture={captureFridgePhoto}
            onRetake={retakeFridgePhoto}
            disabled={fridgeAnalyzing}
          />
          {fridgeAnalyzing && (
            <p className="flex items-center justify-center gap-2 py-2 text-sm text-stone-500">
              <Loader2 size={16} className="animate-spin" /> Detectando productos…
            </p>
          )}
          {fridgeLines && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-stone-400">Detectado · revisa y edita</p>
              {fridgeLines.map((l, i) => (
                <LineEditor
                  key={i}
                  line={l}
                  showLocation
                  onChange={(patch) => updateFridgeLine(i, patch)}
                  onRemove={() => setFridgeLines(fridgeLines.filter((_, idx) => idx !== i))}
                />
              ))}
              <button
                type="button"
                onClick={() => setFridgeLines([...fridgeLines, { ...emptyLine(), location: "nevera" }])}
                className="btn-ghost w-full text-sm"
              >
                <Plus size={14} /> Añadir línea
              </button>
              <button onClick={confirmFridge} className="btn-primary w-full">
                <Check size={16} /> Añadir a mi despensa
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "barcode" && (
        <div className="space-y-3">
          <p className="text-sm text-stone-500">Escanea (simulado) o escribe un código de barras de ejemplo:</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(BARCODE_DB).map((code) => (
              <button key={code} onClick={() => lookupBarcode(code)} className="chip hover:bg-stone-200">
                {code}
              </button>
            ))}
          </div>
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookupBarcode(barcode)}
            className="input"
            placeholder="Escribe un código de barras…"
          />
          <button onClick={() => lookupBarcode(barcode)} className="btn-secondary w-full">
            <ScanBarcode size={16} /> Buscar producto
          </button>
          {barcodeResult?.notFound && (
            <p className="text-sm text-red-600">Código no reconocido en la demo. Prueba uno de los sugeridos arriba.</p>
          )}
          {barcodeResult && !barcodeResult.notFound && (
            <div className="rounded-lg border border-stone-200 p-3">
              <p className="text-sm">
                {CATALOG_BY_ID[barcodeResult.matchId].emoji} {CATALOG_BY_ID[barcodeResult.matchId].name} — {barcodeResult.quantity}{" "}
                {barcodeResult.unit}
              </p>
              <button onClick={confirmBarcode} className="btn-primary mt-2 w-full">
                <Check size={16} /> Añadir a mi despensa
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "manual" && (
        <form onSubmit={submitManual} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-600">Producto</label>
            <input
              list="catalog-list"
              className="input"
              placeholder="Empieza a escribir…"
              onChange={(e) => {
                const match = PRODUCT_CATALOG.find((p) => p.name === e.target.value);
                setManual({ ...manual, productId: match?.id || "" });
              }}
            />
            <datalist id="catalog-list">
              {PRODUCT_CATALOG.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-600">Cantidad</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                className="input"
                value={manual.quantity}
                onChange={(e) => setManual({ ...manual, quantity: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-600">Ubicación</label>
              <select
                className="input"
                value={manual.location}
                onChange={(e) => setManual({ ...manual, location: e.target.value })}
              >
                <option value="nevera">Nevera</option>
                <option value="congelador">Congelador</option>
                <option value="despensa">Despensa</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={!manual.productId} className="btn-primary w-full">
            <Plus size={16} /> Añadir producto
          </button>
        </form>
      )}
    </Modal>
  );
}

function LineEditor({ line, onChange, onRemove, showLocation = false }) {
  const current = CATALOG_BY_ID[line.matchId];
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-stone-200 p-2.5">
      <span className="w-5 text-center">{current?.emoji || "❓"}</span>
      <input
        list="line-catalog-list"
        className="input min-w-[9rem] flex-1"
        placeholder="Producto"
        defaultValue={current?.name || line.name || ""}
        onChange={(e) => {
          const match = PRODUCT_CATALOG.find((p) => p.name === e.target.value);
          onChange({ matchId: match?.id || "", name: e.target.value });
        }}
      />
      <input
        type="number"
        min="0"
        step="any"
        className="input w-20"
        placeholder="Cant."
        value={line.quantity}
        onChange={(e) => onChange({ quantity: e.target.value })}
      />
      <input
        className="input w-16"
        placeholder="Ud."
        value={line.unit}
        onChange={(e) => onChange({ unit: e.target.value })}
      />
      {showLocation && (
        <select className="input w-28" value={line.location} onChange={(e) => onChange({ location: e.target.value })}>
          <option value="nevera">Nevera</option>
          <option value="congelador">Congelador</option>
          <option value="despensa">Despensa</option>
        </select>
      )}
      <button type="button" onClick={onRemove} className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-red-600">
        <Trash2 size={16} />
      </button>
      <datalist id="line-catalog-list">
        {PRODUCT_CATALOG.map((p) => (
          <option key={p.id} value={p.name} />
        ))}
      </datalist>
    </div>
  );
}

