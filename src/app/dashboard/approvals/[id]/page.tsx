"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  ArrowLeft, ChevronDown, CheckCircle2, Eye, Download,
  FileText, ImageIcon, FileCheck, Info
} from "lucide-react";
import RoutingHistoryModal from "../../components/RoutingHistoryModal";

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
  "For Approval": 5, "Approval": 5, "Released": 6, "Releasing": 6,
};

const SUPPORTING_FILES = [
  { name: "Inspection_Report.pdf", type: "PDF", by: "Ramon Dela Cruz", date: "Apr 20, 2026" },
  { name: "Executive_Brief.pdf", type: "PDF", by: "Ramon Dela Cruz", date: "Apr 19, 2026" },
  { name: "Site_Photos.zip", type: "ZIP", by: "Ramon Dela Cruz", date: "Apr 19, 2026" },
];

const APPROVAL_ATTACHMENTS = [
  { name: "Approval_Checklist.pdf", type: "PDF", by: "Maria Reyes", date: "Apr 20, 2026" },
  { name: "Inspection_Report.pdf", type: "PDF", by: "Ramon Dela Cruz", date: "Apr 20, 2026" },
  { name: "Executive_Brief.pdf", type: "PDF", by: "Ramon Dela Cruz", date: "Apr 19, 2026" },
  { name: "Routing_Slip.pdf", type: "PDF", by: "System", date: "Apr 18, 2026" },
];

const ACTIVITIES = [
  { date: "Apr 20, 2026 09:15 AM", dot: "bg-blue-600", text: "Inspection report submitted" },
  { date: "Apr 19, 2026 04:30 PM", dot: "bg-green-500", text: "Executive brief generated" },
  { date: "Apr 19, 2026 02:10 PM", dot: "bg-green-500", text: "Inspection completed by Ramon Dela Cruz" },
  { date: "Apr 18, 2026 05:10 PM", dot: "bg-gray-400", text: "Evaluation endorsed for approval" },
];

/* ── Helpers ── */
function fmtDate(d?: string | null) {
  if (!d) return "–";
  const dt = new Date(d); if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
}
function dueDaysLeft(due: string) {
  if (!due) return null;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const d = new Date(due); d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - t.getTime()) / 86400000);
}

/* ── Sub-components ── */
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
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />{s.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200`}>{status}</span>;
}

function SignaturePad() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#374151";
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    // Scale coordinates based on canvas internal resolution vs actual display size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="relative w-full h-full flex flex-col min-h-[70px]">
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        className="w-full h-full cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button
        type="button"
        onClick={clear}
        className="absolute top-1 right-1 text-[9px] text-gray-400 hover:text-red-500 bg-white/80 px-1 rounded z-10"
      >
        Clear
      </button>
      {/* PNPKI Note */}
      {/* <div className="absolute -bottom-2 -right-4 bg-yellow-400 text-gray-900 text-[9px] font-bold px-4 py-1.5 shadow-md transform -rotate-6 pointer-events-none z-10">
        PNPKI will be used for<br/>the e-signature
      </div> */}
    </div>
  );
}

function StepProgress({ currentStatus }: { currentStatus: string }) {
  const current = STEP_INDEX[currentStatus] ?? 5;
  return (
    <div className="w-full">
      <div className="flex items-center w-full">
        {STEPS.map((step, i) => {
          const done = i < current, active = i === current;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border-2 transition-all
                ${done ? "bg-green-500 border-green-500 text-white" : active ? "bg-blue-700 border-blue-700 text-white ring-4 ring-blue-100" : "bg-white border-gray-300 text-gray-400"}`}>
                {done ? <CheckCircle2 size={14} /> : i + 1}
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
              <span className={`text-[9px] font-medium text-center leading-tight whitespace-nowrap ${done ? "text-green-600" : active ? "text-blue-700 font-bold" : "text-gray-400"}`}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── MAIN PAGE ── */
