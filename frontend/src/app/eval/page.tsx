"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// ──────────────────────────────────────────────────────────────
// Icons
// ──────────────────────────────────────────────────────────────
const DocumentIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const ResetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
);
const ViewIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
);
const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

// Stat Card Icons
const StatTotalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const StatCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const StatClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const StatAlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

// Generic Thumbnail Component for items
const Thumbnail = ({ color }: { color: string }) => (
  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${color} shadow-inner border border-gray-100`}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  </div>
);

export default function MyReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [reportsData, setReportsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [previewReport, setPreviewReport] = useState<any | null>(null);
  const router = useRouter();

  const handleDownloadPDF = async (row: any) => {
    setIsGeneratingPDF(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate_report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_data: row }),
      });
      if (!response.ok) throw new Error("Failed to generate report");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BIS_Report_${row.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF report. Please ensure the backend is running.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    async function fetchReports() {
      try {
        const q = query(collection(db, "analysisHistory"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => {
          const fbData = doc.data();
          const colors = ['from-blue-400 to-blue-600', 'from-gray-700 to-gray-900', 'from-orange-700 to-orange-900', 'from-cyan-500 to-cyan-700', 'from-slate-600 to-slate-800'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          return {
            id: doc.id.substring(0, 6).toUpperCase(),
            rawId: doc.id,
            title: fbData.product || "Document Upload",
            type: fbData.inputType === "Quick Search" ? "Product Analysis" : "Document Analysis",
            dept: fbData.department || "Procurement",
            date: fbData.date,
            time: fbData.time,
            status: fbData.status,
            compliance: fbData.complianceStatus,
            color: randomColor
          };
        });
        
        if (data.length > 0) {
          setReportsData(data);
        } else {
          throw new Error("No data found");
        }
      } catch (err) {
        console.error("Error fetching reports, using mock data:", err);
        const mockData = [
          { id: "A1B2C3", rawId: "A1B2C3", title: "Laptop Computers", type: "Product Analysis", dept: "IT Department", date: "2023-10-01", time: "10:30 AM", status: "Completed", compliance: "Compliant", color: "from-blue-400 to-blue-600" },
          { id: "X9Y8Z7", rawId: "X9Y8Z7", title: "Office Chairs", type: "Product Analysis", dept: "HR Department", date: "2023-09-28", time: "02:15 PM", status: "Completed", compliance: "Minor Issues", color: "from-orange-700 to-orange-900" },
          { id: "M4N5P6", rawId: "M4N5P6", title: "Water Purifiers", type: "Tender Analysis", dept: "Facilities", date: "2023-09-25", time: "11:45 AM", status: "In Progress", compliance: "Pending", color: "from-gray-700 to-gray-900" },
          { id: "Q1W2E3", rawId: "Q1W2E3", title: "Electrical Cables", type: "Product Analysis", dept: "Maintenance", date: "2023-09-20", time: "09:00 AM", status: "Completed", compliance: "Non-Compliant", color: "from-red-500 to-red-700" }
        ];
        setReportsData(mockData);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReports();
  }, []);

  const stats = {
    total: reportsData.length,
    completed: reportsData.filter(d => d.status === "Completed").length,
    inProgress: reportsData.filter(d => d.status === "In Progress").length,
    issuesFound: reportsData.filter(d => d.compliance === "Non-Compliant" || d.compliance === "Compliance Issues").length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans">
      
      {/* ─────────────────────────────────────────────────────────
          Hero / Header Section
          ───────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 border-b border-gray-200 pt-6 pb-8 px-8 relative overflow-hidden">
        {/* Background building placeholder */}
        <div className="absolute right-0 bottom-0 opacity-30 pointer-events-none w-1/3 h-full bg-cover bg-no-repeat bg-right-bottom" style={{ backgroundImage: "url('/building.png')" }}></div>
        
        <div className="max-w-[1400px] mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6 tracking-wide">
            <Link href="/" className="hover:text-[#1565C0] transition-colors">Home</Link>
            <ChevronIcon />
            <span className="text-[#0B3558]">My Reports</span>
          </div>

          <div className="flex items-center gap-4 mb-2">
            <div className="bg-[#1565C0] text-white p-3 rounded-xl shadow-md">
              <DocumentIcon />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[#0B3558] tracking-tight">My Reports</h1>
              <p className="text-gray-600 font-medium text-sm mt-1">View, download and manage your analysis reports</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 mt-6 space-y-6">
        
        {/* ─────────────────────────────────────────────────────────
            Top Stats Cards
            ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1565C0] text-white flex items-center justify-center shadow-sm">
                <StatTotalIcon />
              </div>
              <div>
                <p className="text-2xl font-black text-[#0B3558] leading-tight">{stats.total}</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Reports</p>
              </div>
            </div>
            <div className="text-blue-300 opacity-50">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#10B981] text-white flex items-center justify-center shadow-sm">
              <StatCheckIcon />
            </div>
            <div>
              <p className="text-2xl font-black text-[#0B3558] leading-tight">{stats.completed}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Completed Analyses</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center shadow-sm">
              <StatClockIcon />
            </div>
            <div>
              <p className="text-2xl font-black text-[#0B3558] leading-tight">{stats.inProgress}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">In Progress</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EF4444] text-white flex items-center justify-center shadow-sm">
              <StatAlertIcon />
            </div>
            <div>
              <p className="text-2xl font-black text-[#0B3558] leading-tight">{stats.issuesFound}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Compliance Issues Found</p>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────
            Main Panel (Filters + Table)
            ───────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          
          {/* Filters Bar */}
          <div className="p-5 border-b border-gray-100 flex flex-wrap items-end gap-4 bg-white">
            
            <div className="flex-1 min-w-[250px]">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Search Reports</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </div>
                <input 
                  type="text" 
                  placeholder="Search by product name, report title or date..." 
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] transition-shadow"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="w-40">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Date Range</label>
              <div className="relative">
                <select className="w-full pl-8 pr-4 py-2 appearance-none border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] bg-white transition-shadow cursor-pointer">
                  <option>Last 30 Days</option>
                </select>
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
              </div>
            </div>

            <div className="w-32">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] bg-white transition-shadow cursor-pointer">
                <option>All</option>
              </select>
            </div>

            <div className="w-48">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Department</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] bg-white transition-shadow cursor-pointer">
                <option>All Departments</option>
              </select>
            </div>

            <div className="w-40">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Report Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] bg-white transition-shadow cursor-pointer">
                <option>All Types</option>
              </select>
            </div>

            <button className="bg-[#1565C0] hover:bg-blue-700 text-white rounded-lg px-5 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors h-[38px]">
              <ResetIcon />
              Reset
            </button>
          </div>

          {/* Table */}
          <div className="overflow-hidden w-full">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#f8fafc] text-[#0B3558] text-xs font-bold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 w-12 text-center">#</th>
                  <th className="px-4 py-4">Product / Title</th>
                  <th className="px-4 py-4">Report Type</th>
                  <th className="px-4 py-4">Department</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Compliance</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {reportsData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 text-center font-medium text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Thumbnail color={row.color} />
                        <div className="min-w-0">
                          <p className="font-bold text-[#0B3558] text-sm max-w-[250px] truncate" title={row.title}>{row.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Report ID: <span className="font-medium text-gray-600">{row.id}</span></p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                        row.type === 'Product Analysis' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        row.type === 'Tender Analysis' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-700 font-medium text-[13px] max-w-[150px] truncate" title={row.dept}>{row.dept}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800 font-medium text-[13px]">{row.date}</p>
                      <p className="text-gray-500 text-[11px]">{row.time}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                        row.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                        row.compliance === 'Compliant' ? 'bg-green-50 text-green-700 border-green-200' :
                        row.compliance === 'Minor Issues' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        (row.compliance === 'Compliance Issues' || row.compliance === 'Non-Compliant') ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-gray-100 text-gray-700 border-gray-300'
                      }`}>
                        {row.compliance}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setPreviewReport(row)}
                          className="flex items-center gap-1 border border-blue-200 text-[#1565C0] hover:bg-blue-50 px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors shadow-sm"
                        >
                          <ViewIcon /> View
                        </button>
                        <button 
                          onClick={() => handleDownloadPDF(row)}
                          disabled={isGeneratingPDF}
                          className="flex items-center gap-1 border border-blue-200 text-[#1565C0] hover:bg-blue-50 px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors shadow-sm disabled:opacity-50"
                        >
                          <DownloadIcon /> PDF
                        </button>
                        <button className="flex items-center gap-1 border border-blue-200 text-[#1565C0] hover:bg-blue-50 px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors shadow-sm">
                          <DocumentIcon /> DOCX
                        </button>
                        <button className="flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 px-2 py-1.5 rounded-md transition-colors shadow-sm">
                          <MoreIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-5 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600 bg-white mt-auto">
            <div className="font-medium text-gray-500 text-[13px]">Showing 1 to {reportsData.length} of {stats.total || reportsData.length} reports</div>
            <div className="flex gap-1 items-center">
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 text-gray-500 font-bold">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center border border-blue-600 bg-[#1565C0] text-white rounded font-bold shadow-sm">1</button>
              {stats.total > 10 && (
                <>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium">2</button>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium">3</button>
                  <span className="px-1 text-gray-400">...</span>
                  <button className="w-9 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium">{Math.ceil(stats.total / 10)}</button>
                </>
              )}
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 text-gray-500 font-bold">&gt;</button>
            </div>
          </div>

        </div>
      </div>

      {/* Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <div>
                <h3 className="font-bold text-[#0B3558] text-lg">{previewReport.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Report ID: {previewReport.id} • {previewReport.type}</p>
              </div>
              <button 
                onClick={() => setPreviewReport(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm font-semibold text-[#0B3558]">{previewReport.status}</p>
                </div>
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Compliance</p>
                  <p className="text-sm font-semibold text-[#0B3558]">{previewReport.compliance}</p>
                </div>
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Department</p>
                  <p className="text-sm font-semibold text-[#0B3558]">{previewReport.dept}</p>
                </div>
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm font-semibold text-[#0B3558]">{previewReport.date} {previewReport.time}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2 border-b border-gray-100 pb-2">Analysis Summary</h4>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    This is a preview of the report for <strong>{previewReport.title}</strong>. The full analysis contains detailed normative references, specifications mapping, and compliance verification against BIS standards.
                  </p>
                  
                  {previewReport.type === 'Product Analysis' && (
                    <div className="bg-green-50/50 border border-green-100 rounded-lg p-4 mb-4">
                      <p className="text-xs font-semibold text-green-800 mb-1">Key BIS Match</p>
                      <p className="text-sm text-green-700">A suitable Indian Standard is available for this product category. View the full report to see the IS Number and requirements.</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
                  <div className="text-gray-400 mb-3 bg-white p-4 rounded-full shadow-sm">
                    <DocumentIcon />
                  </div>
                  <h4 className="text-lg font-bold text-[#0B3558] mb-2">Detailed Report Available</h4>
                  <p className="mt-1 text-sm text-gray-500 max-w-md mb-6 leading-relaxed">Download the full PDF report to view all details, complete gap analysis, and final recommendations.</p>
                  <button 
                    onClick={() => {
                      handleDownloadPDF(previewReport);
                      setPreviewReport(null);
                    }}
                    className="flex items-center gap-2 bg-[#1565C0] hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"
                  >
                    <DownloadIcon /> Download Full PDF Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
