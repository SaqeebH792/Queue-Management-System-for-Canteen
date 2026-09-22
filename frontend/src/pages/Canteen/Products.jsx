import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Edit2,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getAllProducts } from "../../routes/student.routes";
import { deleteProduct } from "../../routes/canteen.routes";
import { Helmet } from "react-helmet-async";
import ProductSkeleton from "../../components/canteen/ProductSkeleton";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [activeFilters, setActiveFilters] = useState({
    search: "",
    category: "",
  });

  const [pagination, setPagination] = useState({
    hasNextPage: false,
    nextCursor: null,
  });

  const [cursorHistory, setCursorHistory] = useState([]);
  const [currentCursor, setCurrentCursor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track which product is pending deletion confirmation
  const [deletingId, setDeletingId] = useState(null);

  // View switcher for mobile/desktop preference
  const [viewMode, setViewMode] = useState("auto"); // "auto", "table", "grid"

  // Fetch products handler
  const fetchProducts = useCallback(
    async (filters = activeFilters, cursorData = null) => {
      setLoading(true);
      try {
        const params = {
          search: filters.search || undefined,
          category: filters.category || undefined,
        };

        if (cursorData) {
          params.cursorDate = cursorData.cursorDate;
          params.cursorId = cursorData.cursorId;
        }

        const response = await getAllProducts(params);

        setProducts(response?.data?.products || []);
        setPagination({
          hasNextPage: response?.data?.hasMore || false,
          nextCursor: response?.data?.nextCursor || null,
        });
        setCurrentCursor(cursorData);
      } catch (error) {
        console.error("Error retrieving products:", error);
        toast.error("Failed to load products list.");
      } finally {
        setLoading(false);
      }
    },
    [activeFilters]
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced Search Handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim() !== activeFilters.search) {
        const filters = { ...activeFilters, search: search.trim() };
        setActiveFilters(filters);
        setCursorHistory([]);
        setCurrentCursor(null);
        fetchProducts(filters, null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, activeFilters, fetchProducts]);

  // ========================= CATEGORY =========================

  const handleCategoryChange = e => {
    const value = e.target.value;
    setCategory(value);

    const filters = {
      ...activeFilters,
      category: value,
    };

    setActiveFilters(filters);
    setCursorHistory([]);
    setCurrentCursor(null);
    fetchProducts(filters, null);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    const filters = { search: "", category: "" };
    setActiveFilters(filters);
    setCursorHistory([]);
    setCurrentCursor(null);
    fetchProducts(filters, null);
  };

  // ========================= PAGINATION =========================

  const handleNextPage = () => {
    if (!pagination.hasNextPage || !pagination.nextCursor) return;
    setCursorHistory(prev => [...prev, currentCursor]);
    fetchProducts(activeFilters, pagination.nextCursor);
  };

  const handlePrevPage = () => {
    if (cursorHistory.length === 0) {
      fetchProducts(activeFilters, null);
      return;
    }

    const history = [...cursorHistory];
    const previousCursor = history.pop();

    setCursorHistory(history);
    fetchProducts(activeFilters, previousCursor);
  };

  // ========================= DELETE =========================

  const handleDeleteProduct = async id => {
    toast.promise(deleteProduct(id), {
      loading: "Deleting product...",
      success: () => {
        setDeletingId(null);
        fetchProducts(activeFilters, currentCursor);
        return "Product deleted successfully.";
      },
      error: error => {
        setDeletingId(null);
        return error?.response?.data?.message || error?.message || "Could not delete product.";
      },
    });
  };

  // Status Badge Renderer using exact image status badge colors
  const renderStatusBadge = (status = "Active") => {
    switch (status?.toLowerCase()) {
      case "out of stock":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEDEC] text-[#E03A3A] dark:bg-rose-950/40 dark:text-rose-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E03A3A] shrink-0" />
            Out of Stock
          </span>
        );
      case "low stock":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF4DC] text-[#D9822B] dark:bg-amber-950/40 dark:text-amber-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9822B] shrink-0" />
            Low Stock
          </span>
        );
      case "active":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40 dark:text-emerald-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0" />
            Active
          </span>
        );
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Inventory Management</title>
        </Helmet>
        <ProductSkeleton />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Inventory Management</title>
      </Helmet>

      <div className="w-full space-y-6 text-[#2D3748] dark:text-zinc-100 font-sans">
        {/* Title Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A202C] dark:text-white">
              Inventory
            </h1>
            <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
              Manage and track all canteen menu items in one place.
            </p>
          </div>

          <Link
            to="/canteenAdmin/dashboard/uploadProducts"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </Link>
        </div>

        {/* Main Content Card Container */}
        <div className="bg-white dark:bg-[#1E1F21] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Top Filter Controls Bar */}
          <div className="p-4 sm:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative w-full">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search products, SKU..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8F9FA] dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 focus:border-[#FF6B00] rounded-full text-[#1A202C] dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={category}
                onChange={handleCategoryChange}
                className="flex-1 md:flex-initial min-w-0 px-4 py-2.5 text-xs sm:text-sm font-semibold bg-[#F8F9FA] dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 focus:border-[#FF6B00] rounded-full text-[#1A202C] dark:text-zinc-100 cursor-pointer focus:outline-none transition-all"
              >
                <option value="">All Categories</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Drinks">Drinks</option>
                <option value="Fries">Fries</option>
                <option value="Snacks">Snacks</option>
                <option value="Desserts">Desserts</option>
              </select>

              {(search || category) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-2.5 rounded-full text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                className="p-2.5 border border-zinc-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-[#F8F9FA] dark:hover:bg-zinc-700/80 transition-colors cursor-pointer shrink-0 min-w-10 min-h-10 flex items-center justify-center"
                title="Filter Options"
              >
                <SlidersHorizontal size={16} />
              </button>

              {/* View Switcher Controls */}
              <div className="hidden sm:flex items-center border border-zinc-200 dark:border-zinc-700 rounded-full bg-[#F8F9FA] dark:bg-zinc-800 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white dark:bg-[#1E1F21] text-[#FF6B00] shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                  title="Table View"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-[#1E1F21] text-[#FF6B00] shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {products.length === 0 ? (
            <div className="py-16 text-center px-4 space-y-3">
              <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
                No products found matching your search criteria.
              </p>
              {(search || category) && (
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2 text-xs font-bold text-[#FF6B00] underline cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop / Tablet Table View */}
              <div
                className={`${
                  viewMode === "grid"
                    ? "hidden"
                    : viewMode === "table"
                      ? "block"
                      : "hidden md:block"
                } overflow-x-auto scrollbar-thin`}
              >
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-170">
                  <thead>
                    <tr className="bg-[#FAFBFD] dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 font-bold text-[11px] uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                      <th className="py-3.5 px-6 w-20">Image</th>
                      <th className="py-3.5 px-6">Product Name</th>
                      <th className="py-3.5 px-6">Category</th>
                      <th className="py-3.5 px-6">Price</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-medium text-[#2D3748] dark:text-zinc-300">
                    {products.map(product => (
                      <tr
                        key={product._id}
                        className="hover:bg-[#FFFBF7] dark:hover:bg-zinc-800/40 transition-colors duration-150"
                      >
                        {/* Image */}
                        <td className="py-3.5 px-6">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-12 w-12 rounded-xl object-cover border border-zinc-200/80 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl border border-zinc-200/80 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </td>

                        {/* Name & SKU */}
                        <td className="py-3.5 px-6">
                          <div className="font-bold text-[#1A202C] dark:text-white line-clamp-1">
                            {product.name}
                          </div>
                          {product.sku && (
                            <div className="text-[10px] sm:text-xs text-zinc-400 font-mono tracking-wider mt-0.5 uppercase">
                              SKU: {product.sku}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-6 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                          {product.category}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-6 font-extrabold text-[#1A202C] dark:text-white whitespace-nowrap">
                          Rs: {product.price}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-6">{renderStatusBadge(product.status)}</td>

                        {/* Action Column */}
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          {deletingId === product._id ? (
                            <div className="inline-flex items-center gap-1.5 bg-rose-500/10 p-1.5 rounded-full border border-rose-500/20">
                              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 px-2">
                                Confirm?
                              </span>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                                title="Yes"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="p-1 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                                title="No"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1">
                              <Link
                                to={`/canteenAdmin/dashboard/editProduct/${product._id}`}
                                className="p-2 rounded-full text-zinc-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors cursor-pointer min-w-9 min-h-9 inline-flex items-center justify-center"
                                title="Edit Product"
                              >
                                <Edit2 size={16} />
                              </Link>
                              <button
                                onClick={() => setDeletingId(product._id)}
                                className="p-2 rounded-full text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer min-w-9 min-h-9 inline-flex items-center justify-center"
                                title="Delete Product"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Grid View */}
              <div
                className={`${
                  viewMode === "table" ? "hidden" : viewMode === "grid" ? "grid" : "grid md:hidden"
                } grid-cols-1 sm:grid-cols-2 gap-4 p-4`}
              >
                {products.map(product => (
                  <div
                    key={product._id}
                    className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-[#FAFBFD] dark:bg-zinc-800/40 flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-14 w-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                          <ImageIcon size={20} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-xs sm:text-sm text-[#1A202C] dark:text-white line-clamp-1">
                            {product.name}
                          </h3>
                          <span className="font-extrabold text-xs sm:text-sm text-[#1A202C] dark:text-white shrink-0">
                            Rs: {product.price}
                          </span>
                        </div>

                        {product.sku && (
                          <div className="text-[10px] text-zinc-400 font-mono tracking-wider mt-0.5 uppercase">
                            SKU: {product.sku}
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            {product.category}
                          </span>
                          {renderStatusBadge(product.status)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-end gap-2">
                      {deletingId === product._id ? (
                        <div className="inline-flex items-center gap-1.5 bg-rose-500/10 p-1.5 rounded-full border border-rose-500/20 w-full justify-between">
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 px-2">
                            Confirm Delete?
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(product._id)}
                          className="px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Footer Controls */}
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs font-bold text-zinc-500 dark:text-zinc-400">
            <div className="text-center sm:text-left">
              Showing {products.length > 0 ? "1" : "0"} to {products.length} entries
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={cursorHistory.length === 0}
                className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-[#FAFBFD] dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer min-w-9 min-h-9 flex items-center justify-center"
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <button className="px-4 py-2 rounded-full bg-[#FF6B00] text-white font-bold cursor-default min-w-9 text-center shadow-xs">
                {cursorHistory.length + 1}
              </button>

              <button
                onClick={handleNextPage}
                disabled={!pagination.hasNextPage}
                className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-[#FAFBFD] dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer min-w-9 min-h-9 flex items-center justify-center"
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Products;
