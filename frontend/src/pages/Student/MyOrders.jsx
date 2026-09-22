import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  History,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { fetchMyOrders } from "../../store/orderSlice";
import MyOrderCard from "../../components/student/MyOrderCard";
import MyOrdersSkeleton from "../../components/skeleton/MyOrdersSkeleton";
import QRCodeModal from "../../components/student/QRCodeModal";
import { Helmet } from "react-helmet-async";

// Modern Animation Variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const cardRevealVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

function MyOrders() {
  const dispatch = useDispatch();
  const { orders = [], loading, error } = useSelector((state) => state.orders);

  const [selectedQrOrder, setSelectedQrOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const { activeOrders, pastOrders } = useMemo(() => {
    const active = [];
    const past = [];

    orders.forEach((order) => {
      const status = order.status?.toLowerCase();
      if (
        status === "delivered" ||
        status === "completed" ||
        status === "cancelled"
      ) {
        past.push(order);
      } else {
        active.push(order);
      }
    });

    return { activeOrders: active, pastOrders: past };
  }, [orders]);

  return (
    <>
      <Helmet>
        <title>My Orders | CulinaryGrid</title>
      </Helmet>

      <div className="min-h-screen text-[#2C1810] dark:text-[#E8E8E8] sm:px-8 lg:px-10 font-sans transition-colors duration-300 pb-20 overflow-x-hidden pt-22 sm:pt-30">
        <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-1"
          >
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2C1810] dark:text-white tracking-tight">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Track current cravings and review past favorites.
            </p>
          </motion.div>

          {/* Main State Handling with Transitions */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading-skeleton"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <MyOrdersSkeleton />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error-state"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white dark:bg-[#2B2D30] rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center border border-slate-200/80 dark:border-slate-800 shadow-xs"
              >
                <div className="p-3.5 rounded-full bg-rose-500/10 text-[#A93226] mb-3">
                  <AlertCircle size={28} />
                </div>
                <h3 className="text-base font-serif font-bold text-[#2C1810] dark:text-white mb-1">
                  Failed to Load Orders
                </h3>
                <p className="text-xs font-medium text-slate-400 mb-6 max-w-sm leading-relaxed">
                  {error.message ||
                    "Something went wrong while retrieving your order records."}
                </p>
                <button
                  onClick={() => dispatch(fetchMyOrders())}
                  className="px-6 py-2.5 rounded-full bg-[#A93226] hover:bg-[#8B0000] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <RefreshCw size={14} />
                  <span>Try Again</span>
                </button>
              </motion.div>
            ) : orders.length === 0 ? (
              <motion.div
                key="empty-state"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white dark:bg-[#2B2D30] rounded-3xl p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-2 border border-slate-200/80 dark:border-slate-800 shadow-xs"
              >
                <div className="p-3.5 rounded-full bg-[#F3E5E1] dark:bg-[#35383C] text-[#A93226] mb-2">
                  <ShoppingBag size={32} strokeWidth={1.5} />
                </div>
                <p className="text-lg font-serif font-bold text-[#2C1810] dark:text-white">
                  No orders found
                </p>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  When you order meals from campus canteens, they will appear
                  right here.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="orders-list"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Left Column: Active Orders (Broader layout - 7/12 cols) */}
                <section className="lg:col-span-7 space-y-4">
                  <motion.div
                    variants={headerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-30px" }}
                    className="flex items-center gap-2 text-[#2C1810] dark:text-white pb-2 border-b border-slate-200/60 dark:border-slate-800"
                  >
                    <Utensils size={18} className="text-[#A93226]" />
                    <h2 className="text-xl font-serif font-bold">
                      Active Orders
                    </h2>
                    {activeOrders.length > 0 && (
                      <span className="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        {activeOrders.length} active
                      </span>
                    )}
                  </motion.div>

                  {activeOrders.length > 0 ? (
                    <motion.div
                      variants={listContainerVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-50px" }}
                      className="space-y-4"
                    >
                      {activeOrders.map((order) => (
                        <motion.div
                          key={order._id}
                          variants={cardRevealVariants}
                        >
                          <MyOrderCard
                            order={order}
                            isActiveOrder={true}
                            onShowQr={() => setSelectedQrOrder(order)}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="bg-white/50 dark:bg-[#2B2D30]/50 rounded-2xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-400 font-medium">
                        No active orders at the moment.
                      </p>
                    </div>
                  )}
                </section>

                {/* Right Column: Order History (Scrollable sidebar - 5/12 cols) */}
                <section className="lg:col-span-5 space-y-4 lg:sticky lg:top-28">
                  <motion.div
                    variants={headerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-30px" }}
                    className="flex items-center gap-2 text-[#2C1810] dark:text-white pb-2 border-b border-slate-200/60 dark:border-slate-800"
                  >
                    <History size={18} className="text-slate-400" />
                    <h2 className="text-xl font-serif font-bold">
                      Order History
                    </h2>
                  </motion.div>

                  {pastOrders.length > 0 ? (
                    /* Custom scrollable container for history */
                    <div className="lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                      <motion.div
                        variants={listContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="space-y-4"
                      >
                        {pastOrders.map((order) => (
                          <motion.div
                            key={order._id}
                            variants={cardRevealVariants}
                          >
                            <MyOrderCard
                              order={order}
                              isActiveOrder={false}
                              onShowQr={() => setSelectedQrOrder(order)}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  ) : (
                    <div className="bg-white/50 dark:bg-[#2B2D30]/50 rounded-2xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-400 font-medium">
                        No past orders found.
                      </p>
                    </div>
                  )}
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* QR Code Modal for order collection */}
      {selectedQrOrder && (
        <QRCodeModal
          order={selectedQrOrder}
          onClose={() => setSelectedQrOrder(null)}
        />
      )}
    </>
  );
}

export default MyOrders;