export default function ApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [app, setApp] = useState<AppRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const [outputType, setOutputType] = useState("Inspection Report");
  const [decision, setDecision] = useState("Approve / Endorse");

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
        status: "For Approval",
        queue_status: r.queue_status ?? "", due_date: r.due_date ?? "",
      });
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  const handleApproveAndSign = async () => {
    if (!app) return;
    setFormLoading(true);

    // Step 1: Update the approval record to 'Approved'
    const { error: approvalErr } = await supabase
      .from("approvals")
      .update({ status: "Approved" })
      .eq("application_id", app.id);

    if (approvalErr) {
      // If no approval record exists yet, insert one as Approved
      const { error: insertErr } = await supabase
        .from("approvals")
        .insert({
          application_id: app.id,
          approver_name: "Regional Director",
          approval_date: new Date().toISOString().split("T")[0],
          status: "Approved",
        });
      if (insertErr) {
        setMessage({ text: "Error approving: " + insertErr.message, type: "error" });
        setFormLoading(false);
        return;
      }
    }

    // Step 2: Update the application stage directly
    await supabase
      .from("applications")
      .update({ current_stage: "Ready for Release" })
      .eq("id", app.id);

    // Step 3: Insert a record into the releasing table
    await supabase
      .from("releasing")
      .insert({
        application_id: app.id,
        released_by: "Pending Assignment",
        release_date: new Date().toISOString().split("T")[0],
        status: "Ready",
      });

    setMessage({ text: "Application approved! Moving to Releasing...", type: "success" });
    setTimeout(() => {
      router.push("/dashboard/approvals");
    }, 1500);
  };

  useEffect(() => {
    function h(e: MouseEvent) { if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setShowActions(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm gap-2">
      <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Loading…
    </div>
  );

  if (!app) return (
    <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-500">
      <p className="font-semibold">Application not found</p>
      <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><ArrowLeft size={13} />Back</button>
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
          <h1 className="text-xl font-bold text-gray-900">Approval Page</h1>
          <p className="text-xs text-gray-500 mt-0.5">Review the report or executive brief, record the decision, and approve or return the application.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => router.push(`/dashboard/applications/${encodeURIComponent(app.reference_no)}`)}
            className="flex items-center gap-1.5 text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">
            <ArrowLeft size={13} /> Back to Application
          </button>
          <div ref={actionsRef} className="relative">
            <button onClick={() => setShowActions(p => !p)}
              className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors">
              More Actions <ChevronDown size={13} />
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

      {/* ── Step Progress ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4 w-full">
        <StepProgress currentStatus={app.status} />
      </div>

      {/* ── Three Columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">

        {/* 1. Review Summary */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-xs text-blue-600">📄</span>
            <h3 className="text-xs font-bold text-gray-700">Review Summary</h3>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <dl className="space-y-2">
              <div className="flex items-start justify-between text-xs">
                <dt className="text-gray-600 font-medium w-32 flex-shrink-0">Application No.:</dt>
                <dd className="text-gray-800 text-right">{app.reference_no}</dd>
              </div>
              <div className="flex items-start justify-between text-xs">
                <dt className="text-gray-600 font-medium w-32 flex-shrink-0">Project Name:</dt>
                <dd className="text-gray-800 text-right">{app.project_name}</dd>
              </div>
              <div className="flex items-start justify-between text-xs">
                <dt className="text-gray-600 font-medium w-32 flex-shrink-0">Type:</dt>
                <dd className="text-gray-800 text-right">{appTypeFull}</dd>
              </div>
              <div className="flex items-start justify-between text-xs">
                <dt className="text-gray-600 font-medium w-32 flex-shrink-0">Location:</dt>
                <dd className="text-gray-800 text-right">Brgy. 123, Quezon City</dd>
              </div>
              <div className="flex items-start justify-between text-xs">
                <dt className="text-gray-600 font-medium w-32 flex-shrink-0">Status:</dt>
                <dd className="text-gray-800 text-right">For Approval</dd>
              </div>
              <div className="flex items-start justify-between text-xs mt-2 pt-2 border-t border-gray-100">
                <dt className="text-gray-600 font-medium w-40 flex-shrink-0">Evaluator Recommendation:</dt>
                <dd className="text-green-600 font-bold text-right">APPROVE</dd>
              </div>
              <div className="flex items-start justify-between text-xs">
                <dt className="text-gray-600 font-medium w-40 flex-shrink-0">Inspector Recommendation:</dt>
                <dd className="text-green-600 font-bold text-right">APPROVE</dd>
              </div>
              <div className="flex items-start justify-between text-xs">
                <dt className="text-gray-600 font-medium w-40 flex-shrink-0">Date Submitted for Approval:</dt>
                <dd className="text-gray-800 font-semibold text-right">April 20, 2026</dd>
              </div>
            </dl>

            <div className="mt-auto space-y-2 pt-4">
              <button className="w-full bg-[#0033A0] hover:bg-blue-800 text-white text-xs font-semibold py-2 rounded transition-colors">
                View Full Record
              </button>
              <button onClick={() => setShowHistoryModal(true)} className="w-full border border-blue-600 text-blue-700 hover:bg-blue-50 text-xs font-semibold py-2 rounded transition-colors">
                View Routing History
              </button>
            </div>
          </div>
        </div>

        {/* 2. Report / Executive Brief */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-xs text-blue-600">📄</span>
            <h3 className="text-xs font-bold text-gray-700">Report / Executive Brief</h3>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-800 mb-1 block">Output Type</label>
              <div className="flex w-full rounded border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setOutputType("Inspection Report")}
                  className={`flex-1 text-xs font-semibold py-1.5 ${outputType === "Inspection Report" ? "bg-[#0033A0] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                  Inspection Report
                </button>
                <button
                  onClick={() => setOutputType("Executive Brief")}
                  className={`flex-1 text-xs font-semibold py-1.5 border-l border-gray-300 ${outputType === "Executive Brief" ? "bg-[#0033A0] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                  Executive Brief
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-800 block mb-1">Document Summary</label>
              <div className="w-full text-xs border border-gray-200 bg-gray-50/50 rounded p-2.5 text-gray-700 min-h-[60px] leading-relaxed">
                The inspection validates compliance with the approved plans and applicable laws. All critical items were found satisfactory with minor observations noted. Recommended for approval.
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-[10px] text-gray-600 font-medium">
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100"><FileText size={12} /> 1 report attached</span>
              <span className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100"><FileText size={12} /> 1 executive brief attached</span>
              <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100"><ImageIcon size={12} /> 4 site photos attached</span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-800 block mb-1">Supporting Files</label>
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="py-1.5 px-2 font-semibold text-gray-600">File Name</th>
                      <th className="py-1.5 px-2 font-semibold text-gray-600">Type</th>
                      <th className="py-1.5 px-2 font-semibold text-gray-600">Uploaded By</th>
                      <th className="py-1.5 px-2 font-semibold text-gray-600">Date</th>
                      <th className="py-1.5 px-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {SUPPORTING_FILES.map((file) => (
                      <tr key={file.name}>
                        <td className="py-1.5 px-2 text-gray-700 flex items-center gap-1.5">
                          {file.type === "PDF" ? <FileText className="text-red-500" size={12} /> : <FileText className="text-yellow-500" size={12} />}
                          {file.name}
                        </td>
                        <td className="py-1.5 px-2 text-gray-500">{file.type}</td>
                        <td className="py-1.5 px-2 text-gray-500">{file.by}</td>
                        <td className="py-1.5 px-2 text-gray-500">{file.date}</td>
                        <td className="py-1.5 px-2 text-center"><button className="text-blue-600 hover:text-blue-800"><Download size={12} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-auto pt-2 grid grid-cols-3 gap-2">
              <button className="flex items-center justify-center gap-1 border border-blue-600 text-blue-700 text-xs font-semibold py-1.5 rounded hover:bg-blue-50 transition-colors">
                <Eye size={12} /> Preview Output
              </button>
              <button className="flex items-center justify-center gap-1 border border-blue-600 text-blue-700 text-xs font-semibold py-1.5 rounded hover:bg-blue-50 transition-colors">
                <Download size={12} /> Download Report
              </button>
              <button className="bg-[#0033A0] hover:bg-blue-800 text-white text-xs font-semibold py-1.5 rounded transition-colors">
                Open Full Document
              </button>
            </div>
          </div>
        </div>

        {/* 3. Decision & E-Signature */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-xs text-blue-600">✔️</span>
            <h3 className="text-xs font-bold text-gray-700">Decision & E-Signature</h3>
          </div>
          <div className="flex-1 flex flex-col gap-3">

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-800 block mb-2">Decision</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="decision" value="Approve / Endorse" checked={decision === "Approve / Endorse"} onChange={(e) => setDecision(e.target.value)} className="w-3.5 h-3.5 text-[#0033A0] focus:ring-[#0033A0]" />
                    <span className="text-xs text-gray-700 font-medium">Approve / Endorse</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="decision" value="Return for Revision" checked={decision === "Return for Revision"} onChange={(e) => setDecision(e.target.value)} className="w-3.5 h-3.5 text-[#0033A0] focus:ring-[#0033A0]" />
                    <span className="text-xs text-gray-700 font-medium">Return for Revision</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="decision" value="Disapprove" checked={decision === "Disapprove"} onChange={(e) => setDecision(e.target.value)} className="w-3.5 h-3.5 text-[#0033A0] focus:ring-[#0033A0]" />
                    <span className="text-xs text-gray-700 font-medium">Disapprove</span>
                  </label>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-[10px] font-bold text-gray-800 block mb-1">Sign as</label>
                <select className="w-full text-xs border border-gray-300 rounded p-1.5 text-gray-700 outline-none focus:border-blue-500 mb-2">
                  <option>Regional Director</option>
                </select>
                <div className="flex-1 border border-gray-200 rounded bg-gray-50/50 flex flex-col items-center justify-center relative p-0 overflow-hidden min-h-[70px]">
                  <SignaturePad />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-800 block mb-1">Remarks (Optional)</label>
              <textarea placeholder="Type remarks..." className="w-full text-xs border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 h-16 resize-none"></textarea>
            </div>

            <div className="mt-auto pt-2 space-y-2">
              {message && (
                <div className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{message.text}</span>
                </div>
              )}
              <button
                onClick={handleApproveAndSign}
                disabled={formLoading}
                className="w-full bg-[#16a34a] hover:bg-green-700 text-white text-xs font-bold py-2 rounded transition-colors shadow disabled:opacity-50">
                {formLoading ? "Processing..." : "Approve and Sign"}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className="w-full border border-gray-300 text-blue-700 text-xs font-semibold py-1.5 rounded hover:bg-gray-50 transition-colors">
                  Save Draft
                </button>
                <button className="w-full border border-red-300 text-red-600 text-xs font-semibold py-1.5 rounded hover:bg-red-50 transition-colors">
                  Return for Revision
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom Row (Activity & Evidence) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">

        {/* Completion Notes / Activity */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 h-full">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-xs text-blue-600">🕒</span>
            <h3 className="text-xs font-bold text-gray-700">Completion Notes / Activity</h3>
          </div>
          <div className="relative pl-3 space-y-5 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {ACTIVITIES.map((act, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-3 h-3 rounded-full border-2 border-white ${act.dot} shrink-0 absolute left-[-6px] shadow`}></div>
                <div className="w-full pl-6 text-xs flex flex-col md:flex-row gap-2 md:gap-8 items-start md:items-center">
                  <div className="w-32 flex-shrink-0 text-gray-500 font-medium whitespace-nowrap">{act.date}</div>
                  <div className="text-gray-700">{act.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Approval Evidence / Attachments */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 h-full">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-xs">📎</span>
            <h3 className="text-xs font-bold text-gray-700">Approval Evidence / Attachments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 font-bold text-gray-700 px-2">File Name</th>
                  <th className="pb-2 font-bold text-gray-700 px-2">Type</th>
                  <th className="pb-2 font-bold text-gray-700 px-2">Uploaded By</th>
                  <th className="pb-2 font-bold text-gray-700 px-2">Date</th>
                  <th className="pb-2 font-bold text-gray-700 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {APPROVAL_ATTACHMENTS.map((file) => (
                  <tr key={file.name} className="hover:bg-gray-50/50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <FileText className="text-red-500" size={14} />
                        {file.name}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-600">{file.type}</td>
                    <td className="py-3 px-2 text-gray-600">{file.by}</td>
                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{file.date}</td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-2 text-blue-600">
                        <button className="hover:text-blue-800"><Eye size={14} /></button>
                        <button className="hover:text-blue-800"><Download size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      {showHistoryModal && <RoutingHistoryModal app={app} onClose={() => setShowHistoryModal(false)} />}
    </div>
  );
}
