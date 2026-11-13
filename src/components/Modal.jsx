import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className={`max-h-[92vh] w-full ${maxWidth} overflow-y-auto rounded-t-2xl bg-white p-5 shadow-card sm:rounded-2xl`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-800">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
