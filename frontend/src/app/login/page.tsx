"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

/* ──────────────────────────────────────────────
   Translations Dictionary
   ────────────────────────────────────────────── */
const translations = {
  en: {
    title: "DrishtiManak IS Recommendation",
    subheading: "Indian Standards Recommendation & Tender Matching Platform",
    desc: "Analyze product descriptions, technical specifications, and tender documents using semantic AI to identify the most relevant Indian Standards, allied standards, normative references, latest amendments, and applicable certification requirements.",
    f1_title: "Analyze Product Description",
    f1_desc: "Understand product and technical requirements using AI",
    f2_title: "Recommend Relevant IS",
    f2_desc: "Identify relevant Indian Standards and allied standards",
    f3_title: "Latest Version & Amendments",
    f3_desc: "Identify current standards, revisions and amendments",
    f4_title: "Multilingual Support",
    f4_desc: "Search in English, Hindi and other Indian languages",
    login_title: "Procurement Official Login",
    login_sub: "Access the BIS Standards Recommendation System",
    userid: "User ID / Employee ID",
    userid_ph: "Enter your User ID or Employee ID",
    password: "Password",
    password_ph: "Enter your password",
    remember: "Remember me",
    forgot: "Forgot Password?",
    login_btn: "Login",
    authenticating: "Authenticating...",
    or_login: "Or Login with",
    gov_sso: "Government SSO",
    gov_sso_sub: "NIC / eOffice",
    gem_sso: "GeM SSO",
    gem_sso_sub: "e-Marketplace",
    cppp: "CPPP",
    cppp_sub: "eProcurement",
    security: "This system is for authorized procurement officials of Government Departments, PSEs and authorized organizations only.",
    security_sub: "Authorized access only • Secure Government Portal",
    err_user: "Please enter your User ID or Employee ID.",
    err_pass: "Please enter your password.",
    err_len: "Password must be at least 6 characters.",
    err_invalid: "Invalid User ID or Password. Please contact your department IT administrator if you have forgotten your credentials."
  },
  hi: {
    title: "भारतीय मानकों के लिए एआई-आधारित अनुशंसा इंजन",
    subheading: "खरीद विनिर्देशों और निविदा दस्तावेजों को तैयार करते समय प्रासंगिक भारतीय मानकों की पहचान करने के लिए बुद्धिमान सहायता।",
    desc: "शब्दार्थ एआई का उपयोग करके उत्पाद विवरण, तकनीकी विनिर्देशों और निविदा दस्तावेजों का विश्लेषण करें ताकि सबसे प्रासंगिक भारतीय मानकों, संबद्ध मानकों, मानक संदर्भों, नवीनतम संशोधनों और लागू प्रमाणन आवश्यकताओं की पहचान की जा सके।",
    f1_title: "उत्पाद विवरण का विश्लेषण करें",
    f1_desc: "एआई का उपयोग करके उत्पाद और तकनीकी आवश्यकताओं को समझें",
    f2_title: "प्रासंगिक IS की अनुशंसा करें",
    f2_desc: "प्रासंगिक भारतीय मानकों और संबद्ध मानकों की पहचान करें",
    f3_title: "नवीनतम संस्करण और संशोधन",
    f3_desc: "वर्तमान मानकों, संशोधनों और अद्यतनों की पहचान करें",
    f4_title: "बहुभाषी समर्थन",
    f4_desc: "अंग्रेजी, हिंदी और अन्य भारतीय भाषाओं में खोजें",
    login_title: "खरीद अधिकारी लॉगिन",
    login_sub: "बीआईएस मानक अनुशंसा प्रणाली तक पहुंचें",
    userid: "यूजर आईडी / कर्मचारी आईडी",
    userid_ph: "अपना यूजर आईडी या कर्मचारी आईडी दर्ज करें",
    password: "पासवर्ड",
    password_ph: "अपना पासवर्ड दर्ज करें",
    remember: "मुझे याद रखें",
    forgot: "पासवर्ड भूल गए?",
    login_btn: "लॉगिन करें",
    authenticating: "प्रमाणीकरण हो रहा है...",
    or_login: "या इसके साथ लॉगिन करें",
    gov_sso: "सरकारी SSO",
    gov_sso_sub: "एनआईसी (NIC) / ई-ऑफिस",
    gem_sso: "GeM SSO",
    gem_sso_sub: "ई-मार्केटप्लेस",
    cppp: "CPPP",
    cppp_sub: "ई-प्रोक्योरमेंट",
    security: "यह प्रणाली केवल सरकारी विभागों, सार्वजनिक क्षेत्र के उद्यमों (PSEs) और अधिकृत संगठनों के अधिकृत खरीद अधिकारियों के लिए है।",
    security_sub: "केवल अधिकृत पहुंच • सुरक्षित सरकारी पोर्टल",
    err_user: "कृपया अपना यूजर आईडी या कर्मचारी आईडी दर्ज करें।",
    err_pass: "कृपया अपना पासवर्ड दर्ज करें।",
    err_len: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
    err_invalid: "अमान्य यूजर आईडी या पासवर्ड। यदि आप अपना क्रेडेंशियल भूल गए हैं तो कृपया अपने विभाग के आईटी प्रशासक से संपर्क करें।"
  },
  mr: {
    title: "भारतीय मानकांसाठी एआय-आधारित शिफारस इंजिन",
    subheading: "खरेदी तपशील आणि निविदा दस्तऐवज तयार करताना संबंधित भारतीय मानके ओळखण्यासाठी बुद्धिमान सहाय्य.",
    desc: "सर्वात संबंधित भारतीय मानके, संलग्न मानके, मानक संदर्भ, नवीनतम सुधारणा आणि लागू प्रमाणन आवश्यकता ओळखण्यासाठी एआय (AI) वापरून उत्पादन वर्णन, तांत्रिक तपशील आणि निविदा दस्तऐवजांचे विश्लेषण करा.",
    f1_title: "उत्पादन वर्णनाचे विश्लेषण करा",
    f1_desc: "एआय वापरून उत्पादन आणि तांत्रिक आवश्यकता समजून घ्या",
    f2_title: "संबंधित IS ची शिफारस करा",
    f2_desc: "संबंधित भारतीय मानके आणि संलग्न मानके ओळखा",
    f3_title: "नवीनतम आवृत्ती आणि सुधारणा",
    f3_desc: "वर्तमान मानके, आवृत्या आणि सुधारणा ओळखा",
    f4_title: "बहुभाषिक समर्थन",
    f4_desc: "इंग्रजी, हिंदी आणि इतर भारतीय भाषांमध्ये शोधा",
    login_title: "खरेदी अधिकारी लॉगिन",
    login_sub: "BIS मानक शिफारस प्रणालीमध्ये प्रवेश करा",
    userid: "वापरकर्ता आयडी / कर्मचारी आयडी",
    userid_ph: "तुमचा वापरकर्ता आयडी किंवा कर्मचारी आयडी प्रविष्ट करा",
    password: "पासवर्ड",
    password_ph: "तुमचा पासवर्ड प्रविष्ट करा",
    remember: "मला लक्षात ठेवा",
    forgot: "पासवर्ड विसरलात?",
    login_btn: "लॉगिन करा",
    authenticating: "प्रमाणीकरण करत आहे...",
    or_login: "किंवा याद्वारे लॉगिन करा",
    gov_sso: "सरकारी SSO",
    gov_sso_sub: "एनआयसी (NIC) / ई-ऑफिस",
    gem_sso: "GeM SSO",
    gem_sso_sub: "ई-मार्केटप्लेस",
    cppp: "CPPP",
    cppp_sub: "ई-प्रोक्योरमेंट",
    security: "ही प्रणाली केवळ सरकारी विभाग, सार्वजनिक क्षेत्रातील उपक्रम (PSEs) आणि अधिकृत संस्थांच्या अधिकृत खरेदी अधिकाऱ्यांसाठी आहे.",
    security_sub: "केवळ अधिकृत प्रवेश • सुरक्षित सरकारी पोर्टल",
    err_user: "कृपया तुमचा वापरकर्ता आयडी किंवा कर्मचारी आयडी प्रविष्ट करा.",
    err_pass: "कृपया तुमचा पासवर्ड प्रविष्ट करा.",
    err_len: "पासवर्ड किमान ६ अक्षरांचा असावा.",
    err_invalid: "अवैध वापरकर्ता आयडी किंवा पासवर्ड. तुम्ही तुमचे क्रेडेंशियल्स विसरल्यास कृपया तुमच्या विभागाच्या आयटी प्रशासकाशी संपर्क साधा."
  }
};

