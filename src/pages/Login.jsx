import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChefHat, Mail, Lock, Sparkles } from "lucide-react";
import { useStore } from "../store/useStore";

export default function Login() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);
  const loginDemo = useStore((s) => s.loginDemo);
  const authError = useStore((s) => s.authError);
  const clearAuthError = useStore((s) => s.clearAuthError);
  const [email, setEmail] = useState("demo@cocinia.app");
  const [password, setPassword] = useState("cocinia123");

  function handleSubmit(e) {
    e.preventDefault();
    clearAuthError();
    if (login(email, password)) navigate("/inicio");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sage-50 to-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-600 text-white shadow-card">
            <ChefHat size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-800">CocinIA</h1>
          <p className="text-sm text-stone-500">Tu nevera y tu Thermomix hablan entre sí</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-bold text-stone-800">Inicia sesión</h2>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-600">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-9"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-600">Contraseña</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>

          {authError && <p className="text-sm font-medium text-red-600">{authError}</p>}

          <button type="submit" className="btn-primary w-full">
            Entrar
          </button>

          <button
            type="button"
            onClick={() => {
              loginDemo();
              navigate("/inicio");
            }}
            className="btn-secondary w-full"
          >
            <Sparkles size={16} /> Probar con cuenta demo
          </button>

          <p className="text-center text-sm text-stone-500">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="font-semibold text-sage-700 hover:underline">
              Crea tu hogar
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-stone-400">
          Demo funcional con datos ficticios · sin conexión a servicios reales
        </p>
      </div>
    </div>
  );
}
