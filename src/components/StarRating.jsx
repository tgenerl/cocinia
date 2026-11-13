import { Star } from "lucide-react";
import { classNames } from "../utils/helpers";

export default function StarRating({ value = 0, onChange, size = 20, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(s)}
          className={classNames(readOnly ? "cursor-default" : "cursor-pointer")}
        >
          <Star
            size={size}
            className={s <= value ? "fill-clay-400 text-clay-400" : "text-stone-300"}
          />
        </button>
      ))}
    </div>
  );
}
