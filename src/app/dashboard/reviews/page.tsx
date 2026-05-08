"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Search, Filter, MoreVertical } from "lucide-react";

export default function ReviewsModule() {
  const supabase = createClient();
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("applications_with_queue_status")
        .select("*")
        .in("status", ["Initial Review", "Evaluation", "Ongoing Evaluation", "Under Review", "For Compliance", "Returned"])
        .order("due_date", { ascending: true });
        
      if (!error && data) setApps(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = apps.filter(a => 
    !search || 
    a.reference_no?.toLowerCase().includes(search.toLowerCase()) || 
    a.applicant_name?.toLowerCase().includes(search.toLowerCase()) || 
    a.project_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[60vh]">
      <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Document Reviews</h2>
          <p className="text-sm text-gray-500 mt-1">Assigned reviews and evaluation forms</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search applications..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <Search size={16} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-semibold">Application No.</th>
              <th className="px-6 py-3 font-semibold">Applicant / Project</th>
              <th className="px-6 py-3 font-semibold">Current Stage</th>
              <th className="px-6 py-3 font-semibold">Priority</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading applications...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No applications found for review.</td>
              </tr>
            ) : (
              filtered.map(app => (
                <tr key={app.reference_no} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-800">{app.reference_no}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{app.project_name}</div>
                    <div className="text-xs text-gray-500">{app.applicant_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-semibold">
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border
                      ${app.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' : 
                        app.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                        'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {app.priority || 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold 
                      ${app.queue_status === 'Overdue' ? 'text-red-600' : 
                        app.queue_status === 'Due Today' ? 'text-orange-600' : 
                        app.queue_status === 'Due Soon' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {app.queue_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => router.push(`/dashboard/reviews/${encodeURIComponent(app.reference_no)}`)}
                        className="px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors whitespace-nowrap"
                      >
                        Open Case
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
