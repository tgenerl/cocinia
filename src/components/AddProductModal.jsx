import { useState } from "react";
import { Camera, Receipt, ScanBarcode, Plus, Check, Loader2 } from "lucide-react";
import Modal from "./Modal";
import { useStore } from "../store/useStore";
import {
  TICKET_SAMPLES,
  FRIDGE_PHOTO_SAMPLE,
  BARCODE_DB,
  PRODUCT_CATALOG,
  CATALOG_BY_ID,
} from "../data/dummyData";
import { addDays, todayISO } from "../utils/helpers";

function locationForCategory(category) {
  if (category === "Congelados") return "congelador";
  if (["Lácteos y huevos", "Carnes", "Pescados"].includes(category)) return "nevera";
  return "despensa";
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
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);
  const [ticketChecked, setTicketChecked] = useState({});

  function simulateTicketScan() {
    setTicketLoading(true);
    setTicketResult(null);
    setTimeout(() => {
      const sample = TICKET_SAMPLES[Math.floor(Math.random() * TICKET_SAMPLES.length)];
      setTicketResult(sample);
      setTicketChecked(Object.fromEntries(sample.rawLines.map((_, i) => [i, true])));
      setTicketLoading(false);
    }, 1100);
  }

  function confirmTicket() {
    const lines = ticketResult.rawLines.filter((_, i) => ticketChecked[i]);
    const byLocation = {};
    lines.forEach((l) => {
      const catEntry = CATALOG_BY_ID[l.matchId];
      const loc = locationForCategory(catEntry.category);
      byLocation[loc] = byLocation[loc] || [];
      byLocation[loc].push(l);
    });
    Object.entries(byLocation).forEach(([loc, items]) => addParsedItems(items, loc));
    pushToast(`${lines.length} productos del tique de ${ticketResult.store} añadidos a tu despensa`, "success");
    setTicketResult(null);
    onClose();
  }

  // --- Nevera foto ---
  const [fridgeLoading, setFridgeLoading] = useState(false);
  const [fridgeResult, setFridgeResult] = useState(null);
  const [fridgeChecked, setFridgeChecked] = useState({});

  function simulateFridgeScan() {
    setFridgeLoading(true);
    setFridgeResult(null);
    setTimeout(() => {
      setFridgeResult(FRIDGE_PHOTO_SAMPLE);
      setFridgeChecked(Object.fromEntries(FRIDGE_PHOTO_SAMPLE.map((_, i) => [i, true])));
      setFridgeLoading(false);
    }, 1100);
  }

  function confirmFridge() {
    const items = fridgeResult.filter((_, i) => fridgeChecked[i]);
    addParsedItems(items, "nevera");
    pushToast(`${items.length} productos detectados añadidos a la nevera`, "success");
    setFridgeResult(null);
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
            Simula hacer una foto a tu tique de compra. La IA reconocerá los productos y abreviaturas del súper automáticamente.
          </p>
          {!ticketResult && (
            <button onClick={simulateTicketScan} disabled={ticketLoading} className="btn-primary w-full">
              {ticketLoading ? <Loader2 size={16} className="animate-spin" /> : <Receipt size={16} />}
              {ticketLoading ? "Analizando tique…" : "Simular foto de tique"}
            </button>
          )}
          {ticketResult && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-stone-400">Tique de {ticketResult.store}</p>
              {ticketResult.rawLines.map((l, i) => {
                const p = CATALOG_BY_ID[l.matchId];
                return (
                  <label key={i} className="flex items-center justify-between rounded-lg border border-stone-200 p-2.5">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!ticketChecked[i]}
                        onChange={(e) => setTicketChecked({ ...ticketChecked, [i]: e.target.checked })}
                      />
                      <span className="text-sm">
                        <span className="text-stone-400 line-through">{l.raw}</span> → {p.emoji} {p.name}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-stone-600">
                      {l.quantity} {l.unit}
                    </span>
                  </label>
                );
              })}
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
            Simula una foto de tu nevera o despensa para detectar lo que ya tienes sin tique de compra.
          </p>
          {!fridgeResult && (
            <button onClick={simulateFridgeScan} disabled={fridgeLoading} className="btn-primary w-full">
              {fridgeLoading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              {fridgeLoading ? "Detectando productos…" : "Simular foto de nevera"}
            </button>
          )}
          {fridgeResult && (
            <div className="space-y-2">
              {fridgeResult.map((item, i) => {
                const p = CATALOG_BY_ID[item.matchId];
                return (
                  <label key={i} className="flex items-center justify-between rounded-lg border border-stone-200 p-2.5">
                    <span className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!fridgeChecked[i]}
                        onChange={(e) => setFridgeChecked({ ...fridgeChecked, [i]: e.target.checked })}
                      />
                      {p.emoji} {p.name}
                    </span>
                    <span className="text-sm font-semibold text-stone-600">
                      {item.quantity} {item.unit}
                    </span>
                  </label>
                );
              })}
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
