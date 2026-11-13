import { useMemo, useState } from "react";
import { Plus, Trash2, ShoppingBag, RefreshCcw, Check } from "lucide-react";
import { useStore } from "../store/useStore";
import { classNames } from "../utils/helpers";

export default function ListaCompra() {
  const shoppingList = useStore((s) => s.shoppingList);
  const toggleShoppingItem = useStore((s) => s.toggleShoppingItem);
  const removeShoppingItem = useStore((s) => s.removeShoppingItem);
  const clearCheckedShoppingItems = useStore((s) => s.clearCheckedShoppingItems);
  const addManualShoppingItem = useStore((s) => s.addManualShoppingItem);
  const regenerateShoppingList = useStore((s) => s.regenerateShoppingList);
  const supermarkets = useStore((s) => s.supermarkets);
  const orderOnline = useStore((s) => s.orderOnline);
  const orderedSupermarket = useStore((s) => s.orderedSupermarket);
  const pushToast = useStore((s) => s.pushToast);

  const [manualName, setManualName] = useState("");

  const grouped = useMemo(() => {
    const groups = {};
    shoppingList.forEach((item) => {
      const aisle = item.aisle || "Otros";
      groups[aisle] = groups[aisle] || [];
      groups[aisle].push(item);
    });
    return groups;
  }, [shoppingList]);

  const checkedCount = shoppingList.filter((i) => i.checked).length;

  function addManual(e) {
    e.preventDefault();
    if (!manualName.trim()) return;
    addManualShoppingItem({ name: manualName.trim(), quantity: 1, unit: "ud", category: "Otros", aisle: "Otros" });
    setManualName("");
  }

  function handleOrder(id, name) {
    orderOnline(id);
    pushToast(`Pedido enviado a ${name} con un toque 🛒`, "success");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-stone-800">Lista de la compra</h1>
        <div className="flex gap-2">
          <button onClick={regenerateShoppingList} className="btn-secondary">
            <RefreshCcw size={16} /> Actualizar automático
          </button>
          {checkedCount > 0 && (
            <button onClick={clearCheckedShoppingItems} className="btn-secondary">
              <Trash2 size={16} /> Quitar marcados ({checkedCount})
            </button>
          )}
        </div>
      </div>

      <form onSubmit={addManual} className="card flex gap-2">
        <input value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="Añadir algo a mano…" className="input" />
        <button type="submit" className="btn-primary whitespace-nowrap">
          <Plus size={16} /> Añadir
        </button>
      </form>

      {shoppingList.length === 0 && (
        <p className="py-6 text-center text-sm text-stone-400">
          Tu lista está vacía. Genera una automáticamente desde el Plan semanal o añade productos a mano.
        </p>
      )}

      {Object.entries(grouped).map(([aisle, items]) => (
        <section key={aisle}>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-400">{aisle}</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={classNames(
                  "card flex items-center gap-3 py-2.5",
                  item.checked && "opacity-50"
                )}
              >
                <input type="checkbox" checked={item.checked} onChange={() => toggleShoppingItem(item.id)} className="h-4 w-4" />
                <div className="flex-1">
                  <p className={classNames("text-sm font-semibold text-stone-800", item.checked && "line-through")}>{item.name}</p>
                  <p className="text-xs text-stone-400">
                    {item.quantity} {item.unit}
                    {item.source === "stock-bajo" && " · bajo mínimos"}
                    {item.source === "plan-semanal" && " · plan semanal"}
                  </p>
                </div>
                <button onClick={() => removeShoppingItem(item.id)} className="btn-ghost p-2 text-stone-400">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="card">
        <p className="mb-3 flex items-center gap-2 font-bold text-stone-800">
          <ShoppingBag size={18} /> Pedir online
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {supermarkets
            .filter((s) => s.connected)
            .map((s) => (
              <button
                key={s.id}
                onClick={() => handleOrder(s.id, s.name)}
                disabled={orderedSupermarket === s.id}
                className="flex flex-col items-center gap-2 rounded-xl border border-stone-200 p-4 hover:bg-stone-50 disabled:opacity-60"
              >
                <span className="text-3xl">{s.emoji}</span>
                <span className="text-sm font-semibold">{s.name}</span>
                {orderedSupermarket === s.id ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-sage-600">
                    <Check size={12} /> Pedido realizado
                  </span>
                ) : (
                  <span className="text-xs text-stone-400">Un toque y listo</span>
                )}
              </button>
            ))}
          {supermarkets.filter((s) => s.connected).length === 0 && (
            <p className="col-span-full text-sm text-stone-400">
              Conecta un súper desde Ajustes para pedir online con un toque.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
