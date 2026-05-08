import { useState } from "react";
import { X, FileText, Info, Save, Send, CheckCircle, PartyPopper } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface ProceedReleaseModalProps {
  app: {
    id: string;
    reference_no: string;
    project_name: string;
    applicant_name: string;
    status: string;
  };
  onClose: () => void;
}

export default function ProceedReleaseModal({ app, onClose }: ProceedReleaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleRelease = async () => {
    setLoading(true);

    // Step 1: Update the application stage to 'Released'
    await supabase
      .from("applications")
      .update({ current_stage: "Released" })
      .eq("id", app.id);

    // Step 2: Update existing releasing record to 'Released', or insert if none exists
    const { data: existingRelease } = await supabase
      .from("releasing")
      .select("id")
      .eq("application_id", app.id)
      .limit(1)
      .single();

    if (existingRelease) {
      await supabase
        .from("releasing")
        .update({
          status: "Released",
          released_by: "Records Section",
          release_date: new Date().toISOString().split("T")[0],
          tracking_no: app.reference_no + "-R",
          delivery_method: "Portal + Email",
        })
        .eq("id", existingRelease.id);
    } else {
      await supabase.from("releasing").insert({
        application_id: app.id,
        released_by: "Records Section",
        release_date: new Date().toISOString().split("T")[0],
        tracking_no: app.reference_no + "-R",
        delivery_method: "Portal + Email",
        status: "Released",
      });
    }

    setLoading(false);
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
              <CheckCircle size={36} className="text-green-600" />
            </div>
            <PartyPopper size={40} className="text-[#0033A0] mb-2" />
            <h2 className="text-xl font-bold text-gray-900 mb-1">Application Successfully Released!</h2>
            <p className="text-sm text-gray-500 mb-1">{app.reference_no}</p>
            <p className="text-xs text-gray-400 mb-6">{app.project_name}</p>
            <button
              onClick={() => { router.push("/dashboard/releasing"); }}
              className="w-full py-2.5 rounded-lg bg-[#0033A0] text-white font-bold hover:bg-blue-800 transition-colors text-sm shadow"
            >
              Back to Releasing
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
        <div className="px-6 py-5 flex items-start justify-between border-b border-gray-100">
          <div>
            <h2 className="text-[22px] font-bold text-blue-900">Proceed to Release</h2>
            <p className="text-xs text-gray-500 mt-1">Confirm the final release package, delivery method, and release details before sending to the applicant.</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Summary Strip */}
          <div className="flex flex-wrap items-center justify-between bg-white border border-gray-200 shadow-sm rounded-lg py-3 px-6">
            <div className="flex-1 text-center border-r border-gray-200">
              <p className="text-[10px] text-gray-400 font-medium">Application No.</p>
              <p className="text-sm font-bold text-gray-800 mt-0.5">{app.reference_no}</p>
            </div>
            <div className="flex-1 text-center border-r border-gray-200">
              <p className="text-[10px] text-gray-400 font-medium">Project Name</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{app.project_name}</p>
            </div>
            <div className="flex-1 text-center border-r border-gray-200">
              <p className="text-[10px] text-gray-400 font-medium">Applicant / Developer</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{app.applicant_name}</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-[10px] text-gray-400 font-medium">Current Status</p>
              <div className="mt-0.5">
                <span className="inline-block text-xs font-semibold px-3 py-0.5 rounded bg-green-100 text-green-700">
                  Ready for Release
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* LEFT COLUMN */}
            <div className="space-y-4 flex flex-col">
              
              {/* 1. Release Package */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-blue-700"><FileText size={16}/></span>
                  <h3 className="text-sm font-bold text-blue-900">1. Release Package</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Permit / Certificate.pdf", size: "1.24 MB", date: "Apr 21, 2026", checked: true },
                    { name: "Decision_Letter.pdf", size: "856 KB", date: "Apr 21, 2026", checked: true },
                    { name: "Routing_Slip.pdf", size: "412 KB", date: "Apr 21, 2026", checked: true },
                    { name: "Executive_Brief.pdf (Internal Copy)", size: "1.05 MB", date: "Apr 20, 2026", checked: false },
                  ].map((doc, i) => (
                    <label key={i} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={doc.checked} readOnly className="w-4 h-4 text-[#0033A0] rounded border-gray-300 focus:ring-[#0033A0]"/>
                        <div className="flex items-center gap-2">
                           <FileText className="text-red-500 shrink-0" size={14}/>
                           <span className="text-xs font-medium text-gray-700">{doc.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.date}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. Delivery Method */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-blue-700">🚚</span>
                  <h3 className="text-sm font-bold text-blue-900">2. Delivery Method</h3>
                </div>
                <div className="grid grid-cols-[110px_1fr] items-center gap-y-3 text-xs">
                  <span className="text-gray-600 font-medium">Delivery Channel:</span>
                  <select className="w-full border border-gray-300 rounded p-1.5 text-gray-700 focus:outline-none focus:border-blue-500">
                    <option>Portal + Email</option>
                  </select>

                  <span className="text-gray-600 font-medium">Recipient:</span>
                  <input type="text" readOnly value="Juan Santos / ABC Residences" className="w-full border border-gray-300 rounded p-1.5 text-gray-700 bg-gray-50/50 outline-none" />

                  <span className="text-gray-600 font-medium">Email Address:</span>
                  <input type="text" readOnly value="juansantos@email.com" className="w-full border border-gray-300 rounded p-1.5 text-gray-700 bg-gray-50/50 outline-none" />

                  <span className="text-gray-600 font-medium">Date of Release:</span>
                  <div className="relative">
                    <input type="text" readOnly value="April 22, 2026" className="w-full border border-gray-300 rounded p-1.5 text-gray-700 bg-gray-50/50 outline-none pl-7" />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">📅</span>
                  </div>

                  <span className="text-gray-600 font-medium">Released By:</span>
                  <input type="text" readOnly value="Records Section" className="w-full border border-gray-300 rounded p-1.5 text-gray-700 bg-gray-50/50 outline-none" />
                </div>
              </div>

              {/* 3. Release Notes */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-blue-700">💬</span>
                  <h3 className="text-sm font-bold text-blue-900">3. Release Notes</h3>
                </div>
                <div className="flex-1 flex flex-col">
                  <textarea 
                    className="flex-1 w-full border border-gray-300 rounded p-2 text-xs text-gray-700 focus:outline-none focus:border-blue-500 resize-none min-h-[60px]"
                    defaultValue="Approved permit package is ready for release and has been prepared for official transmission to the applicant."
                  />
                  <div className="text-left mt-1">
                    <span className="text-[9px] text-gray-400">100 / 500 characters</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4 flex flex-col">
              
              {/* 4. Release Confirmation */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-blue-700"><CheckCircle size={16}/></span>
                  <h3 className="text-sm font-bold text-blue-900">4. Release Confirmation</h3>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-y-2 text-xs mb-4">
                  <div className="text-gray-600 font-medium">Permit / Certificate No.:</div>
                  <div className="text-gray-800">{app.reference_no}-R</div>
                  
                  <div className="text-gray-600 font-medium">Date Approved:</div>
                  <div className="text-gray-800">April 20, 2026</div>
                  
                  <div className="text-gray-600 font-medium">Date Prepared:</div>
                  <div className="text-gray-800">April 21, 2026</div>
                  
                  <div className="text-gray-600 font-medium">Traffic Light:</div>
                  <div className="text-green-600 font-bold flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    On Time
                  </div>
                  
                  <div className="text-gray-600 font-medium">Release Status:</div>
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded bg-orange-50 text-orange-600 font-bold border border-orange-100 text-[10px]">
                      Pending Confirmation
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-1.5 text-[10px] text-green-700 font-medium">
                  <CheckCircle size={14} className="shrink-0 text-green-600 mt-0.5" />
                  <span>Final output package complete and ready for official release.</span>
                </div>
              </div>

              {/* 5. Records and Notification */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-blue-700">🔔</span>
                  <h3 className="text-sm font-bold text-blue-900">5. Records and Notification</h3>
                </div>
                <div className="space-y-2">
                  {[
                    "Save final release copy to records",
                    "Notify applicant through portal",
                    "Send release email notification",
                  ].map((label, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked readOnly className="w-4 h-4 text-[#0033A0] rounded border-gray-300 focus:ring-[#0033A0]" />
                      <span className="text-xs text-blue-900 font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 6. Final Outputs Preview */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex-1">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-gray-600"><FileText size={16}/></span>
                  <h3 className="text-sm font-bold text-blue-900">6. Final Outputs Preview</h3>
                </div>
                <div className="space-y-3 mt-4">
                  {[
                    { name: "Permit / Certificate.pdf", size: "1.24 MB" },
                    { name: "Decision_Letter.pdf", size: "856 KB" },
                    { name: "Routing_Slip.pdf", size: "412 KB" },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <FileText className="text-red-500 shrink-0" size={14}/>
                         <span className="text-xs font-medium text-gray-700">{doc.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-500">{doc.size}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50/80 border-t border-gray-100 p-4 pb-2">
          <div className="flex items-center justify-between max-w-4xl mx-auto gap-4 mb-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-blue-600 text-blue-700 font-bold hover:bg-blue-50 transition-colors text-sm">
              Cancel
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-blue-600 text-blue-700 font-bold hover:bg-blue-50 transition-colors text-sm">
              <Save size={16} /> Save Draft
            </button>
            <button 
              disabled={loading}
              onClick={handleRelease} 
              className="flex-[1.5] flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0033A0] text-white font-bold hover:bg-blue-800 transition-colors text-sm shadow disabled:opacity-50">
              <Send size={16} /> {loading ? "Releasing..." : "Confirm and Release"}
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-500 flex items-center justify-center gap-1">
            <Info size={12} /> Once confirmed, the release will be recorded and the applicant will be notified.
          </p>
        </div>

      </div>
    </div>
  );
}
