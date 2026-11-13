import { X } from "lucide-react";
import { useStore } from "../store/useStore";
import { classNames } from "../utils/helpers";

const TONE_STYLES = {
  info: "bg-stone-800 text-white",
  success: "bg-sage-600 text-white",
  warning: "bg-clay-500 text-white",
  error: "bg-red-600 text-white",
};

export default function ToastHost() {
  const toasts = useStore((s) => s.toasts);
  const dismissToast = useStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={classNames(
            "pointer-events-auto flex max-w-md items-center gap-3 rounded-xl px-4 py-3 shadow-card",
            TONE_STYLES[t.tone] || TONE_STYLES.info
          )}
        >
          <span className="text-sm font-medium">{t.message}</span>
          <button onClick={() => dismissToast(t.id)} className="opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
