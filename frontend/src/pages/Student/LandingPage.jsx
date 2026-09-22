import { useEffect, useState, useCallback } from "react";
import { getAllProducts } from "../../routes/student.routes";
import Card from "../../components/student/Card";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  PackageX,
  X,
  ArrowRight,
  ShoppingBag,
  Clock,
  ChefHat,
  PackageCheck,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import ProductGridSkeleton from "../../components/skeleton/ProductGridSkeleton";
import LandingPageSkeleton from "../../components/skeleton/LandingPageSkeleton";
// 1. Import Framer Motion components
import { motion } from "framer-motion";

const CATEGORIES = [
  { label: "ALL FOOD", value: "" },
  { label: "FAST FOOD", value: "Fast Food" },
  { label: "SNACKS", value: "Snacks" },
  { label: "FRIES", value: "Fries" },
  { label: "DRINKS", value: "Drinks" },
  { label: "TEA", value: "Tea" },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Order Food",
    description: "Select your desired items from our curated menu selection.",
    icon: ShoppingBag,
    bgColor: "bg-orange-500 text-white",
  },
  {
    step: "02",
    title: "Give Pickup Time",
    description: "Specify your preferred time window for seamless collection.",
    icon: Clock,
    bgColor: "bg-teal-400 text-white",
  },
  {
    step: "03",
    title: "Preparing Food",
    description: "Precision kitchen assembly initiated upon scheduling.",
    icon: ChefHat,
    bgColor: "bg-cyan-500 text-white",
  },
  {
    step: "04",
    title: "Ready to Pickup",
    description: "Order is packed, staged, and ready at the pickup counter.",
    icon: PackageCheck,
    bgColor: "bg-emerald-500 text-white",
  },
];

// 2. Define Modern Animation Variants

// A subtle slide-up and fade-in for section headers
const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Custom "out-quint" easing for smoothness
    },
  },
};

// Container variant to stagger children (cards, steps)
const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Delay between each child animation
    },
  },
};

// Child variant for grid items: slight scale up, slide up, and fade in
const gridItemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Unique pop-in animation for the hero image
const imageVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -2 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.8,
      delay: 0.2,
      ease: [0.34, 1.56, 0.64, 1], // Back-out ease for a slight "pop"
    },
  },
};

function LandingPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [queryParams, setQueryParams] = useState({
    search: "",
    category: "",
    cursor: null,
  });

  const [pagination, setPagination] = useState({
    hasNextPage: false,
    nextCursor: null,
  });

  const [cursorHistory, setCursorHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track initial render vs subsequent fetches
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchProducts = useCallback(async paramsObj => {
    setLoading(true);
    try {
      const params = {
        search: paramsObj.search || undefined,
        category: paramsObj.category || undefined,
      };

      if (paramsObj.cursor) {
        params.cursorDate = paramsObj.cursor.cursorDate;
        params.cursorId = paramsObj.cursor.cursorId;
      }

      const response = await getAllProducts(params);
      setProducts(response?.data?.products || []);

      setPagination({
        hasNextPage: response?.data?.hasMore || false,
        nextCursor: response?.data?.nextCursor || null,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(queryParams);
  }, [queryParams, fetchProducts]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    setCursorHistory([]);
    setQueryParams({
      search: search.trim(),
      category: category,
      cursor: null,
    });
  };

  const handleCategorySelect = selectedCategory => {
    setCategory(selectedCategory);
    setCursorHistory([]);
    setQueryParams({
      search: search.trim(),
      category: selectedCategory,
      cursor: null,
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setCursorHistory([]);
    setQueryParams({ search: "", category: "", cursor: null });
  };

  const handleNextPage = () => {
    if (!pagination.hasNextPage || !pagination.nextCursor) return;

    setCursorHistory(prev => [...prev, queryParams.cursor]);
    setQueryParams(prev => ({
      ...prev,
      cursor: pagination.nextCursor,
    }));
  };

  const handlePrevPage = () => {
    if (cursorHistory.length === 0) {
      setQueryParams(prev => ({ ...prev, cursor: null }));
      return;
    }

    const historyCopy = [...cursorHistory];
    const previousCursor = historyCopy.pop();

    setCursorHistory(historyCopy);
    setQueryParams(prev => ({
      ...prev,
      cursor: previousCursor,
    }));
  };

  // Render Full Skeleton during initial application boot
  if (isInitialLoad) {
    return <LandingPageSkeleton />;
  }

  return (
    <>
      <Helmet>
        <title>UniBite | Campus Food Bazaar</title>
      </Helmet>

      <div className="min-h-screen text-[#2C1810] dark:text-[#E8E8E8] transition-colors duration-300 overflow-hidden pt-28 sm:pt-22">
        {" "}
        <motion.section
          initial="hidden"
          animate="visible"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={staggerContainerVariants} className="space-y-6">
            <motion.h1
              variants={fadeUpVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight text-[#2C1810] dark:text-white"
            >
              Artisanal Flavors, <br />
              Delivered <span className="text-[#A93226] italic font-serif">Fast.</span>
            </motion.h1>
            <motion.p
              variants={fadeUpVariants}
              className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-md leading-relaxed"
            >
              Experience restaurant-quality meals crafted by local chefs, delivered hot and fresh to
              your door in under 30 minutes. Real ingredients, real flavor, real fast.
            </motion.p>
            <motion.div variants={fadeUpVariants} className="flex flex-wrap gap-4 pt-2">
              <a
                href="#menu-section"
                className="inline-flex items-center space-x-2 bg-[#A93226] hover:bg-[#8B0000] text-white px-8 py-3.5 rounded-full font-medium text-sm transition-all shadow-md"
              >
                <span>Explore Menu</span>
                <ArrowRight size={16} />
              </a>
              <button className="bg-[#F3E5E1] dark:bg-[#2A2C2F] text-[#2C1810] dark:text-slate-200 px-8 py-3.5 rounded-full font-medium text-sm hover:bg-[#EBD5CF] dark:hover:bg-[#35383C] transition-all">
                Find Nearest Location
              </button>
            </motion.div>
          </motion.div>

          {/* Animate Hero Image */}
          <motion.div variants={imageVariants} className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80"
                alt="Featured Artisanal Meal"
                className="w-full h-95 sm:h-115 object-cover"
              />
            </div>
            {/* Delivery Badge */}
            <div className="absolute bottom-6 right-6 bg-white/95 dark:bg-[#272829]/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 flex items-center space-x-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-xl text-teal-600 dark:text-teal-400">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Delivery Time
                </p>
                <p className="text-sm font-bold text-[#2C1810] dark:text-white">15 - 25 min</p>
              </div>
            </div>
          </motion.div>
        </motion.section>
        {/* Menu / Featured Craves Section */}
        <section id="menu-section" className="max-w-7xl mx-auto px-6 py-12 space-y-8">
          {/* Animate Menu Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }} // Trigger when 50% of element is in view
            variants={fadeUpVariants}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"
          >
            <div>
              <h2 className="text-3xl font-serif font-bold text-[#2C1810] dark:text-white">
                Featured Craves
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Our most loved artisanal dishes, curated just for you.
              </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search dishes..."
                  className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#2B2D30] text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#A93226]"
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </form>

              {(category || search) && (
                <button
                  onClick={handleClearFilters}
                  className="bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-red-500/20 transition-colors"
                >
                  Reset <X size={14} />
                </button>
              )}
            </div>
          </motion.div>
          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map(item => (
              <button
                key={item.label}
                onClick={() => handleCategorySelect(item.value)}
                className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  category === item.value
                    ? "bg-[#A93226] text-white shadow-sm"
                    : "bg-white dark:bg-[#2B2D30] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#35383C]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {/* Products Grid Condition */}
          {loading ? (
            <ProductGridSkeleton />
          ) : (
            <>
              {products.length > 0 ? (
                // 3. Staggered Grid Animation
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }} // Trigger earlier for grids
                  variants={staggerContainerVariants}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {products.map((product, index) => (
                    // Animate individual card container
                    <motion.div
                      key={product._id || index}
                      variants={gridItemVariants}
                      className="h-full"
                    >
                      <Card product={product} index={index} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="bg-white dark:bg-[#2B2D30] rounded-3xl p-12 text-center border border-slate-200/60 dark:border-slate-800 my-6 space-y-3">
                  <PackageX size={44} className="mx-auto text-slate-400 stroke-[1.5]" />
                  <h3 className="text-lg font-serif font-bold text-[#2C1810] dark:text-white">
                    No Items Found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    No dishes matched your search criteria. Try modifying your search parameters or
                    category.
                  </p>
                </div>
              )}

              {/* Pagination Controls */}
              {products.length > 0 && (
                <div className="flex items-center justify-between bg-white dark:bg-[#2B2D30] p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={cursorHistory.length === 0 && !queryParams.cursor}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <div className="font-semibold px-4 py-1.5 rounded-xl bg-[#F3E5E1] dark:bg-[#35383C] text-[#A93226] dark:text-red-400">
                    Page {cursorHistory.length + 1}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={!pagination.hasNextPage}
                    className="px-4 py-2 rounded-xl bg-[#A93226] text-white font-semibold hover:bg-[#8B0000] disabled:opacity-40 flex items-center gap-1 transition-colors"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
        {/* Process Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 space-y-12">
          {/* Animate Process Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUpVariants}
            className="text-center space-y-2"
          >
            <h2 className="text-3xl font-serif font-bold text-[#2C1810] dark:text-white">
              How It Works
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
              We believe convenience shouldn't compromise quality. Follow our simple process to
              enjoy your meal.
            </p>
          </motion.div>

          {/* Staggered Process Steps Animation */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {PROCESS_STEPS.map(stepItem => {
              const IconComponent = stepItem.icon;
              return (
                // Animate individual step container
                <motion.div
                  key={stepItem.step}
                  variants={gridItemVariants}
                  className="bg-white dark:bg-[#2B2D30] p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stepItem.bgColor} shadow-md`}
                  >
                    <IconComponent size={26} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#A93226] dark:text-[#E74C3C]">
                      Step {stepItem.step}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#2C1810] dark:text-white mt-1">
                      {stepItem.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {stepItem.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
        {/* Footer */}
        <footer className="border-t border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-[#1A1B1D]/50 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-serif font-bold text-base text-[#A93226] dark:text-[#E74C3C]">
              UniBite
            </span>

            <div className="flex items-center space-x-6">
              <a className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                Privacy Policy
              </a>
              <a className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                Terms of Service
              </a>
              <a className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                Contact Us
              </a>
            </div>

            <p>© {new Date().getFullYear()} UniBite. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default LandingPage;
