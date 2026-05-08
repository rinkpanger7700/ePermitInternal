"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  Filter,
  RotateCcw,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  MoreVertical,
  X,
} from "lucide-react";

/* ─────────────────────────────────────── types */
interface AppRow {
  id: string;
  reference_no: string;
  applicant_name: string;
  applicant_email: string;
  project_name: string;
  app_type: string;
  office: string;
  status: string;
  queue_status: string;
  date_received: string;
  date_released: string;
  region: string;
  priority: string;
  due_date: string;
}

/* ─────────────────────────────────────── helpers */
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const YEARS = Array.from({ length: 6 }, (_, i) => String(2024 + i));

function fmtDate(d: string | null | undefined) {
  if (!d) return "–";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "–";
  return dt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

/* Compute traffic-light status from due_date */
function computeQueueStatus(due_date: string): string {
  if (!due_date) return "Pending";
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(due_date);
  if (isNaN(due.getTime())) return "Pending";
  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.floor((dueStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due Today";
  if (diffDays <= 7) return "On time";
  return "Pending";
}

/* Traffic light dot */
function TrafficDot({ status }: { status: string }) {
  const color =
    status === "Overdue"   ? "bg-red-500" :
    status === "Due Today" ? "bg-orange-500" :
    status === "On time"   ? "bg-green-500" :
                             "bg-gray-400";
  return <span className={`inline-block w-3.5 h-3.5 rounded-full ${color} shadow-sm`} />;
}

/* Status badge */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Evaluation:      "bg-purple-100 text-purple-700 border-purple-200",
    "For Inspection": "bg-blue-100 text-blue-700 border-blue-200",
    "Ongoing Evaluation": "bg-purple-100 text-purple-700 border-purple-200",
    Inspection:      "bg-blue-100 text-blue-700 border-blue-200",
    "For Approval":  "bg-red-100 text-red-600 border-red-200",
    Released:        "bg-green-100 text-green-700 border-green-200",
    Returned:        "bg-gray-100 text-gray-600 border-gray-200",
    "For Compliance":"bg-orange-100 text-orange-600 border-orange-200",
    "Initial Review":"bg-indigo-100 text-indigo-700 border-indigo-200",
    "Under Review":"bg-yellow-100 text-yellow-700 border-yellow-200",
  };
  const cls = styles[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded border ${cls} whitespace-nowrap`}>
      {status}
    </span>
  );
}

/* Simple dropdown select */
function FilterSelect({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
        >
          <option value="">All</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

/* Date range input */
function DateRangeInput({
  label, from, to, onFrom, onTo,
}: {
  label: string; from: string; to: string;
  onFrom: (v: string) => void; onTo: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <div className="flex items-center gap-1 border border-gray-300 rounded-md px-2 py-1.5 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <input
          type="date"
          value={from}
          onChange={(e) => onFrom(e.target.value)}
          className="text-xs text-gray-600 bg-transparent focus:outline-none w-[90px]"
        />
        <span className="text-gray-400 text-xs">–</span>
        <input
          type="date"
          value={to}
          onChange={(e) => onTo(e.target.value)}
          className="text-xs text-gray-600 bg-transparent focus:outline-none w-[90px]"
        />
        <Calendar size={13} className="text-gray-400 ml-1 flex-shrink-0" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── main component */
const PAGE_SIZE = 10;

export default function ApplicationsPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [rows, setRows]       = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);

  /* filter state */
  const [appType,     setAppType]     = useState("");
  const [region,      setRegion]      = useState("");
  const [office,      setOffice]      = useState("");
  const [status,      setStatus]      = useState("");
  const [trafficLight,setTrafficLight]= useState("");
  const [month,       setMonth]       = useState("");
  const [year,        setYear]        = useState("");
  const [rcvFrom,     setRcvFrom]     = useState("");
  const [rcvTo,       setRcvTo]       = useState("");
  const [relFrom,     setRelFrom]     = useState("");
  const [relTo,       setRelTo]       = useState("");
  const [nameSearch,  setNameSearch]  = useState("");

  /* applied (committed) filters */
  const [applied, setApplied] = useState({
    appType:"", region:"", office:"", status:"", trafficLight:"",
    month:"", year:"", rcvFrom:"", rcvTo:"", relFrom:"", relTo:"", nameSearch:"",
  });

  /* fetch */
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("applications_with_queue_status")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) {
        console.error("[Applications] fetch error:", error.message);
        setLoading(false);
        return;
      }

      const mapped: AppRow[] = ((data ?? []) as any[]).map((r) => ({
        id:            r.id ?? r.reference_no,
        reference_no:  r.reference_no ?? "",
        applicant_name:r.applicant_name ?? "",
        applicant_email:r.applicant_email ?? "",
        project_name:  r.project_name ?? "",
        app_type:      r.app_type ?? r.permit_type ?? (r.reference_no?.startsWith("CLS") ? "C&LS" : "DP"),
        office:        r.office ?? r.processing_office ?? (r.region ? `${r.region} - Planning` : "–"),
        status:        r.status ?? r.current_stage ?? "",
        queue_status:  computeQueueStatus(r.due_date ?? ""),
        date_received: r.date_received ?? r.created_at ?? "",
        date_released: r.date_released ?? "",
        region:        r.region ?? "",
        priority:      r.priority ?? "",
        due_date:      r.due_date ?? "",
      }));

      setRows(mapped);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* unique values for dropdowns */
  function uniq(key: keyof AppRow) {
    return Array.from(new Set(rows.map((r) => r[key]).filter(Boolean) as string[])).sort();
  }

  function applyFilters() {
    setApplied({ appType, region, office, status, trafficLight, month, year, rcvFrom, rcvTo, relFrom, relTo, nameSearch });
    setPage(1);
  }

  function resetFilters() {
    setAppType(""); setRegion(""); setOffice(""); setStatus(""); setTrafficLight("");
    setMonth(""); setYear(""); setRcvFrom(""); setRcvTo(""); setRelFrom(""); setRelTo(""); setNameSearch("");
    setApplied({ appType:"", region:"", office:"", status:"", trafficLight:"",
      month:"", year:"", rcvFrom:"", rcvTo:"", relFrom:"", relTo:"", nameSearch:"" });
    setPage(1);
  }

  /* filter logic */
  const filtered = rows.filter((r) => {
    if (applied.appType      && r.app_type      !== applied.appType)      return false;
    if (applied.region       && r.region        !== applied.region)       return false;
    if (applied.office       && r.office        !== applied.office)       return false;
    if (applied.status       && r.status        !== applied.status)       return false;
    if (applied.trafficLight && r.queue_status  !== applied.trafficLight) return false;
    if (applied.month) {
      const m = new Date(r.date_received || r.due_date).getMonth();
      if (MONTHS[m] !== applied.month) return false;
    }
    if (applied.year) {
      const y = new Date(r.date_received || r.due_date).getFullYear().toString();
      if (y !== applied.year) return false;
    }
    if (applied.rcvFrom && r.date_received && r.date_received < applied.rcvFrom) return false;
    if (applied.rcvTo   && r.date_received && r.date_received > applied.rcvTo)   return false;
    if (applied.relFrom && r.date_released && r.date_released < applied.relFrom) return false;
    if (applied.relTo   && r.date_released && r.date_released > applied.relTo)   return false;
    if (applied.nameSearch) {
      const q = applied.nameSearch.toLowerCase();
      if (!r.applicant_name.toLowerCase().includes(q) && !r.project_name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  /* pagination */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function pageNumbers() {
    const pages: (number | "…")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("…");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  }

  const startEntry = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry   = Math.min(page * PAGE_SIZE, filtered.length);

  /* export stub */
  function exportCSV() {
    const headers = ["Application No.","Applicant","Email","Project Name","Type","Office","Status","Traffic Light","Date Received","Date Released"];
    const csvRows = [headers, ...filtered.map((r) => [
      r.reference_no, r.applicant_name, r.applicant_email, r.project_name, r.app_type, r.office,
      r.status, r.queue_status, fmtDate(r.date_received), fmtDate(r.date_released),
    ])];
    const csv = csvRows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url;
    a.download = "applications_export.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* ── Page Title ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Application Queue</h1>
        <p className="text-sm text-gray-500 mt-0.5">View, filter, and manage permit applications across offices.</p>
      </div>

      {/* ── Filter Panel ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <FilterSelect
            label="Application Type"
            value={appType}
            onChange={setAppType}
            options={uniq("app_type")}
          />
          <FilterSelect
            label="Regional Office"
            value={region}
            onChange={setRegion}
            options={uniq("region")}
          />
          <FilterSelect
            label="Processing Office"
            value={office}
            onChange={setOffice}
            options={uniq("office")}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={uniq("status")}
          />
          <FilterSelect
            label="Traffic Light Status"
            value={trafficLight}
            onChange={setTrafficLight}
            options={["Overdue", "Due Today", "On time", "Pending"]}
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
          {/* Month */}
          <FilterSelect
            label="Month"
            value={month}
            onChange={setMonth}
            options={MONTHS}
          />
          {/* Year */}
          <FilterSelect
            label="Year"
            value={year}
            onChange={setYear}
            options={YEARS}
          />
          {/* Date Received */}
          <DateRangeInput
            label="Date Received"
            from={rcvFrom} to={rcvTo}
            onFrom={setRcvFrom} onTo={setRcvTo}
          />
          {/* Date Released */}
          <DateRangeInput
            label="Date Released"
            from={relFrom} to={relTo}
            onFrom={setRelFrom} onTo={setRelTo}
          />
          {/* Applicant / Developer Name */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-xs font-semibold text-gray-600">Applicant / Developer Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search name..."
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 3 – actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={applyFilters}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            <Filter size={14} />
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Table toolbar */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-end gap-2">
          <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">
            <Filter size={14} />
            Advanced Filter
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download size={14} />
            Export
            <ChevronDown size={13} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-bold text-blue-700 uppercase tracking-wide whitespace-nowrap">
                  Application No.
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wide whitespace-nowrap">
                  Applicant / Developer
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wide whitespace-nowrap">
                  Project Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wide whitespace-nowrap">
                  Office
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-center px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wide whitespace-nowrap">
                  Traffic Light
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wide whitespace-nowrap">
                  Date Received
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wide whitespace-nowrap">
                  Date Released
                </th>
                <th className="text-center px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-5 py-14 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm">Loading applications…</span>
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-14 text-center text-gray-400 text-sm">
                    {rows.length === 0
                      ? "No applications found. Make sure data exists in the database."
                      : "No results match the applied filters."}
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                      {row.reference_no}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-gray-700 font-medium">{row.applicant_name}</div>
                      {row.applicant_email && (
                        <div className="text-xs text-gray-400">{row.applicant_email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">
                      {row.project_name}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {row.app_type || "DP"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                      {row.office}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <TrafficDot status={row.queue_status} />
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-xs">
                      {fmtDate(row.date_received)}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-xs">
                      {fmtDate(row.date_released)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => router.push(`/dashboard/applications/${encodeURIComponent(row.reference_no)}`)}
                          className="text-xs font-medium px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                        >
                          Open Case
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
                          <MoreVertical size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-gray-500">
              Showing {startEntry} to {endEntry} of {filtered.length} entries
            </span>
            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              {pageNumbers().map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-semibold transition-colors ${
                      page === p
                        ? "bg-blue-700 text-white border border-blue-700"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
