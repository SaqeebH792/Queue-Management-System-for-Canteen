import React, { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { uploadStudents } from "../../routes/university.routes";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  BadgeAlert,
  X,
  Trash2,
  Download,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

function Studentsignup({ user }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  // Derive admin account status directly from props
  const currentUser = user?.data?.user;
  const adminStatus = currentUser?.status || "inactive";
  const isAdminActive = adminStatus.toLowerCase() === "active";
  const [showDismissibleAlert, setShowDismissibleAlert] = useState(true);

  // Data Preview & Pagination States
  const [parsedData, setParsedData] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'errors' | 'valid'
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const fileInputRef = useRef(null);

  // File Processing & Validation Handler
  const processFile = selectedFile => {
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (!rows.length) {
          toast.error("Selected file contains no data rows.");
          return;
        }

        if (!isAdminActive && rows.length > 100) {
          toast.error("Inactive admins are restricted to 100 student records.");
          return;
        }

        const seenRegs = new Set();
        const validatedRows = rows.map((row, idx) => {
          const studentId = (row.StudentID || row.RegistrationNo || row.registrationNo || "")
            .toString()
            .trim();

          const name = (
            row.Name ||
            row.fullName ||
            `${row.FirstName || ""} ${row.LastName || ""}`
          ).trim();

          const email = (row.Email || row.email || "").toString().trim();
          const major = (row.Major || row.Department || row.department || "").toString().trim();

          let hasError = false;
          let errorField = null;
          const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

          if (!studentId || seenRegs.has(studentId.toLowerCase())) {
            hasError = true;
            errorField = "studentId";
          } else if (!email || !isEmailValid) {
            hasError = true;
            errorField = "email";
          } else if (!name) {
            hasError = true;
            errorField = "name";
          }

          if (studentId) seenRegs.add(studentId.toLowerCase());

          return {
            id: idx + 1,
            studentId: studentId || "MISSING",
            name: name || "N/A",
            email: email || "N/A",
            major: major || "N/A",
            status: hasError ? "Invalid" : "Valid",
            errorField,
            raw: row,
          };
        });

        setParsedData(validatedRows);
        setFile(selectedFile);
        setCurrentPage(1);
        toast.success("File parsed successfully.");
      } catch (err) {
        toast.error("Failed to parse file format.");
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleFileChange = e => processFile(e.target.files[0]);

  const handleDrop = e => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setCurrentPage(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteRow = id => {
    setParsedData(prev => prev.filter(item => item.id !== id));
  };

  const handleCommitRoster = async () => {
    if (!file) return;

    if (!isAdminActive && parsedData.length > 100) {
      toast.error("Inactive admins are capped at 100 records.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("csvFile", file);

      const response = await uploadStudents(formData);
      toast.success(response?.message || "Roster committed successfully!");
      handleReset();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to commit roster");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,StudentID,FirstName,LastName,Email,Major\nSTU-9901,Alice,Smith,asmith@edu.edu,Computer Science\nSTU-9902,Bob,Jones,bjones@edu.edu,Mathematics";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Pagination Calculations
  const errorRows = parsedData.filter(r => r.status === "Invalid");
  const validRows = parsedData.filter(r => r.status === "Valid");

  const filteredData =
    activeTab === "errors" ? errorRows : activeTab === "valid" ? validRows : parsedData;

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const paginatedRows = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <>
      <Helmet>
        <title>Student Roster Upload - Admin Portal</title>
      </Helmet>

      <div className="min-h-screen font-sans text-[#1E1F21] dark:text-zinc-100 transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E1F21] dark:text-white">
                  Student Roster Upload
                </h1>
                {!isAdminActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#B2B0FF] text-[#1E1F21]">
                    <BadgeAlert className="w-3.5 h-3.5" />
                    Inactive Account
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#D2F535] text-[#1E1F21]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Active Admin
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                Import, review, and validate batch student records before committing to the
                institutional directory.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F3F4F6] dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-[#1E1F21] dark:text-zinc-200 rounded-full transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </button>
          </div>

          {/* Dismissible Limit Alert */}
          {!isAdminActive && showDismissibleAlert && (
            <div className="flex items-center justify-between p-4 bg-[#B2B0FF]/10 border border-[#B2B0FF]/30 rounded-3xl text-[#1E1F21] dark:text-zinc-100 text-xs font-bold shadow-xs">
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 shrink-0 text-[#167CC2]" />
                <span>
                  Notice: Inactive admin accounts are limited to uploading{" "}
                  <strong>100 records</strong> per batch upload.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDismissibleAlert(false)}
                className="p-1 hover:bg-[#B2B0FF]/20 rounded-full transition-colors cursor-pointer text-[#1E1F21] dark:text-zinc-300"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* File Selection Side Card */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-[#1E1F21] rounded-[28px] p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-extrabold text-[#1E1F21] dark:text-white uppercase tracking-wider">
                  Upload Document
                </h2>

                {/* Drag-and-Drop Container */}
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                    isDragging
                      ? "border-[#167CC2] bg-[#167CC2]/10"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-[#167CC2]/50 bg-[#F3F4F6] dark:bg-zinc-800/60"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="w-10 h-10 rounded-full bg-[#167CC2]/10 flex items-center justify-center text-[#167CC2] mb-3">
                    <Upload className="w-5 h-5" />
                  </div>

                  <p className="text-xs font-extrabold text-[#1E1F21] dark:text-white mb-1">
                    Click or drag CSV/Excel file
                  </p>
                  <p className="text-[11px] font-medium text-zinc-400 mb-4">
                    Supports .csv, .xls, .xlsx up to 10MB
                  </p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2 bg-[#1E1F21] hover:opacity-90 dark:bg-white dark:text-[#1E1F21] text-white text-xs font-extrabold rounded-full transition-colors cursor-pointer"
                  >
                    Browse Files
                  </button>
                </div>

                {/* Parsed File Details Badge */}
                {file && (
                  <div className="p-4 bg-[#F3F4F6] dark:bg-zinc-800/60 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#D2F535] flex items-center justify-center text-[#1E1F21] shrink-0">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-[#1E1F21] dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-[10px] font-semibold text-zinc-400">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-full transition-colors cursor-pointer"
                        title="Clear selection"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#1E1F21] font-extrabold bg-[#D2F535] px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Parsed {parsedData.length} records successfully</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Checklist Guide */}
              <div className="bg-white dark:bg-[#1E1F21] rounded-[28px] p-6 shadow-xs space-y-3">
                <h3 className="font-extrabold text-[#1E1F21] dark:text-white text-xs uppercase tracking-wider">
                  Format Checklist
                </h3>
                <ul className="space-y-2.5 text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                  <li className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#167CC2] shrink-0" />
                    Header row with key column names required.
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#167CC2] shrink-0" />
                    Supported columns: StudentID, Name, Email, Major.
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#167CC2] shrink-0" />
                    Duplicate or missing StudentIDs are marked invalid.
                  </li>
                </ul>
              </div>
            </div>

            {/* Interactive Data Grid Section */}
            <div className="lg:col-span-8 bg-white dark:bg-[#1E1F21] rounded-[28px] p-4 sm:p-6 shadow-xs space-y-4">
              {/* Table Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h2 className="text-base font-extrabold text-[#1E1F21] dark:text-white">
                    Data Preview
                  </h2>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">
                    {parsedData.length === 0
                      ? "Upload a file to preview student records."
                      : `${parsedData.length} total rows parsed. ${errorRows.length} require review.`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!parsedData.length || loading}
                    className="px-4 py-2 bg-[#F3F4F6] dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={handleCommitRoster}
                    disabled={!parsedData.length || loading}
                    className="px-5 py-2 bg-[#167CC2] text-white hover:bg-[#167CC2]/90 rounded-full text-xs font-extrabold transition-colors disabled:opacity-40 flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Commit Roster</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("all");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-colors cursor-pointer ${
                    activeTab === "all"
                      ? "bg-[#1E1F21] text-white dark:bg-white dark:text-[#1E1F21]"
                      : "bg-[#F3F4F6] dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  All ({parsedData.length})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("errors");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === "errors"
                      ? "bg-[#B2B0FF] text-[#1E1F21]"
                      : "bg-[#F3F4F6] dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Errors ({errorRows.length})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("valid");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-colors cursor-pointer ${
                    activeTab === "valid"
                      ? "bg-[#D2F535] text-[#1E1F21]"
                      : "bg-[#F3F4F6] dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  Valid ({validRows.length})
                </button>
              </div>

              {/* Structured Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                      <th className="py-3 px-3 w-8">#</th>
                      <th className="py-3 px-3">StudentID</th>
                      <th className="py-3 px-3">Name</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">Major</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {paginatedRows.length > 0 ? (
                      paginatedRows.map(row => {
                        const isInvalid = row.status === "Invalid";

                        return (
                          <tr
                            key={row.id}
                            className={
                              isInvalid
                                ? "bg-[#B2B0FF]/20 hover:bg-[#B2B0FF]/30 transition-colors"
                                : "hover:bg-[#F3F4F6] dark:hover:bg-zinc-800/50 transition-colors"
                            }
                          >
                            <td className="py-3.5 px-3 text-zinc-400 text-xs font-medium">
                              {row.id}
                            </td>

                            <td className="py-3.5 px-3 font-extrabold text-xs">
                              <span
                                className={
                                  row.errorField === "studentId"
                                    ? "text-rose-500 dark:text-rose-400 font-extrabold flex items-center gap-1"
                                    : "text-[#1E1F21] dark:text-zinc-200"
                                }
                              >
                                {row.studentId}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-xs">
                              <span
                                className={
                                  row.errorField === "name"
                                    ? "text-rose-500 dark:text-rose-400 font-extrabold"
                                    : "font-bold text-[#1E1F21] dark:text-white"
                                }
                              >
                                {row.name}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-xs">
                              <span
                                className={
                                  row.errorField === "email"
                                    ? "text-rose-500 dark:text-rose-400 font-extrabold"
                                    : "text-zinc-500 dark:text-zinc-400 font-medium"
                                }
                              >
                                {row.email}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                              {row.major}
                            </td>

                            <td className="py-3.5 px-3 text-center">
                              {isInvalid ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#B2B0FF] text-[#1E1F21]">
                                  Invalid
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#D2F535] text-[#1E1F21]">
                                  Valid
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(row.id)}
                                className="p-1.5 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                title="Delete row"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-12 text-center text-zinc-400 text-xs font-medium"
                        >
                          No data available in this view.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-400 order-2 xs:order-1">
                  Showing {filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} -{" "}
                  {Math.min(currentPage * rowsPerPage, filteredData.length)} of{" "}
                  {filteredData.length}
                </span>

                <div className="flex items-center gap-2 w-full xs:w-auto justify-stretch xs:justify-end order-1 xs:order-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex-1 xs:flex-initial justify-center px-4 py-2 rounded-full bg-[#F3F4F6] dark:bg-zinc-800 text-[#1E1F21] dark:text-zinc-200 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="font-extrabold text-[#1E1F21] dark:text-white text-xs px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="flex-1 xs:flex-initial justify-center px-4 py-2 rounded-full bg-[#1E1F21] dark:bg-white text-white dark:text-[#1E1F21] text-xs font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Studentsignup;
