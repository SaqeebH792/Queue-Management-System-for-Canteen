import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Star,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Send,
  AlertCircle,
  Sparkles,
  PenSquare,
  Clock,
  Check,
} from "lucide-react";

import { getProductById } from "../../routes/student.routes";
import LoginModal from "../../components/student/LoginModal";
import OrderSummaryModal from "../../components/student/OrderSummaryModal";
import ProductDetailSkeleton from "../../components/skeleton/ProductDetailSkeleton";
import { Helmet } from "react-helmet-async";

function ProductDetail() {
  const { id } = useParams();
  const { isAuthenticated, user } = useSelector(state => state.studentAuth);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const [selectedCustomizations, setSelectedCustomizations] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const MAX_QTY = 10;
  const MIN_QTY = 1;

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductById(id);
      const productData = response.data;
      setItem(productData);
      setReviews(productData?.reviews || []);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const increaseQuantity = () => {
    setQuantity(prev => (prev < MAX_QTY ? prev + 1 : prev));
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > MIN_QTY ? prev - 1 : MIN_QTY));
  };

  const handleCustomizationToggle = opt => {
    if (selectedCustomizations.some(item => item.name === opt.name)) {
      setSelectedCustomizations(selectedCustomizations.filter(item => item.name !== opt.name));
    } else {
      setSelectedCustomizations([...selectedCustomizations, opt]);
    }
  };

  const handleActionWithAuth = actionType => {
    if (!isAuthenticated) {
      setPendingAction(actionType);
      setShowLoginModal(true);
      return;
    }
    executeAction(actionType);
  };

  const executeAction = actionType => {
    if (actionType === "order") {
      setShowOrderModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (pendingAction) {
      executeAction(pendingAction);
      setPendingAction(null);
    }
  };

  const handleLoginClose = () => {
    setShowLoginModal(false);
    setPendingAction(null);
  };

  const handleOrderSuccess = order => {
    alert(
      `Order placed successfully!\nEstimated Time: ${
        order?.estimatedTime || item?.prepTime || "15-20"
      } Minutes`
    );
    setShowOrderModal(false);
  };

  const handleAddReview = e => {
    e.preventDefault();
    if (!isAuthenticated) {
      setPendingAction("review");
      setShowLoginModal(true);
      return;
    }

    if (!newComment.trim()) return;

    const newEntry = {
      _id: Date.now(),
      author: user?.name || user?.email || "Student",
      rating: newRating,
      createdAt: new Date().toISOString(),
      comment: newComment.trim(),
    };

    setReviews([newEntry, ...reviews]);
    setNewComment("");
    setNewRating(5);
    setShowWriteReview(false);
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#FAF3F0] dark:bg-[#1E1F21] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#2B2D30] border border-slate-200/80 dark:border-slate-800 p-8 text-center rounded-3xl shadow-sm">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-[#A93226] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#2C1810] dark:text-white mb-2">
            Meal Item Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            The meal you are searching for might be out of stock or unavailable.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#A93226] hover:bg-[#8B0000] text-white text-xs font-semibold rounded-full transition-all shadow-sm"
          >
            <ArrowLeft size={14} />
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }
  const baseUnitPrice = item?.price || 0;
  const extrasTotalPrice = selectedCustomizations.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const totalUnitPrice = baseUnitPrice + extrasTotalPrice;
  const totalPrice = (totalUnitPrice * quantity).toFixed(2);

  const galleryImages = item?.images || (item?.image ? [item.image] : []);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="min-h-screen text-[#2C1810] dark:text-[#E8E8E8] transition-colors duration-300 pb-16">
      <Helmet>
        <title>{`${item.name || "Meal Details"} | CulinaryGrid`}</title>
      </Helmet>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Link
            to="/"
            className="hover:text-[#A93226] dark:hover:text-[#E74C3C] transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            <span>Menu</span>
          </Link>
          <span>/</span>
          <span className="capitalize">{item.canteenName || "Canteen"}</span>
          <span>/</span>
          <span className="text-[#2C1810] dark:text-white font-semibold truncate max-w-50">
            {item.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-[8%]">
          <div className="lg:col-span-6 space-y-4">
            <div className="relative w-full aspect-4/3 bg-white dark:bg-[#2B2D30] rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center justify-center p-4">
              <img
                src={galleryImages[activeImage] || item.image}
                alt={item.name}
                className="w-full h-full object-cover rounded-2xl transition-all duration-300"
              />
              {item.badge && (
                <div className="absolute top-4 right-4 bg-[#64C2B4] text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>{item.badge}</span>
                </div>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-2xl border-2 transition-all overflow-hidden shrink-0 cursor-pointer ${
                      activeImage === idx
                        ? "border-[#A93226] dark:border-[#E74C3C] scale-105"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${item.name} thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-6 space-y-5">
            {item.category && (
              <p className="text-xs font-bold tracking-widest text-[#A93226] dark:text-[#E74C3C] uppercase">
                {item.category}
              </p>
            )}

            <h1 className="text-3xl sm:text-4xl border-b border-white dark:border-[#2B2D30] font-serif font-bold text-[#2C1810] dark:text-white leading-tight">
              {item.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-serif font-bold text-[#A93226] dark:text-[#E74C3C]">
                Rs:{baseUnitPrice}
              </span>

              {avgRating && (
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={
                          i < Math.round(Number(avgRating))
                            ? "fill-amber-500 text-amber-500"
                            : "text-slate-300 dark:text-slate-700"
                        }
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    ({reviews.length} Reviews)
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {item.description || "No description available for this item."}
            </p>

            {item.customizations && item.customizations.length > 0 && (
              <div className="bg-white dark:bg-[#2B2D30] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-xs">
                <h3 className="font-serif font-bold text-sm text-[#2C1810] dark:text-white">
                  Customize
                </h3>
                <div className="space-y-2.5">
                  {item.customizations.map((option, idx) => {
                    const isChecked = selectedCustomizations.some(c => c.name === option.name);
                    return (
                      <label
                        key={idx}
                        className="flex items-center justify-between text-xs cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            onClick={() => handleCustomizationToggle(option)}
                            className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${
                              isChecked
                                ? "bg-[#A93226] border-[#A93226] text-white"
                                : "border-slate-300 dark:border-slate-600 group-hover:border-[#A93226]"
                            }`}
                          >
                            {isChecked && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {option.name}
                          </span>
                        </div>
                        {option.price > 0 && (
                          <span className="text-slate-400 font-mono text-[11px]">
                            +Rs:{option.price}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#F3E5E1] dark:bg-[#2B2D30] rounded-full px-3 py-1.5 border border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="p-1 text-[#2C1810] dark:text-white hover:text-[#A93226] transition-colors cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[#2C1810] dark:text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="p-1 text-[#2C1810] dark:text-white hover:text-[#A93226] transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleActionWithAuth("order")}
                  className="flex-1 py-3 px-6 bg-[#A93226] hover:bg-[#8B0000] text-white text-xs font-bold rounded-full transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ShoppingBag size={15} />
                  <span>Buy Now - Rs:{totalPrice}</span>
                </button>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <Clock size={12} />
                <span>Estimated preparation time: {item.prepTime || "15-20 mins"}</span>
              </div>
            </div>
          </div>
        </div>
        <hr className="border-slate-200/60 dark:border-slate-800/80 my-8" />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-serif font-bold text-[#2C1810] dark:text-white">
                Customer Reviews
              </h2>
              {avgRating && (
                <span className="px-2.5 py-0.5 rounded-md bg-[#F3E5E1] dark:bg-[#2B2D30] text-[#A93226] dark:text-red-400 font-bold text-xs">
                  {avgRating}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowWriteReview(prev => !prev)}
              className="px-4 py-2 rounded-full border border-[#A93226]/30 dark:border-[#E74C3C]/40 bg-[#F3E5E1]/40 dark:bg-[#2B2D30] text-[#A93226] dark:text-[#E74C3C] hover:bg-[#A93226] hover:text-white dark:hover:bg-[#E74C3C] dark:hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PenSquare size={14} />
              <span>Write a Review</span>
            </button>
          </div>
          {showWriteReview && (
            <form
              onSubmit={handleAddReview}
              className="bg-white dark:bg-[#2B2D30] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rate this item
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-amber-500 p-0.5 cursor-pointer"
                    >
                      <Star
                        size={18}
                        className={
                          star <= (hoverRating || newRating)
                            ? "fill-amber-500 text-amber-500"
                            : "text-slate-200 dark:text-slate-700"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Write your review here..."
                className="w-full p-3 bg-[#FAF3F0] dark:bg-[#1E1F21] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-[#2C1810] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#A93226] resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWriteReview(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A93226] hover:bg-[#8B0000] text-white text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send size={12} />
                  <span>Submit Review</span>
                </button>
              </div>
            </form>
          )}
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev, index) => {
                const authorName = rev.author || rev.userName || "Student";
                const initials = authorName.substring(0, 2).toUpperCase();

                return (
                  <div
                    key={rev._id || rev.id || index}
                    className="p-5 bg-white dark:bg-[#2B2D30] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#F3E5E1] dark:bg-[#35383C] text-[#A93226] dark:text-red-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#2C1810] dark:text-white">
                            {authorName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {rev.createdAt
                              ? new Date(rev.createdAt).toLocaleDateString()
                              : rev.date || "Verified Purchase"}
                          </p>
                        </div>
                      </div>

                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < rev.rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-slate-200 dark:text-slate-700"
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-[#2B2D30] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No reviews yet. Be the first student to review this meal!
            </div>
          )}
        </div>
      </main>
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleLoginClose}
        onSuccess={handleLoginSuccess}
      />

      <OrderSummaryModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        product={{ ...item, selectedCustomizations }}
        quantity={quantity}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}
export default ProductDetail;
