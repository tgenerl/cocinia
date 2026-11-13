import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Snowflake, Archive, Refrigerator } from "lucide-react";
import { useStore } from "../store/useStore";
import ExpiryBadge from "../components/ExpiryBadge";
import AddProductModal from "../components/AddProductModal";
import { classNames } from "../utils/helpers";

const LOCATIONS = [
  { id: "todo", label: "Todo", icon: Archive },
  { id: "nevera", label: "Nevera", icon: Refrigerator },
  { id: "congelador", label: "Congelador", icon: Snowflake },
  { id: "despensa", label: "Despensa", icon: Archive },
];

export default function Despensa() {
  const pantry = useStore((s) => s.pantry);
  const updatePantryItem = useStore((s) => s.updatePantryItem);
  const removePantryItem = useStore((s) => s.removePantryItem);
  const markPantryItemWasted = useStore((s) => s.markPantryItemWasted);
  const pushToast = useStore((s) => s.pushToast);

  const [location, setLocation] = useState("todo");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const filtered = useMemo(() => {
    return pantry
      .filter((p) => p.quantity > 0)
      .filter((p) => location === "todo" || p.location === location)
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [pantry, location, search]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((item) => {
      groups[item.category] = groups[item.category] || [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-stone-800">Despensa</h1>
        <button onClick={() => setAddOpen(true)} className="btn-primary">
          <Plus size={16} /> Añadir producto
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl bg-stone-100 p-1">
          {LOCATIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setLocation(id)}
              className={classNames(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition",
                location === id ? "bg-white text-sage-700 shadow-sm" : "text-stone-500"
              )}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto…"
            className="input pl-9"
          />
        </div>
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="py-10 text-center text-sm text-stone-400">No hay productos que coincidan con el filtro.</p>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-400">{category}</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="card flex flex-wrap items-center gap-3 py-3">
                <span className="text-2xl">{item.emoji}</span>
                <div className="min-w-[120px] flex-1">
                  <p className="truncate font-semibold text-stone-800">{item.name}</p>
                  <p className="text-xs capitalize text-stone-400">{item.location}</p>
                </div>

                <ExpiryBadge date={item.expiryDate} />

                {editingId === item.id ? (
                  <input
                    type="number"
                    autoFocus
                    min="0"
                    step="any"
                    defaultValue={item.quantity}
                    onBlur={(e) => {
                      updatePantryItem(item.id, { quantity: Number(e.target.value) || 0 });
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                    className="input w-24"
                  />
                ) : (
                  <button
                    onClick={() => setEditingId(item.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-200"
                    title="Editar cantidad"
                  >
                    <Pencil size={13} /> {item.quantity} {item.unit}
                  </button>
                )}

                <button
                  onClick={() => {
                    markPantryItemWasted(item.id);
                    pushToast(`${item.name} marcado como desperdiciado`, "warning");
                  }}
                  className="btn-ghost p-2 text-clay-600"
                  title="Marcar como tirado (desperdicio)"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => removePantryItem(item.id)}
                  className="btn-ghost p-2 text-stone-400"
                  title="Quitar de la despensa (ya consumido)"
                >
                  ✓
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      <AddProductModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
