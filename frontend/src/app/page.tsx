"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// using real backend now
import { INDIAN_STANDARDS_DB } from "../data/indianStandards";
import { TENDERS_DB, TenderMatch } from "../data/tenders";
import { getRecommendations } from "../services/recommendationEngine";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface HistoryEntry {
  id: string;
  query: string;
  timestamp: string;
  standardsFound: number;
  tendersFound: number;
  detectedCategory: string;
  topStandard: string;
}

interface RecentDoc {
  name: string;
  type: "pdf" | "docx";
  time: string;
}

/* ──────────────────────────────────────────────
   SVG Icons used within the page
   ────────────────────────────────────────────── */
function IconStandards() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function IconCheckCircle() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function IconLink() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function IconLayers() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
function IconSparkle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0B3558]">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F28C18]">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function SearchPage() {
  const { user } = useAuth();   // ← Firebase current user
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [tenders, setTenders] = useState<TenderMatch[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [backendData, setBackendData] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [resultsTab, setResultsTab] = useState<'recommended' | 'related' | 'cert' | 'gap' | 'generated'>('recommended');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  // Tab State
  const [activeTab, setActiveTab] = useState<'quick' | 'manual' | 'upload'>('quick');

  // Manual Input States
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [techSpecs, setTechSpecs] = useState("");
  const [tenderText, setTenderText] = useState("");

  // Category/Sub-category selectors
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  // Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Recent documents (demo)
  const [recentDocs] = useState<RecentDoc[]>([
    { name: "Tender_Spec_Lighting.pdf", type: "pdf", time: "2 hours ago" },
    { name: "Electrical_Equipment.docx", type: "docx", time: "1 day ago" },
    { name: "Construction_Materials.pdf", type: "pdf", time: "2 days ago" },
    { name: "Water_Supply_Pipe_DOC.docx", type: "docx", time: "3 days ago" },
  ]);

  // Character count for textarea
  const [descCharCount, setDescCharCount] = useState(0);

  // Per-user localStorage key — isolates history per Firebase account
  const historyKey = user?.uid ? `isrecommend_history_${user.uid}` : "isrecommend_history_guest";

  // Load history from localStorage on mount / when user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(historyKey);
      if (saved) setHistory(JSON.parse(saved));
      else setHistory([]); // clear previous user's history from state
    } catch {}
  }, [historyKey]);

  function saveToHistory(q: string, stds: any[], tnds: TenderMatch[], cat: string, topIS: string) {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      query: q,
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      standardsFound: stds.length,
      tendersFound: tnds.length,
      detectedCategory: cat,
      topStandard: topIS,
    };
    const updated = [entry, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem(historyKey, JSON.stringify(updated));

    // Save to Firebase for real history
    try {
      const now = new Date();
      addDoc(collection(db, "analysisHistory"), {
        product: q || "Document Upload",
        inputType: q ? "Quick Search" : "Document Upload",
        inputTypeColor: "bg-blue-50 text-blue-600 border-blue-200",
        date: now.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }),
        department: "Procurement",
        status: stds.length > 0 ? "Completed" : "Issues Found",
        statusColor: stds.length > 0 ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200",
        category: cat || "General",
        language: "English",
        applicableStandards: stds.length,
        complianceStatus: stds.length > 0 ? "Compliant" : "Non-Compliant",
        issuesFound: stds.length > 0 ? 0 : 1,
        recommendations: stds.length,
        createdAt: now.toISOString(),
        userId: user?.uid || "guest",          // ← per-user isolation in Firestore
        userEmail: user?.email || "guest",
      });
    } catch (err) {
      console.error("Firebase error saving history", err);
    }
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleBackendReport = async (action: 'download' | 'view') => {
    try {
      setIsReportLoading(true);
      const reportData = {
        title: analysis?.category || query || "General Procurement",
        dept: "Procurement Department",
        compliance: "Analyzed",
        standards: results.map(r => ({
          is_number: r.is_number || r.isNumber,
          title: r.title,
          match_score: r.score ? Math.round(r.score * 100) : 95
        }))
      };

      const res = await fetch(`${API_BASE}/api/generate_report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_data: reportData })
      });
      
      if (!res.ok) throw new Error("Failed to generate report from backend");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      if (action === 'download') {
        const a = document.createElement('a');
        a.href = url;
        a.download = `Gov-Report-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      } else {
        setPdfPreviewUrl(url);
      }
    } catch (err) {
      console.error(err);
      alert("Error generating official report from backend.");
    } finally {
      setIsReportLoading(false);
    }
  };

  async function handleSearch(e?: React.FormEvent, forceQuery?: string) {
    if (e) e.preventDefault();
    const q = forceQuery || query;
    if (!q.trim()) {
      setErrorMsg("Please enter a procurement requirement.");
      return;
    }
    
    setErrorMsg("");
    setLoading(true);
    setSearched(false);
    
    setLoadingStep("Analyzing procurement requirement...");
    await sleep(20);
    setLoadingStep("Detecting product category...");
    await sleep(20);
    setLoadingStep("Matching Indian Standards...");
    await sleep(20);
    setLoadingStep("Finding relevant tenders...");
    await sleep(20);

    try {
      const res = await fetch(`${API_BASE}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, top_k: 5 })
      });
      const data = await res.json();
      
      if (data.status === "SUCCESS") {
        setBackendData(data);
        const allRecs = [...(data.primary_recommendations || []), ...(data.alternative_recommendations || [])];
        setResults(allRecs.map(r => ({
          is_number: r.is_number,
          title: r.title,
          status: r.certification_information?.status || "Unknown",
          reason: r.recommendation_reason,
          score: r.final_score
        })));
        setAnalysis({
          category: data.intent?.product || "Unknown",
          specifications: data.intent?.technical_terms?.join(", ") || "None",
          sector: data.intent?.domain || "General",
        });
        saveToHistory(q, allRecs, [], data.intent?.domain || "Unknown", data.primary_recommendations?.[0]?.is_number || "N/A");
      } else {
        setBackendData(data); // for NO_CONFIDENT_MATCH
        setResults([]);
        setAnalysis(null);
        saveToHistory(q, [], [], "No match", "N/A");
      }
    } catch(err) {
      setErrorMsg("Failed to connect to backend recommendation engine.");
    }
    setLoading(false);
    setSearched(true);
    
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    // Auto-print if requested via URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "print") {
        setTimeout(() => window.print(), 1000); // Wait for render
        // Clear params after print triggered
        window.history.replaceState({}, '', '/');
      }
    }
  }
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const auto = params.get('auto');
    if (q && auto === 'true' && !searched && !loading) {
      setQuery(q);
      handleSearch(undefined, q);
      if (params.get("action") !== "print") {
        window.history.replaceState({}, '', '/');
      }
    }
  }, []); // Run once on mount

  async function handleManualSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!productName.trim()) {
      setErrorMsg("Product Name is required.");
      return;
    }
    if (!productDesc.trim() && !techSpecs.trim() && !tenderText.trim()) {
      setErrorMsg("Please provide at least one additional detail (Description, Specs, or Tender Text).");
      return;
    }
    setErrorMsg("");
    
    const combinedQuery = `${productName} ${productDesc} ${techSpecs} ${tenderText}`;
    setExtractedData(null);
    handleSearch(undefined, combinedQuery);
  }

  function processFile(file: File) {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      setErrorMsg("Unsupported file format. Please upload PDF, DOCX, or TXT.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File is too large. Maximum size is 10MB.");
      return;
    }
    setSelectedFile(file);
    setErrorMsg("");
  }

  async function handleAnalyzeDocument() {
    if (!selectedFile) return;
    
    setLoading(true);
    setSearched(false);
    setErrorMsg("");
    setLoadingStep("Uploading document...");
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      setLoadingStep("Extracting text and identifying product info...");
      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to process document");
      }
      
      setLoadingStep("Structuring product input...");
      await sleep(20);
      
      setExtractedData(data.extracted);
      
      const combined = `${data.extracted.productName} ${data.extracted.productDescription} ${data.extracted.technicalSpecifications} ${data.extracted.rawText}`;
      
      setLoadingStep("Matching BIS standards...");
      await sleep(20);
      
      // We do NOT invent BIS standards, we just pass the extracted text to our existing robust recommendation engine
      const recs = getRecommendations(combined);
      
      if (recs) {
        setResults(recs.standards);
        setAnalysis({
          category: recs.detectedProduct,
          specifications: recs.detectedSpecifications,
          sector: recs.sector,
          confidence: recs.confidence
        });
        setTenders(recs.tenders);
        saveToHistory("Doc: " + (data.extracted.productName !== "Not detected" ? data.extracted.productName : selectedFile.name), recs.standards, recs.tenders, recs.detectedProduct, recs.standards[0]?.isNumber || "N/A");
      } else {
        setResults([]);
        setAnalysis(null);
        setTenders([]);
        saveToHistory("Doc: " + selectedFile.name, [], [], "No match", "N/A");
      }
      
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during extraction.");
    } finally {
      setLoading(false);
      setSearched(true);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  const handleChipClick = (term: string) => {
    setQuery(term);
    handleSearch(undefined, term);
  };

  const popularSearches = [
    "5 hp water pumps", "construction material", "uPVC pipes", "transformer", "solar PV", "centrifugal pump"
  ];

  const categories = [
    { value: "civil", label: "Civil & Construction" },
    { value: "electrical", label: "Electrical & Electronics" },
    { value: "mechanical", label: "Mechanical Engineering" },
    { value: "chemical", label: "Chemicals & Polymers" },
    { value: "water", label: "Water Supply & Sanitation" },
    { value: "consumer", label: "Consumer Products" },
  ];

  const domains = [
    // Consistent Data / Prominent Departments
    { title: "Civil Engineering", icon: "🏗️", standards: "Data Available", count: 1200, color: "from-amber-50 to-orange-50", border: "border-amber-200" },
    { title: "Electrotechnical", icon: "⚡", standards: "Data Available", count: 1500, color: "from-blue-50 to-indigo-50", border: "border-blue-200" },
    { title: "Mechanical Engineering", icon: "⚙️", standards: "Data Available", count: 1100, color: "from-gray-50 to-slate-50", border: "border-gray-200" },
    { title: "Electronics & IT", icon: "💻", standards: "Data Available", count: 850, color: "from-purple-50 to-violet-50", border: "border-purple-200" },
    { title: "Food & Agriculture", icon: "🌾", standards: "Data Available", count: 920, color: "from-green-50 to-emerald-50", border: "border-green-200" },
    { title: "Chemical", icon: "🧪", standards: "Data Available", count: 1050, color: "from-cyan-50 to-sky-50", border: "border-cyan-200" },
    { title: "Metallurgical Engineering", icon: "🏭", standards: "Data Available", count: 780, color: "from-red-50 to-rose-50", border: "border-red-200" },
    { title: "Petroleum & Coal", icon: "🛢️", standards: "Data Available", count: 620, color: "from-zinc-50 to-stone-50", border: "border-zinc-200" },
    { title: "Production & General", icon: "🏭", standards: "Data Available", count: 700, color: "from-yellow-50 to-amber-50", border: "border-yellow-200" },
    
    // Inconsistent Data / Less Data
    { title: "Medical Equipment", icon: "🏥", standards: "Coming Soon", count: 350, color: "from-teal-50 to-emerald-50", border: "border-teal-200" },
    { title: "Textile", icon: "🧵", standards: "Coming Soon", count: 480, color: "from-pink-50 to-rose-50", border: "border-pink-200" },
    { title: "Water Resources", icon: "💧", standards: "Coming Soon", count: 320, color: "from-sky-50 to-blue-50", border: "border-sky-200" },
    { title: "Environment & Ecology", icon: "🌿", standards: "Coming Soon", count: 210, color: "from-lime-50 to-green-50", border: "border-lime-200" },
    { title: "Ayush", icon: "🧘", standards: "Coming Soon", count: 180, color: "from-orange-50 to-red-50", border: "border-orange-200" },
    { title: "Management System", icon: "📊", standards: "Coming Soon", count: 150, color: "from-indigo-50 to-blue-50", border: "border-indigo-200" },
    { title: "Service Sector", icon: "🤝", standards: "Coming Soon", count: 120, color: "from-fuchsia-50 to-purple-50", border: "border-fuchsia-200" },
    { title: "Others", icon: "📁", standards: "Coming Soon", count: 50, color: "from-gray-50 to-gray-100", border: "border-gray-200" },
  ];

  const stats = [
    {
      label: "Total Indian Standards (IS) Available",
      value: "23,456",
      icon: <IconStandards />,
      iconBg: "bg-[#0B3558]",
      iconColor: "text-white",
      underline: "bg-[#0B3558]",
    },
    {
      label: "Latest Standards (2020 – 2025)",
      value: "4,872",
      icon: <IconCheckCircle />,
      iconBg: "bg-[#16A34A]",
      iconColor: "text-white",
      underline: "bg-[#16A34A]",
    },
    {
      label: "Allied & Normative References",
      value: "18,320",
      icon: <IconLink />,
      iconBg: "bg-[#F28C18]",
      iconColor: "text-white",
      underline: "bg-[#F28C18]",
    },
    {
      label: "Product Categories Covered",
      value: "520+",
      icon: <IconLayers />,
      iconBg: "bg-[#6366F1]",
      iconColor: "text-white",
      underline: "bg-[#6366F1]",
    },
  ];

  return (
    <div className="font-sans text-[#172033] min-h-screen bg-[#EEF2F7]">
      {/* ═══════════════════════════════════════════
          HERO BANNER
          ═══════════════════════════════════════════ */}
      <div className="relative w-full h-[220px] md:h-[260px] bg-cover bg-center bg-no-repeat overflow-hidden border-b border-gray-200 print:hidden" style={{ backgroundImage: 'url("/login-bg.jpg")' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
        <div className="relative h-full max-w-[1400px] mx-auto px-6 sm:px-8 flex items-center justify-between">
          <div className="max-w-3xl pt-2">
            <h1 className="font-extrabold tracking-tight mb-2 flex flex-wrap items-baseline gap-x-3">
              <div className="text-3xl md:text-5xl uppercase font-serif">
                <span className="text-[#0B3558]">Drishti</span>
                <span className="text-[#F28C18]">Manak</span>
              </div>
              <span className="text-[#0B3558] normal-case font-sans text-2xl md:text-4xl whitespace-nowrap">IS Recommendation</span>
            </h1>
            <h2 className="text-lg md:text-xl font-bold text-[#1a4a8a] mb-3">Indian Standards Recommendation & Tender Matching Platform</h2>
            <p className="text-sm md:text-base text-gray-700 font-medium max-w-2xl leading-relaxed">
              AI-powered assistance for procurement officials to identify the most relevant Indian Standards (IS) while preparing tender specifications.
            </p>
          </div>
          
          <div className="hidden lg:block bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/50 max-w-xs transform translate-y-4">
            <p className="text-[#0B3558] font-bold text-sm leading-snug">
              Ensuring Quality,<br/>Safety and Reliability<br/>Through Indian Standards
            </p>
            <div className="flex mt-3 h-[3px] rounded-full overflow-hidden w-16">
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#138808]" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      
        {/* ═══════════════════════════════════════════
            Executive Stats Row
            ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className={`w-12 h-12 rounded-xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[11px] text-[#667085] font-semibold uppercase tracking-wide leading-tight mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-[#0B3558] tracking-tight">{stat.value}</p>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${stat.underline}`} />
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          Main Content Grid (Search + Right Panel)
          ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        
        {/* ─────────── LEFT: AI Recommendation Panel ─────────── */}
        <div id="analysis-section" className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-7 pt-6 pb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#0B3558] flex items-center gap-2.5">
              <span className="text-[#F28C18]"><IconSparkle /></span>
              AI-Powered Standard Recommendation
            </h2>
            <span className="px-3 py-1 bg-[#dcfce7] text-[#16A34A] text-[11px] font-bold rounded-md uppercase tracking-wider">
              NLP Engine
            </span>
          </div>

          <p className="px-7 text-[#667085] text-sm mb-5 leading-relaxed">
            Enter a product description, technical specification or upload a tender document to get the most relevant Indian Standards (IS) and related standards.
          </p>

          {/* TABS */}
          <div className="flex border-b border-gray-200 mx-7 gap-0">
            {[
              { key: 'quick', label: 'Quick Search', icon: '🔍' },
              { key: 'manual', label: 'Product Input', icon: '📝' },
              { key: 'upload', label: 'Document Upload', icon: '📄' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-3 px-5 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5
                  ${activeTab === tab.key
                    ? "border-[#0B3558] text-[#0B3558]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                <span className="text-sm">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="px-7 py-6 flex-1">
            {activeTab === 'quick' && (
              <div className="animate-in fade-in duration-300 space-y-5">
                <form onSubmit={(e) => { setExtractedData(null); handleSearch(e); }} className="space-y-4">
                  <textarea
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setDescCharCount(e.target.value.length); }}
                    placeholder="Describe your product, technical specification or procurement requirement..."
                    rows={3}
                    maxLength={1000}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#F5F7FA] border border-gray-300 text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-[#0B3558] transition-all resize-none text-sm"
                  />
                  <p className="text-right text-[11px] text-gray-400 -mt-2">{descCharCount}/1000</p>
                  
                  <p className="text-xs text-gray-400 -mt-2">
                    e.g. 11 kV transformer, solar street light, cement, uPVC pipe, fire extinguisher, office furniture, etc.
                  </p>

                  {/* Category Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0B3558] mb-1.5">Product Category (Optional)</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#F5F7FA] border border-gray-300 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-[#0B3558] appearance-none"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0B3558] mb-1.5">Sub Category (Optional)</label>
                      <select
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#F5F7FA] border border-gray-300 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-[#0B3558] appearance-none"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                      >
                        <option value="">Select Sub Category</option>
                      </select>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0B3558] to-[#1565C0] text-white font-bold text-sm tracking-wide hover:from-[#092a47] hover:to-[#1256a3] active:scale-[0.99] transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                  >
                    <IconSparkle />
                    Get Recommended Standards
                  </button>
                </form>
                
                {/* Popular Searches */}
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-[#667085] mr-1 text-xs font-medium">Popular searches:</span>
                  {popularSearches.map(term => (
                    <button 
                      key={term} 
                      type="button"
                      onClick={() => handleChipClick(term)}
                      className="px-3 py-1 bg-[#F5F7FA] hover:bg-[#e8ecf2] text-[#0B3558] rounded-md transition-colors border border-gray-200 text-xs font-medium"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'manual' && (
              <form onSubmit={handleManualSearch} className="animate-in fade-in duration-300 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#0B3558] mb-1">Product Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder='e.g. "PVC Insulated Electrical Cable"'
                    className="w-full px-4 py-3 rounded-lg bg-[#F5F7FA] border border-gray-300 text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-[#0B3558]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0B3558] mb-1">Product Description</label>
                  <textarea
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                    placeholder='e.g. "PVC insulated copper electrical cable used for domestic wiring"'
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-[#F5F7FA] border border-gray-300 text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-[#0B3558]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#0B3558] mb-1">Technical Specifications</label>
                    <textarea
                      value={techSpecs}
                      onChange={(e) => setTechSpecs(e.target.value)}
                      placeholder='Material, Voltage, Size, Grade, Capacity...'
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-[#F5F7FA] border border-gray-300 text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-[#0B3558]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0B3558] mb-1">Tender / Procurement Text</label>
                    <textarea
                      value={tenderText}
                      onChange={(e) => setTenderText(e.target.value)}
                      placeholder='Paste complete tender or procurement requirement text here...'
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-[#F5F7FA] border border-gray-300 text-[#172033] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:border-[#0B3558]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 mt-2 rounded-xl bg-gradient-to-r from-[#0B3558] to-[#1565C0] text-white font-bold tracking-wide hover:from-[#092a47] hover:to-[#1256a3] transition-all disabled:opacity-50 shadow-md flex items-center gap-2"
                >
                  <IconSparkle />
                  Analyze Product
                </button>
              </form>
            )}

            {activeTab === 'upload' && (
              <div className="animate-in fade-in duration-300 text-center">
                <label 
                  className={`block w-full border-2 border-dashed rounded-xl p-10 transition-all cursor-pointer group ${isDragging ? 'border-[#0B3558] bg-blue-50' : 'border-gray-300 hover:border-[#0B3558] hover:bg-blue-50/30'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      processFile(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={(e) => { if(e.target.files) processFile(e.target.files[0]); }} />
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📄</div>
                  <h3 className="text-lg font-bold text-[#0B3558] mb-1">Upload Tender / Product Document</h3>
                  <p className="text-sm text-[#667085] mb-4">Supported formats: PDF, DOCX, TXT (Max 10MB)</p>
                  <span className="px-5 py-2.5 bg-[#0B3558] text-white text-sm font-bold rounded-lg shadow-sm">
                    Browse Files
                  </span>
                </label>
                
                {selectedFile && (
                  <div className="mt-6 flex items-center justify-between p-4 bg-[#F5F7FA] border border-gray-200 rounded-xl text-left">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-2xl">📎</span>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-[#0B3558] truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || "Document"}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      ✕
                    </button>
                  </div>
                )}

                <div className="mt-4 text-left">
                  <button
                    onClick={handleAnalyzeDocument}
                    disabled={loading || !selectedFile}
                    className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#0B3558] to-[#1565C0] text-white font-bold tracking-wide hover:from-[#092a47] hover:to-[#1256a3] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  >
                    {loading ? "Analyzing..." : "Analyze Document"}
                  </button>
                </div>
              </div>
            )}

            {/* Loader and Error Messages */}
            {errorMsg && <p className="text-red-500 text-sm mt-4 font-semibold">{errorMsg}</p>}
            {loading && (
              <div className="mt-6 p-4 bg-blue-50 border border-[#0B3558]/20 rounded-xl flex items-center gap-4 animate-in fade-in">
                <div className="w-5 h-5 border-2 border-[#0B3558] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#0B3558] text-sm font-semibold">{loadingStep}</p>
              </div>
            )}
          </div>
        </div>

        {/* ─────────── RIGHT: Recent Searches & Documents ─────────── */}
        <div className="space-y-5">
          {/* Recent Searches */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#0B3558] flex items-center gap-2">
                🔍 Recent Searches
              </h3>
              <Link href="/history" className="text-[11px] font-semibold text-[#1565C0] hover:underline flex items-center gap-0.5">
                View All <span>→</span>
              </Link>
            </div>
            <div className="space-y-2.5">
              {history.length === 0 ? (
                <>
                  {/* Show placeholder items */}
                  {["LED street light specification", "11 kV transformer", "uPVC pipes for water supply", "Fire extinguisher", "Office furniture"].map((item, i) => (
                    <button
                      key={item}
                      onClick={() => handleChipClick(item)}
                      className="w-full flex items-center justify-between py-2 px-1 hover:bg-[#F5F7FA] rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <span className="text-[13px] text-[#344054] group-hover:text-[#0B3558] transition-colors">{item}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{i === 0 ? "2 hours ago" : i === 1 ? "5 hours ago" : i === 2 ? "1 day ago" : i === 3 ? "2 days ago" : "3 days ago"}</span>
                    </button>
                  ))}
                </>
              ) : (
                history.slice(0, 5).map((h, i) => (
                  <button
                    key={h.id}
                    onClick={() => handleChipClick(h.query)}
                    className="w-full flex items-center justify-between py-2 px-1 hover:bg-[#F5F7FA] rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <span className="text-[13px] text-[#344054] group-hover:text-[#0B3558] transition-colors truncate">{h.query}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{h.timestamp.split(",")[0]}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Recent Documents */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#0B3558] flex items-center gap-2">
                📄 Recent Documents
              </h3>
              <Link href="/history" className="text-[11px] font-semibold text-[#1565C0] hover:underline flex items-center gap-0.5">
                View All <span>→</span>
              </Link>
            </div>
            <div className="space-y-2.5">
              {recentDocs.map((doc, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-1 hover:bg-[#F5F7FA] rounded-lg transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${doc.type === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {doc.type.toUpperCase()}
                    </span>
                    <span className="text-[13px] text-[#344054] group-hover:text-[#0B3558] transition-colors truncate">{doc.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{doc.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          RICH RESULTS SECTION
          ═══════════════════════════════════════════ */}
      <div id="results-section" className="scroll-mt-8"></div>
      
      {searched && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          


          {(!results || results.length === 0) ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
              <h3 className="text-xl font-bold text-[#0B3558] mb-2">No matching standard found in the current dataset.</h3>
              <p className="text-[#667085] mb-4">Try a more specific procurement description, for example:</p>
              <div className="flex justify-center gap-3">
                <span className="px-3 py-1 bg-gray-100 rounded text-sm text-[#0B3558]">5 HP water pump</span>
                <span className="px-3 py-1 bg-gray-100 rounded text-sm text-[#0B3558]">TMT steel</span>
                <span className="px-3 py-1 bg-gray-100 rounded text-sm text-[#0B3558]">uPVC pipe</span>
                <span className="px-3 py-1 bg-gray-100 rounded text-sm text-[#0B3558]">solar PV module</span>
              </div>
            </div>
          ) : (
            <div id="report-content" className="bg-white rounded-xl shadow-sm border-2 border-[#116F4A] overflow-hidden mt-6 print:border-none print:shadow-none print:mt-0">
              {/* Header for Print / View Mode */}
              <div className="hidden print:flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded-md"><span className="text-xl">🏛️</span></div>
                  <div>
                    <h1 className="text-xl font-bold text-[#0B3558] leading-tight">AI Standards Assistant</h1>
                    <p className="text-xs text-gray-500">Identify Applicable Indian Standards for Procurement</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm font-semibold text-[#0B3558]">
                  <span>Home</span>
                  <span>Dashboard</span>
                  <span>Analysis</span>
                  <span>My Reports</span>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="w-8 h-8 rounded-full bg-[#0B3558] text-white flex items-center justify-center">O</div>
                    <span>Officer ▽</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4 text-sm">
                  <div className="text-gray-500 font-medium">
                    <span className="text-[#0B3558] font-bold">Dashboard</span> <span className="mx-1 text-gray-400">&gt;</span> <span className="text-[#0B3558] font-bold">Analysis</span> <span className="mx-1 text-gray-400">&gt;</span> <span className="text-gray-600">Results</span>
                  </div>
                  <div className="flex gap-2" data-html2canvas-ignore="true" id="report-actions">
                    <button disabled={isReportLoading} onClick={() => handleBackendReport('download')} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-[#0B3558] font-bold hover:bg-gray-50 text-[13px] print:hidden disabled:opacity-50">
                      {isReportLoading ? (
                        <div className="w-4 h-4 border-2 border-[#0B3558] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      )}
                      {isReportLoading ? "Generating..." : "Download Report"}
                    </button>
                    <button disabled={isReportLoading} onClick={() => handleBackendReport('view')} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-[#0B3558] font-bold hover:bg-gray-50 text-[13px] print:hidden disabled:opacity-50">
                      {isReportLoading ? (
                        <div className="w-4 h-4 border-2 border-[#0B3558] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                      {isReportLoading ? "Generating..." : "View Report"}
                    </button>
                    <button onClick={() => { setSearched(false); setQuery(""); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#0B3558] text-[#0B3558] rounded font-bold hover:bg-blue-50 text-[13px] print:hidden">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      New Analysis
                    </button>
                  </div>
                </div>

                <div className="bg-[#EAF5EC] border border-[#BDE0C8] rounded-lg p-4 flex items-start gap-3 mb-6">
                  <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <h3 className="text-[#0D5B3C] font-bold">Analysis Completed</h3>
                    <p className="text-sm text-[#0D5B3C] mt-0.5">Relevant Indian Standards and related standards identified for the given product description.</p>
                  </div>
                </div>

                {/* Right Panel Tabs */}
                <div className="flex border-b border-gray-200 mb-6 text-sm overflow-x-auto font-medium">
                  {[
                    { id: 'recommended', label: 'Recommended Standards' },
                    { id: 'related', label: 'Related Standards' },
                    { id: 'cert', label: 'Certification' },
                    { id: 'gap', label: 'Specification Gap Analysis' },
                    { id: 'generated', label: 'Generated Specification' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setResultsTab(tab.id as any)}
                      className={`px-4 py-2 whitespace-nowrap border-b-2 transition-colors ${
                        resultsTab === tab.id ? 'border-[#0B3558] bg-[#1E5F9E] text-white rounded-t-lg' : 'border-transparent text-gray-500 hover:text-[#0B3558]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {resultsTab === 'recommended' && (
                  <div className="space-y-6">
                    {/* Primary Recommended Section */}
                    <div>
                      <h3 className="flex items-center gap-2 text-[#0B3558] font-bold text-[17px] mb-3">
                        <IconTarget />
                        Primary Recommended Indian Standard(s)
                      </h3>
                      <div className="border border-gray-200 rounded-lg overflow-hidden text-[13px]">
                        <table className="w-full text-left">
                          <thead className="bg-[#F4F7FB] text-[#0B3558] border-b border-gray-200">
                            <tr>
                              <th className="p-3 font-bold w-[12%]">IS Number</th>
                              <th className="p-3 font-bold w-[28%]">Standard Title</th>
                              <th className="p-3 font-bold w-[10%]">Relevance</th>
                              <th className="p-3 font-bold w-[15%]">Latest Version</th>
                              <th className="p-3 font-bold w-[10%]">Status</th>
                              <th className="p-3 font-bold w-[25%]">Why Recommended</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {results.length > 0 ? results.map((r, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="p-3 font-bold text-[#0B3558]">{r.isNumber || r.is_number}</td>
                                <td className="p-3 text-gray-800">{r.title || "Standard Specification Document"}</td>
                                <td className="p-3 font-bold text-[#16A34A]"><span className="bg-[#E6F4EA] px-2 py-0.5 rounded">{((r.matchScore ?? r.confidence ?? r.score) * 100).toFixed(0)}%</span></td>
                                <td className="p-3 text-gray-700">{r.isNumber || r.is_number}:2023</td>
                                <td className="p-3"><span className="bg-[#E6F4EA] text-[#16A34A] px-2 py-0.5 rounded text-[11px] font-bold">{r.status || 'Active'}</span></td>
                                <td className="p-3 text-gray-600">{r.matchReason || r.reason || "Directly applicable based on procurement requirements."}</td>
                              </tr>
                            )) : (
                              <tr className="hover:bg-gray-50">
                                <td className="p-3 font-bold text-[#0B3558]">IS 10322</td>
                                <td className="p-3 text-gray-800">Luminaires for road and street lighting – Specification</td>
                                <td className="p-3 font-bold text-[#16A34A]"><span className="bg-[#E6F4EA] px-2 py-0.5 rounded">96%</span></td>
                                <td className="p-3 text-gray-700">IS 10322:2023</td>
                                <td className="p-3"><span className="bg-[#E6F4EA] text-[#16A34A] px-2 py-0.5 rounded text-[11px] font-bold">Active</span></td>
                                <td className="p-3 text-gray-600">Directly applicable for LED street lights used for road and street lighting.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

                {resultsTab === 'related' && (
                  <div className="space-y-6">
                    {/* Allied / Related Standards Section */}
                    <div className="print:break-before-page">
                      <h3 className="flex items-center gap-2 text-[#0B3558] font-bold text-[17px] mb-3 mt-6 print:mt-0">
                        <IconUsers />
                        Allied / Related Standards
                      </h3>
                      <div className="border border-gray-200 rounded-lg overflow-hidden text-[13px]">
                        <table className="w-full text-left">
                          <thead className="bg-[#F4F7FB] text-[#0B3558] border-b border-gray-200">
                            <tr>
                              <th className="p-3 font-bold w-[20%]">Category</th>
                              <th className="p-3 font-bold w-[15%]">IS Number</th>
                              <th className="p-3 font-bold w-[35%]">Standard Title</th>
                              <th className="p-3 font-bold w-[30%]">Purpose</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50">
                              <td className="p-3 font-bold text-gray-700">Normative Reference</td>
                              <td className="p-3 font-bold text-[#0B3558]">IS 60598-1</td>
                              <td className="p-3 text-gray-800">Luminaires – Part 1: General requirements and tests</td>
                              <td className="p-3 text-gray-600">General safety and construction requirements for luminaires.</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="p-3 font-bold text-gray-700">Test Method</td>
                              <td className="p-3 font-bold text-[#0B3558]">IS 16106</td>
                              <td className="p-3 text-gray-800">LED Luminaires – Methods of test</td>
                              <td className="p-3 text-gray-600">Testing procedures for LED luminaires.</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="p-3 font-bold text-gray-700">Safety Standard</td>
                              <td className="p-3 font-bold text-[#0B3558]">IS 15885 (Part 1)</td>
                              <td className="p-3 text-gray-800">Street lighting – General requirements</td>
                              <td className="p-3 text-gray-600">Safety and general requirements.</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="p-3 font-bold text-gray-700">Installation Standard</td>
                              <td className="p-3 font-bold text-[#0B3558]">IS 3646 (Part 1)</td>
                              <td className="p-3 text-gray-800">Code of practice for indoor and outdoor electrical installations</td>
                              <td className="p-3 text-gray-600">Guidelines for installation.</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="p-3 font-bold text-gray-700">Related Standard</td>
                              <td className="p-3 font-bold text-[#0B3558]">IS 10322 (Amend)</td>
                              <td className="p-3 text-gray-800">Amendment details</td>
                              <td className="p-3 text-gray-600">Consider latest amendments.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {resultsTab === 'cert' && (
                  <div className="space-y-6">
                    {/* Certification Card */}
                    <div className="max-w-xl mt-6 print:break-before-page print:mt-0">
                      <div className="bg-[#FCF5FF] border border-[#E9D5FF] rounded-xl p-4 shadow-sm">
                        <h4 className="flex items-center gap-2 text-[#7E22CE] font-bold mb-3 text-[15px]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/></svg>
                          Certification Requirements
                        </h4>
                        <div className="space-y-3 text-[13px]">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-700">BIS Product Certification</span>
                            <span className="bg-[#FEE2E2] text-[#B91C1C] px-2 py-1 rounded text-[11px] font-bold">Applicable (as per QCO)</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-700">CRS</span>
                            <span className="bg-[#E0E7FF] text-[#4338CA] px-2 py-1 rounded text-[11px] font-bold">Not Applicable</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-700">Hallmarking</span>
                            <span className="bg-[#E0E7FF] text-[#4338CA] px-2 py-1 rounded text-[11px] font-bold">Not Applicable</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-700">Other Requirements</span>
                            <span className="bg-[#F3F4F6] text-gray-600 px-2 py-1 rounded text-[11px] font-bold">As per applicable regulations</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {resultsTab === 'gap' && (
                  <div className="space-y-6">
                    {/* Version Info Card */}
                    <div className="max-w-xl mt-6 print:break-before-page print:mt-0">
                      <div className="bg-[#FFFDF4] border border-[#FBE8B4] rounded-xl p-4 shadow-sm">
                        <h4 className="flex items-center gap-2 text-[#D97706] font-bold mb-3 text-[15px]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                          Version & Amendment Information
                        </h4>
                        <div className="space-y-2 text-[13px]">
                          <div className="flex gap-2 items-center"><div className="w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div><div><span className="font-bold text-gray-700">Latest Version:</span> <span className="text-gray-800">IS 10322:2023</span></div></div>
                          <div className="flex gap-2 items-center"><div className="w-4 h-4 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shrink-0"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div><div><span className="font-bold text-gray-700">Previous Version:</span> <span className="text-gray-800">IS 10322:2012 (Revised)</span></div></div>
                          <div className="flex gap-2 items-center"><div className="w-4 h-4 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shrink-0"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div><div><span className="font-bold text-gray-700">Amendments:</span> <span className="text-gray-800">Amendment 1: 2024</span></div></div>
                          <div className="flex gap-2 items-center"><div className="w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div><div><span className="font-bold text-gray-700">Status:</span> <span className="font-bold text-[#16A34A]">Active</span></div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {resultsTab !== 'recommended' && resultsTab !== 'related' && resultsTab !== 'cert' && resultsTab !== 'gap' && (
                  <div className="py-12 text-center text-gray-500">
                    Content for {resultsTab} will be displayed here.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          Browse by Product Category
          ═══════════════════════════════════════════ */}
      <div id="product-categories" className="pt-4 print:hidden">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-[#0B3558] flex items-center gap-2">
            📊 Browse by Product Category
          </h2>
          <Link href="/certification" className="text-sm font-semibold text-[#1565C0] hover:underline flex items-center gap-1">
            View All Categories <span>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {domains.map((domain, i) => (
            <div
              key={i}
              className={`bg-gradient-to-b ${domain.color} border ${domain.border} rounded-xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center text-center cursor-pointer group`}
              onClick={() => window.location.href = `/analysis?category=${encodeURIComponent(domain.title)}`}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{domain.icon}</div>
              <h3 className="text-sm font-bold text-[#0B3558] mb-1 leading-tight group-hover:text-[#1565C0] transition-colors">{domain.title}</h3>
              <p className="text-xs text-[#667085] mb-3">{domain.standards}</p>
              <span className="text-[#1565C0] font-semibold text-xs flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                Explore <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
            </div>
          ))}
        </div>
      </div>
      </div>
      
      {/* PDF Preview Modal */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="font-bold text-[#0B3558] text-lg">Report Preview</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = pdfPreviewUrl;
                    a.download = `Gov-Report-${Date.now()}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="px-4 py-1.5 bg-[#0B3558] text-white font-semibold rounded hover:bg-[#1E5F9E] text-sm"
                >
                  Download PDF
                </button>
                <button 
                  onClick={() => {
                    setPdfPreviewUrl(null);
                    setTimeout(() => window.URL.revokeObjectURL(pdfPreviewUrl), 100);
                  }}
                  className="px-4 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-semibold text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-200">
              <iframe 
                src={pdfPreviewUrl} 
                className="w-full h-full border-none" 
                title="PDF Report Preview"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
