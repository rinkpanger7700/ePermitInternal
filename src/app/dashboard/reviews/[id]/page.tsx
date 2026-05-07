"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  ArrowLeft, ChevronDown, CheckCircle2, AlertTriangle,
  XCircle, Eye, Download, Plus, Save,
} from "lucide-react";
import IssueNDRModal from "../IssueNDRModal";

/* ── Types ── */
interface AppRow {
  reference_no: string; applicant_name: string; project_name: string;
  app_type: string; status: string; queue_status: string; due_date: string;
}

/* ── Static data matching screenshot ── */
const STEPS = ["Intake", "Auto-Check", "Requirements Validation", "Evaluation", "Inspection", "Approval", "Releasing"];
const STEP_INDEX: Record<string, number> = {
  "Initial Review": 0, "Auto-Check": 1, "Payment Verification": 1,
  "Requirements Validation": 2, "Evaluation": 3, "Inspection": 4,
  "For Approval": 5, "Approval": 5, "Released": 6, "Releasing": 6,
};

const REQUIREMENTS = [
  { no: 1, name: "Completed Application Form", status: "Complete",         note: "Signed and readable" },
  { no: 2, name: "Architectural Plans",        status: "Complete",         note: "Verified" },
  { no: 3, name: "Structural Plans",           status: "Complete",         note: "Verified" },
  { no: 4, name: "Location Map",               status: "Complete",         note: "Verified" },
  { no: 5, name: "Proof of Ownership",         status: "Needs Clarification", note: "Uploaded document appears expired" },
  { no: 6, name: "Others (as required)",       status: "Missing",          note: "Additional barangay clearance not attached" },
];

const UPLOADED_FILES = [
  { name: "App_Form.pdf",            date: "Mar 28, 2026" },
  { name: "Plans_Architectural.pdf", date: "Mar 28, 2026" },
  { name: "Plans_Structural.pdf",    date: "Mar 29, 2026" },
  { name: "Location_Map.pdf",        date: "Mar 29, 2026" },
  { name: "Proof_Ownership.pdf",     date: "Mar 30, 2026" },
];

const VALIDATION_FINDINGS = [
  { item: "Checklist Review",          result: "Completed",         evidence: "Checklist saved and validator remarks recorded",    by: "Maria Reyes",        date: "Mar 31, 2026" },
  { item: "File Review",               result: "Completed",         evidence: "All uploaded files opened and inspected",           by: "Maria Reyes",        date: "Apr 1, 2026" },
  { item: "Auto-Check Verification",   result: "Completed",         evidence: "System findings reviewed and confirmed",            by: "System / Maria Reyes", date: "Apr 2, 2026" },
  { item: "Ownership Document Review", result: "Needs Clarification", evidence: "Title copy appears expired",                      by: "Maria Reyes",        date: "Apr 3, 2026" },
];

/* ── Helpers ── */
function fmtDate(d?: string | null) {
  if (!d) return "–";
  const dt = new Date(d); if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
}
function dueDaysLeft(due: string) {
  if (!due) return null;
  const t = new Date(); t.setHours(0,0,0,0);
  const d = new Date(due); d.setHours(0,0,0,0);
  return Math.ceil((d.getTime()-t.getTime())/86400000);
}

/* ── Sub-components ── */
function TrafficPill({ status }: { status: string }) {
  const m: Record<string,{dot:string;label:string;bg:string;text:string}> = {
    Overdue:     {dot:"bg-red-500",    label:"Overdue",       bg:"bg-red-50",    text:"text-red-600"},
    "Due Today": {dot:"bg-orange-400", label:"Due Today",     bg:"bg-orange-50", text:"text-orange-600"},
    "Due Soon":  {dot:"bg-yellow-400", label:"Near Deadline", bg:"bg-yellow-50", text:"text-yellow-700"},
    Pending:     {dot:"bg-green-500",  label:"On Track",      bg:"bg-green-50",  text:"text-green-700"},
  };
  const s = m[status] ?? {dot:"bg-gray-400",label:status,bg:"bg-gray-50",text:"text-gray-600"};
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`}/>{s.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const m: Record<string,string> = {
    Evaluation:"bg-purple-100 text-purple-700 border-purple-200",
    Inspection:"bg-blue-100 text-blue-700 border-blue-200",
    "For Approval":"bg-red-100 text-red-600 border-red-200",
    Released:"bg-green-100 text-green-700 border-green-200",
    Returned:"bg-gray-100 text-gray-600 border-gray-200",
    "Requirements Validation":"bg-blue-100 text-blue-700 border-blue-200",
    "Initial Review":"bg-indigo-100 text-indigo-700 border-indigo-200",
  };
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${m[status]??"bg-gray-100 text-gray-600 border-gray-200"}`}>{status}</span>;
}

function ReqBadge({ status }: { status: string }) {
  if (status === "Complete")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded"><CheckCircle2 size={11}/>Complete</span>;
  if (status === "Needs Clarification")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded"><AlertTriangle size={11}/>Needs Clarification</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded"><XCircle size={11}/>Missing</span>;
}

