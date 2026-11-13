import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, Archive, BookOpen, CalendarDays, ShoppingCart, Settings, LogOut, Flame, ChefHat } from "lucide-react";
import { useStore } from "../store/useStore";
import { classNames } from "../utils/helpers";

const NAV_ITEMS = [
  { to: "/inicio", label: "Inicio", icon: Home },
  { to: "/despensa", label: "Despensa", icon: Archive },
  { to: "/recetas", label: "Recetas", icon: BookOpen },
  { to: "/plan", label: "Plan semanal", icon: CalendarDays },
  { to: "/compra", label: "Lista de la compra", icon: ShoppingCart },
  { to: "/ajustes", label: "Ajustes", icon: Settings },
];

export default function Layout() {
  const navigate = useNavigate();
  const group = useStore((s) => s.group);
  const currentUser = useStore((s) => s.currentUser);
  const streak = useStore((s) => s.streak);
  const logout = useStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-600 text-white">
            <ChefHat size={20} />
          </div>
          <div className="leading-tight">
            <p className="font-extrabold text-stone-800">CocinIA</p>
            <p className="text-xs text-stone-400">{group.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full bg-clay-50 px-3 py-1.5 text-clay-700 sm:flex">
            <Flame size={16} />
            <span className="text-sm font-semibold">{streak.weeksWithoutWaste} sem. sin desperdicio</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-lg sm:flex">
              {currentUser?.avatar || "🙂"}
            </span>
            <span className="hidden text-sm font-medium text-stone-600 md:inline">{currentUser?.name}</span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="btn-ghost"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar desktop */}
        <nav className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-60 shrink-0 flex-col gap-1 border-r border-stone-200 bg-white p-4 md:flex">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                classNames(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                  isActive ? "bg-sage-50 text-sage-700" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Main content */}
        <main className="min-h-[calc(100vh-65px)] w-full px-4 pb-24 pt-5 md:px-8 md:pb-10 md:pt-7">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-stone-200 bg-white/95 px-1 py-2 backdrop-blur md:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              classNames(
                "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium",
                isActive ? "text-sage-700" : "text-stone-400"
              )
            }
          >
            <Icon size={20} />
            {label.split(" ")[0]}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
