import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChefHat, Mail, Lock, User, Home, Users } from "lucide-react";
import { useStore } from "../store/useStore";

export default function Register() {
  const navigate = useNavigate();
  const register = useStore((s) => s.register);
  const authError = useStore((s) => s.authError);
  const clearAuthError = useStore((s) => s.clearAuthError);

  const [mode, setMode] = useState("crear"); // crear | unirse
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    clearAuthError();
    const ok = register({
      name,
      email,
      password,
      householdName: mode === "crear" ? householdName : undefined,
      inviteCode: mode === "unirse" ? inviteCode : undefined,
    });
    if (ok) navigate("/inicio");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sage-50 to-stone-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-600 text-white shadow-card">
            <ChefHat size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-800">Crea tu cuenta</h1>
          <p className="text-sm text-stone-500">Empieza a controlar tu despensa en segundos</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="flex rounded-xl bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => setMode("crear")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${mode === "crear" ? "bg-white shadow-sm text-sage-700" : "text-stone-500"}`}
            >
              Crear un hogar
            </button>
            <button
              type="button"
              onClick={() => setMode("unirse")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${mode === "unirse" ? "bg-white shadow-sm text-sage-700" : "text-stone-500"}`}
            >
              Unirme con código
            </button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-600">Tu nombre</label>
            <div className="relative">
              {!name && <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />}
              <input required value={name} onChange={(e) => setName(e.target.value)} className="input pl-9" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-600">Email</label>
            <div className="relative">
              {!email && <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-9"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-600">Contraseña</label>
            <div className="relative">
              {!password && <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />}
              <input
                type="password"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-9"
              />
            </div>
          </div>

          {mode === "crear" ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-600">Nombre de tu hogar</label>
              <div className="relative">
                {!householdName && <Home size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />}
                <input
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-600">Código de invitación</label>
              <div className="relative">
                {!inviteCode && <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />}
                <input
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="input pl-9 uppercase tracking-widest"
                />
              </div>
              <p className="mt-1 text-xs text-stone-400">Pídeselo a quien ya tenga la despensa de tu familia en CocinIA.</p>
            </div>
          )}

          {authError && <p className="text-sm font-medium text-red-600">{authError}</p>}

          <button type="submit" className="btn-primary w-full">
            Crear cuenta
          </button>

          <p className="text-center text-sm text-stone-500">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-semibold text-sage-700 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
