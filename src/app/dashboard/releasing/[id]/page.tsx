"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  ArrowLeft, ChevronDown, CheckCircle2, Eye, Download,
  FileText, Send, Save, CheckCircle, Mail, Database, FileOutput
} from "lucide-react";
import ProceedReleaseModal from "../ProceedReleaseModal";

/* ── Types ── */
interface AppRow {
  id: string;
  reference_no: string; applicant_name: string; project_name: string;
  app_type: string; status: string; queue_status: string; due_date: string;
}

/* ── Static data matching screenshot ── */
const STEPS = ["Intake", "Auto-Check", "Requirements Validation", "Evaluation", "Inspection", "Approval", "Releasing"];
const STEP_INDEX: Record<string, number> = {
  "Initial Review": 0, "Auto-Check": 1, "Under Review": 1,
  "Requirements Validation": 2, "Evaluation": 3, "Inspection": 4, "Inspection in Progress": 4,
  "For Approval": 5, "Approval": 5, "Ready for Release": 6, "Released": 6, "Releasing": 6,
};

const RELEASE_DOCUMENTS = [
  { name: "Permit_Certificate.pdf", date: "April 22, 2026" },
  { name: "Decision_Letter.pdf",    date: "April 22, 2026" },
  { name: "Executive_Brief.pdf",    date: "April 21, 2026" },
  { name: "Routing_Slip.pdf",       date: "April 21, 2026" },
];

