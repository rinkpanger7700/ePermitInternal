"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase";
import {
  ClipboardList,
  Calendar,
  AlertTriangle,
  Zap,
  ArrowRight,
  Info,
  Filter,
  MoreVertical,
  X,
  FileText,
  MapPin,
  User,
  Clock,
  ChevronDown,
} from "lucide-react";

/* ────────────────────────────────────────────── types */
interface Application {
  id?: string;
  reference_no: string;
  applicant_name: string;
  project_name: string;
  status: string;       // maps to DB column: status (Current Stage)
  priority: string;
  due_date: string;
  queue_status: string; // maps to DB column: queue_status (Status)
  region?: string;
}

/* ────────────────────────────────────────────── helpers */
function priorityBadge(p: string) {
  const map: Record<string, string> = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Low: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return map[p] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    Overdue: "text-red-600",
    "Due Today": "text-orange-600",
    "Due Soon": "text-yellow-600",
    Pending: "text-green-600",
  };
  return map[s] ?? "text-gray-600";
}

function dueDateLabel(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const formatted = due.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (diff < 0) return { date: formatted, sub: `Overdue ${Math.abs(diff)} day${Math.abs(diff) > 1 ? "s" : ""}`, color: "text-red-600" };
  if (diff === 0) return { date: formatted, sub: "(Today)", color: "text-orange-600" };
  if (diff === 1) return { date: formatted, sub: "(1 day left)", color: "text-yellow-600" };
  return { date: formatted, sub: `(${diff} days left)`, color: "text-gray-500" };
}