/* ──────────────────────────────────────────────
   Inline SVG components for icons
   ────────────────────────────────────────────── */

const ASHOKA_SPOKES = Array.from({ length: 24 }).map((_, i) => ({
  x2: parseFloat((32 + 12 * Math.cos((i * 15 * Math.PI) / 180)).toFixed(4)),
  y2: parseFloat((20 + 12 * Math.sin((i * 15 * Math.PI) / 180)).toFixed(4)),
}));

function AshokaEmblem({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      <circle cx="32" cy="20" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="32" cy="20" r="4" />
      {ASHOKA_SPOKES.map((pt, i) => (
        <line key={i} x1="32" y1="20" x2={pt.x2} y2={pt.y2} stroke="currentColor" strokeWidth="0.7" />
      ))}
      <rect x="26" y="34" width="12" height="4" rx="1" />
      <rect x="24" y="38" width="16" height="3" rx="1" />
      <text x="32" y="50" textAnchor="middle" fontSize="4.5" fontWeight="bold" fontFamily="serif">सत्यमेव जयते</text>
    </svg>
  );
}

function BISLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 56" className={className}>
      <rect width="56" height="56" rx="6" fill="#1a3a6b" />
      <circle cx="28" cy="24" r="14" fill="none" stroke="#FFD700" strokeWidth="2" />
      <text x="28" y="28" textAnchor="middle" fill="#FFD700" fontSize="12" fontWeight="bold" fontFamily="serif">BIS</text>
      <text x="28" y="45" textAnchor="middle" fill="white" fontSize="4" fontFamily="sans-serif">मानक: गुणवत्ता:</text>
      <text x="28" y="51" textAnchor="middle" fill="#FF9933" fontSize="3.5" fontFamily="sans-serif">Standards for a Better India</text>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   Login Page Component
   ────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const { signInWithGoogle, user } = useAuth();
  
  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);
  
  // Language State
  const [lang, setLang] = useState<"en" | "hi" | "mr">("en");
  
  useEffect(() => {
    const savedLang = localStorage.getItem("bis_lang");
    if (savedLang === "en" || savedLang === "hi" || savedLang === "mr") {
      setLang(savedLang);
    }
  }, []);

  const handleLangChange = (newLang: "en" | "hi" | "mr") => {
    setLang(newLang);
    localStorage.setItem("bis_lang", newLang);
  };

  const t = translations[lang];

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!userId.trim()) {
      setErrorMsg(t.err_user);
      return;
    }
    if (!password.trim()) {
      setErrorMsg(t.err_pass);
      return;
    }
    if (password.length < 6) {
      setErrorMsg(t.err_len);
      return;
    }

    setIsLoading(true);

    // Simulate authentication delay
    await new Promise((r) => setTimeout(r, 1800));

    // Demo credential check
    if (userId === "admin" && password === "admin123") {
      router.push("/");
    } else {
      setErrorMsg(t.err_invalid);
      setIsLoading(false);
    }
  }

  const navItems = [
    { label: "Home", icon: "🏠" },
    { label: "About", icon: "📋" },
    { label: "Help", icon: "❓" },
    { label: "Contact", icon: "📞" },
  ];

  const features = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      ),
      title: t.f1_title,
      desc: t.f1_desc,
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 15l2 2 4-4" />
        </svg>
      ),
      title: t.f2_title,
      desc: t.f2_desc,
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      title: t.f3_title,
      desc: t.f3_desc,
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
      title: t.f4_title,
      desc: t.f4_desc,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* TOP TRICOLOR STRIP */}
      <div className="flex h-1">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* GOVERNMENT HEADER */}
      <header className="bg-gradient-to-r from-[#0a1f3f] via-[#0f2b55] to-[#0a1f3f] text-white shadow-lg relative z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* LEFT: BIS Logo + Text */}
            <div className="flex items-center gap-3 sm:gap-4">
              <BISLogo className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0" />
              <div className="leading-tight">
                <p className="text-sm sm:text-base font-bold tracking-wide">भारतीय मानक ब्यूरो</p>
                <p className="text-xs sm:text-sm font-semibold text-blue-200">Bureau of Indian Standards</p>
                <p className="text-[10px] sm:text-xs text-blue-300/80 hidden sm:block">Ministry of Consumer Affairs, Food & Public Distribution</p>
                <p className="text-[10px] sm:text-xs text-blue-300/60 hidden sm:block">Government of India</p>
              </div>
            </div>

            {/* CENTER NAV — Desktop */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-end mr-6">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className="px-4 py-2 text-sm font-medium text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center gap-1.5"
                >
                  <span className="text-sm">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* RIGHT: Language Selector & Emblem */}
            <div className="hidden sm:flex items-center gap-4 border-l border-white/20 pl-4">
              {/* Language Selector Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <GlobeIcon />
                  {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "मराठी"}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right z-50">
                  <button onClick={() => handleLangChange("en")} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0f2b55] transition-colors border-b border-gray-100">English</button>
                  <button onClick={() => handleLangChange("hi")} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0f2b55] transition-colors border-b border-gray-100">हिंदी</button>
                  <button onClick={() => handleLangChange("mr")} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0f2b55] transition-colors">मराठी</button>
                </div>
              </div>

              {/* Emblem */}
              <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                <div className="text-right leading-tight">
                  <p className="text-[10px] text-blue-300/70">भारत सरकार</p>
                  <p className="text-xs font-semibold text-blue-200">Government of India</p>
                </div>
                <AshokaEmblem className="w-10 h-10 sm:w-12 sm:h-12 text-[#FFD700] flex-shrink-0" />
              </div>
            </div>

            {/* MOBILE MENU TOGGLE */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                {mobileMenuOpen ? (
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
          </div>

          {/* Mobile Nav Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-white/10 pt-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 mb-2 bg-white/5 rounded-lg border border-white/10">
                <p className="text-xs text-blue-200 mb-2 uppercase tracking-wider font-bold">Select Language</p>
                <div className="flex gap-2">
                  <button onClick={() => handleLangChange("en")} className={`flex-1 py-1.5 text-sm rounded ${lang === 'en' ? 'bg-[#FF9933] text-white font-bold' : 'bg-white/10 text-blue-100'}`}>English</button>
                  <button onClick={() => handleLangChange("hi")} className={`flex-1 py-1.5 text-sm rounded ${lang === 'hi' ? 'bg-[#FF9933] text-white font-bold' : 'bg-white/10 text-blue-100'}`}>हिंदी</button>
                  <button onClick={() => handleLangChange("mr")} className={`flex-1 py-1.5 text-sm rounded ${lang === 'mr' ? 'bg-[#FF9933] text-white font-bold' : 'bg-white/10 text-blue-100'}`}>मराठी</button>
                </div>
              </div>
              
              {navItems.map((item) => (
                <button key={item.label} className="w-full text-left px-4 py-2.5 text-sm text-blue-200 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2">
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          MAIN HERO + LOGIN
          ═══════════════════════════════════════════ */}
      <main className="flex-1 relative bg-[#0a1f3f] flex flex-col justify-center py-10 lg:py-0">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/login-bg.jpg")' }}
        />
        {/* Subtle overlay for text readability on left only */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/50 via-transparent to-transparent" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* ─────────── LEFT: Hero Content ─────────── */}
            <div className="text-white space-y-4 lg:space-y-6">
              {/* Main Heading */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-[3px] bg-[#FF9933] rounded-full" />
                  <span className="text-xs font-bold text-[#FF9933] uppercase tracking-[0.2em]">
                    Bureau of Indian Standards
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-tight tracking-tight">
                  {lang === 'en' ? (
                    <div className="flex flex-col gap-1 sm:gap-2">
                      <span>DrishtiManak</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FF9933]">IS Recommendation</span>
                    </div>
                  ) : (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FF9933]">{t.title}</span>
                  )}
                </h1>
              </div>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed max-w-xl font-medium">
                {t.subheading}
              </p>

              {/* Description */}
              <p className="text-sm text-blue-200/70 leading-relaxed max-w-lg">
                {t.desc}
              </p>

              {/* Decorative divider */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-[2px] bg-[#FF9933]" />
                <div className="w-3 h-3 rounded-full border-2 border-[#FF9933]" />
                <div className="w-20 h-[2px] bg-gradient-to-r from-[#FF9933] to-transparent" />
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="bg-[#0f2b55]/60 backdrop-blur-md border border-white/[0.15] rounded-xl p-5 hover:bg-[#0f2b55]/80 hover:border-white/[0.3] transition-all duration-300 group shadow-lg"
                  >
                    <div className="text-[#FFD700] mb-2.5 group-hover:scale-110 transition-transform origin-left">
                      {f.icon}
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1 leading-snug">{f.title}</h3>
                    <p className="text-[11px] text-blue-200/70 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ─────────── RIGHT: Login Card ─────────── */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 border border-gray-200/60 overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-b from-[#f8fafc] to-white px-6 pt-5 pb-4 text-center border-b border-gray-100">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#0f2b55] to-[#1a4a8a] rounded-2xl flex items-center justify-center shadow-lg">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                      <path d="M12 3L9 1h6L12 3z" fill="white" stroke="white" strokeWidth="1" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-[#0f2b55] leading-tight">{t.login_title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t.login_sub}</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="px-6 py-4 space-y-4">
                  {/* Error Message */}
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2 animate-in fade-in duration-200">
                      <span className="mt-0.5 text-red-500">⚠</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* User ID */}
                  <div>
                    <label htmlFor="userId" className="block text-sm font-semibold text-[#1a2332] mb-1.5">
                      {t.userid}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        <UserIcon />
                      </div>
                      <input
                        id="userId"
                        type="text"
                        value={userId}
                        onChange={(e) => { setUserId(e.target.value); setErrorMsg(""); }}
                        placeholder={t.userid_ph}
                        autoComplete="username"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm text-[#1a2332] placeholder-gray-400 bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2a5a9e] focus:border-[#2a5a9e] transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-[#1a2332] mb-1.5">
                      {t.password}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                        <LockIcon />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                        placeholder={t.password_ph}
                        autoComplete="current-password"
                        className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl text-sm text-[#1a2332] placeholder-gray-400 bg-[#f8fafc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2a5a9e] focus:border-[#2a5a9e] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me / Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#2a5a9e] focus:ring-[#2a5a9e] cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">{t.remember}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(!forgotOpen)}
                      className="text-sm font-semibold text-[#2a5a9e] hover:text-[#1a3a6b] hover:underline transition-colors"
                    >
                      {t.forgot}
                    </button>
                  </div>

                  {/* Forgot Password Panel */}
                  {forgotOpen && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 animate-in fade-in duration-200">
                      Please contact your Department IT Administrator or email{" "}
                      <span className="font-semibold">helpdesk@bis.gov.in</span> with your Employee ID for password reset assistance.
                    </div>
                  )}

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-[#1a4a8a] to-[#2a5a9e] text-white font-bold text-base rounded-xl hover:from-[#0f3a7a] hover:to-[#1a4a8a] active:scale-[0.98] transition-all shadow-lg shadow-[#1a4a8a]/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t.authenticating}
                      </>
                    ) : (
                      t.login_btn
                    )}
                  </button>
                </form>

                {/* SSO Divider */}
                <div className="px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{t.or_login}</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                </div>

                {/* SSO Options */}
                <div className="px-6 pt-3 pb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoading(true);
                      await signInWithGoogle();
                      setIsLoading(false);
                    }}
                    className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-xl hover:border-[#2a5a9e] hover:bg-blue-50/50 transition-all duration-200 group"
                  >
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-100/60 transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-[#0f2b55] leading-tight">Google</p>
                      <p className="text-[10px] text-gray-400 leading-tight">Sign In</p>
                    </div>
                  </button>

                  {[
                    {
                      name: t.gov_sso,
                      sub: t.gov_sso_sub,
                      icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f2b55" strokeWidth="1.5">
                          <path d="M3 21h18M3 7h18M5 7v14M19 7v14M9 11h6M9 15h6M12 3l7 4H5l7-4z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ),
                    },
                    {
                      name: t.gem_sso,
                      sub: t.gem_sso_sub,
                      icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f2b55" strokeWidth="1.5">
                          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ),
                    },
                    {
                      name: t.cppp,
                      sub: t.cppp_sub,
                      icon: (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f2b55" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M9 13h6M9 17h4" strokeLinecap="round" />
                        </svg>
                      ),
                    },
                  ].map((sso) => (
                    <button
                      key={sso.name}
                      type="button"
                      className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-xl hover:border-[#2a5a9e] hover:bg-blue-50/50 transition-all duration-200 group"
                    >
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-100/60 transition-colors">
                        {sso.icon}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-[#0f2b55] leading-tight">{sso.name}</p>
                        <p className="text-[10px] text-gray-400 leading-tight">{sso.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Security Notice */}
                <div className="mx-6 mb-4 p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl">
                  <div className="flex items-start gap-2.5">
                    <div className="text-[#2a5a9e] mt-0.5 flex-shrink-0">
                      <InfoIcon />
                    </div>
                    <div>
                      <p className="text-xs text-[#1e40af] leading-relaxed font-medium">
                        {t.security}
                      </p>
                      <p className="text-[10px] text-[#3b82f6] mt-1.5 font-semibold flex items-center gap-1.5">
                        <span>🔒</span>
                        {t.security_sub}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0a1f3f] text-blue-300/70 py-4 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <p>
              © 2024–2025 Bureau of Indian Standards • Ministry of Consumer Affairs, Food & Public Distribution
            </p>
            <div className="flex items-center gap-4">
              <span>Terms of Use</span>
              <span>Privacy Policy</span>
              <span>Accessibility</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Tricolor */}
      <div className="flex h-1">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>
    </div>
  );
}
