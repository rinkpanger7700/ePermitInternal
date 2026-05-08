import { useState } from "react";
import { X, Calendar, AlertTriangle, XCircle, Image as ImageIcon, FileText, ChevronDown, Info } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface IssueNDRModalProps {
  app: {
    id: string;
    reference_no: string;
    project_name: string;
    applicant_name: string;
    status: string;
  };
  onClose: () => void;
}

export default function IssueNDRModal({ app, onClose }: IssueNDRModalProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleIssueNdr = async () => {
    setLoading(true);

    await supabase
      .from("applications")
      .update({ current_stage: "For Compliance" })
      .eq("id", app.id);

    await supabase.from("reviews").insert({
      application_id: app.id,
      status: "NDR Issued",
      review_date: new Date().toISOString().split("T")[0],
      reviewer_name: "Current User",
    });

    setLoading(false);
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle size={36} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">NDR Issued Successfully</h2>
            <p className="text-sm text-gray-500 mb-1">{app.reference_no}</p>
            <p className="text-xs text-gray-400 mb-2">{app.project_name}</p>
            <p className="text-xs text-orange-600 font-medium mb-6 flex items-center gap-1">
              <Info size={12} /> Status set to For Compliance
            </p>
            <button
              onClick={() => { router.push("/dashboard/reviews"); }}
              className="w-full py-2.5 rounded-lg bg-[#0033A0] text-white font-bold hover:bg-blue-800 transition-colors text-sm shadow"
            >
              Back to Reviews
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-start justify-between border-b border-gray-100">
          <div>
            <h2 className="text-[22px] font-bold text-blue-900">Issue Notice of Deficiency Requirements (NDR)</h2>
            <p className="text-xs text-gray-500 mt-1">Prepare and issue an NDR to inform the applicant of incomplete or deficient submission requirements.</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* App Info Row */}
          <div className="flex flex-wrap items-center justify-between bg-white border border-gray-100 shadow-sm rounded-lg px-6 py-3">
            <div>
              <p className="text-[10px] text-gray-400 font-medium">Application No.</p>
              <p className="text-sm font-bold text-blue-700 mt-0.5">{app.reference_no}</p>
            </div>
            <div className="h-8 w-px bg-gray-100"></div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium">Project Name</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{app.project_name}</p>
            </div>
            <div className="h-8 w-px bg-gray-100"></div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium">Applicant / Developer</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{app.applicant_name}</p>
            </div>
            <div className="h-8 w-px bg-gray-100"></div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium text-center">Current Status</p>
              <div className="mt-0.5 flex justify-center">
                <span className="inline-block text-xs font-medium px-2 py-0.5 rounded border bg-blue-100 text-blue-700 border-blue-200">
                  {app.status}
                </span>
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Column */}
            <div className="space-y-4">
              
              {/* 1. NDR Details */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2 mb-4">
                  <span className="w-5 h-5 rounded-full border border-blue-700 flex items-center justify-center text-[10px]">1</span>
                  NDR Details
                </h3>
                <dl className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <dt className="text-gray-600">NDR No. (auto-generated):</dt>
                    <dd className="font-semibold text-gray-800">NDR-2026-014</dd>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <dt className="text-gray-600">Date Issued:</dt>
                    <dd className="font-semibold text-gray-800 flex items-center gap-2">April 3, 2026 <Calendar size={13} className="text-gray-400"/></dd>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <dt className="text-gray-600">Compliance Deadline:</dt>
                    <dd className="font-semibold text-gray-800 flex items-center gap-2">April 10, 2026 <Calendar size={13} className="text-gray-400"/></dd>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <dt className="text-gray-600">Issued By:</dt>
                    <dd className="font-semibold text-gray-800">Maria Reyes</dd>
                  </div>
                </dl>
              </div>

              {/* 2. Deficiency Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full border border-blue-700 flex items-center justify-center text-[10px]">2</span>
                  Deficiency Summary
                </h3>
                <div className="border border-gray-200 rounded p-3 bg-gray-50/50">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    The submitted documents are incomplete or deficient in content. Please comply with the requirements listed below before processing can continue.
                  </p>
                </div>
                <div className="text-right mt-1.5 text-[10px] text-gray-400">146 / 500</div>
              </div>

              {/* 3. Deficient Requirements */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full border border-blue-700 flex items-center justify-center text-[10px]">3</span>
                  Deficient Requirements
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-blue-50/50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 font-bold text-gray-700 w-[35%]">Requirement</th>
                        <th className="px-3 py-2 font-bold text-gray-700 w-[45%]">Issue / Deficiency</th>
                        <th className="px-3 py-2 font-bold text-gray-700 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-3 py-2.5 text-gray-700">Proof of Ownership</td>
                        <td className="px-3 py-2.5 text-gray-600">Expired supporting document</td>
                        <td className="px-3 py-2.5">
                          <span className="flex items-center justify-center gap-1 text-orange-600 font-semibold"><AlertTriangle size={12}/> Deficient</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2.5 text-gray-700">Others (as required)</td>
                        <td className="px-3 py-2.5 text-gray-600">Barangay clearance not attached</td>
                        <td className="px-3 py-2.5">
                          <span className="flex items-center justify-center gap-1 text-red-600 font-semibold"><XCircle size={12}/> Missing</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2.5 text-gray-700">Location Map</td>
                        <td className="px-3 py-2.5 text-gray-600">Needs clearer project boundary annotation</td>
                        <td className="px-3 py-2.5">
                          <span className="flex items-center justify-center gap-1 text-orange-600 font-semibold"><AlertTriangle size={12}/> Deficient</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  <span className="text-lg leading-none">+</span> Add Another Item
                </button>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-4">
              
              {/* 4. Required Compliance / Instructions */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full border border-blue-700 flex items-center justify-center text-[10px]">4</span>
                  Required Compliance / Instructions
                </h3>
                <div className="border border-gray-200 rounded p-3 bg-gray-50/50">
                  <p className="text-xs text-gray-700 leading-relaxed mb-2">
                    Please submit updated and complete documents addressing the deficiencies listed. Specifically:
                  </p>
                  <ul className="list-disc pl-5 text-xs text-gray-700 space-y-1 mb-2">
                    <li>Provide a valid and updated Proof of Ownership.</li>
                    <li>Attach the Barangay Clearance for the project.</li>
                    <li>Re-upload the Location Map with clear project boundary annotation.</li>
                  </ul>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    All documents must be legible and in PDF format. Failure to comply within the deadline may result in further action per applicable rules.
                  </p>
                </div>
                <div className="text-right mt-1.5 text-[10px] text-gray-400">254 / 1000</div>
              </div>

              {/* 5. Supporting Evidence / Attachments */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full border border-blue-700 flex items-center justify-center text-[10px]">5</span>
                  Supporting Evidence / Attachments
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between border border-gray-200 rounded px-3 py-2.5">
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <FileText size={14}/>
                      <span>Reviewer Notes - {app.reference_no}.pdf</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400">245 KB</span>
                      <button className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border border-gray-200 rounded px-3 py-2.5">
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <FileText size={14}/>
                      <span>Requirements Checklist (v2.0).pdf</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400">312 KB</span>
                      <button className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border border-gray-200 rounded px-3 py-2.5">
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <ImageIcon size={14}/>
                      <span>Location Map - Annotated Screenshot.png</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400">638 KB</span>
                      <button className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Delivery / Recipient */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full border border-blue-700 flex items-center justify-center text-[10px]">6</span>
                  Delivery / Recipient
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-gray-700 w-28 flex-shrink-0">Recipient:</label>
                    <div className="flex-1 relative">
                      <select className="w-full appearance-none border border-gray-300 rounded text-xs px-3 py-2 text-gray-700 outline-none focus:border-blue-500">
                        <option>{app.applicant_name} / {app.project_name}</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-gray-700 w-28 flex-shrink-0">Delivery Channel:</label>
                    <div className="flex-1 relative">
                      <select className="w-full appearance-none border border-gray-300 rounded text-xs px-3 py-2 text-gray-700 outline-none focus:border-blue-500">
                        <option>Portal Notification + Email</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-6 pt-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-center gap-3 mb-3">
            <button className="px-8 py-2 rounded border border-blue-600 text-blue-700 text-sm font-bold hover:bg-blue-50 transition-colors">
              Save Draft
            </button>
            <button className="px-8 py-2 rounded border border-blue-600 text-blue-700 text-sm font-bold hover:bg-blue-50 transition-colors">
              Preview NDR
            </button>
            <button
              disabled={loading}
              onClick={handleIssueNdr}
              className="px-8 py-2 rounded bg-red-600 text-white text-sm font-bold shadow hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Issuing NDR..." : "Issue NDR to Applicant"}
            </button>
            <button onClick={onClose} className="px-8 py-2 rounded border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-100 transition-colors">
              Cancel
            </button>
          </div>
          <p className="text-xs text-gray-600 flex items-center gap-1.5 font-medium">
            <Info size={14} className="text-blue-600"/>
            Once issued, the applicant will be notified and the application will remain pending compliance.
          </p>
        </div>

      </div>
    </div>
  );
}
