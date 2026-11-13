import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Share2, RefreshCcw, Plus, Trash2, Users, LogOut, ShoppingBag } from "lucide-react";
import { useStore } from "../store/useStore";

const AVATARS = ["🙂", "🧑‍🍳", "👩", "👨", "🧒", "👵", "👴", "🧑‍🦱"];
const DIETS = [
  { id: "omnivoro", label: "Omnívoro" },
  { id: "vegetariano", label: "Vegetariano" },
  { id: "vegano", label: "Vegano" },
];

export default function Ajustes() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const group = useStore((s) => s.group);
  const renameGroup = useStore((s) => s.renameGroup);
  const regenerateInviteCode = useStore((s) => s.regenerateInviteCode);
  const familyMembers = useStore((s) => s.familyMembers);
  const addFamilyMember = useStore((s) => s.addFamilyMember);
  const updateFamilyMember = useStore((s) => s.updateFamilyMember);
  const removeFamilyMember = useStore((s) => s.removeFamilyMember);
  const supermarkets = useStore((s) => s.supermarkets);
  const toggleSupermarketConnection = useStore((s) => s.toggleSupermarketConnection);
  const logout = useStore((s) => s.logout);
  const pushToast = useStore((s) => s.pushToast);

  const [newMember, setNewMember] = useState({ name: "", avatar: "🙂", diet: "omnivoro", allergies: "" });

  function copyCode() {
    navigator.clipboard?.writeText(group.inviteCode);
    pushToast("Código copiado al portapapeles", "success");
  }

  function shareInvite() {
    const text = `Únete a nuestra despensa en CocinIA con el código ${group.inviteCode}`;
    if (navigator.share) {
      navigator.share({ title: "CocinIA", text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      pushToast("Enlace de invitación copiado", "success");
    }
  }

  function submitMember(e) {
    e.preventDefault();
    if (!newMember.name.trim()) return;
    addFamilyMember({
      name: newMember.name.trim(),
      avatar: newMember.avatar,
      diet: newMember.diet,
      allergies: newMember.allergies
        ? newMember.allergies.split(",").map((a) => a.trim()).filter(Boolean)
        : [],
    });
    pushToast(`${newMember.name} se ha unido a vuestra despensa compartida`, "success");
    setNewMember({ name: "", avatar: "🙂", diet: "omnivoro", allergies: "" });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-extrabold text-stone-800">Ajustes</h1>

      {/* Perfil */}
      <section className="card flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-3xl">{currentUser?.avatar}</span>
        <div>
          <p className="font-bold text-stone-800">{currentUser?.name}</p>
          <p className="text-sm text-stone-400">{currentUser?.email}</p>
        </div>
      </section>

      {/* Grupo familiar */}
      <section className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold text-stone-800">
            <Users size={18} /> Grupo familiar
          </h2>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-600">Nombre del hogar</label>
          <input
            defaultValue={group.name}
            onBlur={(e) => renameGroup(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-600">Código de invitación</label>
          <div className="flex items-center gap-2">
            <span className="flex-1 rounded-xl border border-dashed border-stone-300 px-3.5 py-2.5 text-center text-lg font-bold tracking-[0.3em] text-sage-700">
              {group.inviteCode}
            </span>
            <button onClick={copyCode} className="btn-secondary" title="Copiar código">
              <Copy size={16} />
            </button>
            <button onClick={shareInvite} className="btn-secondary" title="Compartir">
              <Share2 size={16} />
            </button>
            <button onClick={regenerateInviteCode} className="btn-secondary" title="Generar nuevo código">
              <RefreshCcw size={16} />
            </button>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            Comparte este código con tu familia para que se unan desde "Unirme con código" al registrarse.
          </p>
        </div>

        <div className="space-y-2">
          {familyMembers.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border border-stone-100 p-2.5">
              <span className="text-2xl">{m.avatar}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-700">{m.name}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="chip">{DIETS.find((d) => d.id === m.diet)?.label || m.diet}</span>
                  {m.allergies.map((a) => (
                    <span key={a} className="chip bg-red-50 text-red-600">
                      ⚠ {a}
                    </span>
                  ))}
                  {m.dislikes?.map((d) => (
                    <span key={d} className="chip">
                      no le gusta: {d}
                    </span>
                  ))}
                </div>
              </div>
              {m.role !== "admin" && (
                <button onClick={() => removeFamilyMember(m.id)} className="btn-ghost p-2 text-stone-400">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={submitMember} className="space-y-3 border-t border-stone-100 pt-4">
          <p className="text-sm font-semibold text-stone-700">Añadir perfil al hogar</p>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => setNewMember({ ...newMember, avatar: a })}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                  newMember.avatar === a ? "bg-sage-100 ring-2 ring-sage-400" : "bg-stone-100"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <input
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            placeholder="Nombre"
            className="input"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={newMember.diet}
              onChange={(e) => setNewMember({ ...newMember, diet: e.target.value })}
              className="input"
            >
              {DIETS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            <input
              value={newMember.allergies}
              onChange={(e) => setNewMember({ ...newMember, allergies: e.target.value })}
              placeholder="Alergias (separadas por coma)"
              className="input"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            <Plus size={16} /> Añadir al hogar
          </button>
        </form>
      </section>

      {/* Supermercados */}
      <section className="card space-y-3">
        <h2 className="flex items-center gap-2 font-bold text-stone-800">
          <ShoppingBag size={18} /> Súper conectado
        </h2>
        {supermarkets.map((s) => (
          <label key={s.id} className="flex items-center justify-between rounded-lg border border-stone-100 p-3">
            <span className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <span className="text-xl">{s.emoji}</span> {s.name}
            </span>
            <input type="checkbox" checked={s.connected} onChange={() => toggleSupermarketConnection(s.id)} className="h-5 w-9" />
          </label>
        ))}
      </section>

      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="btn-secondary w-full text-red-600"
      >
        <LogOut size={16} /> Cerrar sesión
      </button>
    </div>
  );
}
