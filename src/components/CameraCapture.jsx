import { useRef } from "react";
import { Camera, RefreshCcw } from "lucide-react";

// Botón que abre la cámara real del dispositivo (o el selector de archivos en escritorio)
export default function CameraCapture({ label, photoUrl, onCapture, onRetake, disabled }) {
  const inputRef = useRef(null);

  function handleChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    onCapture(file, URL.createObjectURL(file));
  }

  if (photoUrl) {
    return (
      <div className="space-y-2">
        <div className="overflow-hidden rounded-xl border border-stone-200">
          <img src={photoUrl} alt="Foto capturada" className="h-48 w-full object-cover" />
        </div>
        {!disabled && (
          <button type="button" onClick={onRetake} className="btn-ghost w-full text-sm">
            <RefreshCcw size={14} /> Repetir foto
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      <button type="button" onClick={() => inputRef.current?.click()} className="btn-primary w-full">
        <Camera size={16} /> {label}
      </button>
    </>
  );
}
