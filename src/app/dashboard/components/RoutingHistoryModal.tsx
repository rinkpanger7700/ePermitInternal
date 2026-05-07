import { X, Download } from "lucide-react";

interface RoutingHistoryModalProps {
  app: {
    reference_no: string;
    project_name: string;
    status: string;
  };
  onClose: () => void;
}

const HISTORY_DATA = [
  {
    stepNo: 1,
    stepName: "Intake",
    stepColor: "bg-blue-50 text-blue-700",
    statusBadge: "bg-green-100 text-green-700",
    statusDot: "bg-green-500",
    statusText: "On Time",
    date: "Mar 28, 2026",
    time: "04:25 PM",
    from: "Records Section",
    to: "System",
    action: "Application encoded",
    remarks: "Initial intake completed",
  },
  {
    stepNo: 2,
    stepName: "Auto-Check",
    stepColor: "bg-blue-50 text-blue-700",
    statusBadge: "bg-green-100 text-green-700",
    statusDot: "bg-green-500",
    statusText: "On Time",
    date: "Mar 28, 2026",
    time: "04:30 PM",
    from: "System",
    to: "Maria Reyes /\nEvaluator",
    action: "Auto-check completed",
    remarks: "No critical system\nissues found",
  },
  {
    stepNo: 3,
    stepName: "Requirements\nValidation",
    stepColor: "bg-orange-50 text-orange-700",
    statusBadge: "bg-yellow-100 text-yellow-700",
    statusDot: "bg-yellow-500",
    statusText: "Near Deadline",
    date: "Apr 1, 2026",
    time: "09:15 AM",
    from: "Maria Reyes /\nEvaluator",
    to: "Applicant",
    action: "Returned for compliance",
    remarks: "Missing barangay clearance\nand expired ownership\ndocument",
  },
  {
    stepNo: 4,
    stepName: "Requirements\nValidation",
    stepColor: "bg-orange-50 text-orange-700",
    statusBadge: "bg-red-100 text-red-700",
    statusDot: "bg-red-500",
    statusText: "Overdue",
    date: "Apr 4, 2026",
    time: "10:05 AM",
    from: "Applicant",
    to: "Maria Reyes /\nEvaluator",
    action: "Compliance resubmitted",
    remarks: "Revised requirements\nuploaded",
  },
  {
    stepNo: 5,
    stepName: "Evaluation /\nInspection",
    stepColor: "bg-green-50 text-green-700",
    statusBadge: "bg-green-100 text-green-700",
    statusDot: "bg-green-500",
    statusText: "On Time",
    date: "Apr 18, 2026",
    time: "02:10 PM",
    from: "Ramon Dela Cruz /\nInspector",
    to: "Regional Director /\nApprover",
    action: "Inspection report and\nexecutive brief submitted",
    remarks: "Recommended\nfor approval",
  },
  {
    stepNo: 6,
    stepName: "Approval",
    stepColor: "bg-blue-50 text-blue-700",
    statusBadge: "bg-yellow-100 text-yellow-700",
    statusDot: "bg-yellow-500",
    statusText: "Near Deadline",
    date: "Apr 20, 2026",
    time: "09:15 AM",
    from: "System",
    to: "Regional Director /\nApprover",
    action: "For approval",
    remarks: "Pending final\ndecision",
  },
];

export default function RoutingHistoryModal({ app, onClose }: RoutingHistoryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between border-b border-gray-100">
          <div>
            <h2 className="text-[22px] font-bold text-blue-900">Routing History</h2>
            <p className="text-xs text-gray-500 mt-1">Chronological record of routing actions, endorsements, and transfers across the permit process.</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* App Info Row */}
          <div className="flex items-center justify-between bg-white border border-gray-200 shadow-sm rounded-lg py-4">
            <div className="flex-1 text-center">
              <p className="text-[10px] text-gray-400 font-medium">Application No.</p>
              <p className="text-sm font-bold text-blue-700 mt-0.5">{app.reference_no}</p>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="flex-1 text-center">
              <p className="text-[10px] text-gray-400 font-medium">Project Name</p>
              <p className="text-sm font-semibold text-blue-700 mt-0.5">{app.project_name}</p>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="flex-1 text-center">
              <p className="text-[10px] text-gray-400 font-medium">Current Status</p>
              <div className="mt-0.5">
                <span className="inline-block text-xs font-semibold px-3 py-1 rounded bg-blue-100 text-blue-700">
                  {app.status}
                </span>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="relative">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-700 font-bold">
                  <th className="py-3 px-2 w-[160px] pl-16">Step / Stage</th>
                  <th className="py-3 px-2">Date & Time</th>
                  <th className="py-3 px-2">From</th>
                  <th className="py-3 px-2">To</th>
                  <th className="py-3 px-2">Action Taken</th>
                  <th className="py-3 px-2">Remarks / Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 relative">
                {/* Connecting Line */}
                <div className="absolute left-[20px] top-6 bottom-6 w-0.5 bg-blue-100 -z-10"></div>
                
                {HISTORY_DATA.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="py-4 px-2 relative">
                      <div className="flex items-center gap-4">
                        {/* Circle */}
                        <div className="w-6 h-6 rounded-full bg-[#0033A0] text-white flex items-center justify-center font-bold text-[10px] absolute left-1.5 shadow-sm">
                          {row.stepNo}
                        </div>
                        {/* Step Name */}
                        <div className="ml-10">
                          <span className={`inline-block px-2 py-1 rounded text-[10px] font-semibold whitespace-pre-wrap ${row.stepColor}`}>
                            {row.stepName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${row.statusBadge}`}>
                          <span className={`w-2 h-2 rounded-full ${row.statusDot}`}></span>
                          {row.statusText}
                        </span>
                        <div className="text-gray-600 font-medium">
                          <div>{row.date}</div>
                          <div>{row.time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{row.from}</td>
                    <td className="py-4 px-2 text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{row.to}</td>
                    <td className="py-4 px-2 text-gray-600 whitespace-pre-wrap leading-relaxed">{row.action}</td>
                    <td className="py-4 px-2 text-gray-600 whitespace-pre-wrap leading-relaxed">{row.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50/80 border-t border-gray-100 p-6 flex items-center justify-end gap-4">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-blue-600 text-blue-700 font-bold hover:bg-blue-50 transition-colors">
            <Download size={16} /> Download Routing Slip
          </button>
          <button onClick={onClose} className="px-8 py-2.5 rounded-lg bg-[#0033A0] text-white font-bold hover:bg-blue-800 transition-colors shadow">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
