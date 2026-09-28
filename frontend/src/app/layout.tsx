"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/* ──────────────────────────────────────────────
   SVG Icon Components
   ────────────────────────────────────────────── */
function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconUpload() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M3 7h18M5 7v14M19 7v14M9 11h6M9 15h6M12 3l7 4H5l7-4z" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconBarChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function IconGraph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <circle cx="18" cy="6" r="3" />
      <line x1="8.5" y1="7.5" x2="15.5" y2="16.5" />
      <line x1="15.5" y1="7.5" x2="8.5" y2="16.5" />
    </svg>
  );
}
function IconHelp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconFileText() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function IconCheckSquare() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconDatabase() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   Header Icon Components
   ────────────────────────────────────────────── */
function HeaderIconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function HeaderIconSearchStds() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function HeaderIconDocs() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function HeaderIconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function HeaderIconHelpCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function HeaderIconPhone() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   BIS Logo SVG
   ────────────────────────────────────────────── */
function BISLogoSVG({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <rect width="56" height="56" rx="8" fill="#ffffff" />
      <circle cx="28" cy="22" r="13" fill="none" stroke="#0B3558" strokeWidth="2.5" />
      <text x="28" y="26" textAnchor="middle" fill="#0B3558" fontSize="11" fontWeight="bold" fontFamily="serif">BIS</text>
      <text x="28" y="40" textAnchor="middle" fill="#0B3558" fontSize="4" fontFamily="sans-serif" fontWeight="600">मानक: गुणवत्ता:</text>
      <text x="28" y="47" textAnchor="middle" fill="#F28C18" fontSize="3.5" fontFamily="sans-serif" fontWeight="600">Standards for a Better India</text>
    </svg>
  );
}

/* ──────────────────────────────────────────────
   Ashoka Emblem SVG
   ────────────────────────────────────────────── */
// Pre-compute spoke endpoints once at module level with fixed precision so that
// SSR and client produce identical strings, avoiding React hydration mismatches.
const ASHOKA_SPOKES = Array.from({ length: 24 }).map((_, i) => ({
  x2: parseFloat((32 + 12 * Math.cos((i * 15 * Math.PI) / 180)).toFixed(4)),
  y2: parseFloat((20 + 12 * Math.sin((i * 15 * Math.PI) / 180)).toFixed(4)),
}));

