import { useNavigate } from "react-router-dom";
import { Star, Clock, Plus, Utensils } from "lucide-react";

function Card({ product }) {
  const navigate = useNavigate();

  const handleShowProduct = () => {
    navigate(`/product/${product?._id}`);
  };

  const formattedPrice =
    typeof product?.price === "number"
      ? `Rs:${product.price}`
      : product?.price
        ? `Rs:${product.price}`
        : "RS:0.00";

  return (
    <div
      onClick={handleShowProduct}
      className="bg-white dark:bg-[#2B2D30] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group h-full border border-slate-200/60 dark:border-slate-800"
    >
      <div>
        <div className="relative w-full h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {product?.image ? (
            <img
              src={product.image}
              alt={product?.name || "Product image"}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5">
              <Utensils size={28} strokeWidth={1.5} />
              <span className="text-xs font-semibold">No Image Available</span>
            </div>
          )}

          {product?.isBestSeller ? (
            <div className="absolute top-3 right-3 bg-[#C84B31] text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-sm">
              Best Seller
            </div>
          ) : product?.rating ? (
            <div className="absolute top-3 right-3 bg-[#114B5F] text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm">
              <Star size={12} className="fill-white text-white" />
              <span>{product.rating}</span>
            </div>
          ) : null}
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif font-bold text-[#2C1810] dark:text-white text-lg tracking-tight leading-snug line-clamp-1">
              {product?.name || "Unnamed Product"}
            </h3>
            <span className="font-serif font-bold text-[#A93226] dark:text-[#E74C3C] text-lg shrink-0">
              {formattedPrice}
            </span>
          </div>

          {product?.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {product?.category && (
            <div className="pt-1 flex flex-wrap gap-1.5">
              <span className="px-3 py-0.5 rounded-full bg-[#F3E5E1] dark:bg-[#35383C] text-[#A93226] dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
                {product.category}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 pt-3">
          <Clock size={14} className="text-slate-400" />
          <span>{product?.prepTime || "15-20 min"}</span>
        </div>

        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            handleShowProduct();
          }}
          className="mt-3 w-8 h-8 rounded-full bg-[#A93226] hover:bg-[#8B0000] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          title="View Item"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

export default Card;
