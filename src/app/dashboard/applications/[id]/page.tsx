"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ArrowLeft, ChevronDown, Bell, Download, CheckCircle2 } from "lucide-react";

/* ── Types ── */
interface AppRow {
  id: string;
  reference_no: string;
  applicant_name: string;
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

/* ── Static data ── */
const STEPS = ["Intake", "Auto-Check", "Evaluation", "Inspection", "Approval", "Releasing"];
const STEP_INDEX: Record<string, number> = {
  "Initial Review": 0, "Auto-Check": 1, "Payment Verification": 1,
  "Evaluation": 2, "Inspection": 3, "For Approval": 4, "Approval": 4, "Released": 5, "Releasing": 5,
};
const SUB_PROCESSES = [
  { name: "Intake Review", status: "Completed", date: "Apr 10, 2026", by: "Records Section", evidence: "Intake checklist verified, timestamp logged" },
  { name: "Auto-Check Validation", status: "Completed", date: "Apr 10, 2026", by: "System", evidence: "Auto-check passed, system validation result available" },
  { name: "Initial Evaluation", status: "Completed", date: "Apr 15, 2026", by: "Maria Reyes", evidence: "Evaluation remarks saved, signed review note attached" },
  { name: "Payment Recording", status: "Completed", date: "Apr 13, 2026", by: "Cashier", evidence: "Official receipt OR-2026-0188 linked" },
  { name: "Requirements Validation", status: "Completed", date: "Apr 12, 2026", by: "Maria Reyes", evidence: "Validation checklist and uploaded supporting files" },
];
const ACTIVITY_LOG = [
  { dot: "bg-green-500", date: "Apr 15, 2026 10:20 AM", text: "Evaluation started by Maria Reyes" },
  { dot: "bg-blue-500", date: "Apr 13, 2026 02:11 PM", text: "Payment recorded" },
  { dot: "bg-gray-300", date: "Apr 12, 2026 09:05 AM", text: "Requirements validated" },
  { dot: "bg-gray-300", date: "Apr 10, 2026 04:30 PM", text: "Application received" },
  { dot: "bg-gray-300", date: "Apr 10, 2026 04:25 PM", text: "Encoded by Records Section" },
];
const FILES = [
  { name: "Evaluation Report.pdf", color: "text-red-500" },
  { name: "Validation Checklist.pdf", color: "text-red-500" },
  { name: "Official Receipt.pdf", color: "text-red-500" },
  { name: "Auto-Check Result", color: "text-blue-500" },
  { name: "Routing Slip", color: "text-blue-500" },
];

/* ── Helpers ── */
function fmtDate(d?: string | null) {
  if (!d) return "–";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
}
function dueDaysLeft(due: string) {
  if (!due) return null;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const d = new Date(due); d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - t.getTime()) / 86400000);
}

