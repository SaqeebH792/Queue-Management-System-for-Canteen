import { useState, useEffect, useRef } from "react";
import { uploadProducts } from "../../routes/canteen.routes";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

const initialFormState = {
  image: null,
  name: "",
  category: "",
  price: "",
  description: "",
};

function UploadProducts() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // States
  const [formData, setFormData] = useState(initialFormState);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  // Memory-Safe Image Preview Hook
  useEffect(() => {
    if (!formData.image) {
      setImagePreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(formData.image);
    setImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formData.image]);

  const handleChange = e => {
    const { name, value, files, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "file" ? files?.[0] || null : value,
    }));
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    if (!formData.image) {
      setStatus({
        type: "error",
        message: "Product image is required.",
      });
      return;
    }

    const trimmedName = (formData.name || "").trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setStatus({
        type: "error",
        message: "Product name must be between 2 and 100 characters.",
      });
      return;
    }

    if (!formData.category) {
      setStatus({
        type: "error",
        message: "Please select a menu category.",
      });
      return;
    }

    const numericPrice = Number(formData.price);
    if (isNaN(numericPrice) || numericPrice <= 0 || numericPrice > 100000) {
      setStatus({
        type: "error",
        message: "Please enter a valid price between 1 and 100,000.",
      });
      return;
    }

    const data = new FormData();
    data.append("image", formData.image);
    data.append("name", trimmedName);
    data.append("category", formData.category);
    data.append("price", formData.price);
    data.append("description", formData.description);

    try {
      setLoading(true);
      await uploadProducts(data);

      setStatus({
        type: "success",
        message: `"${trimmedName}" was successfully added to the menu!`,
      });

      setFormData(initialFormState);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTimeout(() => {
        setStatus({ type: null, message: "" });
      }, 4000);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to upload product. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Add New Product | Canteen</title>
      </Helmet>

      <div className="w-full min-h-screen font-sans text-slate-800 dark:text-zinc-100">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Top Breadcrumb & Action Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <Link
                  to="/canteenAdmin/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#F97316] dark:text-zinc-400 dark:hover:text-[#F97316] transition-colors mb-2"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Inventory</span>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Add New Product
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400 mt-0.5">
                  Enter the details for the new menu item to add it to the canteen inventory.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Product</span>
                  )}
                </button>
              </div>
            </div>

            {/* Status Alert Banner */}
            {status.message && (
              <div
                className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                  status.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-300"
                    : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/50 dark:text-rose-300"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {status.type === "success" ? (
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle size={18} className="text-rose-600 dark:text-rose-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">
                    {status.type === "success" ? "Success" : "Error"}
                  </p>
                  <p className="text-xs sm:text-sm font-medium mt-0.5">{status.message}</p>
                </div>
              </div>
            )}

            {/* Responsive Layout Grid */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 items-start">
              {/* Left Main Column (Forms) */}
              <div className="w-full lg:col-span-2 space-y-6 order-2 lg:order-1">
                {/* Basic Information Card */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3">
                    Basic Information
                  </h2>

                  {/* Name & Category in Same Row with Equal Width */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Product Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Club Sandwich"
                        className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-[#F97316] focus:ring-2 focus:ring-orange-500/20 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Menu Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-[#F97316] focus:ring-2 focus:ring-orange-500/20 rounded-xl text-slate-700 dark:text-zinc-300 cursor-pointer focus:outline-none transition-all"
                      >
                        <option value="" className="text-slate-400">
                          Select a category...
                        </option>
                        <option value="Fast Food">Fast Food</option>
                        <option value="Drinks">Drinks</option>
                        <option value="Fries">Fries</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Desserts">Desserts</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Price <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        min="1"
                        max="100000"
                        step="1"
                        placeholder="Enter amount"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-[#F97316] focus:ring-2 focus:ring-orange-500/20 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      name="description"
                      placeholder="Detailed description of the menu item..."
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-[#F97316] focus:ring-2 focus:ring-orange-500/20 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Product Image Card */}
              <div className="w-full space-y-6 order-1 lg:order-2">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-3">
                    Product Image
                  </h2>

                  <input
                    ref={fileInputRef}
                    type="file"
                    name="image"
                    id="product-image-input"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleChange}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 h-52 flex items-center justify-center p-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-contain rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        title="Remove Image"
                        className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors shadow-md cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="product-image-input"
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/40 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-all text-center group"
                    >
                      <div className="p-3 rounded-full bg-orange-50 dark:bg-amber-950/40 text-[#F97316] group-hover:scale-105 transition-transform mb-3 shadow-xs">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-zinc-200">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 mt-1">
                        SVG, PNG, JPG or WEBP (Max: 5MB)
                      </p>
                    </label>
                  )}

                  {/* Image Guidelines Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 space-y-1.5">
                    <p className="font-bold text-slate-900 dark:text-zinc-300">Image Guidelines</p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] font-medium leading-relaxed">
                      <li>Use a clean background for consistency.</li>
                      <li>Ensure food is well-lit and appetizing.</li>
                      <li>Maintain a clear, high-resolution aspect ratio.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default UploadProducts;