const RELEASE_TIMELINE = [
  { date: "Apr 22, 2026 10:15 AM", dot: "bg-green-500", text: "Permit / certificate generated", by: "Records Officer" },
  { date: "Apr 22, 2026 10:22 AM", dot: "bg-green-500", text: "Decision letter generated", by: "Records Officer" },
  { date: "Apr 22, 2026 10:35 AM", dot: "bg-yellow-400", text: "Sent to applicant via portal and email", by: "Records Officer" },
  { date: "Apr 22, 2026 10:42 AM", dot: "bg-green-500", text: "Release copy saved to records", by: "Records Officer" },
  { date: "Apr 22, 2026 10:50 AM", dot: "bg-green-500", text: "Release status updated to Released Successfully", by: "Records Officer" },
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
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded border bg-green-50 text-green-700 border-green-200`}>{status}</span>;
}

function StepProgress({ currentStatus }: { currentStatus: string }) {
  const current = STEP_INDEX[currentStatus] ?? 6;
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
export default function ReleasingPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [app, setApp] = useState<AppRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [showProceedModal, setShowProceedModal] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const appId = decodeURIComponent(Array.isArray(params.id) ? params.id[0] : params.id ?? "");

  useEffect(() => {
    async function load() {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(appId);
      const query = supabase.from("applications_with_queue_status").select("*");
      const { data, error } = await (isUuid ? query.eq("id", appId) : query.eq("reference_no", appId)).single();
      if (error || !data) { console.error("[Review] fetch error:", error?.message); setLoading(false); return; }
      const r = data as any;
      setApp({
        id: r.id,
        reference_no: r.reference_no ?? "", applicant_name: r.applicant_name ?? "",
        project_name: r.project_name ?? "",
        app_type: r.app_type ?? r.permit_type ?? (r.reference_no?.startsWith("CLS") ? "C&LS" : "DP"),
        status: "Ready for Release",
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
  const appTypeFull = app.app_type==="DP"?"Development Permit":app.app_type==="C&LS"?"Certificate of Land Status":app.app_type;

  return (
    <div className="space-y-3">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Releasing Page</h1>
          <p className="text-xs text-gray-500 mt-0.5">Generate release documents, send approved outputs to the applicant, and record final release details.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => router.push(`/dashboard/applications/${encodeURIComponent(app.reference_no)}`)}
            className="flex items-center gap-1.5 text-xs border border-blue-600 text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-semibold">
            <ArrowLeft size={13}/> Back to Application
          </button>
          <div ref={actionsRef} className="relative">
            <button onClick={() => setShowActions(p=>!p)}
              className="flex items-center gap-1 text-xs border border-blue-600 text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-semibold transition-colors">
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
          { label: "Traffic Light",         node: <TrafficPill status="Due Soon"/> },
          { label: "Target Release Date",   node: <p className="text-sm font-bold leading-tight text-gray-800">April 22, 2026</p> },
        ].map(({label, node}) => (
          <div key={label}>
            <p className="text-[10px] text-gray-400 font-medium">{label}</p>
            <div className="mt-0.5">{node}</div>
          </div>
        ))}
      </div>

      {/* ── Step Progress ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4 w-full">
        <StepProgress currentStatus={app.status}/>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-3 items-stretch">
        
        {/* Release Actions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col h-full">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Release Actions</h3>
          
          <div className="space-y-2 flex-1">
            {/* Generate Permit */}
            <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50/50">
              <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <FileOutput size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">Generate Permit / Certificate</p>
                <p className="text-[10px] text-gray-500 truncate">Create the official permit or certificate for approved application.</p>
              </div>
              <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold shrink-0">Ready</span>
            </div>

            {/* Generate Decision Letter */}
            <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50/50">
              <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">Generate Decision Letter</p>
                <p className="text-[10px] text-gray-500 truncate">Prepare the formal decision letter for applicant release.</p>
              </div>
              <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold shrink-0">Ready</span>
            </div>

            {/* Send to Applicant */}
            <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50/50">
              <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Mail size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">Send to Applicant</p>
                <p className="text-[10px] text-gray-500 truncate">Deliver the approved output through portal notification and email.</p>
              </div>
              <span className="inline-block px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-[10px] font-bold shrink-0">Pending</span>
            </div>

            {/* Save to Records */}
            <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50/50">
              <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Database size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">Save to Records</p>
                <p className="text-[10px] text-gray-500 truncate">Archive final release documents and release details in the records repository.</p>
              </div>
              <span className="inline-block px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-[10px] font-bold shrink-0">Pending</span>
            </div>
          </div>

          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
            <button onClick={() => setShowProceedModal(true)} className="flex-1 bg-[#0033A0] hover:bg-blue-800 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Send size={14} /> Proceed to Release
            </button>
            <button className="flex-1 border border-blue-600 text-blue-700 hover:bg-blue-50 text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              <FileText size={14} /> Save Draft
            </button>
          </div>
        </div>

        {/* Right Side: Summary & Documents */}
        <div className="flex flex-col gap-3">
          {/* Release Summary */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Release Summary</h3>
            <div className="grid grid-cols-[140px_1fr] gap-y-1.5 text-xs">
              <div className="text-gray-500 font-medium">Permit / Certificate No.:</div>
              <div className="text-gray-800 font-semibold">{app.reference_no}-R</div>
              
              <div className="text-gray-500 font-medium">Date Approved:</div>
              <div className="text-gray-800">April 20, 2026</div>
              
              <div className="text-gray-500 font-medium">Date Prepared:</div>
              <div className="text-gray-800">April 21, 2026</div>
              
              <div className="text-gray-500 font-medium">Date Released:</div>
              <div className="text-gray-800">April 22, 2026</div>
              
              <div className="text-gray-500 font-medium">Released By:</div>
              <div className="text-gray-800">Records Section</div>
              
              <div className="text-gray-500 font-medium">Delivery Channel:</div>
              <div className="text-gray-800">Portal + Email</div>
              
              <div className="text-gray-500 font-medium">Release Status:</div>
              <div className="text-green-600 font-bold">Released Successfully</div>
            </div>
            
            <div className="mt-3 flex items-start gap-1.5 text-[10px] text-green-700 font-medium bg-green-50 p-2 rounded">
              <CheckCircle size={14} className="shrink-0 text-green-600 mt-0.5" />
              <span>Final output successfully prepared and ready for official release.</span>
            </div>
          </div>

          {/* Release Documents */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex-1">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Release Documents</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-700 font-bold">
                    <th className="pb-2 px-2">Document Name</th>
                    <th className="pb-2 px-2">Date</th>
                    <th className="pb-2 px-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {RELEASE_DOCUMENTS.map((doc) => (
                    <tr key={doc.name} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2 text-gray-800 font-medium">
                          <FileText className="text-red-500 shrink-0" size={14}/>
                          <span className="truncate">{doc.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-gray-600 whitespace-nowrap">{doc.date}</td>
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                          <button className="hover:text-blue-800"><Eye size={14}/></button>
                          <button className="hover:text-blue-800"><Download size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Timeline / Activity Log ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Release Timeline / Activity Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left">
            <thead>
              <tr className="border-b border-gray-100 text-gray-700 font-bold">
                <th className="pb-2 px-2 pl-6">Date / Time</th>
                <th className="pb-2 px-2">Activity</th>
                <th className="pb-2 px-2">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 relative">
              {RELEASE_TIMELINE.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 relative">
                  <td className="py-2.5 px-2 relative font-medium text-gray-600 pl-6 w-48 shrink-0">
                     <div className={`w-2 h-2 rounded-full absolute left-1.5 top-1/2 -translate-y-1/2 ${item.dot}`}></div>
                     {item.date}
                  </td>
                  <td className="py-2.5 px-2 text-gray-700">{item.text}</td>
                  <td className="py-2.5 px-2 text-gray-600">{item.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {showProceedModal && app && (
        <ProceedReleaseModal app={app} onClose={() => setShowProceedModal(false)} />
      )}
    </div>
  );
}
