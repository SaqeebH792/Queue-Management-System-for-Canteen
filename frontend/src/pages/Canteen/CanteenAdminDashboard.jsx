import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, PackageX, RotateCw, ChevronRight, CheckCircle } from "lucide-react";
import { updateOrderStatus, getOrders } from "../../routes/canteen.routes";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  OrderCardSkeleton,
  DashboardHeaderSkeleton,
} from "../../components/canteen/OrderCardSkeleton";

function CanteenAdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // Pagination & Loading States
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchOrders = useCallback(async (searchVal, statusVal, cursorObj = null) => {
    const params = {
      search: searchVal || undefined,
      status: statusVal === "all" ? undefined : statusVal,
    };

    if (cursorObj) {
      params.cursorCreatedAt = cursorObj.cursorCreatedAt;
      params.cursorId = cursorObj.cursorId;
    }

    return await getOrders(params);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetchOrders(activeSearch, status, null);
      const result = response.data;

      setOrders(result.orders || []);
      setHasNextPage(result.pagination?.hasNextPage || false);
      setNextCursor(result.pagination?.nextCursor || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeSearch, status, fetchOrders]);

  const handleLoadMore = async () => {
    if (loadingMore || !nextCursor) return;

    try {
      setLoadingMore(true);
      const response = await fetchOrders(activeSearch, status, nextCursor);
      const result = response.data;

      setOrders(prev => [...prev, ...(result.orders || [])]);
      setHasNextPage(result.pagination?.hasNextPage || false);
      setNextCursor(result.pagination?.nextCursor || null);
    } catch (error) {
      toast.error("Could not load more orders");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearchSubmit = e => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const handleSearchChange = e => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim() === "") {
      setActiveSearch("");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    toast.promise(updateOrderStatus(orderId, newStatus), {
      loading: "Updating order status...",
      success: response => {
        const updatedData = response.data;
        setOrders(prev =>
          prev.map(order =>
            order._id === orderId
              ? {
                  ...order,
                  status: updatedData.status,
                  qrCodeUrl: updatedData.qrCodeUrl,
                }
              : order
          )
        );
        setUpdatingOrderId(null);
        return `Order status updated to ${newStatus}`;
      },
      error: error => {
        setUpdatingOrderId(null);
        return typeof error === "string"
          ? error
          : error?.response?.data?.message || "Failed to update status";
      },
    });
  };

  const getStatusBadgeStyle = orderStatus => {
    switch (orderStatus?.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50";
      case "accepted":
        return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50";
      case "preparing":
      case "cooking":
        return "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/50";
      case "ready":
      case "delivering":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/50";
      case "delivered":
      case "completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
    }
  };

  const getNextStatusConfig = currentStatus => {
    switch (currentStatus?.toLowerCase()) {
      case "pending":
        return {
          label: "Accept",
          nextStatus: "Accepted",
          style: "bg-blue-600 hover:bg-blue-700 text-white shadow-xs",
        };
      case "accepted":
        return {
          label: "Start Preparing",
          nextStatus: "Preparing",
          style: "bg-orange-500 hover:bg-orange-600 text-white shadow-xs",
        };
      case "preparing":
      case "cooking":
        return {
          label: "Mark Ready",
          nextStatus: "Ready",
          style: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs",
        };
      case "ready":
      case "delivering":
        return {
          label: "Mark Delivered",
          nextStatus: "Delivered",
          style: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs",
        };
      case "delivered":
      case "completed":
        return null;
      default:
        return {
          label: "Accept",
          nextStatus: "Accepted",
          style: "bg-blue-600 hover:bg-blue-700 text-white shadow-xs",
        };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  const statusOptions = [
    { label: "All Orders", value: "all" },
    { label: "Pending", value: "Pending", dotColor: "bg-amber-500" },
    { label: "Accepted", value: "Accepted", dotColor: "bg-blue-500" },
    { label: "Preparing", value: "Preparing", dotColor: "bg-orange-500" },
    { label: "Ready", value: "Ready", dotColor: "bg-indigo-500" },
    { label: "Completed", value: "Delivered", dotColor: "bg-emerald-500" },
  ];

  return (
    <>
      <Helmet>
        <title>Order Management | Canteen</title>
      </Helmet>

      <div className="w-full min-h-screen font-sans text-slate-800 dark:text-zinc-100 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Order Management
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadOrders}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RotateCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
                Refresh Orders
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {statusOptions.map(tab => {
              const isActive = status === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatus(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#F97316] text-white shadow-xs"
                      : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {!isActive && tab.dotColor && (
                    <span className={`w-2 h-2 rounded-full ${tab.dotColor}`} />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by order ID or customer name..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer shadow-xs"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready for Pickup</option>
                  <option value="Delivered">Completed</option>
                </select>
              </div>
            </div>
          </form>

          {loading ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
              <DashboardHeaderSkeleton />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                  <OrderCardSkeleton key={index} />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
              <AnimatePresence mode="wait">
                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                          <th className="py-4 px-6">Order ID</th>
                          <th className="py-4 px-6">Customer</th>
                          <th className="py-4 px-6">Items</th>
                          <th className="py-4 px-6">Amount</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <motion.tbody
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs sm:text-sm"
                      >
                        {orders.map(order => {
                          console.log(order);
                          const orderIdFormatted = order._id
                            ? `#${order._id.slice(-4).toUpperCase()}`
                            : "N/A";
                          const itemCount = order.items?.length || 0;
                          const totalAmount = order.totalAmount
                            ? `${Number(order.totalAmount).toFixed(2)}`
                            : "$0.00";
                          const nextAction = getNextStatusConfig(order.status);
                          const isUpdating = updatingOrderId === order._id;

                          return (
                            <motion.tr
                              key={order._id}
                              variants={rowVariants}
                              className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                            >
                              <td className="py-4 px-6 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                {orderIdFormatted}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  {order.user?.avatar ? (
                                    <img
                                      src={order.user.avatar}
                                      alt={order.user?.name || "Customer"}
                                      className="w-9 h-9 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center font-bold text-xs uppercase">
                                      {order.student?.name ? order.student?.name.charAt(0) : "U"}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                                      {order.student?.name || "Guest Customer"}
                                    </p>
                                    {order.student?.email && (
                                      <p className="text-xs text-slate-400 mt-0.5">
                                        {order.student.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-6">
                                <p className="font-medium text-slate-800 dark:text-zinc-200 line-clamp-1 max-w-[220px]">
                                  {order.items?.map(item => item.name || item.title).join(", ") ||
                                    "No items specified"}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {itemCount} {itemCount === 1 ? "item" : "items"}
                                </p>
                              </td>
                              <td className="py-4 px-6 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                {order.items?.map(item => `Rs: ${item?.totalAmount}`)}
                              </td>
                              <td className="py-4 px-6 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeStyle(
                                    order.status || "Pending"
                                  )}`}
                                >
                                  {order.status || "Pending"}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end">
                                  {nextAction ? (
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() =>
                                        handleStatusChange(order._id, nextAction.nextStatus)
                                      }
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${nextAction.style}`}
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <>
                                          {nextAction.label}
                                          <ChevronRight className="w-3.5 h-3.5" />
                                        </>
                                      )}
                                    </button>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Done
                                    </span>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </motion.tbody>
                    </table>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-16 px-4 text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                      <PackageX size={24} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      No active orders found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your search criteria or filter options.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              {hasNextPage && (
                <div className="flex justify-center p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 font-semibold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <Loader2 size={16} className="animate-spin text-orange-500" />
                    ) : (
                      "Load More Orders"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export default CanteenAdminDashboard;