function ValidationBadge({ result }: { result: string }) {
  if (result === "Completed")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded"><CheckCircle2 size={11}/>Completed</span>;
  if (result === "Needs Clarification")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded"><AlertTriangle size={11}/>Needs Clarification</span>;
  return <span className="inline-block text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{result}</span>;
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
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border-2 transition-all
                ${done?"bg-green-500 border-green-500 text-white":active?"bg-blue-700 border-blue-700 text-white ring-4 ring-blue-100":"bg-white border-gray-300 text-gray-400"}`}>
                {done?<CheckCircle2 size={14}/>:i+1}
              </div>
              {i<STEPS.length-1&&<div className={`flex-1 h-1 ${done?"bg-green-400":"bg-gray-200"}`}/>}
            </div>
          );
        })}
      </div>
      <div className="flex w-full mt-1.5">
        {STEPS.map((step, i) => {
          const done = i<current, active = i===current;
          return (
            <div key={step} className="flex-1 last:flex-none flex justify-center">
              <span className={`text-[9px] font-medium text-center leading-tight whitespace-nowrap ${done?"text-green-600":active?"text-blue-700 font-bold":"text-gray-400"}`}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── MAIN PAGE ── */
export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [app, setApp] = useState<AppRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [showNdrModal, setShowNdrModal] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const actionsRef = useRef<HTMLDivElement>(null);

  const appId = decodeURIComponent(Array.isArray(params.id) ? params.id[0] : params.id ?? "");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("applications_with_queue_status").select("*").eq("reference_no", appId).single();
      if (error || !data) { console.error("[Review] fetch error:", error?.message); setLoading(false); return; }
      const r = data as any;
      setApp({
        reference_no: r.reference_no ?? "", applicant_name: r.applicant_name ?? "",
        project_name: r.project_name ?? "",
        app_type: r.app_type ?? r.permit_type ?? (r.reference_no?.startsWith("CLS") ? "C&LS" : "DP"),
        status: "Requirements Validation",
        queue_status: r.queue_status ?? "", due_date: r.due_date ?? "",
      });
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  useEffect(() => {
    function h(e: MouseEvent) { if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setShowActions(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2">
      <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      Loading…
    </div>
  );

  if (!app) return (
    <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-500">
      <p className="font-semibold">Application not found</p>
      <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><ArrowLeft size={13}/>Back</button>
    </div>
  );

  const days = dueDaysLeft(app.due_date);
  const daysLabel = days===null?"":days<0?`(${Math.abs(days)} days overdue)`:days===0?"(Due today)":`(${days} days left)`;
  const dueDateColor = days!==null&&days<0?"text-red-600":days===0?"text-orange-500":"text-red-600";
  const appTypeFull = app.app_type==="DP"?"Development Permit":app.app_type==="C&LS"?"Certificate of Land Status":app.app_type;

  return (
    <div className="space-y-3">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Document Review / Requirements Validation</h1>
          <p className="text-xs text-gray-500 mt-0.5">Validate submitted requirements, review uploaded files, and take action on compliance issues.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => router.push(`/dashboard/applications/${encodeURIComponent(app.reference_no)}`)}
            className="flex items-center gap-1.5 text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">
            <ArrowLeft size={13}/> Back to Application
          </button>
          <div ref={actionsRef} className="relative">
            <button onClick={() => setShowActions(p=>!p)}
              className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors">
              More Actions <ChevronDown size={13}/>
            </button>
            {showActions && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button onClick={() => { setShowActions(false); router.push(`/dashboard/applications/${encodeURIComponent(app.reference_no)}`); }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  📄 View Application
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary strip ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-3 flex flex-wrap items-center justify-between gap-y-2">
        {[
          { label: "Application No.",       node: <span className="text-sm font-bold text-blue-700">{app.reference_no}</span> },
          { label: "Application Type",      node: <span className="text-sm font-semibold text-gray-800">{appTypeFull}</span> },
          { label: "Project Name",          node: <span className="text-sm font-semibold text-gray-800">{app.project_name}</span> },
          { label: "Applicant / Developer", node: <span className="text-sm font-semibold text-gray-800">{app.applicant_name}</span> },
          { label: "Current Status",        node: <StatusBadge status={app.status}/> },
          { label: "Traffic Light",         node: <TrafficPill status={app.queue_status}/> },
          ...(app.due_date ? [{ label: "Target Due Date", node:
            <p className={`text-sm font-bold leading-tight ${dueDateColor}`}>{fmtDate(app.due_date)}<br/><span className="text-xs font-normal">{daysLabel}</span></p>
          }] : []),
        ].map(({label, node}) => (
          <div key={label}>
            <p className="text-[10px] text-gray-400 font-medium">{label}</p>
            <div className="mt-0.5">{node}</div>
          </div>
        ))}
      </div>

      {/* ── Step Progress ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4">
        <StepProgress currentStatus="Requirements Validation"/>
      </div>

      {/* ── Three columns: Requirements | Files | Auto-Check ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Requirements Checklist */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-1.5">
            <span className="text-xs">📋</span>
            <h3 className="text-xs font-bold text-gray-700">Requirements Checklist</h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-3 py-2 font-semibold text-gray-500">Requirement</th>
                <th className="text-left px-2 py-2 font-semibold text-gray-500">Status</th>
                <th className="text-left px-2 py-2 font-semibold text-gray-500">Review Note</th>
              </tr>
            </thead>
            <tbody>
              {REQUIREMENTS.map((r) => (
                <tr key={r.no} className="border-b border-gray-50">
                  <td className="px-3 py-2 text-gray-700">{r.no}. {r.name}</td>
                  <td className="px-2 py-2"><ReqBadge status={r.status}/></td>
                  <td className="px-2 py-2 text-gray-500 text-[10px]">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-3 py-2.5 border-t border-gray-100 flex items-center gap-2">
            <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline border border-gray-200 px-2.5 py-1 rounded-md hover:bg-gray-50">
              View Full Checklist
            </button>
            <button className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 px-2.5 py-1 rounded-md hover:bg-gray-50">
              <Download size={11}/> Download Checklist
            </button>
          </div>
        </div>

        {/* Uploaded Files */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-1.5">
            <span className="text-xs">📁</span>
            <h3 className="text-xs font-bold text-gray-700">Uploaded Files</h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-3 py-2 font-semibold text-gray-500">File Name</th>
                <th className="text-left px-2 py-2 font-semibold text-gray-500 whitespace-nowrap">Upload Date</th>
                <th className="text-center px-2 py-2 font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {UPLOADED_FILES.map((f) => (
                <tr key={f.name} className="border-b border-gray-50">
                  <td className="px-3 py-2 text-blue-600 font-medium">📄 {f.name}</td>
                  <td className="px-2 py-2 text-gray-500 whitespace-nowrap">{f.date}</td>
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <button className="text-gray-400 hover:text-blue-600 transition-colors"><Eye size={13}/></button>
                      <button className="text-gray-400 hover:text-blue-600 transition-colors"><Download size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-3 py-2.5 border-t border-gray-100">
            <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
              <Plus size={11}/> View all files
            </button>
          </div>
        </div>

        {/* Auto-Check Result */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <AlertTriangle size={13} className="text-gray-500"/>
            <h3 className="text-xs font-bold text-gray-700">Auto-Check Result</h3>
          </div>
          <div className="flex flex-col items-center py-4 gap-2">
            <div className="w-14 h-14 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center">
              <AlertTriangle size={28} className="text-orange-400"/>
            </div>
            <span className="text-lg font-bold text-orange-500">Incomplete</span>
          </div>
          <ul className="space-y-1.5 mb-4">
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"/>
              1 missing requirement
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"/>
              1 incorrect / expired document
            </li>
          </ul>
          <button className="w-full text-xs font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 py-1.5 rounded-lg transition-colors">
            View Details
          </button>
        </div>
      </div>

      {/* ── Bottom row: Validation Findings | Reviewer Action Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Validation Findings – spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-1.5">
            <span className="text-xs">📊</span>
            <h3 className="text-xs font-bold text-gray-700">Validation Findings / Evidence</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-2 font-bold text-gray-600">Validation Item</th>
                  <th className="text-left px-3 py-2 font-bold text-gray-600">Result</th>
                  <th className="text-left px-3 py-2 font-bold text-gray-600">Evidence / Reference</th>
                  <th className="text-left px-3 py-2 font-bold text-gray-600 whitespace-nowrap">Completed By</th>
                  <th className="text-left px-3 py-2 font-bold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {VALIDATION_FINDINGS.map((row) => (
                  <tr key={row.item} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 font-semibold text-gray-800">{row.item}</td>
                    <td className="px-3 py-2.5"><ValidationBadge result={row.result}/></td>
                    <td className="px-3 py-2.5 text-gray-500">{row.evidence}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.by}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reviewer Action Panel */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🖊️</span>
            <h3 className="text-xs font-bold text-gray-700">Reviewer Action Panel</h3>
          </div>
          <button onClick={() => router.push(`/dashboard/inspections/${encodeURIComponent(app.reference_no)}`)} className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
            <Save size={13}/> Save and Review
          </button>
          <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold py-2.5 rounded-lg transition-colors">
            <CheckCircle2 size={13}/> Mark as Compliant
          </button>
          <button onClick={() => setShowNdrModal(true)} className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold py-2.5 rounded-lg transition-colors">
            <AlertTriangle size={13}/> Issue NDR
          </button>

          {/* Reviewer Notes */}
          <div>
            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Reviewer Notes</label>
            <textarea
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="Enter findings or instructions..."
              maxLength={1380}
              rows={4}
              className="mt-1 w-full text-xs border border-gray-200 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400"
            />
            <div className="text-right text-[10px] text-gray-400 mt-0.5">
              {reviewerNotes.length} / 1380
            </div>
          </div>
        </div>
      </div>
      {showNdrModal && <IssueNDRModal app={app} onClose={() => setShowNdrModal(false)} />}
    </div>
  );
}