/* ────────────────────────────────────────────── Case Detail Modal */
function CaseModal({
  app,
  onClose,
}: {
  app: Application;
  onClose: () => void;
}) {
  const dl = dueDateLabel(app.due_date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-in">
        {/* Header */}
        <div className="bg-[#1e3a8a] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={20} />
            <div>
              <h2 className="font-bold text-lg">Case Details</h2>
              <p className="text-blue-200 text-xs">{app.reference_no}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status banner */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border ${app.queue_status === "Overdue"
                ? "bg-red-50 border-red-200"
                : app.queue_status === "Due Today"
                  ? "bg-orange-50 border-orange-200"
                  : app.queue_status === "Due Soon"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-green-50 border-green-200"
              }`}
          >
            <AlertTriangle
              size={18}
              className={statusBadge(app.queue_status)}
            />
            <span className={`text-sm font-medium ${statusBadge(app.queue_status)}`}>
              Status: {app.queue_status}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Permit No.
              </label>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                {app.reference_no}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Current Stage
              </label>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                {app.status}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Applicant
              </label>
              <div className="flex items-center gap-2 mt-1">
                <User size={14} className="text-gray-400" />
                <p className="text-sm font-semibold text-gray-800">
                  {app.applicant_name}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Project Name
              </label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin size={14} className="text-gray-400" />
                <p className="text-sm font-semibold text-gray-800">
                  {app.project_name}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Priority
              </label>
              <div className="mt-1">
                <span
                  className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${priorityBadge(app.priority)}`}
                >
                  {app.priority}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Due Date
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={14} className="text-gray-400" />
                <p className="text-sm font-semibold text-gray-800">
                  {dl.date}{" "}
                  <span className={`text-xs font-normal ${dl.color}`}>
                    {dl.sub}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Region */}
          {app.region && (
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Region
              </label>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                {app.region}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
          <button className="px-5 py-2 text-sm text-white bg-[#1e3a8a] hover:bg-blue-800 rounded-lg transition-colors font-medium">
            Start Review
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────── Column Filter Dropdown */
function ColumnFilterDropdown({
  values,
  filterValue,
  onSelect,
  placeholder,
}: {
  values: string[];
  filterValue: string;
  onSelect: (val: string) => void;
  placeholder: string;
}) {
  return (
    <div className="absolute z-20 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-in">
      <button
        onClick={() => onSelect("")}
        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${!filterValue ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}
      >
        All
      </button>
      <div className="border-t border-gray-100 my-1" />
      <div className="max-h-48 overflow-y-auto">
        {values.map((v) => (
          <button
            key={v}
            onClick={() => onSelect(v)}
            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${filterValue === v ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────── REGIONAL DASHBOARD */
export function RegionalDashboard() {
  const supabase = createClient();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [openFilterColumn, setOpenFilterColumn] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({
    search: "",
    priority: "",
    queue_status: "",
    status: "",
  });

  function setFilter(key: keyof typeof filters, val: string) {
    setFilters((prev) => ({ ...prev, [key]: val }));
  }

  function clearFilters() {
    setFilters({ search: "", priority: "", queue_status: "", status: "" });
    setColumnFilters({});
  }

  function setColumnFilter(column: string, value: string) {
    setColumnFilters((prev) => {
      const next = { ...prev };
      if (value === "") {
        delete next[column];
      } else {
        next[column] = value;
      }
      return next;
    });
    setOpenFilterColumn(null);
  }

  function getUniqueValues(column: string): string[] {
    const keyMap: Record<string, keyof Application> = {
      reference_no: "reference_no",
      applicant_project: "applicant_name",
      status: "status",
      priority: "priority",
      due_date: "due_date",
      queue_status: "queue_status",
    };
    const key = keyMap[column];
    if (!key) return [];
    const values = new Set<string>();
    applications.forEach((a) => {
      const val = String(a[key] ?? "");
      if (val) values.add(val);
    });
    return Array.from(values).sort();
  }

  useEffect(() => {
    async function fetchApplications() {
      const { data, error } = await supabase
        .from("applications_with_queue_status")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) {
        console.error("[Dashboard] Supabase fetch error:", error.message, error.details);
        setLoading(false);
        return;
      }

      if (data) {
        const mapped: Application[] = (data as any[]).map((row) => ({
          id: row.id ?? row.reference_no,
          reference_no: row.reference_no ?? "",
          applicant_name: row.applicant_name ?? "",
          project_name: row.project_name ?? "",
          status: row.status ?? "", // Current Stage
          priority: row.priority ?? "",
          due_date: row.due_date ?? "",
          queue_status: row.queue_status ?? "", // Queue Status
          region: row.region,
        }));
        console.log(`[Dashboard] Loaded ${mapped.length} applications`, mapped);
        setApplications(mapped);
      }
      setLoading(false);
    }
    fetchApplications();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setOpenFilterColumn(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pending = applications.filter((a) => a.queue_status === "Pending" || a.queue_status === "Due Soon").length;
  const dueToday = applications.filter((a) => a.queue_status === "Due Today").length;
  const overdue = applications.filter((a) => a.queue_status === "Overdue").length;
  const immediate = applications.filter(
    (a) => a.queue_status === "Overdue" || a.queue_status === "Due Today"
  ).length;

  const filteredApplications = applications.filter((a) => {
    const q = filters.search.toLowerCase();
    if (q && ![
      a.reference_no, a.applicant_name, a.project_name, a.status, a.priority, a.queue_status
    ].some((v) => v.toLowerCase().includes(q))) return false;
    if (filters.priority && a.priority !== filters.priority) return false;
    if (filters.queue_status && a.queue_status !== filters.queue_status) return false;
    if (filters.status && a.status !== filters.status) return false;
    if (columnFilters.reference_no && !a.reference_no.toLowerCase().includes(columnFilters.reference_no.toLowerCase())) return false;
    if (columnFilters.applicant_project && !(
      a.applicant_name.toLowerCase().includes(columnFilters.applicant_project.toLowerCase()) ||
      a.project_name.toLowerCase().includes(columnFilters.applicant_project.toLowerCase())
    )) return false;
    if (columnFilters.status && a.status !== columnFilters.status) return false;
    if (columnFilters.priority && a.priority !== columnFilters.priority) return false;
    if (columnFilters.due_date && !a.due_date.startsWith(columnFilters.due_date)) return false;
    if (columnFilters.queue_status && a.queue_status !== columnFilters.queue_status) return false;
    return true;
  });

  const activeFilterCount = [filters.priority, filters.queue_status, filters.status, ...Object.values(columnFilters)].filter(Boolean).length;

  const stats = [
    {
      label: "My Pending",
      value: pending,
      icon: ClipboardList,
      bg: "bg-blue-600",
      color: "text-blue-600",
    },
    {
      label: "Due Today",
      value: dueToday,
      icon: Calendar,
      bg: "bg-yellow-500",
      color: "text-yellow-600",
    },
    {
      label: "Overdue",
      value: overdue,
      icon: AlertTriangle,
      bg: "bg-red-500",
      color: "text-red-600",
    },
    {
      label: "For Immediate Action",
      value: immediate,
      icon: Zap,
      bg: "bg-blue-800",
      color: "text-blue-800",
    },
  ];

  return (
    <div>
      {/* ── Title ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Focus on your pending, due today, and overdue applications.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4"
            >
              <div
                className={`w-11 h-11 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}
              >
                <Icon size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-0.5">
                  {loading ? "–" : s.value}
                </p>
                <button className={`text-xs font-medium mt-1 flex items-center gap-1 ${s.color} hover:underline`}>
                  View queue <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Application Queue ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Queue header */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ClipboardList size={18} className="text-gray-400" />
            <h2 className="text-base font-bold text-gray-800">
              My Application Queue
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Info size={14} />
            <span>
              This queue helps staff prioritize and fast-track applications that
              need immediate action.
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="px-4 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              All My Cases
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {loading ? "–" : filteredApplications.length}
              </span>
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <X size={12} />
                Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
              </button>
            )}
          </div>
          {/* <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={14} />
            Filter
            <ChevronDown size={14} />
          </button> */}
        </div>

        {/* Table */}
        <div ref={tableRef} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  <div className="flex flex-col gap-2">
                    <span>Permit No.</span>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Filter..."
                        value={columnFilters.reference_no ?? ""}
                        onChange={(e) => setColumnFilter("reference_no", e.target.value)}
                        className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {columnFilters.reference_no && (
                        <button
                          onClick={() => setColumnFilter("reference_no", "")}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  <div className="flex flex-col gap-2">
                    <span>Applicant / Project</span>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Filter..."
                        value={columnFilters.applicant_project ?? ""}
                        onChange={(e) => setColumnFilter("applicant_project", e.target.value)}
                        className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {columnFilters.applicant_project && (
                        <button
                          onClick={() => setColumnFilter("applicant_project", "")}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  <div className="flex flex-col gap-2">
                    <span>Current Stage</span>
                    <div className="relative">
                      <button
                        onClick={() => setOpenFilterColumn(openFilterColumn === "status" ? null : "status")}
                        className={`w-full text-left text-xs px-2 py-1 border rounded flex items-center justify-between ${columnFilters.status ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <span className="truncate">{columnFilters.status || "Filter..."}</span>
                        <ChevronDown size={12} className="flex-shrink-0 ml-1" />
                      </button>
                      {openFilterColumn === "status" && (
                        <ColumnFilterDropdown
                          values={getUniqueValues("status")}
                          filterValue={columnFilters.status ?? ""}
                          onSelect={(val) => setColumnFilter("status", val)}
                          placeholder="Select status"
                        />
                      )}
                    </div>
                  </div>
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  <div className="flex flex-col gap-2 items-center">
                    <span>Priority</span>
                    <div className="relative w-full">
                      <button
                        onClick={() => setOpenFilterColumn(openFilterColumn === "priority" ? null : "priority")}
                        className={`w-full text-left text-xs px-2 py-1 border rounded flex items-center justify-between ${columnFilters.priority ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <span className="truncate">{columnFilters.priority || "Filter..."}</span>
                        <ChevronDown size={12} className="flex-shrink-0 ml-1" />
                      </button>
                      {openFilterColumn === "priority" && (
                        <ColumnFilterDropdown
                          values={getUniqueValues("priority")}
                          filterValue={columnFilters.priority ?? ""}
                          onSelect={(val) => setColumnFilter("priority", val)}
                          placeholder="Select priority"
                        />
                      )}
                    </div>
                  </div>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  <div className="flex flex-col gap-2">
                    <span>Due Date</span>
                    <div className="relative">
                      <input
                        type="date"
                        value={columnFilters.due_date ?? ""}
                        onChange={(e) => setColumnFilter("due_date", e.target.value)}
                        className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {columnFilters.due_date && (
                        <button
                          onClick={() => setColumnFilter("due_date", "")}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  <div className="flex flex-col gap-2 items-center">
                    <span>Status</span>
                    <div className="relative w-full">
                      <button
                        onClick={() => setOpenFilterColumn(openFilterColumn === "queue_status" ? null : "queue_status")}
                        className={`w-full text-left text-xs px-2 py-1 border rounded flex items-center justify-between ${columnFilters.queue_status ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <span className="truncate">{columnFilters.queue_status || "Filter..."}</span>
                        <ChevronDown size={12} className="flex-shrink-0 ml-1" />
                      </button>
                      {openFilterColumn === "queue_status" && (
                        <ColumnFilterDropdown
                          values={getUniqueValues("queue_status")}
                          filterValue={columnFilters.queue_status ?? ""}
                          onSelect={(val) => setColumnFilter("queue_status", val)}
                          placeholder="Select status"
                        />
                      )}
                    </div>
                  </div>
                </th>
                <th className="text-center px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading applications…
                    </div>
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    {applications.length === 0
                      ? "No applications found. Run the SQL migration to seed data."
                      : "No results match your filters."}
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => {
                  const dl = dueDateLabel(app.due_date);
                  return (
                    <tr
                      key={app.id}
                      className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {app.reference_no}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-800">
                          {app.project_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {app.applicant_name}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {app.status}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${priorityBadge(app.priority)}`}
                        >
                          {app.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`text-sm ${dl.color === "text-red-600" ? "text-red-600" : "text-gray-700"}`}>
                          {dl.date}
                        </div>
                        <div className={`text-xs ${dl.color}`}>{dl.sub}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-xs font-semibold ${statusBadge(app.queue_status)}`}>
                          {app.queue_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="text-xs font-medium px-4 py-1.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Open Case
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Case Modal ── */}
      {selectedApp && (
        <CaseModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────── OTHER DASHBOARDS */

export function BureauDashboard() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Bureau Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 border-l-4 border-l-indigo-500">
          <p className="text-sm text-gray-500 font-medium">Nationwide Pending</p>
          <p className="text-3xl font-bold text-indigo-900 mt-2">412</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500 font-medium">Awaiting Bureau Approval</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">56</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 border-l-4 border-l-red-500">
          <p className="text-sm text-gray-500 font-medium">Critical Delays</p>
          <p className="text-3xl font-bold text-red-600 mt-2">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500 font-medium">Total Processed (Month)</p>
          <p className="text-3xl font-bold text-green-600 mt-2">1,240</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-64 flex items-center justify-center">
        <p className="text-gray-400">Bureau-level performance charts.</p>
      </div>
    </div>
  );
}

export function ExecutiveDashboard() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Executive Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 bg-gradient-to-br from-white to-purple-50">
          <p className="text-sm text-purple-800 font-medium">Overall Efficiency Rate</p>
          <p className="text-4xl font-bold text-purple-900 mt-2">94.2%</p>
          <p className="text-xs text-purple-600 mt-2">↑ 2.1% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 bg-gradient-to-br from-white to-green-50">
          <p className="text-sm text-green-800 font-medium">Total Revenue Collected</p>
          <p className="text-4xl font-bold text-green-900 mt-2">₱12.4M</p>
          <p className="text-xs text-green-600 mt-2">↑ 5.4% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 bg-gradient-to-br from-white to-blue-50">
          <p className="text-sm text-blue-800 font-medium">Active Development Projects</p>
          <p className="text-4xl font-bold text-blue-900 mt-2">3,492</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-64 flex items-center justify-center">
          <p className="text-gray-400">Regional Performance Comparison</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-64 flex items-center justify-center">
          <p className="text-gray-400">Revenue Trends (YTD)</p>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">System Administration</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 text-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-slate-300 font-medium">Active Users</p>
          <p className="text-3xl font-bold mt-2">1,842</p>
        </div>
        <div className="bg-slate-800 text-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-slate-300 font-medium">System Status</p>
          <p className="text-3xl font-bold text-green-400 mt-2">Healthy</p>
        </div>
        <div className="bg-slate-800 text-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-slate-300 font-medium">API Latency</p>
          <p className="text-3xl font-bold mt-2">42ms</p>
        </div>
        <div className="bg-slate-800 text-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-slate-300 font-medium">Failed Logins (24h)</p>
          <p className="text-3xl font-bold text-red-400 mt-2">14</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Audit Logs</h3>
        <ul className="space-y-3">
          <li className="text-sm flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">User role updated: jsmith</span>
            <span className="text-gray-400">2 mins ago</span>
          </li>
          <li className="text-sm flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">System backup completed</span>
            <span className="text-gray-400">1 hour ago</span>
          </li>
          <li className="text-sm flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">New regional office added (RO13)</span>
            <span className="text-gray-400">3 hours ago</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
