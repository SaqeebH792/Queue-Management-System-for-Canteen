import { useEffect, useState, useCallback, useRef } from "react";
import { getAllStudents, updateStudentStatus } from "../../routes/university.routes";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import {
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import UniversityDashboardSkeleton from "../../components/university/UniversityDashboardSkeleton";

const UniversityDashboard = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const [pagination, setPagination] = useState({
    hasNextPage: false,
    nextCursor: null,
  });

  const [activeFilters, setActiveFilters] = useState({
    search: "",
    status: "",
  });
  const [cursorHistory, setCursorHistory] = useState([]);
  const [currentCursor, setCurrentCursor] = useState(null);

  const abortControllerRef = useRef(null);

  const fetchStudents = useCallback(async (filters, cursor = null, isInitial = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setIsPageLoading(true);
      }

      const params = {
        search: filters.search || undefined,
        status: filters.status !== "" ? filters.status : undefined,
      };

      if (cursor) {
        params.cursorCreatedAt = cursor.cursorCreatedAt;
        params.cursorId = cursor.cursorId;
      }

      const response = await getAllStudents(params, {
        signal: abortControllerRef.current.signal,
      });

      const dataPayload = response?.data || response;

      setStudents(dataPayload?.students || []);
      setPagination(dataPayload?.pagination || { hasNextPage: false, nextCursor: null });
      setCurrentCursor(cursor);
      setSelectedStudentIds([]);
    } catch (error) {
      if (error?.name === "CanceledError" || error?.name === "AbortError") {
        return;
      }
      toast.error(error?.response?.data?.message || "Failed to fetch student list");
    } finally {
      setLoading(false);
      setIsPageLoading(false);
    }
  }, []);

  // Debounced Search & Filter Synchronization
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmedSearch = search.trim();
      if (trimmedSearch !== activeFilters.search || status !== activeFilters.status) {
        const newFilters = { search: trimmedSearch, status };
        setActiveFilters(newFilters);
        setCursorHistory([]);
        fetchStudents(newFilters, null, false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [search, status, activeFilters, fetchStudents]);

  // Initial Fetch
  useEffect(() => {
    fetchStudents({ search: "", status: "" }, null, true);
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchStudents]);

  const handleStatusChange = newStatus => {
    setStatus(newStatus);
  };

  const handleReset = () => {
    setSearch("");
    setStatus("");
  };

  const handleNextPage = () => {
    if (!pagination.hasNextPage || !pagination.nextCursor) return;
    setCursorHistory(prev => [...prev, currentCursor]);
    fetchStudents(activeFilters, pagination.nextCursor, false);
  };

  const handlePrevPage = () => {
    if (cursorHistory.length === 0) return;
    const newHistory = [...cursorHistory];
    const previousCursor = newHistory.pop();
    setCursorHistory(newHistory);
    fetchStudents(activeFilters, previousCursor, false);
  };

  const handleToggleStatus = async student => {
    if (!student?._id) return;

    const previousStudents = [...students];
    const newStatus = !student.isActive;

    // Optimistic Update
    setStudents(prev => prev.map(s => (s._id === student._id ? { ...s, isActive: newStatus } : s)));

    try {
      await updateStudentStatus(student._id, newStatus);
      toast.success(`Student account ${newStatus ? "activated" : "deactivated"} successfully`);
    } catch (error) {
      setStudents(previousStudents);
      toast.error(error?.response?.data?.message || "Status update failed");
    }
  };

  const handleBulkStatusChange = async targetStatus => {
    if (selectedStudentIds.length === 0) return;

    setIsBulkUpdating(true);
    const previousStudents = [...students];

    // Optimistic Update
    setStudents(prev =>
      prev.map(s => (selectedStudentIds.includes(s._id) ? { ...s, isActive: targetStatus } : s))
    );

    try {
      await Promise.all(selectedStudentIds.map(id => updateStudentStatus(id, targetStatus)));
      toast.success(
        `${selectedStudentIds.length} student records ${targetStatus ? "activated" : "deactivated"}`
      );
      setSelectedStudentIds([]);
    } catch (error) {
      setStudents(previousStudents);
      toast.error(error?.response?.data?.message || "Bulk status update failed");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleSelectAll = e => {
    if (e.target.checked) {
      setSelectedStudentIds(students.map(s => s._id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleSelectStudent = id => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isAllSelected = students.length > 0 && selectedStudentIds.length === students.length;

  const formatDate = dateString => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <UniversityDashboardSkeleton />;
  }

  return (
    <div className="w-full min-h-screen font-sans text-[#1E1F21] dark:text-zinc-100 ">
      <Helmet>
        <title>Student Directory | Admin Portal</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#1E1F21] dark:text-white">
              Student Management
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Manage student registrations, active statuses, and directory records.
            </p>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-[#1E1F21] rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Students Fetched
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#167CC2]/10 flex items-center justify-center text-[#167CC2]">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E1F21] dark:text-white">
                {students.length}
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-zinc-400 mt-0.5 sm:mt-1">
                Current page record count
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1F21] rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Active Records
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#D2F535] flex items-center justify-center text-[#1E1F21]">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex items-baseline justify-between">
              <div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E1F21] dark:text-white">
                  {students.filter(s => s.isActive).length}
                </div>
                <p className="text-[11px] sm:text-xs font-semibold text-zinc-400 mt-0.5 sm:mt-1">
                  Verified and active users
                </p>
              </div>
              <span className="bg-[#D2F535] text-[#1E1F21] text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                Active
              </span>
            </div>
          </div>

          <div className="bg-[#1E1F21] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between shadow-xs sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Inactive Records
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-800 flex items-center justify-center text-[#B2B0FF]">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex items-baseline justify-between">
              <div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
                  {students.filter(s => !s.isActive).length}
                </div>
                <p className="text-[11px] sm:text-xs font-medium text-zinc-400 mt-0.5 sm:mt-1">
                  Pending or suspended access
                </p>
              </div>
              <span className="bg-[#B2B0FF] text-[#1E1F21] text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                Inactive
              </span>
            </div>
          </div>
        </div>

        {/* Directory Main Container */}
        <div className="bg-white dark:bg-[#1E1F21] rounded-2xl sm:rounded-[28px] shadow-xs overflow-hidden p-3 sm:p-6">
          {/* Search and Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-5 sm:pb-6">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name or reg no..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#F3F4F6] dark:bg-zinc-800/60 border-none rounded-full pl-10 pr-4 py-2.5 text-xs font-medium text-[#1E1F21] dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#167CC2] transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <label className="flex md:hidden items-center gap-2 px-3.5 py-2 bg-[#F3F4F6] dark:bg-zinc-800/60 rounded-full text-xs text-zinc-700 dark:text-zinc-300 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="rounded border-zinc-300 text-[#167CC2] focus:ring-[#167CC2] w-4 h-4"
                />
                Select All
              </label>

              <select
                value={status}
                onChange={e => handleStatusChange(e.target.value)}
                className="flex-1 sm:flex-initial bg-[#F3F4F6] dark:bg-zinc-800/60 border-none text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#167CC2] cursor-pointer h-10 min-w-[130px]"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <button
                onClick={handleReset}
                className="p-2.5 bg-[#F3F4F6] dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer shrink-0 h-10 w-10 flex items-center justify-center ml-auto md:ml-0"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bulk Selection Action Bar */}
          {selectedStudentIds.length > 0 && (
            <div className="mb-4 p-3 bg-[#167CC2]/10 border border-[#167CC2]/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
              <span className="text-xs font-bold text-[#167CC2] px-2">
                {selectedStudentIds.length} student
                {selectedStudentIds.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleBulkStatusChange(true)}
                  disabled={isBulkUpdating}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-full bg-[#D2F535] text-[#1E1F21] text-xs font-extrabold hover:opacity-90 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Activate
                </button>
                <button
                  onClick={() => handleBulkStatusChange(false)}
                  disabled={isBulkUpdating}
                  className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-full bg-[#B2B0FF] text-[#1E1F21] text-xs font-extrabold hover:opacity-90 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Deactivate
                </button>
              </div>
            </div>
          )}

          {/* Loading Overlay State */}
          {isPageLoading && (
            <div className="py-12 text-center text-zinc-400">
              <div className="flex justify-center items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#167CC2]" />
                <span className="text-xs font-bold">Loading records...</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isPageLoading && students.length === 0 && (
            <div className="py-12 text-center text-zinc-400 text-xs font-medium">
              No student records found matching the applied query.
            </div>
          )}

          {/* Mobile & Tablet View: Cards Layout (< md) */}
          {!isPageLoading && students.length > 0 && (
            <div className="block md:hidden space-y-3">
              {students.map(student => {
                const isSelected = selectedStudentIds.includes(student._id);
                return (
                  <div
                    key={student._id}
                    className={`p-3.5 sm:p-4 rounded-2xl transition-colors ${
                      isSelected
                        ? "bg-[#167CC2]/10 border border-[#167CC2]/30"
                        : "bg-[#F3F4F6] dark:bg-zinc-800/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 sm:gap-3 overflow-hidden">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectStudent(student._id)}
                          className="mt-1 rounded border-zinc-300 text-[#167CC2] focus:ring-[#167CC2] w-4 h-4 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <div className="font-extrabold text-[#1E1F21] dark:text-white text-xs truncate">
                            {student.name}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-medium truncate">
                            {student.email}
                          </div>
                        </div>
                      </div>

                      {student.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D2F535] text-[#1E1F21] shrink-0">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#B2B0FF] text-[#1E1F21] shrink-0">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-[#1E1F21] p-3 rounded-xl mt-3">
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase font-bold">
                          Reg No
                        </span>
                        <span className="font-extrabold text-zinc-800 dark:text-zinc-200 truncate block">
                          {student.registrationNo || "N/A"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase font-bold">
                          CNIC
                        </span>
                        <span className="font-mono font-medium text-zinc-600 dark:text-zinc-400 text-[11px] truncate block">
                          {student.cnic || "N/A"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase font-bold">
                          Department
                        </span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate block">
                          {student.department || "N/A"}
                        </span>
                        {student.session && (
                          <span className="text-[10px] text-zinc-400 block font-medium truncate">
                            Session: {student.session}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase font-bold">
                          Joined Date
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                          {formatDate(student.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        onClick={() => handleToggleStatus(student)}
                        className={`w-full px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          student.isActive
                            ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300"
                            : "bg-[#167CC2] text-white hover:bg-[#167CC2]/90"
                        }`}
                      >
                        {student.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Desktop Table View (≥ md) */}
          {!isPageLoading && students.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="rounded border-zinc-300 text-[#167CC2] focus:ring-[#167CC2] w-4 h-4"
                      />
                    </th>
                    <th className="py-3 px-3">Reg No</th>
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">CNIC</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Joined Date</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {students.map(student => {
                    const isSelected = selectedStudentIds.includes(student._id);
                    return (
                      <tr
                        key={student._id}
                        className={`transition-colors ${
                          isSelected
                            ? "bg-[#167CC2]/10"
                            : "hover:bg-[#F3F4F6]/60 dark:hover:bg-zinc-800/30"
                        }`}
                      >
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectStudent(student._id)}
                            className="rounded border-zinc-300 text-[#167CC2] focus:ring-[#167CC2] w-4 h-4"
                          />
                        </td>
                        <td className="py-3.5 px-3 font-extrabold text-[#1E1F21] dark:text-zinc-200 text-xs">
                          {student.registrationNo || "N/A"}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-extrabold text-[#1E1F21] dark:text-white text-xs">
                            {student.name}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-medium">
                            {student.email}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                          <div>{student.department || "N/A"}</div>
                          {student.session && (
                            <span className="text-[10px] text-zinc-400 font-medium block">
                              Session: {student.session}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
                          {student.cnic || "N/A"}
                        </td>
                        <td className="py-3.5 px-3">
                          {student.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D2F535] text-[#1E1F21]">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#B2B0FF] text-[#1E1F21]">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {formatDate(student.createdAt)}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => handleToggleStatus(student)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                              student.isActive
                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                                : "bg-[#167CC2] text-white hover:bg-[#167CC2]/90"
                            }`}
                          >
                            {student.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Cursor Pagination Controls */}
          <div className="pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800 mt-4">
            <span className="text-xs font-bold text-zinc-400 order-2 sm:order-1 text-center sm:text-left">
              Page Level: {cursorHistory.length + 1}
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end order-1 sm:order-2">
              <button
                onClick={handlePrevPage}
                disabled={cursorHistory.length === 0 || isPageLoading}
                className="flex-1 sm:flex-initial justify-center px-4 py-2 rounded-full bg-[#F3F4F6] dark:bg-zinc-800 text-[#1E1F21] dark:text-zinc-200 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!pagination.hasNextPage || isPageLoading}
                className="flex-1 sm:flex-initial justify-center px-4 py-2 rounded-full bg-[#1E1F21] dark:bg-white text-white dark:text-[#1E1F21] text-xs font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDashboard;
