"use client";

import { useState } from "react";
import { 
  Filter, Layers, ClipboardList, Search, CheckCircle2, FileCheck2, AlertTriangle, Info,
  MapPin, Clock, Target, TrendingUp, AlertCircle, Settings, CheckSquare
} from "lucide-react";

export default function ReportsPage() {
  const [dashboardView, setDashboardView] = useState("Secretary Dashboard");
  const [region, setRegion] = useState("NCR");
  const [bureau, setBureau] = useState("Housing and Real Estate Development Bureau");
  const [coverage, setCoverage] = useState("Nationwide");
  const [appType, setAppType] = useState("All");
  const [month, setMonth] = useState("April");
  const [year, setYear] = useState("2026");

  const isBureau = dashboardView === "Bureau Dashboard";
  const isSecretary = dashboardView === "Secretary Dashboard";

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-[#0033A0]">
          {isSecretary ? "MANAGEMENT DASHBOARD" : "Reports & Analytics"}
        </h1>
        <p className="text-sm text-gray-500">
          {isSecretary ? "National permit performance snapshot, critical issues, and decision support." 
            : isBureau ? "Monitor bureau-wide performance, traffic light status, and regional office results." 
            : "Monitor application performance, traffic light status, and regional office results."}
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex-[1.5] min-w-[180px]">
          <label className="block text-[11px] font-bold text-gray-700 mb-1">Dashboard View</label>
          <select value={dashboardView} onChange={e=>setDashboardView(e.target.value)} className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:border-[#0033A0] outline-none font-medium">
            <option>Regional Dashboard</option>
            <option>Bureau Dashboard</option>
            <option>Secretary Dashboard</option>
          </select>
        </div>
        
        {isSecretary ? (
          <div className="flex-1 min-w-[150px]">
            <label className="block text-[11px] font-bold text-gray-700 mb-1">Coverage</label>
            <select value={coverage} onChange={e=>setCoverage(e.target.value)} className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:border-[#0033A0] outline-none">
              <option>Nationwide</option>
              <option>Luzon</option>
              <option>Visayas</option>
              <option>Mindanao</option>
            </select>
          </div>
        ) : isBureau ? (
          <div className="flex-[2] min-w-[250px]">
            <label className="block text-[11px] font-bold text-gray-700 mb-1">Bureau</label>
            <select value={bureau} onChange={e=>setBureau(e.target.value)} className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:border-[#0033A0] outline-none truncate">
              <option>Housing and Real Estate Development Bureau</option>
              <option>Environmental Land Use and Urban Planning</option>
            </select>
          </div>
        ) : (
          <div className="flex-1 min-w-[150px]">
            <label className="block text-[11px] font-bold text-gray-700 mb-1">Regional Office</label>
            <select value={region} onChange={e=>setRegion(e.target.value)} className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:border-[#0033A0] outline-none">
              <option>NCR</option>
              <option>Region IV-A</option>
              <option>Region III</option>
            </select>
          </div>
        )}

        <div className="flex-1 min-w-[120px]">
          <label className="block text-[11px] font-bold text-gray-700 mb-1">Application Type</label>
          <select value={appType} onChange={e=>setAppType(e.target.value)} className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:border-[#0033A0] outline-none">
            <option>All</option>
            <option>DP</option>
            <option>CRAS</option>
          </select>
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="block text-[11px] font-bold text-gray-700 mb-1">Month</label>
          <select value={month} onChange={e=>setMonth(e.target.value)} className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:border-[#0033A0] outline-none">
            <option>April</option>
            <option>May</option>
          </select>
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="block text-[11px] font-bold text-gray-700 mb-1">Year</label>
          <select value={year} onChange={e=>setYear(e.target.value)} className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:border-[#0033A0] outline-none">
            <option>2026</option>
            <option>2025</option>
          </select>
        </div>
        <button className="bg-[#0033A0] hover:bg-blue-800 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 h-[38px] shadow shrink-0">
          <Filter size={14} /> Apply Filters
        </button>
      </div>

      {isSecretary ? <SecretaryView /> : isBureau ? <BureauView /> : <RegionalView />}

      {/* ── Legend Footer ── */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex flex-wrap items-center justify-center gap-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Info size={14} className="text-gray-400"/> Traffic Light Legend:
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-700">
          <div className="w-3 h-3 rounded-full bg-green-500"></div> <span className="font-bold text-green-700">Green = On Time</span> <span className="text-[10px]">(within target timeline)</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-700">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div> <span className="font-bold text-yellow-600">Yellow = Near Deadline</span> <span className="text-[10px]">(approaching target)</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-700">
          <div className="w-3 h-3 rounded-full bg-red-500"></div> <span className="font-bold text-red-600">Red = Overdue</span> <span className="text-[10px]">(past target deadline)</span>
        </div>
      </div>
    </div>
  );
}

function SecretaryView() {
  return (
    <>
      {/* ── KPI Strip ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { icon: <Layers size={18}/>, bg: "bg-blue-600", label: "Total Applications", value: "38,640", valColor: "text-gray-900" },
          { icon: <FileCheck2 size={18}/>, bg: "bg-green-600", label: "Released", value: "16,934", valColor: "text-gray-900" },
        ].map((kpi, i) => (
          <div key={i} className="flex-1 min-w-[140px] bg-white rounded-xl border border-gray-200 shadow-sm p-3.5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg text-white flex items-center justify-center shrink-0 shadow-sm ${kpi.bg}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold whitespace-nowrap">{kpi.label}</p>
              <p className={`text-xl font-black ${kpi.valColor}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
        <div className="flex-[1.5] min-w-[180px] bg-white rounded-xl border border-gray-200 shadow-sm p-3.5 flex items-center gap-4">
          <div className="relative w-10 h-10 shrink-0">
             <svg viewBox="-4 -4 44 44" className="w-full h-full transform -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="6"/>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563EB" strokeWidth="6" strokeDasharray="74, 100"/>
             </svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold">National On-Time Rate</p>
            <p className="text-xl font-black text-gray-900">74%</p>
          </div>
        </div>
        {[
          { icon: <AlertTriangle size={18}/>, bg: "bg-red-500", label: "Overdue Cases", value: "3,128", valColor: "text-red-600" },
          { icon: <MapPin size={18}/>, bg: "bg-purple-600", label: "Critical Regions", value: "1", valColor: "text-purple-700" },
          { icon: <Clock size={18}/>, bg: "bg-orange-400", label: "Near Deadline", value: "6,918", valColor: "text-gray-900" },
          { icon: <Target size={18}/>, bg: "bg-blue-500", label: "Priority Action Items", value: "3", valColor: "text-blue-700" },
        ].map((kpi, i) => (
          <div key={i} className="flex-1 min-w-[140px] bg-white rounded-xl border border-gray-200 shadow-sm p-3.5 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg text-white flex items-center justify-center shrink-0 shadow-sm ${kpi.bg}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold whitespace-nowrap leading-tight">{kpi.label}</p>
              <p className={`text-xl font-black ${kpi.valColor}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Middle Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-4">
        {/* National Traffic Light Overview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
          <h3 className="text-sm font-bold text-blue-900 mb-6">National Traffic Light Overview</h3>
          <div className="flex-1 flex items-center gap-8 justify-center pb-4">
            <div className="w-36 h-36 shrink-0 relative">
               <svg viewBox="-4 -4 44 44" className="w-full h-full transform -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EF4444" strokeWidth="8" strokeDasharray="100, 100"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EAB308" strokeWidth="8" strokeDasharray="92, 100"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22C55E" strokeWidth="8" strokeDasharray="74, 100"/>
               </svg>
            </div>
            <div className="flex-1 space-y-4 max-w-[200px]">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div><span className="font-semibold text-gray-700">On Time (Green)</span></div>
                <div className="font-bold text-gray-900 w-20 text-right">28,594 <span className="text-gray-400 font-medium ml-1">(74%)</span></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><span className="font-semibold text-gray-700">Near Deadline (Yellow)</span></div>
                <div className="font-bold text-gray-900 w-20 text-right">6,918 <span className="text-gray-400 font-medium ml-1">(18%)</span></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="font-semibold text-gray-700">Overdue (Red)</span></div>
                <div className="font-bold text-gray-900 w-20 text-right">3,128 <span className="text-gray-400 font-medium ml-1">(8%)</span></div>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg border border-orange-100 p-2 flex items-center justify-center gap-3">
             <span className="text-sm font-bold text-gray-800">National Status:</span>
             <span className="border-2 border-orange-400 text-orange-500 font-black tracking-widest px-4 py-0.5 rounded text-lg bg-white shadow-sm">WATCH</span>
          </div>
        </div>

        {/* Critical Regions and Executive Attention */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
          <h3 className="text-sm font-bold text-blue-900 mb-4">Critical Regions and Executive Attention</h3>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-700 font-bold">
                  <th className="pb-2 px-2">Office / Region</th>
                  <th className="pb-2 px-2 text-center">Overdue</th>
                  <th className="pb-2 px-2 text-center">On-Time Rate</th>
                  <th className="pb-2 px-2">Primary Bottleneck</th>
                  <th className="pb-2 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { r: "Region XI (Davao Region)", o: "1,508", t: "47%", b: "Approval", s: "Critical", sc: "bg-red-100 text-red-700", ovC: "text-red-600 font-bold", tC: "text-red-600 font-bold" },
                  { r: "NCR (National Capital Region)", o: "858", t: "71%", b: "Evaluation", s: "Watch", sc: "bg-orange-50 text-orange-600 border border-orange-100", ovC: "text-red-500 font-bold", tC: "text-green-600 font-bold" },
                  { r: "Region VI (Western Visayas)", o: "528", t: "66%", b: "Inspection", s: "Watch", sc: "bg-orange-50 text-orange-600 border border-orange-100", ovC: "text-red-500 font-bold", tC: "text-orange-500 font-bold" },
                  { r: "Region VII (Central Visayas)", o: "500", t: "66%", b: "Evaluation", s: "Watch", sc: "bg-orange-50 text-orange-600 border border-orange-100", ovC: "text-red-500 font-bold", tC: "text-orange-500 font-bold" },
                  { r: "Housing and Real Estate Development Bureau", o: "412", t: "69%", b: "Approval", s: "Watch", sc: "bg-orange-50 text-orange-600 border border-orange-100", ovC: "text-red-500 font-bold", tC: "text-orange-500 font-bold" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2.5 px-2 font-medium text-gray-800">{row.r}</td>
                    <td className={`py-2.5 px-2 text-center ${row.ovC}`}>{row.o}</td>
                    <td className={`py-2.5 px-2 text-center ${row.tC}`}>{row.t}</td>
                    <td className="py-2.5 px-2 text-gray-600">{row.b}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`inline-block px-3 py-0.5 rounded text-[10px] font-bold ${row.sc}`}>{row.s}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Lower Middle Grid (4 Cols) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        
        {/* Regional Performance Snapshot */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
          <h3 className="text-xs font-bold text-blue-900 mb-3 text-center">Regional Performance Snapshot</h3>
          <div className="flex-1">
            <table className="w-full text-[10px] text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-800 font-bold">
                  <th className="pb-1.5 px-1">Region</th>
                  <th className="pb-1.5 px-1 text-right">Total Applications</th>
                  <th className="pb-1.5 px-1 text-center">On-Time Rate</th>
                  <th className="pb-1.5 px-1 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { r: "NCR", t: "7,140", o: "71%", oc: "text-green-600", s: "Good", sc: "bg-green-100 text-green-700" },
                  { r: "Region III", t: "5,224", o: "76%", oc: "text-green-600", s: "Good", sc: "bg-green-100 text-green-700" },
                  { r: "Region IV-A", t: "4,936", o: "74%", oc: "text-green-600", s: "Good", sc: "bg-green-100 text-green-700" },
                  { r: "Region VI", t: "4,118", o: "66%", oc: "text-orange-500", s: "Fair", sc: "bg-orange-100 text-orange-700" },
                  { r: "Region VII", t: "3,840", o: "66%", oc: "text-orange-500", s: "Fair", sc: "bg-orange-100 text-orange-700" },
                  { r: "Region XI", t: "4,002", o: "47%", oc: "text-red-600", s: "Critical", sc: "bg-red-100 text-red-700 border border-red-200" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2 px-1 font-bold text-blue-900">{row.r}</td>
                    <td className="py-2 px-1 text-right text-gray-700">{row.t}</td>
                    <td className={`py-2 px-1 text-center font-bold ${row.oc}`}>{row.o}</td>
                    <td className="py-2 px-1 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${row.sc}`}>{row.s}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* National Applications Trend */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
          <h3 className="text-xs font-bold text-blue-900 mb-2 text-center">National Applications Trend</h3>
          <div className="flex-1 flex items-end relative h-32 pt-5">
             <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] text-gray-400 font-medium">
               <span>50K</span><span>40K</span><span>30K</span><span>20K</span><span>10K</span><span>0</span>
             </div>
             <div className="ml-6 flex-1 h-full relative">
                <div className="absolute inset-0 flex flex-col justify-between"><div className="border-t border-gray-100 w-full"></div><div className="border-t border-gray-100 w-full"></div><div className="border-t border-gray-100 w-full"></div><div className="border-t border-gray-100 w-full"></div><div className="border-t border-gray-100 w-full"></div><div className="border-t border-gray-200 w-full"></div></div>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <polyline points="0,52 20,48 40,44 60,38 80,32 100,20" fill="none" stroke="#2563EB" strokeWidth="2.5" />
                   <circle cx="0" cy="52" r="3" fill="#2563EB"/>
                   <circle cx="20" cy="48" r="3" fill="#2563EB"/>
                   <circle cx="40" cy="44" r="3" fill="#2563EB"/>
                   <circle cx="60" cy="38" r="3" fill="#2563EB"/>
                   <circle cx="80" cy="32" r="3" fill="#2563EB"/>
                   <circle cx="100" cy="20" r="3" fill="#2563EB"/>
                </svg>
                <div className="absolute inset-0 w-full h-full text-[8px] font-bold text-gray-700">
                  <span className="absolute left-0 top-[35%] -translate-x-1/2">24,120</span>
                  <span className="absolute left-[20%] top-[30%] -translate-x-1/2">25,806</span>
                  <span className="absolute left-[40%] top-[25%] -translate-x-1/2">27,918</span>
                  <span className="absolute left-[60%] top-[20%] -translate-x-1/2">30,240</span>
                  <span className="absolute left-[80%] top-[15%] -translate-x-1/2">32,780</span>
                  <span className="absolute left-[100%] top-[5%] -translate-x-1/2">38,640</span>
                </div>
             </div>
          </div>
          <div className="ml-6 flex justify-between text-[8px] text-gray-500 mt-1 font-medium">
             <span>Oct '25</span><span>Nov '25</span><span>Dec '25</span><span>Jan '26</span><span>Feb '26</span><span>Mar '26</span><span>Apr '26</span>
          </div>
          <div className="text-center text-[9px] font-bold text-gray-600 mt-3 flex items-center justify-center gap-1">
             <div className="w-4 h-0.5 bg-blue-600"></div> Total Applications
          </div>
        </div>

        {/* Application Pipeline by Stage */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
          <h3 className="text-xs font-bold text-blue-900 mb-4 text-center">Application Pipeline by Stage</h3>
          <div className="flex-1 flex flex-col justify-center space-y-3.5">
             {[
               {l: "Intake",     v: 2800,  w: "15%"},
               {l: "Evaluation", v: 8412,  w: "45%"},
               {l: "Inspection", v: 5286,  w: "30%"},
               {l: "Approval",   v: 4108,  w: "22%"},
               {l: "Releasing",  v: 1100,  w: "8%"},
               {l: "Released",   v: 16934, w: "90%"},
             ].map((s,i) => (
               <div key={i} className="flex items-center gap-2 text-[10px]">
                 <span className="w-14 text-blue-900 font-bold">{s.l}</span>
                 <div className="flex-1 h-3.5">
                   <div className="h-full bg-[#0033A0] rounded-sm" style={{width: s.w}}></div>
                 </div>
                 <span className="w-8 text-right font-bold text-gray-800">{s.v.toLocaleString()}</span>
               </div>
             ))}
             <div className="flex justify-between pl-16 text-[9px] text-gray-400 border-t border-gray-100 pt-1 mt-2 font-medium">
               <span>0</span><span>5K</span><span>10K</span><span>15K</span><span>20K</span>
             </div>
          </div>
          <p className="text-[9px] text-gray-400 mt-2 text-center">Number of applications</p>
        </div>

        {/* Applications by Type */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
          <h3 className="text-xs font-bold text-blue-900 mb-2 text-center">Applications by Type</h3>
          <div className="flex-1 flex items-center justify-center gap-5 mt-2">
             <div className="w-24 h-24 shrink-0 relative">
               <svg viewBox="-4 -4 44 44" className="w-full h-full transform -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#9CA3AF" strokeWidth="10" strokeDasharray="100, 100"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="10" strokeDasharray="86, 100"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22C55E" strokeWidth="10" strokeDasharray="68, 100"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563EB" strokeWidth="10" strokeDasharray="41, 100"/>
               </svg>
             </div>
             <div className="space-y-2.5 text-[9px] font-bold">
               <div className="flex items-start gap-1.5"><div className="w-2 h-2 bg-[#2563EB] rounded-full mt-0.5 shrink-0"></div><span className="leading-tight text-blue-900">DP <span className="text-gray-400 font-normal">(Development Permit)</span><br/><span className="text-gray-700">15,842 (41%)</span></span></div>
               <div className="flex items-start gap-1.5"><div className="w-2 h-2 bg-[#22C55E] rounded-full mt-0.5 shrink-0"></div><span className="leading-tight text-blue-900">CNSA <span className="text-gray-400 font-normal">(Certification)</span><br/><span className="text-gray-700">10,436 (27%)</span></span></div>
               <div className="flex items-start gap-1.5"><div className="w-2 h-2 bg-[#F59E0B] rounded-full mt-0.5 shrink-0"></div><span className="leading-tight text-blue-900">LTS <span className="text-gray-400 font-normal">(Locational/Technical)</span><br/><span className="text-gray-700">7,148 (18%)</span></span></div>
               <div className="flex items-start gap-1.5"><div className="w-2 h-2 bg-gray-400 rounded-full mt-0.5 shrink-0"></div><span className="leading-tight text-blue-900">Others<br/><span className="text-gray-700">5,214 (14%)</span></span></div>
             </div>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-3 mt-3 px-2">
            <span className="text-[11px] font-bold text-gray-800">Total</span>
            <span className="text-[11px] font-black text-gray-900">38,640 <span className="text-gray-400 font-bold ml-1">(100%)</span></span>
          </div>
        </div>

      </div>

      {/* ── Executive Insights and Suggested Actions ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-blue-900 mb-4">Executive Insights and Suggested Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 divide-x divide-gray-100">
          
          <div className="flex items-start gap-3 px-2">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <TrendingUp size={24}/>
            </div>
            <div>
              <h4 className="text-xs font-bold text-green-700 mb-1">Best Performing Region</h4>
              <p className="text-[11px] text-gray-600 leading-snug">Region III (Central Luzon) recorded the highest on-time rate at 76%.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 px-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle size={24}/>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-600 mb-1">Most Critical Concern</h4>
              <p className="text-[11px] text-gray-600 leading-snug">Region XI has 1,508 overdue applications and requires immediate intervention.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 px-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
              <Settings size={24}/>
            </div>
            <div>
              <h4 className="text-xs font-bold text-orange-600 mb-1">Main Bottleneck</h4>
              <p className="text-[11px] text-gray-600 leading-snug">Approval remains the most frequent bottleneck in critical offices.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 pl-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <CheckSquare size={24}/>
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-700 mb-1">Recommended Actions</h4>
              <ul className="text-[10px] text-gray-600 space-y-1">
                <li>1) Direct focused backlog clearing in Region XI</li>
                <li>2) Review approval turnaround in HREDB</li>
                <li>3) Monitor NCR evaluation load</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

    </>
  );
}

function RegionalView() {
  return (
    <>
      {/* ── KPI Cards ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { icon: <Layers size={18}/>, bg: "bg-blue-600", label: "Total Applications", value: "4,896", valColor: "text-gray-900" },
          { icon: <ClipboardList size={18}/>, bg: "bg-blue-600", label: "For Evaluation", value: "1,284", valColor: "text-gray-900" },
          { icon: <Search size={18}/>, bg: "bg-blue-600", label: "For Inspection", value: "864", valColor: "text-gray-900" },
          { icon: <CheckCircle2 size={18}/>, bg: "bg-blue-600", label: "For Approval", value: "672", valColor: "text-gray-900" },
          { icon: <FileCheck2 size={18}/>, bg: "bg-green-600", label: "Released", value: "2,008", valColor: "text-gray-900" },
          { icon: <AlertTriangle size={18}/>, bg: "bg-red-500", label: "Overdue", value: "312", valColor: "text-red-600" },
        ].map((kpi, i) => (
          <div key={i} className="flex-1 min-w-[130px] bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg text-white flex items-center justify-center shrink-0 shadow-sm ${kpi.bg}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold whitespace-nowrap">{kpi.label}</p>
              <p className={`text-xl font-black ${kpi.valColor}`}>{kpi.value}</p>
            </div>
          </div>
        ))}

        {/* On-Time Rate Circle */}
        <div className="flex-1 min-w-[160px] bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
          <div className="relative w-12 h-12 shrink-0">
             <svg viewBox="-4 -4 44 44" className="w-full h-full transform -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="4"/>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray="72, 100"/>
             </svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold">On-Time Rate (NCR)</p>
            <p className="text-xl font-black text-gray-900">72%</p>
          </div>
        </div>
      </div>

      {/* ── Middle Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
        {/* Traffic Light Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-6">Traffic Light Summary (NCR)</h3>
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 shrink-0 relative">
               <svg viewBox="-4 -4 44 44" className="w-full h-full transform -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EF4444" strokeWidth="8" strokeDasharray="100, 100"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EAB308" strokeWidth="8" strokeDasharray="94, 100"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22C55E" strokeWidth="8" strokeDasharray="53, 100"/>
               </svg>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div><span className="font-semibold text-gray-700">On Time (Green)</span></div>
                <div className="font-bold text-gray-900">2,620 <span className="text-gray-400 font-medium ml-1">(53%)</span></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><span className="font-semibold text-gray-700">Near Deadline (Yellow)</span></div>
                <div className="font-bold text-gray-900">1,276 <span className="text-gray-400 font-medium ml-1">(26%)</span></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="font-semibold text-gray-700">Overdue (Red)</span></div>
                <div className="font-bold text-gray-900">312 <span className="text-gray-400 font-medium ml-1">(6%)</span></div>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="font-bold text-gray-800">Total</div>
                <div className="font-bold text-gray-900">4,896 <span className="text-gray-400 font-medium ml-1">(100%)</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Office Performance */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Regional Office Performance <span className="text-xs font-normal text-gray-500">(as of April 2026)</span></h3>
            <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors">View All Regions →</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 font-bold">
                  <th className="pb-2 px-2 w-8">#</th>
                  <th className="pb-2 px-2">Regional Office</th>
                  <th className="pb-2 px-2 w-[180px]">Total Applications</th>
                  <th className="pb-2 px-2 text-green-600">On-Time</th>
                  <th className="pb-2 px-2 text-yellow-600">Near Deadline</th>
                  <th className="pb-2 px-2 text-red-500">Overdue</th>
                  <th className="pb-2 px-2 text-center">Performance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { id: 1, name: "NCR (National Capital Region)", total: 4896, on: "2,620 (53%)", near: "1,276 (26%)", over: "312 (6%)", w: "100%", stat: "Good", statC: "bg-green-100 text-green-700" },
                  { id: 2, name: "Region IV-A (CALABARZON)", total: 3412, on: "1,912 (56%)", near: "872 (26%)", over: "186 (5%)", w: "70%", stat: "Good", statC: "bg-green-100 text-green-700" },
                  { id: 3, name: "Region III (Central Luzon)", total: 2978, on: "1,523 (51%)", near: "964 (32%)", over: "212 (7%)", w: "60%", stat: "Fair", statC: "bg-orange-100 text-orange-700" },
                  { id: 4, name: "Region VII (Central Visayas)", total: 2201, on: "1,089 (49%)", near: "726 (33%)", over: "151 (7%)", w: "45%", stat: "Fair", statC: "bg-orange-100 text-orange-700" },
                  { id: 5, name: "Region VI (Western Visayas)", total: 1845, on: "872 (47%)", near: "650 (35%)", over: "120 (6%)", w: "38%", stat: "Fair", statC: "bg-orange-100 text-orange-700" },
                ].map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-2 text-gray-500">{r.id}</td>
                    <td className="py-2.5 px-2 font-medium text-gray-800">{r.name}</td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold w-10 text-right text-gray-900">{r.total.toLocaleString()}</span>
                        <div className="flex-1 h-3.5 bg-blue-100 rounded overflow-hidden">
                          <div className="h-full bg-blue-500 rounded" style={{width: r.w}}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-green-600 font-medium">{r.on}</td>
                    <td className="py-2.5 px-2 text-yellow-600 font-medium">{r.near}</td>
                    <td className="py-2.5 px-2 text-red-500 font-medium">{r.over}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`inline-block px-3 py-0.5 rounded text-[10px] font-bold ${r.statC}`}>{r.stat}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Bottom Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
          <h3 className="text-xs font-bold text-gray-800 mb-2">Applications Trend (Monthly) - NCR</h3>
          <div className="flex-1 flex items-end relative h-32 pt-4">
             <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] text-gray-400">
               <span>4K</span><span>3K</span><span>2K</span><span>1K</span><span>0</span>
             </div>
             <div className="ml-6 flex-1 h-full relative">
                <div className="absolute inset-0 flex flex-col justify-between"><div className="border-t border-gray-100 w-full"></div><div className="border-t border-gray-100 w-full"></div><div className="border-t border-gray-100 w-full"></div><div className="border-t border-gray-100 w-full"></div><div className="border-t border-gray-200 w-full"></div></div>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <polyline points="0,60 20,40 40,70 60,50 80,30 100,20" fill="none" stroke="#2563EB" strokeWidth="2" />
                   <circle cx="0" cy="60" r="2.5" fill="#2563EB"/>
                   <circle cx="20" cy="40" r="2.5" fill="#2563EB"/>
                   <circle cx="40" cy="70" r="2.5" fill="#2563EB"/>
                   <circle cx="60" cy="50" r="2.5" fill="#2563EB"/>
                   <circle cx="80" cy="30" r="2.5" fill="#2563EB"/>
                   <circle cx="100" cy="20" r="2.5" fill="#2563EB"/>
                </svg>
             </div>
          </div>
          <div className="ml-6 flex justify-between text-[9px] text-gray-500 mt-1">
             <span>Nov '25</span><span>Dec '25</span><span>Jan '26</span><span>Feb '26</span><span>Mar '26</span><span>Apr '26</span>
          </div>
          <p className="text-[9px] text-gray-400 mt-3">Monthly trend for the selected year (2026).</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
          <h3 className="text-xs font-bold text-gray-800 mb-2">Applications by Type (NCR)</h3>
          <div className="flex-1 flex items-center justify-center gap-4">
             <div className="w-20 h-20 shrink-0 relative">
               <svg viewBox="-4 -4 44 44" className="w-full h-full transform -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="8" strokeDasharray="100, 100"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3B82F6" strokeWidth="8" strokeDasharray="85, 100"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563EB" strokeWidth="8" strokeDasharray="60, 100"/>
               </svg>
             </div>
             <div className="space-y-2 text-[10px] font-bold">
               <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#2563EB] rounded-sm"></div>DP (60%)</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#3B82F6] rounded-sm"></div>CRAS (25%)</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#F59E0B] rounded-sm"></div>Others (15%)</div>
             </div>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
            <span className="text-[10px] font-bold text-gray-800">Total</span>
            <span className="text-[10px] font-bold text-gray-900">4,896</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
          <h3 className="text-xs font-bold text-gray-800 mb-2">Applications by Stage (NCR)</h3>
          <div className="flex-1 flex flex-col justify-center space-y-3">
             {[
               {l: "Evaluation", v: 1284, w: "60%"},
               {l: "Inspection", v: 864,  w: "45%"},
               {l: "Approval",   v: 672,  w: "35%"},
               {l: "Released",   v: 2008, w: "80%"},
               {l: "Releasing",  v: 68,   w: "10%"},
             ].map((s,i) => (
               <div key={i} className="flex items-center gap-2 text-[10px]">
                 <span className="w-14 text-gray-600 font-medium">{s.l}</span>
                 <div className="flex-1 h-3 bg-gray-100 rounded">
                   <div className="h-full bg-blue-600 rounded" style={{width: s.w}}></div>
                 </div>
                 <span className="w-8 text-right font-bold text-gray-800">{s.v.toLocaleString()}</span>
               </div>
             ))}
             <div className="flex justify-between pl-16 text-[9px] text-gray-400 border-t border-gray-100 pt-1 mt-1">
               <span>0</span><span>1K</span><span>2K</span><span>3K</span>
             </div>
          </div>
          <p className="text-[9px] text-gray-400 mt-2">Number of applications per current stage.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
          <h3 className="text-xs font-bold text-gray-800 mb-2">Monitoring by Stage (NCR)</h3>
          <div className="flex-1 flex flex-col text-[10px]">
            <div className="flex font-bold text-gray-600 border-b border-gray-100 pb-1 mb-1">
              <div className="w-14"></div>
              <div className="flex-1 text-center flex items-center justify-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>On Time</div>
              <div className="flex-1 text-center flex items-center justify-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>Near Deadline</div>
              <div className="flex-1 text-center flex items-center justify-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Overdue</div>
            </div>
            {[
               {l: "Intake",     o: "1,052 (60%)", n: "552 (31%)", r: "132 (7%)"},
               {l: "Evaluation", o: "712 (56%)",   n: "398 (31%)", r: "174 (13%)"},
               {l: "Inspection", o: "430 (50%)",   n: "286 (33%)", r: "148 (17%)"},
               {l: "Approval",   o: "326 (48%)",   n: "220 (32%)", r: "126 (19%)"},
               {l: "Releasing",  o: "100 (63%)",   n: "80 (25%)",  r: "20 (12%)"},
            ].map((s,i) => (
              <div key={i} className="flex py-1.5 border-b border-gray-50 last:border-0">
                <div className="w-14 font-medium text-gray-600">{s.l}</div>
                <div className="flex-1 text-center text-gray-800">{s.o}</div>
                <div className="flex-1 text-center text-gray-800">{s.n}</div>
                <div className="flex-1 text-center text-gray-800">{s.r}</div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-gray-400 mt-2">Traffic light status by application stage.</p>
        </div>
      </div>
    </>
  );
}

function BureauView() {
  return (
    <>
      {/* ── KPI Cards ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { icon: <Layers size={18}/>, bg: "bg-blue-600", label: "Total Applications", value: "24,758", valColor: "text-gray-900" },
          { icon: <ClipboardList size={18}/>, bg: "bg-blue-600", label: "For Evaluation", value: "6,384", valColor: "text-gray-900" },
          { icon: <Search size={18}/>, bg: "bg-blue-600", label: "For Inspection", value: "4,219", valColor: "text-gray-900" },
          { icon: <CheckCircle2 size={18}/>, bg: "bg-blue-600", label: "For Approval", value: "3,812", valColor: "text-gray-900" },
          { icon: <FileCheck2 size={18}/>, bg: "bg-green-600", label: "Released", value: "8,217", valColor: "text-gray-900" },
          { icon: <AlertTriangle size={18}/>, bg: "bg-red-500", label: "Overdue", value: "2,332", valColor: "text-red-600" },
        ].map((kpi, i) => (
          <div key={i} className="flex-1 min-w-[130px] bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg text-white flex items-center justify-center shrink-0 shadow-sm ${kpi.bg}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold whitespace-nowrap">{kpi.label}</p>
              <p className={`text-xl font-black ${kpi.valColor}`}>{kpi.value}</p>
            </div>
          </div>
        ))}

        {/* On-Time Rate Circle */}
        <div className="flex-1 min-w-[160px] bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
          <div className="relative w-12 h-12 shrink-0">
             <svg viewBox="-4 -4 44 44" className="w-full h-full transform -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="4"/>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray="72, 100"/>
             </svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold">On-Time Rate (Bureau)</p>
            <p className="text-xl font-black text-gray-900">72%</p>
          </div>
        </div>
      </div>

      {/* ── Middle Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
        {/* Traffic Light Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-6">Traffic Light Summary (Bureau-Wide)</h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 shrink-0 relative">
               <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EF4444" strokeWidth="8" strokeDasharray="100, 100"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EAB308" strokeWidth="8" strokeDasharray="91, 100"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22C55E" strokeWidth="8" strokeDasharray="72, 100"/>
               </svg>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div><span className="font-semibold text-gray-700">On Time (Green)</span></div>
                <div className="font-bold text-gray-900">17,839 <span className="text-gray-400 font-medium ml-1 w-10 inline-block text-right">(72%)</span></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><span className="font-semibold text-gray-700">Near Deadline (Yellow)</span></div>
                <div className="font-bold text-gray-900">4,587 <span className="text-gray-400 font-medium ml-1 w-10 inline-block text-right">(19%)</span></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="font-semibold text-gray-700">Overdue (Red)</span></div>
                <div className="font-bold text-gray-900">2,332 <span className="text-gray-400 font-medium ml-1 w-10 inline-block text-right">(9%)</span></div>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="font-bold text-gray-800">Total</div>
                <div className="font-bold text-gray-900">24,758 <span className="text-gray-400 font-medium ml-1 w-10 inline-block text-right">(100%)</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Office Performance */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Regional Office Performance <span className="text-xs font-normal text-gray-500">(as of April 2026)</span></h3>
            <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors">View All Regions →</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 font-bold">
                  <th className="pb-2 px-2 w-8">#</th>
                  <th className="pb-2 px-2">Regional Office</th>
                  <th className="pb-2 px-2 w-[180px]">Total Applications</th>
                  <th className="pb-2 px-2 text-green-600">On-Time</th>
                  <th className="pb-2 px-2 text-yellow-600">Near Deadline</th>
                  <th className="pb-2 px-2 text-red-500">Overdue</th>
                  <th className="pb-2 px-2 text-center">Performance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { id: 1, name: "NCR (National Capital Region)", total: 6142, on: "4,250 (69%)", near: "1,254 (20%)", over: "638 (10%)", w: "100%", stat: "Good", statC: "bg-green-100 text-green-700" },
                  { id: 2, name: "Region III (Central Luzon)", total: 4512, on: "3,210 (71%)", near: "860 (19%)", over: "442 (10%)", w: "75%", stat: "Good", statC: "bg-green-100 text-green-700" },
                  { id: 3, name: "Region IV-A (CALABARZON)", total: 4018, on: "2,789 (69%)", near: "807 (20%)", over: "422 (11%)", w: "65%", stat: "Good", statC: "bg-green-100 text-green-700" },
                  { id: 4, name: "Region VI (Western Visayas)", total: 3326, on: "2,160 (65%)", near: "726 (22%)", over: "440 (13%)", w: "54%", stat: "Fair", statC: "bg-orange-100 text-orange-700" },
                  { id: 5, name: "Region VII (Central Visayas)", total: 3094, on: "1,997 (65%)", near: "611 (20%)", over: "486 (16%)", w: "50%", stat: "Fair", statC: "bg-orange-100 text-orange-700" },
                  { id: 6, name: "Region XI (Davao Region)", total: 3666, on: "1,433 (39%)", near: "329 (9%)", over: "1,904 (52%)", w: "60%", stat: "Critical", statC: "bg-red-100 text-red-700 border border-red-200" },
                ].map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-2 text-gray-500">{r.id}</td>
                    <td className="py-2.5 px-2 font-medium text-gray-800">{r.name}</td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold w-10 text-right text-gray-900">{r.total.toLocaleString()}</span>
                        <div className="flex-1 h-3.5 bg-blue-100 rounded overflow-hidden">
                          <div className="h-full bg-blue-500 rounded" style={{width: r.w}}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-green-600 font-medium">{r.on}</td>
                    <td className="py-2.5 px-2 text-yellow-600 font-medium">{r.near}</td>
                    <td className="py-2.5 px-2 text-red-500 font-medium">{r.over}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`inline-block px-3 py-0.5 rounded text-[10px] font-bold ${r.statC}`}>{r.stat}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
        
        {/* Monitoring by Regional Office (Stacked Bar) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col col-span-1 lg:col-span-1">
          <h3 className="text-xs font-bold text-gray-800 mb-2">Monitoring by Regional Office</h3>
          <div className="flex gap-4 text-[9px] font-bold mb-3">
             <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-600 rounded-sm"></div>On Time</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500 rounded-sm"></div>Near Deadline</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-600 rounded-sm"></div>Overdue</div>
          </div>
          <div className="flex-1 flex flex-col justify-between text-[10px]">
             {[
               {name: "NCR", o: "69%", n: "20%", r: "10%"},
               {name: "Region III", o: "71%", n: "19%", r: "10%"},
               {name: "Region IV-A", o: "69%", n: "20%", r: "11%"},
               {name: "Region VI", o: "65%", n: "22%", r: "13%"},
               {name: "Region VII", o: "65%", n: "20%", r: "16%"},
               {name: "Region XI", o: "39%", n: "9%", r: "52%"},
             ].map((r,i) => (
               <div key={i} className="flex items-center gap-2">
                 <span className="w-12 font-medium text-gray-600 truncate">{r.name}</span>
                 <div className="flex-1 h-5 rounded overflow-hidden flex text-white font-bold text-[8px]">
                   <div className="bg-green-600 flex items-center justify-center" style={{width: r.o}}>{r.o}</div>
                   <div className="bg-yellow-500 flex items-center justify-center" style={{width: r.n}}>{r.n}</div>
                   <div className="bg-red-600 flex items-center justify-center" style={{width: r.r}}>{r.r}</div>
                 </div>
               </div>
             ))}
             <div className="flex justify-between pl-14 text-[9px] text-gray-400 pt-1 mt-1 border-t border-gray-100">
               <span>0%</span><span>20%</span><span>40%</span><span>60%</span><span>80%</span><span>100%</span>
             </div>
             <p className="text-[9px] text-gray-400 mt-2 text-center">Percentage of Applications</p>
          </div>
        </div>

        {/* Applications Trend (Monthly) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col col-span-1 lg:col-span-1">
          <h3 className="text-xs font-bold text-gray-800 mb-2">Applications Trend (Monthly) - Bureau-Wide</h3>
          <div className="flex-1 flex items-end relative h-32 pt-4">
             <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] text-gray-400">
               <span>25K</span><span>20K</span><span>15K</span><span>10K</span><span>5K</span><span>0</span>
             </div>
             <div className="ml-6 flex-1 h-full relative">
                <div className="absolute inset-0 flex flex-col justify-between"><div className="border-t border-gray-100 w-full"></div><div className="border-t border-gray-100 w-full"></div><div className="border-t border-gray-100 w-full"></div><div className="border-t border-gray-100 w-full"></div><div className="border-t border-gray-100 w-full"></div><div className="border-t border-gray-200 w-full"></div></div>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <polyline points="0,60 20,55 40,40 60,35 80,30 100,20" fill="none" stroke="#2563EB" strokeWidth="2" />
                   <circle cx="0" cy="60" r="2.5" fill="#2563EB"/>
                   <circle cx="20" cy="55" r="2.5" fill="#2563EB"/>
                   <circle cx="40" cy="40" r="2.5" fill="#2563EB"/>
                   <circle cx="60" cy="35" r="2.5" fill="#2563EB"/>
                   <circle cx="80" cy="30" r="2.5" fill="#2563EB"/>
                   <circle cx="100" cy="20" r="2.5" fill="#2563EB"/>
                </svg>
                <div className="absolute inset-0 w-full h-full text-[8px] font-bold text-gray-600">
                  <span className="absolute left-0 top-[45%] -translate-x-1/2">17,420</span>
                  <span className="absolute left-[20%] top-[40%] -translate-x-1/2">18,345</span>
                  <span className="absolute left-[40%] top-[25%] -translate-x-1/2">19,812</span>
                  <span className="absolute left-[60%] top-[20%] -translate-x-1/2">20,761</span>
                  <span className="absolute left-[80%] top-[15%] -translate-x-1/2">21,096</span>
                  <span className="absolute left-[100%] top-[5%] -translate-x-1/2">24,758</span>
                </div>
             </div>
          </div>
          <div className="ml-6 flex justify-between text-[8px] text-gray-500 mt-1">
             <span>Oct '25</span><span>Nov '25</span><span>Dec '25</span><span>Jan '26</span><span>Feb '26</span><span>Mar '26</span><span>Apr '26</span>
          </div>
          <p className="text-[9px] text-gray-400 mt-3">Monthly trend for the selected year (2026).</p>
        </div>

        {/* Applications by Type */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col col-span-1 lg:col-span-1">
          <h3 className="text-xs font-bold text-gray-800 mb-2">Applications by Type (Bureau-Wide)</h3>
          <div className="flex-1 flex items-center justify-center gap-4">
             <div className="w-20 h-20 shrink-0 relative">
               <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#9CA3AF" strokeWidth="8" strokeDasharray="100, 100"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="8" strokeDasharray="90, 100"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3B82F6" strokeWidth="8" strokeDasharray="73, 100"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563EB" strokeWidth="8" strokeDasharray="41, 100"/>
               </svg>
             </div>
             <div className="space-y-2 text-[9px] font-bold">
               <div className="flex items-start gap-1.5"><div className="w-2 h-2 bg-[#2563EB] rounded-sm mt-0.5 shrink-0"></div><span className="leading-tight">DP (Development Permit)<br/><span className="text-gray-500 font-medium">10,214 (41%)</span></span></div>
               <div className="flex items-start gap-1.5"><div className="w-2 h-2 bg-[#3B82F6] rounded-sm mt-0.5 shrink-0"></div><span className="leading-tight">CNSA (Certification)<br/><span className="text-gray-500 font-medium">7,896 (32%)</span></span></div>
               <div className="flex items-start gap-1.5"><div className="w-2 h-2 bg-[#F59E0B] rounded-sm mt-0.5 shrink-0"></div><span className="leading-tight">LTS (Locational/Technical<br/>clearance) <span className="text-gray-500 font-medium">4,213 (17%)</span></span></div>
               <div className="flex items-start gap-1.5"><div className="w-2 h-2 bg-gray-400 rounded-sm mt-0.5 shrink-0"></div><span className="leading-tight">Others<br/><span className="text-gray-500 font-medium">2,435 (10%)</span></span></div>
             </div>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
            <span className="text-[10px] font-bold text-gray-800">Total</span>
            <span className="text-[10px] font-bold text-gray-900">24,758 <span className="text-gray-400 font-medium ml-1">(100%)</span></span>
          </div>
        </div>

        {/* Applications by Stage */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col col-span-1 lg:col-span-1">
          <h3 className="text-xs font-bold text-gray-800 mb-2">Applications by Stage (Bureau-Wide)</h3>
          <div className="flex-1 flex flex-col justify-center space-y-3">
             {[
               {l: "Evaluation", v: 6384, w: "70%"},
               {l: "Inspection", v: 4219, w: "50%"},
               {l: "Approval",   v: 3812, w: "45%"},
               {l: "Released",   v: 8217, w: "90%"},
               {l: "Releasing",  v: 2126, w: "30%"},
             ].map((s,i) => (
               <div key={i} className="flex items-center gap-2 text-[10px]">
                 <span className="w-14 text-gray-600 font-medium">{s.l}</span>
                 <div className="flex-1 h-3 bg-gray-100 rounded">
                   <div className="h-full bg-blue-600 rounded" style={{width: s.w}}></div>
                 </div>
                 <span className="w-8 text-right font-bold text-gray-800">{s.v.toLocaleString()}</span>
               </div>
             ))}
             <div className="flex justify-between pl-16 text-[9px] text-gray-400 border-t border-gray-100 pt-1 mt-1">
               <span>0</span><span>5K</span><span>10K</span><span>15K</span>
             </div>
          </div>
          <p className="text-[9px] text-gray-400 mt-2">Number of applications per current stage.</p>
        </div>

        {/* Regional Offices Requiring Attention */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col col-span-1 lg:col-span-1">
          <h3 className="text-xs font-bold text-gray-800 mb-1">Regional Offices Requiring Attention</h3>
          <p className="text-[9px] text-gray-500 mb-2 font-medium">Ranked by highest overdue applications</p>
          <div className="flex-1">
            <table className="w-full text-[10px] text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-700 font-bold">
                  <th className="pb-1.5 px-1 w-4">#</th>
                  <th className="pb-1.5 px-1">Regional Office</th>
                  <th className="pb-1.5 px-1 text-right">Overdue</th>
                  <th className="pb-1.5 px-1 text-right">On-Time Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  {i: 1, n: "Region XI (Davao Region)", o: "1,904", r: "39%", bg: "bg-red-500 text-white"},
                  {i: 2, n: "Region VII (Central Visayas)", o: "486", r: "65%", bg: "bg-red-100 text-red-700 font-bold"},
                  {i: 3, n: "Region VI (Western Visayas)", o: "440", r: "65%", bg: "bg-red-100 text-red-700 font-bold"},
                  {i: 4, n: "Region IV-A (CALABARZON)", o: "422", r: "69%", bg: "bg-red-100 text-red-700 font-bold"},
                  {i: 5, n: "Region III (Central Luzon)", o: "442", r: "71%", bg: "bg-red-100 text-red-700 font-bold"},
                  {i: 6, n: "NCR (National Capital Region)", o: "638", r: "69%", bg: "bg-red-100 text-red-700 font-bold"},
                ].map((r) => (
                  <tr key={r.i} className="hover:bg-gray-50">
                    <td className="py-1.5 px-1"><div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] ${r.bg}`}>{r.i}</div></td>
                    <td className="py-1.5 px-1 font-medium text-gray-700">{r.n}</td>
                    <td className="py-1.5 px-1 text-right font-bold text-gray-900">{r.o}</td>
                    <td className="py-1.5 px-1 text-right text-orange-600 font-bold">{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