/* ── Small components ── */
function TrafficPill({ status }: { status: string }) {
  const m: Record<string, { dot: string; label: string; bg: string; text: string }> = {
    Overdue: { dot: "bg-red-500", label: "Overdue", bg: "bg-red-50", text: "text-red-600" },
    "Due Today": { dot: "bg-orange-400", label: "Due Today", bg: "bg-orange-50", text: "text-orange-600" },
    "Due Soon": { dot: "bg-yellow-400", label: "Near Deadline", bg: "bg-yellow-50", text: "text-yellow-700" },
    Pending: { dot: "bg-green-500", label: "On Track", bg: "bg-green-50", text: "text-green-700" },
  };
  const s = m[status] ?? { dot: "bg-gray-400", label: status, bg: "bg-gray-50", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}
function StatusBadge({ status }: { status: string }) {
  const m: Record<string, string> = {
    Evaluation: "bg-purple-100 text-purple-700 border-purple-200",
    Inspection: "bg-blue-100 text-blue-700 border-blue-200",
    "For Approval": "bg-red-100 text-red-600 border-red-200",
    Released: "bg-green-100 text-green-700 border-green-200",
    Returned: "bg-gray-100 text-gray-600 border-gray-200",
    "For Compliance": "bg-orange-100 text-orange-600 border-orange-200",
    "Initial Review": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Payment Verification": "bg-yellow-100 text-yellow-700 border-yellow-200",
  };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${m[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
}
function StepProgress({ currentStatus }: { currentStatus: string }) {
  const current = STEP_INDEX[currentStatus] ?? 2;
  return (
    <div className="w-full">
      <div className="flex items-center w-full">
        {STEPS.map((step, i) => {
          const done = i < current, active = i === current;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold border-2 transition-all
                ${done ? "bg-green-500 border-green-500 text-white" : active ? "bg-blue-700 border-blue-700 text-white ring-4 ring-blue-100" : "bg-white border-gray-300 text-gray-400"}`}>
                {done ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-1 ${done ? "bg-green-400" : "bg-gray-200"}`} />}
            </div>
          );
        })}
      </div>
      <div className="flex w-full mt-1.5">
        {STEPS.map((step, i) => {
          const done = i < current, active = i === current;
          return (
            <div key={step} className="flex-1 last:flex-none flex justify-center">
              <span className={`text-[10px] font-medium whitespace-nowrap ${done ? "text-green-600" : active ? "text-blue-700 font-bold" : "text-gray-400"}`}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── MAIN PAGE ── */
export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [app, setApp] = useState<AppRow | null>(null);
  const [loading, setLoading] = useState(true);

  const appId = decodeURIComponent(Array.isArray(params.id) ? params.id[0] : params.id ?? "");

  useEffect(() => {
    async function load() {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(appId);
      const query = supabase.from("applications_with_queue_status").select("*");
      const { data, error } = await (isUuid ? query.eq("id", appId) : query.eq("reference_no", appId)).single();
      if (error || !data) { console.error("[Detail] fetch error:", error?.message); setLoading(false); return; }
      const r = data as any;
      setApp({
        id: r.id ?? r.reference_no, reference_no: r.reference_no ?? "",
        applicant_name: r.applicant_name ?? "", project_name: r.project_name ?? "",
        app_type: r.app_type ?? r.permit_type ?? (r.reference_no?.startsWith("CLS") ? "C&LS" : "DP"),
        office: r.office ?? r.processing_office ?? (r.region ? `${r.region} - Planning` : "–"),
        status: r.status ?? r.current_stage ?? "", queue_status: r.queue_status ?? "",
        date_received: r.date_received ?? r.created_at ?? "", date_released: r.date_released ?? "",
        region: r.region ?? "", priority: r.priority ?? "", due_date: r.due_date ?? "",
      });
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setShowActions(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2">
      <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Loading application…
    </div>
  );

  if (!app) return (
    <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-500">
      <p className="font-semibold">Application not found</p>
      <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><ArrowLeft size={13} /> Back</button>
    </div>
  );

  const days = dueDaysLeft(app.due_date);
  const daysLabel = days === null ? "" : days < 0 ? `(${Math.abs(days)} days overdue)` : days === 0 ? "(Due today)" : `(${days} days left)`;
  const dueDateColor = days !== null && days < 0 ? "text-red-600" : days === 0 ? "text-orange-500" : "text-red-600";
  const appTypeFull = app.app_type === "DP" ? "Development Permit" : app.app_type === "C&LS" ? "Certificate of Land Status" : app.app_type;

  return (
    <div className="space-y-3">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Application Detail Page</h1>
          <p className="text-xs text-gray-500 mt-0.5">View application status, processor assignment, and evidence of completed sub-processes.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => router.push("/dashboard/applications")}
            className="flex items-center gap-1.5 text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">
            <ArrowLeft size={13} /> Back to Applications
          </button>
          {/* More Actions dropdown */}
          <div ref={actionsRef} className="relative">
            <button
              onClick={() => setShowActions((p) => !p)}
              className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors">
              More Actions <ChevronDown size={13} />
            </button>
            {showActions && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => { setShowActions(false); router.push(`/dashboard/reviews/${encodeURIComponent(app.reference_no)}`); }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  📋 For Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary strip ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-3 flex flex-wrap items-center justify-between gap-y-2">
        {[
          { label: "Application No.", node: <span className="text-sm font-bold text-blue-700">{app.reference_no}</span> },
          { label: "Application Type", node: <span className="text-sm font-semibold text-gray-800">{appTypeFull}</span> },
          { label: "Project Name", node: <span className="text-sm font-semibold text-gray-800">{app.project_name}</span> },
          { label: "Applicant / Developer", node: <span className="text-sm font-semibold text-gray-800">{app.applicant_name}</span> },
          { label: "Current Status", node: <StatusBadge status={app.status} /> },
          { label: "Traffic Light", node: <TrafficPill status={app.queue_status} /> },
          ...(app.due_date ? [{
            label: "Target Due Date", node:
              <p className={`text-sm font-bold leading-tight ${dueDateColor}`}>{fmtDate(app.due_date)}<br /><span className="text-xs font-normal">{daysLabel}</span></p>
          }] : []),
        ].map(({ label, node }) => (
          <div key={label}>
            <p className="text-[10px] text-gray-400 font-medium">{label}</p>
            <div className="mt-0.5">{node}</div>
          </div>
        ))}
      </div>

      {/* ── Main Layout Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          
          {/* Current Step */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4">
            <h3 className="text-xs font-bold text-gray-700 mb-4">Current Step</h3>
            <StepProgress currentStatus={app.status} />
          </div>

          {/* Info & Summary (Side by side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Application Information */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">📄 Application Information</h3>
              <dl className="space-y-1.5">
                {([
                  ["Application No.", app.reference_no],
                  ["Application Type", appTypeFull],
                  ["Project Name", app.project_name],
                  ["Location", app.office || "Brgy. 123, Quezon City"],
                  ["Date Received", fmtDate(app.date_received)],
                  ["Status", "badge"],
                  ["Traffic Light", "pill"],
                  ["Target Due Date", app.due_date ? `${fmtDate(app.due_date)} ${daysLabel}` : "–"],
                ] as [string, string][]).map(([label, val]) => (
                  <div key={label} className="flex items-start justify-between gap-2 text-xs">
                    <dt className="text-gray-500 whitespace-nowrap flex-shrink-0 font-medium">{label}</dt>
                    <dd className="text-gray-800 font-semibold text-right">
                      {val === "badge" ? <StatusBadge status={app.status} /> :
                        val === "pill" ? <TrafficPill status={app.queue_status} /> : val}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Applicant / Project Summary */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">👤 Applicant / Project Summary</h3>
              <dl className="space-y-1.5">
                {([
                  ["Applicant / Developer", app.applicant_name],
                  ["Contact No.", "0917-123-4567"],
                  ["Email", "juansantos@email.com"],
                  ["Lot Area", "1,500 sqm"],
                  ["Total Floor Area", "8,500 sqm"],
                  ["No. of Storeys", "10"],
                ] as [string, string][]).map(([label, val]) => (
                  <div key={label} className="flex items-start justify-between gap-2 text-xs">
                    <dt className="text-gray-500 whitespace-nowrap flex-shrink-0 font-medium">{label}</dt>
                    <dd className="text-gray-800 font-semibold text-right">{val}</dd>
                  </div>
                ))}
              </dl>
              <button className="mt-4 w-full text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 py-1.5 rounded-lg transition-colors">
                View Full Details
              </button>
            </div>
          </div>

          {/* Evidence Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-4 py-2.5 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-700">Evidence of Sub-Process Completion</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-4 py-2 font-bold text-gray-600">Sub-Process</th>
                    <th className="text-left px-4 py-2 font-bold text-gray-600">Status</th>
                    <th className="text-left px-4 py-2 font-bold text-gray-600 whitespace-nowrap">Date Completed</th>
                    <th className="text-left px-4 py-2 font-bold text-gray-600 whitespace-nowrap">Completed By</th>
                    <th className="text-left px-4 py-2 font-bold text-gray-600">Evidence / Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {SUB_PROCESSES.map((row) => (
                    <tr key={row.name} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
                          {row.name}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">{row.status}</span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{row.date}</td>
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{row.by}</td>
                      <td className="px-4 py-2.5 text-gray-500">{row.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width, full height) */}
        <div className="lg:col-span-1">
          {/* Assigned Processor + Activity Log + Files */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col gap-3 h-full">
            {/* Processor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">👥 Assigned Processor</h3>
                <button className="p-1 text-gray-400 hover:text-blue-600 rounded"><Bell size={14} /></button>
              </div>
              <dl className="space-y-1.5">
                {([
                  ["Evaluator", "Maria Reyes"],
                  ["Office", "QC – Planning Division"],
                  ["Date Assigned", "April 11, 2026"],
                  ["Latest Activity", "April 15, 2026 10:20 AM"],
                ] as [string, string][]).map(([label, val]) => (
                  <div key={label} className="flex items-start justify-between gap-2 text-xs">
                    <dt className="text-gray-500 whitespace-nowrap flex-shrink-0 font-medium">{label}</dt>
                    <dd className="text-gray-800 font-semibold text-right">{val}</dd>
                  </div>
                ))}
              </dl>
              <button className="mt-2 flex items-center justify-center gap-1 w-full text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 py-1.5 rounded-lg transition-colors">
                🔄 Reassign
              </button>
            </div>

            {/* Activity Log */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-700">Activity Log</h4>
                <button className="text-xs text-blue-600 hover:underline">View All</button>
              </div>
              <ul className="space-y-1.5">
                {ACTIVITY_LOG.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${a.dot}`} />
                    <div className="text-[10px] leading-snug">
                      <p className="text-gray-400">{a.date}</p>
                      <p className="text-gray-700">{a.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Files */}
            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-xs font-bold text-gray-700 mb-2">Supporting Evidence Files</h4>
              <ul className="space-y-1.5">
                {FILES.map((f) => (
                  <li key={f.name} className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${f.color}`}>{f.name}</span>
                    <button className="p-0.5 text-gray-400 hover:text-blue-600 transition-colors"><Download size={13} /></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
