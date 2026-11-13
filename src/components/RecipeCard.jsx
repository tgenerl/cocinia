import { useNavigate } from "react-router-dom";
import { Clock, Star, Heart, Zap } from "lucide-react";
import { useStore } from "../store/useStore";
import { classNames } from "../utils/helpers";

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate();
  const favoriteRecipeIds = useStore((s) => s.favoriteRecipeIds);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const timesCookedOverrides = useStore((s) => s.timesCookedOverrides);
  const isFavorite = favoriteRecipeIds.includes(recipe.id);
  const timesCooked = (recipe.timesCooked || 0) + (timesCookedOverrides[recipe.id] || 0);

  return (
    <div
      onClick={() => navigate(`/recetas/${recipe.id}`)}
      className="card group cursor-pointer transition hover:-translate-y-0.5 hover:shadow-card"
    >
      <div className="relative mb-3 flex h-28 items-center justify-center rounded-xl bg-stone-100 text-5xl">
        {recipe.emoji}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(recipe.id);
          }}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow-sm"
        >
          <Heart size={16} className={isFavorite ? "fill-red-500 text-red-500" : "text-stone-400"} />
        </button>
        {recipe.type === "thermomix" && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-sage-600 px-2 py-0.5 text-[10px] font-bold text-white">
            <Zap size={10} /> Thermomix
          </span>
        )}
      </div>
      <h4 className="mb-1 line-clamp-2 font-bold text-stone-800">{recipe.name}</h4>
      <div className="mb-2 flex flex-wrap gap-1">
        {recipe.tags?.slice(0, 2).map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <Clock size={13} /> {recipe.time} min
        </span>
        <span className="flex items-center gap-1">
          <Star size={13} className="fill-clay-400 text-clay-400" /> {recipe.ratingAvg}
        </span>
        <span className={classNames("rounded-full px-2 py-0.5", "bg-stone-100")}>{recipe.difficulty}</span>
      </div>
      {timesCooked > 0 && <p className="mt-2 text-[11px] text-stone-400">Cocinada {timesCooked} veces</p>}
    </div>
  );
}