function AshokaEmblemSmall() {
  return (
    <svg viewBox="0 0 64 64" className="w-8 h-8 text-[#FFD700]" fill="currentColor">
      <circle cx="32" cy="20" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="32" cy="20" r="4" />
      {ASHOKA_SPOKES.map((pt, i) => (
        <line key={i} x1="32" y1="20" x2={pt.x2} y2={pt.y2} stroke="currentColor" strokeWidth="0.7" />
      ))}
      <rect x="26" y="34" width="12" height="4" rx="1" />
      <rect x="24" y="38" width="16" height="3" rx="1" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   Layout Component
   ────────────────────────────────────────────── */
import { AuthProvider, useAuth } from "../context/AuthContext";

function UserProfileWidget() {
  const { user, signOut } = useAuth();
  
  if (!user) {
    return (
      <div className="hidden sm:flex items-center gap-2.5 pl-1">
        <Link href="/login" className="text-white hover:text-blue-200 text-xs font-bold">
          Login
        </Link>
      </div>
    );
  }

  const initials = user.displayName ? user.displayName.substring(0, 2).toUpperCase() : "US";
  const name = user.displayName || user.email?.split('@')[0] || "BIS User";

  return (
    <div className="relative group cursor-pointer z-[100]">
      <div className="hidden sm:flex items-center gap-2.5 pl-1">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
          {initials}
        </div>
        <div className="text-right leading-tight hidden lg:block">
          <p className="text-[11px] font-bold text-white">{name}</p>
          <p className="text-[9px] text-blue-300/80 truncate max-w-[120px]">{user.email}</p>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
      </div>
      
      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full pt-2 hidden group-hover:block">
        <div className="w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-100">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  // Language state
  const [lang, setLang] = useState("English");
  const [langOpen, setLangOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bis_lang_label");
    if (saved) setLang(saved);
  }, []);

  const handleLangSwitch = (label: string) => {
    setLang(label);
    localStorage.setItem("bis_lang_label", label);
    setLangOpen(false);
    
    const langCode = label === "हिंदी" ? "hi" : label === "मराठी" ? "mr" : "en";
    
    if (langCode === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname;
    } else {
      document.cookie = "googtrans=/en/" + langCode + "; path=/";
      document.cookie = "googtrans=/en/" + langCode + "; path=/; domain=" + location.hostname;
    }
    
    window.location.reload();
  };

  // If login page, render without sidebar/header
  if (isLoginPage) {
    return (
      <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
        <body className="min-h-screen bg-[#f0f4f8] text-[#1a2332] font-sans">
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </html>
    );
  }

  const navItems = [
    { href: "/",              label: "Dashboard",               icon: <IconDashboard /> },
    { href: "/#analysis-section", label: "New Analysis",             icon: <IconPlus /> },
    { href: "/certification", label: "Standards Search",         icon: <IconSearch /> },
    { href: "/eval",          label: "My Reports",               icon: <IconFileText /> },
    { href: "/audit",         label: "Compliance Check",         icon: <IconCheckSquare /> },
    { href: "/clause",        label: "Specification Generator",  icon: <IconShield /> },
    { href: "/#product-categories", label: "Product Categories",       icon: <IconGrid /> },
    { href: "/help",          label: "Help & Support",           icon: <IconHelp /> },
  ];

  const adminNavItems = [
    { href: "#", label: "User Management",    icon: <IconUsers /> },
    { href: "#", label: "Dataset Management", icon: <IconDatabase /> },
    { href: "#", label: "Settings",           icon: <IconSettings /> },
  ];

  const bottomNavItems: { href: string; label: string; icon: React.ReactNode }[] = [];

  const headerNavItems = [
    { href: "/", label: "Dashboard", icon: <HeaderIconHome /> },
    { href: "/certification", label: "Search Standards", icon: <HeaderIconSearchStds /> },
    { href: "/history", label: "My Documents", icon: <HeaderIconDocs /> },
    { href: "#", label: "Notifications", icon: <HeaderIconBell />, badge: 3 },
    { href: "/help", label: "Help", icon: <HeaderIconHelpCircle /> },
    { href: "/help#contact", label: "Contact", icon: <HeaderIconPhone /> },
  ];

  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        <title>DRISHTIMANAK IS Recommendation — Indian Standards Recommendation Engine</title>
        <meta name="description" content="AI-powered recommendation engine for Indian Standards (BIS). Find the right IS for any product, view allied standards graphs, generate tender clauses, and audit procurement specs." />
        <Script id="google-translate-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
            }
          `
        }} />
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
        <style dangerouslySetInnerHTML={{
          __html: `
            #google_translate_element { display: none; }
            .goog-te-banner-frame { display: none !important; }
            body { top: 0 !important; }
            .skiptranslate { display: none !important; }
          `
        }} />
      </head>
      <body className="min-h-screen bg-[#EEF2F7] text-[#172033] font-sans">
        <AuthProvider>
        <div id="google_translate_element"></div>
        {/* ═══════════════════════════════════════════
            TOP HEADER BAR
            ═══════════════════════════════════════════ */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0B2545] via-[#0D3060] to-[#0B2545] text-white shadow-lg h-16 print:hidden">
          <div className="h-full flex items-center px-4">
            {/* Mobile menu toggle */}
            <button
              className="p-2 mr-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                {sidebarOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>

            {/* LEFT: BIS Logo + Text */}
            <div className="flex items-center gap-3 w-[240px] flex-shrink-0 border-r border-white/10 pr-4 mr-4">
              <div className="flex-shrink-0">
                <BISLogoSVG size={40} />
              </div>
              <div className="leading-tight hidden lg:block">
                <p className="text-[11px] font-bold text-white">भारतीय मानक ब्यूरो</p>
                <p className="text-[10px] font-semibold text-blue-200">Bureau of Indian Standards</p>
                <p className="text-[8px] text-blue-300/70">Ministry of Consumer Affairs, Food &amp; Public Distribution</p>
                <p className="text-[8px] text-blue-300/50">Government of India</p>
              </div>
            </div>

            {/* CENTER: Navigation Icons */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {headerNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-all duration-200 relative group"
                >
                  <div className="relative">
                    {item.icon}
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* RIGHT: Language + Emblem + User */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all"
                >
                  <IconGlobe />
                  <span className="hidden sm:inline text-xs">{lang}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {["English", "हिंदी", "मराठी"].map((l) => (
                      <button
                        key={l}
                        onClick={() => handleLangSwitch(l)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-gray-100 last:border-0
                          ${lang === l ? "bg-[#0B3558] text-white" : "text-gray-700 hover:bg-blue-50 hover:text-[#0B3558]"}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-white/15 hidden sm:block" />

              {/* Government Emblem */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="text-right leading-tight">
                  <p className="text-[9px] text-blue-300/70">भारत सरकार</p>
                  <p className="text-[10px] font-semibold text-blue-200">Government of India</p>
                </div>
                <AshokaEmblemSmall />
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-white/15 hidden sm:block" />

              {/* User Profile */}
              <UserProfileWidget />

            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════
            LEFT SIDEBAR
            ═══════════════════════════════════════════ */}
        <aside className={`fixed top-16 left-0 bottom-0 w-[240px] bg-[#0B3558] flex flex-col z-40 shadow-xl transition-transform duration-300 print:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {/* Sidebar Brand */}
          <div className="px-5 py-4 border-b border-[#062B49]">
            <Link href="/" className="flex flex-col gap-0.5">
              <span className="text-lg font-bold tracking-tight uppercase font-serif">
                <span className="text-white">Drishti</span>
                <span className="text-[#F28C18]">Manak</span>
                <span className="text-white ml-2 text-[10px] sm:text-xs md:text-sm normal-case font-sans block sm:inline">IS Recommendation</span>
              </span>
              <span className="text-[9px] text-[#F28C18] font-bold uppercase tracking-wider">
                Government Procurement Intelligence
              </span>
            </Link>
          </div>

          {/* Main Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href && item.label !== "New Analysis";
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    setSidebarOpen(false);
                    if (item.label === "New Analysis" && pathname === "/") {
                      // Smoothly scroll to the section without full reload if already on the page
                      e.preventDefault();
                      const section = document.getElementById('analysis-section');
                      if (section) {
                        // Offset by header height
                        const y = section.getBoundingClientRect().top + window.pageYOffset - 80;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200
                    ${isActive
                      ? "bg-[#1565C0] text-white shadow-md"
                      : "text-gray-300 hover:text-white hover:bg-[#0D4170]"
                    }`}
                >
                  <span className="opacity-90 flex-shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* ADMIN Section */}
            <div className="pt-4 mt-3 border-t border-[#062B49]">
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-400/60">Admin</p>
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200
                      ${isActive
                        ? "bg-[#1565C0] text-white shadow-md"
                        : "text-gray-300 hover:text-white hover:bg-[#0D4170]"
                      }`}
                  >
                    <span className="opacity-90 flex-shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            <Link
              href="/login"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-300 hover:text-red-200 hover:bg-red-900/30 transition-all duration-200"
            >
              <span className="opacity-80 flex-shrink-0"><IconLogout /></span>
              <span>Logout</span>
            </Link>
          </nav>

          {/* Bottom Support Section */}
          <div className="px-4 py-4 border-t border-[#062B49] bg-[#082c4e]">
            <div className="flex items-start gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94B8DB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Need Support?</p>
                <p className="text-[10px] text-blue-300/80">Contact BIS Helpdesk</p>
                <p className="text-[10px] text-blue-300/70 mt-0.5">support@bis.gov.in</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-blue-300/60">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3" /></svg>
              <span>1800-11-1206</span>
            </div>
            <div className="mt-3 pt-2 border-t border-[#062B49] flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              <span className="text-[10px] text-gray-400">SIH 2626 • Team UNO</span>
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ═══════════════════════════════════════════
            MAIN CONTENT
            ═══════════════════════════════════════════ */}
        <main className="mt-16 min-h-[calc(100vh-64px)] flex flex-col print:mt-0 print:bg-white">
          <div className="flex-1">
            {children}
          </div>
          
          {/* ═══════════════════════════════════════════
              FOOTER
              ═══════════════════════════════════════════ */}
          <footer className="mt-auto font-sans text-sm mt-12 print:hidden">
            {/* Top Dark Section */}
            <div className="bg-[#0f2b55] text-white pt-8 pb-6 bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(rgba(15, 43, 85, 0.95), rgba(15, 43, 85, 0.95)), url("/login-bg.jpg")' }}>
              <div className="max-w-[1400px] mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                
                {/* Column 1: Brand & Info */}
                <div className="lg:col-span-2 pr-4">
                  <div className="flex items-center gap-4 mb-4">
                    <BISLogoSVG size={56} />
                    <div>
                      <h2 className="text-xl font-bold tracking-wide">भारतीय मानक ब्यूरो</h2>
                      <h3 className="text-base font-bold text-blue-200">Bureau of Indian Standards</h3>
                      <p className="text-[11px] text-blue-300 mt-0.5">Ministry of Consumer Affairs, Food & Public Distribution<br/>Government of India</p>
                    </div>
                  </div>
                  <p className="text-xs text-blue-100/80 leading-relaxed mb-4 max-w-sm">
                    BIS is the National Standards Body of India, working under the Ministry of Consumer Affairs, Food & Public Distribution, Government of India. Our mission is to promote standardization, quality and safe products for a better India.
                  </p>
                  <a href="https://www.bis.gov.in/?lang=en" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/30 hover:border-white rounded text-sm font-semibold transition-colors">
                    Visit BIS Official Website
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                </div>

                {/* Column 2: Quick Links */}
                <div>
                  <h4 className="text-base font-bold mb-3">Quick Links</h4>
                  <ul className="space-y-1.5 text-sm text-blue-200/90">
                    {['Home', 'About BIS', 'Indian Standards (IS)', 'Product Certification', 'Manak Online', 'BIS Care (Complaints)', 'Tenders & Procurement', 'News & Events', 'Careers', 'Contact Us'].map(link => (
                      <li key={link}>
                        <a href="#" className="hover:text-white hover:underline flex items-center gap-2">
                          <span className="text-[10px] text-blue-400">❯</span> {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Resources */}
                <div>
                  <h4 className="text-base font-bold mb-3">Resources</h4>
                  <ul className="space-y-1.5 text-sm text-blue-200/90">
                    {['Standards Directory', 'Product Categories', 'Guidelines & Manuals', 'Acts, Rules & Regulations', 'Publications', 'Training & Capacity Building', 'FAQs', 'Help & Support', 'Sitemap'].map(link => (
                      <li key={link}>
                        <a href="#" className="hover:text-white hover:underline flex items-center gap-2">
                          <span className="text-[10px] text-blue-400">❯</span> {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 4: Contact & Social */}
                <div>
                  <h4 className="text-base font-bold mb-3">Contact Us</h4>
                  <ul className="space-y-3 text-sm text-blue-200/90 mb-6">
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5">📍</span>
                      <span className="leading-tight">Bureau of Indian Standards<br/>Manak Bhavan, 9 Bahadur Shah Zafar Marg,<br/>New Delhi - 110002, India</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5">📞</span>
                      <span>1800-11-1206<br/><span className="text-[11px] text-blue-300">(BIS Helpline - Toll Free)</span></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span>✉️</span>
                      <a href="mailto:support@bis.gov.in" className="hover:text-white hover:underline">support@bis.gov.in</a>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5">🕒</span>
                      <span>Monday to Friday<br/>9:00 AM to 5:30 PM<br/><span className="text-[11px] text-blue-300">(Government Working Hours)</span></span>
                    </li>
                  </ul>

                  <h4 className="text-sm font-bold mb-2">Follow Us</h4>
                  <div className="flex gap-2 mb-4">
                    <a href="#" className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center hover:bg-[#1DA1F2] transition-colors"><span className="text-xs">𝕏</span></a>
                    <a href="#" className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center hover:bg-[#FF0000] transition-colors"><span className="text-xs">▶</span></a>
                    <a href="#" className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center hover:bg-[#0077B5] transition-colors"><span className="text-xs">in</span></a>
                    <a href="#" className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center hover:bg-[#1877F2] transition-colors"><span className="text-xs">f</span></a>
                  </div>
                </div>

              </div>
            </div>

            {/* Middle Grey Section */}
            <div className="bg-[#f1f5f9] text-[#1a2332] py-4 border-b border-gray-200">
              <div className="max-w-[1400px] mx-auto px-6 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs font-semibold text-gray-600">
                  {['Terms of Use', 'Privacy Policy', 'Hyperlinking Policy', 'Copyright Policy', 'Accessibility Statement', 'Disclaimer', 'Website Policies', 'Help', 'Sitemap'].map((link, i) => (
                    <span key={link} className="flex items-center gap-4">
                      <a href="#" className="hover:text-[#0f2b55] hover:underline">{link}</a>
                      {i !== 8 && <span className="text-gray-300">|</span>}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-right">
                  <AshokaEmblemSmall />
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-[#0B3558]">Government of India</p>
                    <p className="text-[10px] text-gray-600">Ministry of Consumer Affairs,<br/>Food & Public Distribution</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Dark Section */}
            <div className="bg-[#0B2545] text-white/60 py-3 text-[11px]">
              <div className="max-w-[1400px] mx-auto px-6 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <p>© 2025 Bureau of Indian Standards. All Rights Reserved.</p>
                <div className="flex flex-col items-center gap-1">
                  <p>This is an official website of Bureau of Indian Standards, Government of India.</p>
                  <p className="flex items-center gap-2">
                    <span>🔒 Secure</span> | <span>Accessible</span> | <span>Citizen-Centric</span> | <span>Digital India</span>
                  </p>
                </div>
                <p>Last Updated: 24 Sep 2026</p>
              </div>
            </div>
          </footer>
        </main>
        </AuthProvider>
      </body>
    </html>
  );
}
