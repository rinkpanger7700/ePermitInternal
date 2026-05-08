"use client";

import { X, ArrowLeft, MoreVertical, Bell, Download, ChevronRight, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

/* ── Types ── */
export interface AppRow {
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

/* ── Static mock detail data (would come from DB in production) ── */
const STEPS = ["Intake", "Auto-Check", "Evaluation", "Inspection", "Approval", "Releasing"];

const STEP_INDEX: Record<string, number> = {
  "Initial Review": 0,
  "Auto-Check": 1,
  "Under Review": 1,
  "Evaluation": 2,
  "Inspection": 3,
  "For Approval": 4,
  "Approval": 4,
  "Released": 5,
  "Releasing": 5,
};

const SUB_PROCESSES = [
  { name: "Intake Review", status: "Completed", date: "Apr 10, 2026", by: "Records Section", evidence: "Intake checklist verified, timestamp logged" },
  { name: "Auto-Check Validation", status: "Completed", date: "Apr 10, 2026", by: "System", evidence: "Auto-check passed, system validation result available" },
  { name: "Initial Evaluation", status: "Completed", date: "Apr 15, 2026", by: "Maria Reyes", evidence: "Evaluation remarks saved, signed review note attached" },
  { name: "Payment Recording", status: "Completed", date: "Apr 13, 2026", by: "Cashier", evidence: "Official receipt OR-2026-0188 linked" },
  { name: "Requirements Validation", status: "Completed", date: "Apr 12, 2026", by: "Maria Reyes", evidence: "Validation checklist and uploaded supporting files" },
];

const ACTIVITY_LOG = [
  { date: "Apr 15, 2026 10:20 AM", text: "Evaluation started by Maria Reyes" },
  { date: "Apr 13, 2026 02:11 PM", text: "Payment recorded" },
  { date: "Apr 12, 2026 09:05 AM", text: "Requirements validated" },
  { date: "Apr 10, 2026 04:30 PM", text: "Application received" },
  { date: "Apr 10, 2026 04:25 PM", text: "Encoded by Records Section" },
];

const FILES = [
  { name: "Evaluation Report.pdf", color: "text-red-500" },
  { name: "Validation Checklist.pdf", color: "text-red-500" },
  { name: "Official Receipt.pdf", color: "text-red-500" },
  { name: "Auto-Check Result", color: "text-blue-500" },
  { name: "Routing Slip", color: "text-blue-500" },
];

/* ── Helpers ── */
function fmtDate(d: string | null | undefined) {
  if (!d) return "–";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
}

function dueDaysLeft(due: string) {
  if (!due) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(due); d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
}

function TrafficPill({ status }: { status: string }) {
  const map: Record<string, { dot: string; label: string; bg: string; text: string }> = {
    Overdue: { dot: "bg-red-500", label: "Overdue", bg: "bg-red-50", text: "text-red-600" },
    "Due Today": { dot: "bg-orange-400", label: "Due Today", bg: "bg-orange-50", text: "text-orange-600" },
    "Due Soon": { dot: "bg-yellow-400", label: "Near Deadline", bg: "bg-yellow-50", text: "text-yellow-700" },
    Pending: { dot: "bg-green-500", label: "On Track", bg: "bg-green-50", text: "text-green-700" },
  };
  const s = map[status] ?? { dot: "bg-gray-400", label: status, bg: "bg-gray-50", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Evaluation: "bg-purple-100 text-purple-700 border-purple-200",
    Inspection: "bg-blue-100 text-blue-700 border-blue-200",
    "For Approval": "bg-red-100 text-red-600 border-red-200",
    Released: "bg-green-100 text-green-700 border-green-200",
    Returned: "bg-gray-100 text-gray-600 border-gray-200",
    "For Compliance": "bg-orange-100 text-orange-600 border-orange-200",
    "Initial Review": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Under Review": "bg-yellow-100 text-yellow-700 border-yellow-200",
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded border ${map[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
}

/* ── Step Progress ── */
function StepProgress({ currentStatus }: { currentStatus: string }) {
  const current = STEP_INDEX[currentStatus] ?? 2;
  return (
    <div className="w-full">
      {/* Circles + connecting lines row */}
      <div className="flex items-center w-full">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold border-2 transition-all
                ${done ? "bg-green-500 border-green-500 text-white" :
                  active ? "bg-blue-700 border-blue-700 text-white ring-4 ring-blue-100" :
                    "bg-white border-gray-300 text-gray-400"}`}>
                {done ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              {/* Connector line (not on last step) */}
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-1 ${done ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
      {/* Labels row */}
      <div className="flex w-full mt-1.5">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={step} className="flex-1 last:flex-none flex justify-center">
              <span className={`text-[10px] font-medium whitespace-nowrap ${done ? "text-green-600" : active ? "text-blue-700 font-bold" : "text-gray-400"
                }`}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ── Sub-process table row ── */
function SubRow({ row }: { row: typeof SUB_PROCESSES[0] }) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50">
      <td className="px-4 py-3 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
          {row.name}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded bg-green-100 text-green-700">
          {row.status}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{row.date}</td>
      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{row.by}</td>
      <td className="px-4 py-3 text-xs text-gray-500">{row.evidence}</td>
    </tr>
  );
}

/* ── MAIN MODAL ── */
export default function CaseDetailModal({
  app,
  onClose,
}: {
  app: AppRow;
  onClose: () => void;
}) {
  const days = dueDaysLeft(app.due_date);
  const daysLabel = days === null ? "" : days < 0 ? `(${Math.abs(days)} days overdue)` : days === 0 ? "(Due today)" : `(${days} days left)`;
  const dueDateColor = days !== null && days < 0 ? "text-red-600" : days === 0 ? "text-orange-500" : "text-red-600";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm py-6 px-4">
      <div className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-6xl">

        {/* ── Modal Header ── */}
        <div className="bg-white rounded-t-2xl border-b border-gray-200 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Application Detail Page</h1>
              <p className="text-xs text-gray-500 mt-0.5">View application status, processor assignment, and evidence of completed sub-processes.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Applications
              </button>
              <button className="flex items-center gap-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors font-medium">
                More Actions
                <ChevronRight size={14} />
              </button>
              <button onClick={onClose} className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Summary strip */}
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-gray-500">Application No.</p>
              <p className="text-sm font-bold text-blue-700">{app.reference_no}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Application Type</p>
              <p className="text-sm font-semibold text-gray-800">{app.app_type === "DP" ? "Development Permit" : app.app_type === "C&LS" ? "Certificate of Land Status" : app.app_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Project Name</p>
              <p className="text-sm font-semibold text-gray-800">{app.project_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Applicant / Developer</p>
              <p className="text-sm font-semibold text-gray-800">{app.applicant_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Current Status</p>
              <StatusBadge status={app.status} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Traffic Light</p>
              <TrafficPill status={app.queue_status} />
            </div>
            {app.due_date && (
              <div>
                <p className="text-xs text-gray-500">Target Due Date</p>
                <p className={`text-sm font-bold ${dueDateColor}`}>
                  {fmtDate(app.due_date)}
                  <span className="text-xs font-normal ml-1">{daysLabel}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-5">

          {/* Three-column info cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Application Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-blue-600">📄</span> Application Information
              </h3>
              <dl className="space-y-2 text-xs">
                {[
                  ["Application No.", app.reference_no],
                  ["Application Type", app.app_type === "DP" ? "Development Permit" : app.app_type],
                  ["Project Name", app.project_name],
                  ["Location", app.office || "–"],
                  ["Date Received", fmtDate(app.date_received)],
                  ["Status", null],
                  ["Traffic Light", null],
                  ["Target Due Date", app.due_date ? `${fmtDate(app.due_date)} ${daysLabel}` : "–"],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex items-start justify-between gap-2">
                    <dt className="text-gray-500 whitespace-nowrap flex-shrink-0">{label}</dt>
                    <dd className="text-gray-800 font-medium text-right">
                      {label === "Status" ? <StatusBadge status={app.status} /> :
                        label === "Traffic Light" ? <TrafficPill status={app.queue_status} /> :
                          val}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Applicant / Project Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-blue-600">👤</span> Applicant / Project Summary
              </h3>
              <dl className="space-y-2 text-xs">
                {[
                  ["Applicant / Developer", app.applicant_name],
                  ["Contact No.", "0917-123-4567"],
                  ["Email", "juansantos@email.com"],
                  ["Lot Area", "1,500 sqm"],
                  ["Total Floor Area", "8,500 sqm"],
                  ["No. of Storeys", "10"],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-start justify-between gap-2">
                    <dt className="text-gray-500 whitespace-nowrap flex-shrink-0">{label}</dt>
                    <dd className="text-gray-800 font-medium text-right">{val}</dd>
                  </div>
                ))}
              </dl>
              <button className="mt-4 w-full text-xs font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 py-1.5 rounded-lg transition-colors">
                View Full Details
              </button>
            </div>

            {/* Assigned Processor */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-blue-600">👥</span> Assigned Processor
                </h3>
                <button className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors">
                  <Bell size={16} />
                </button>
              </div>
              <dl className="space-y-2 text-xs">
                {[
                  ["Evaluator", "Maria Reyes"],
                  ["Office", "QC – Planning Division"],
                  ["Date Assigned", "April 11, 2026"],
                  ["Latest Activity", "April 15, 2026 10:20 AM"],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-start justify-between gap-2">
                    <dt className="text-gray-500 whitespace-nowrap flex-shrink-0">{label}</dt>
                    <dd className="text-gray-800 font-medium text-right">{val}</dd>
                  </div>
                ))}
              </dl>
              <button className="mt-4 flex items-center justify-center gap-1.5 w-full text-xs font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 py-1.5 rounded-lg transition-colors">
                🔄 Reassign
              </button>

              {/* Activity Log */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-gray-800">Activity Log</h4>
                  <button className="text-xs text-blue-600 hover:underline">View All</button>
                </div>
                <ul className="space-y-2">
                  {ACTIVITY_LOG.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${i === 0 ? "bg-green-500" : i === 1 ? "bg-blue-500" : "bg-gray-400"}`} />
                      <div>
                        <p className="text-gray-500">{a.date}</p>
                        <p className="text-gray-700">{a.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Supporting Evidence Files */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold text-gray-800 mb-2">Supporting Evidence Files</h4>
                <ul className="space-y-2">
                  {FILES.map((f) => (
                    <li key={f.name} className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${f.color}`}>{f.name}</span>
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Download size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Current Step */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Current Step</h3>
            <StepProgress currentStatus={app.status} />
          </div>

          {/* Evidence of Sub-Process Completion */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">Evidence of Sub-Process Completion</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-600">Sub-Process</th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-600">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-600">Date Completed</th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-600">Completed By</th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-600">Evidence / Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {SUB_PROCESSES.map((row) => <SubRow key={row.name} row={row} />)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
