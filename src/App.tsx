import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Globe, Github, ExternalLink, Loader2, Copy, Check,
  Share2, Activity, AlertCircle, TrendingUp, Cpu, Target,
  BarChart3, ShieldCheck, Zap, Sun, Moon, Twitter, Linkedin,
  Facebook, Instagram, Youtube, Lock, Unlock, Eye, FileText,
  Image, Link2, Code2, Layers, BookOpen, Users, Clock,
  CheckCircle2, XCircle, ArrowUpRight, Sparkles, Radio,
  Shield, Wifi, Hash, ChevronRight, LayoutGrid
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface SeoAudit {
  score: number;
  crawlability: "Good" | "Poor";
  indexability: "Good" | "Poor";
  hasCanonical: boolean;
  hasSitemap: boolean;
  hasStructuredData: boolean;
  mobileOptimized: boolean;
  topIssues: string[];
  recommendations: string[];
}

interface WebsiteInfo {
  title: string;
  description: string;
  category: string;
  techStack: string;
  infrastructure: string;
  cms: string;
  analytics: string;
  seoKeywords: string;
  performanceGrade: string;
  targetAudience: string;
  securityScore: number;
  accessibilityScore: number;
  socialPresence: Record<string, string | null>;
  openGraph: {
    hasOgImage: boolean;
    hasTwitterCard: boolean;
    ogType: string;
    ogSiteName: string;
    socialShareReady: boolean;
  };
  contentMetrics: {
    wordCount: number;
    readingTimeMinutes: number;
    headingStructure: string;
    contentQuality: string;
  };
  securityHeaders: {
    hsts: boolean;
    csp: boolean;
    xFrameOptions: boolean;
    xContentType: boolean;
    referrerPolicy: boolean;
    permissionsPolicy: boolean;
  };
  performanceSignals: {
    hasPreconnect: boolean;
    hasPreload: boolean;
    lazyImages: number;
    totalScripts: number;
    totalStyles: number;
    inlineScripts: number;
  };
  seoAudit: SeoAudit;
  githubUrl: string | null;
  liveUrl: string;
  favicon: string | null;
  themeColor: string;
  rawSocialLinks: Record<string, string>;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "https://github.com", "https://vercel.com", "https://stripe.com",
  "https://linear.app", "https://notion.so", "https://figma.com",
  "https://tailwindcss.com", "https://nextjs.org", "https://supabase.com",
  "https://openai.com", "https://shopify.com", "https://airbnb.com",
];

function gradeColor(g: string) {
  return { A: "text-emerald-500", B: "text-blue-500", C: "text-yellow-500", D: "text-orange-500", F: "text-red-500" }[g] ?? "text-neutral-400";
}
function gradeBg(g: string) {
  return { A: "bg-emerald-500", B: "bg-blue-500", C: "bg-yellow-500", D: "bg-orange-500", F: "bg-red-500" }[g] ?? "bg-neutral-400";
}
function scoreColor(n: number) {
  if (n >= 80) return "text-emerald-500";
  if (n >= 60) return "text-blue-500";
  if (n >= 40) return "text-yellow-500";
  return "text-red-500";
}
function scoreBg(n: number) {
  if (n >= 80) return "bg-emerald-500";
  if (n >= 60) return "bg-blue-500";
  if (n >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function ScoreRing({ score, label, size = 120 }: { score: number; label: string; size?: number }) {
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-neutral-100 dark:text-white/5" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="6"
          strokeLinecap="round"
          className={scoreBg(score).replace("bg-", "stroke-")}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="flex flex-col items-center -mt-[calc(50%+8px)] relative z-10" style={{ marginTop: -(size/2 + 8) }}>
        <span className={`text-3xl font-bold font-display ${scoreColor(score)}`}>{score}</span>
        <span className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase">{label}</span>
      </div>
    </div>
  );
}

function BoolBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${ok ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400"}`}>
      {ok ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
      {label}
    </div>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-[#0d0d0d] border border-neutral-200 dark:border-white/[0.07] rounded-[2rem] p-8 shadow-xl shadow-neutral-200/20 dark:shadow-none ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, label, color = "text-blue-600 dark:text-blue-400" }: { icon: React.ReactNode; label: string; color?: string }) {
  return (
    <div className={`flex items-center gap-2.5 mb-6 ${color}`}>
      <div className="w-8 h-8 rounded-xl bg-current/10 flex items-center justify-center shrink-0">
        <span className="w-4 h-4">{icon}</span>
      </div>
      <h4 className="font-bold tracking-widest text-[11px] uppercase">{label}</h4>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<WebsiteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleUrlChange = (val: string) => {
    setUrl(val);
    if (val.length > 0) {
      const filtered = SUGGESTIONS.filter(s => s.toLowerCase().includes(val.toLowerCase()));
      setFilteredSuggestions(filtered.length ? filtered : SUGGESTIONS.slice(0, 6));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleCopy = () => {
    if (!info) return;
    const lines = [
      `=== LinkScout Enterprise Report ===`,
      `URL: ${info.liveUrl}`,
      `Title: ${info.title}`,
      `Category: ${info.category}`,
      `Description: ${info.description}`,
      `Tech Stack: ${info.techStack}`,
      `Infrastructure: ${info.infrastructure}`,
      `CMS: ${info.cms}`,
      `Performance Grade: ${info.performanceGrade}`,
      `SEO Score: ${info.seoAudit.score}/100`,
      `Security Score: ${info.securityScore}/100`,
      `Accessibility Score: ${info.accessibilityScore}/100`,
      `Keywords: ${info.seoKeywords}`,
      `Target Audience: ${info.targetAudience}`,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!info) return;
    const text = `🔍 LinkScout Analysis: ${info.title}\nSEO: ${info.seoAudit.score}/100 · Security: ${info.securityScore}/100 · Grade: ${info.performanceGrade}\nTech: ${info.techStack}`;
    if (navigator.share) {
      try { await navigator.share({ title: "LinkScout Analysis", text, url: window.location.href }); }
      catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    setShowSuggestions(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Analysis failed");
      }
      setInfo(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const socialIcons: Record<string, React.ReactNode> = {
    twitter: <Twitter className="w-4 h-4" />,
    github: <Github className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />,
    youtube: <Youtube className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060606] text-neutral-900 dark:text-[#e0e0e0] font-sans selection:bg-blue-500/30 transition-colors duration-500 relative">
      <div className="fixed inset-0 enterprise-grid pointer-events-none opacity-40" />

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-3.5 flex justify-between items-center backdrop-blur-2xl border-b border-neutral-200 dark:border-white/[0.06] bg-slate-50/80 dark:bg-[#060606]/80">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1 md:p-1.5 rounded-lg shadow-lg shadow-blue-600/30">
            <Globe className="w-3 md:w-4 h-3 md:h-4 text-white" />
          </div>
          <div className="flex flex-col -space-y-0.5">
            <span className="font-display font-bold tracking-tighter text-base md:text-lg text-neutral-900 dark:text-white leading-none">LinkScout</span>
            <span className="text-[6px] md:text-[7px] font-black tracking-[0.35em] uppercase text-blue-600 dark:text-blue-500">Enterprise</span>
          </div>
          <div className="ml-2 md:ml-4 flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] md:text-[9px] font-black tracking-widest text-emerald-600 dark:text-emerald-400">
            <Radio className="w-2 h-2 animate-pulse" /> <span className="hidden sm:inline">PRODUCTION</span><span className="sm:hidden">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsDark(!isDark)} className="p-1.5 md:p-2 rounded-xl bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-blue-500/50 transition-all shadow-sm active:scale-95">
            {isDark ? <Sun className="w-3.5 md:w-4 h-3.5 md:h-4 text-yellow-400" /> : <Moon className="w-3.5 md:w-4 h-3.5 md:h-4 text-neutral-600" />}
          </button>
        </div>
      </nav>

      {/* ── Background glow ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[5%] left-[15%] w-[70%] h-[45%] rounded-full blur-[180px] opacity-15 transition-all duration-1000"
          style={{ backgroundColor: info?.themeColor || (isDark ? "#3b82f6" : "#93c5fd") }} />
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-20 md:pt-36 md:pb-28">

        {/* ── Hero ── */}
        <header className="max-w-3xl mx-auto text-center mb-12 md:mb-16 space-y-3 md:space-y-5">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-2.5 md:px-3 py-0.5 md:py-1 rounded-full bg-blue-500/5 dark:bg-white/5 border border-blue-500/10 dark:border-white/10 text-[9px] md:text-[10px] font-black tracking-widest uppercase text-blue-600 dark:text-blue-400">
            <Sparkles className="w-2.5 md:w-3 h-2.5 md:h-3 fill-current" /> AI-Powered Web Intelligence
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter text-neutral-900 dark:text-white">
            LinkScout<span className="text-blue-600 dark:text-blue-500 font-light"> Enterprise</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-xs sm:text-sm md:text-base text-neutral-500 dark:text-neutral-400 font-light max-w-xl mx-auto px-2">
            Deep architectural reconnaissance — SEO, security, performance, social, and content intelligence in one report.
          </motion.p>
        </header>

        {/* ── Search ── */}
        <section className="max-w-3xl mx-auto mb-16 md:mb-20 relative px-2">
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} onSubmit={handleAnalyze} className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl md:rounded-3xl blur opacity-10 group-focus-within:opacity-25 transition duration-700" />
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white dark:bg-[#0d0d0d] border border-neutral-200 dark:border-white/10 rounded-2xl md:rounded-3xl p-2 focus-within:border-blue-500/50 transition-all shadow-2xl shadow-neutral-200/40 dark:shadow-none gap-2 sm:gap-0">
              <Search className="w-4 md:w-5 h-4 md:h-5 ml-3 md:ml-4 text-neutral-400 dark:text-neutral-500 shrink-0 hidden sm:block" />
              <input ref={inputRef} type="text" placeholder="Enter any URL — e.g. https://stripe.com"
                value={url} onChange={e => handleUrlChange(e.target.value)}
                onFocus={() => { if (url.length === 0) { setFilteredSuggestions(SUGGESTIONS.slice(0, 6)); setShowSuggestions(true); } }}
                className="w-full bg-transparent border-none focus:ring-0 px-3 md:px-4 py-3 md:py-4 text-sm md:text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 font-mono" />
              <button disabled={loading}
                className="bg-neutral-900 dark:bg-white text-white dark:text-black px-5 md:px-7 py-2.5 md:py-3.5 rounded-xl md:rounded-xl font-black tracking-tight hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap shadow-lg text-xs md:text-sm">
                {loading ? <Loader2 className="w-3.5 md:w-4 h-3.5 md:h-4 animate-spin" /> : <><Zap className="w-3.5 md:w-4 h-3.5 md:h-4" /><span className="hidden sm:inline">ANALYZE</span><span className="sm:hidden">GO</span></>}
              </button>
            </div>
          </motion.form>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div ref={suggestRef} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-white/5">
                  <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">Quick Suggestions</span>
                </div>
                {filteredSuggestions.map((s, i) => (
                  <button key={i} type="button" onClick={() => { setUrl(s); setShowSuggestions(false); inputRef.current?.focus(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-white/5 transition-colors text-left group/s">
                    <Globe className="w-3.5 h-3.5 text-neutral-400 group-hover/s:text-blue-500 transition-colors shrink-0" />
                    <span className="font-mono text-sm text-neutral-600 dark:text-neutral-300 group-hover/s:text-blue-600 dark:group-hover/s:text-blue-400 transition-colors">{s}</span>
                    <ArrowUpRight className="w-3 h-3 ml-auto text-neutral-300 dark:text-neutral-600 group-hover/s:text-blue-500 transition-colors" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-3 md:mt-4 text-center text-red-500 dark:text-red-400 font-mono text-xs md:text-sm tracking-widest flex items-center justify-center gap-2 px-2">
              <AlertCircle className="w-3.5 md:w-4 h-3.5 md:h-4 shrink-0" /> <span>{error}</span>
            </motion.p>
          )}
        </section>

        {/* ── Results ── */}
        <AnimatePresence mode="wait">
          {info && (
            <motion.div layout initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 md:space-y-6 px-2">

              {/* ── Row 1: Identity + Grade + Scores ── */}
              <div className="grid lg:grid-cols-12 gap-4 md:gap-6">

                {/* Identity card */}
                <SectionCard className="lg:col-span-7 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-start">
                    {info.favicon
                      ? <img src={info.favicon} alt="favicon" className="w-12 md:w-16 h-12 md:h-16 rounded-xl md:rounded-2xl bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-2 md:p-3 object-contain shadow-md shrink-0" />
                      : <div className="w-12 md:w-16 h-12 md:h-16 rounded-xl md:rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center shrink-0"><Globe className="w-6 md:w-8 h-6 md:h-8 text-neutral-400" /></div>
                    }
                    <div className="space-y-2 md:space-y-3 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                        <span className="px-2 md:px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[8px] md:text-[9px] font-black tracking-widest uppercase text-blue-600 dark:text-blue-400">{info.category}</span>
                        <span className="flex items-center gap-1 text-[8px] md:text-[9px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400"><ShieldCheck className="w-2.5 md:w-3 h-2.5 md:h-3" /> VERIFIED</span>
                        {info.openGraph.socialShareReady && <span className="flex items-center gap-1 text-[8px] md:text-[9px] font-black tracking-widest uppercase text-purple-600 dark:text-purple-400"><Share2 className="w-2.5 md:w-3 h-2.5 md:h-3" /> READY</span>}
                      </div>
                      <h2 className="text-xl sm:text-2xl md:text-4xl font-display font-bold text-neutral-900 dark:text-white tracking-tight leading-tight line-clamp-2">{info.title}</h2>
                      <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-light line-clamp-2">{info.description}</p>
                    </div>
                  </div>
                  <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-neutral-100 dark:border-white/5 flex flex-wrap gap-2 md:gap-3">
                    <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-lg md:rounded-xl transition-all font-bold text-[9px] md:text-[10px] tracking-widest text-neutral-600 dark:text-neutral-300 active:scale-95">
                      {copied ? <Check className="w-3 md:w-3.5 h-3 md:h-3.5" /> : <Copy className="w-3 md:w-3.5 h-3 md:h-3.5" />} <span className="hidden sm:inline">{copied ? "COPIED" : "COPY"}</span>
                    </button>
                    <button onClick={handleShare} className="flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-lg md:rounded-xl transition-all font-bold text-[9px] md:text-[10px] tracking-widest text-neutral-600 dark:text-neutral-300 active:scale-95">
                      {shared ? <Check className="w-3 md:w-3.5 h-3 md:h-3.5" /> : <Share2 className="w-3 md:w-3.5 h-3 md:h-3.5" />} <span className="hidden sm:inline">{shared ? "SHARED" : "SHARE"}</span>
                    </button>
                    <a href={info.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg md:rounded-xl transition-all font-bold text-[9px] md:text-[10px] tracking-widest shadow-lg shadow-blue-500/20 active:scale-95">
                      VISIT <ExternalLink className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    </a>
                    {info.githubUrl && (
                      <a href={info.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-neutral-900 dark:bg-white/10 hover:bg-neutral-800 dark:hover:bg-white/20 text-white rounded-lg md:rounded-xl transition-all font-bold text-[9px] md:text-[10px] tracking-widest active:scale-95">
                        <Github className="w-3 md:w-3.5 h-3 md:h-3.5" /> <span className="hidden sm:inline">REPO</span>
                      </a>
                    )}
                  </div>
                </SectionCard>

                {/* Grade + Scores */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-3 md:gap-4">
                  {/* Performance Grade */}
                  <div className="col-span-2 bg-neutral-900 dark:bg-[#0d0d0d] border border-white/5 rounded-xl md:rounded-[2rem] p-4 md:p-6 flex items-center gap-4 md:gap-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
                    <div className="relative">
                      <p className="text-[8px] md:text-[9px] font-black tracking-widest text-white/40 uppercase mb-0.5 md:mb-1">Technical Health</p>
                      <span className={`text-5xl md:text-7xl font-display font-bold tracking-tighter ${gradeColor(info.performanceGrade)}`}>{info.performanceGrade}</span>
                    </div>
                    <div className="relative space-y-1.5 md:space-y-2 flex-1">
                      <div className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl border border-white/5">
                        <p className="text-[7px] md:text-[8px] font-black tracking-widest text-white/40 uppercase mb-0.5">Infrastructure</p>
                        <p className="font-mono text-[10px] md:text-xs text-white font-medium leading-tight truncate">{info.infrastructure}</p>
                      </div>
                      <div className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl border border-white/5">
                        <p className="text-[7px] md:text-[8px] font-black tracking-widest text-white/40 uppercase mb-0.5">CMS / Engine</p>
                        <p className="font-mono text-[10px] md:text-xs text-white font-medium leading-tight truncate">{info.cms}</p>
                      </div>
                    </div>
                  </div>

                  {/* SEO Score */}
                  <SectionCard className="flex flex-col items-center justify-center gap-1 !p-5">
                    <div className="relative flex items-center justify-center">
                      <svg width="90" height="90" className="-rotate-90">
                        <circle cx="45" cy="45" r="36" fill="none" strokeWidth="6" className="stroke-neutral-100 dark:stroke-white/5" />
                        <motion.circle cx="45" cy="45" r="36" fill="none" strokeWidth="6" strokeLinecap="round"
                          className={scoreBg(info.seoAudit.score).replace("bg-", "stroke-")}
                          strokeDasharray={2 * Math.PI * 36}
                          initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - info.seoAudit.score / 100) }}
                          transition={{ duration: 1.2, ease: "easeOut" }} />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className={`text-2xl font-bold font-display ${scoreColor(info.seoAudit.score)}`}>{info.seoAudit.score}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">SEO Score</span>
                  </SectionCard>

                  {/* Security Score */}
                  <SectionCard className="flex flex-col items-center justify-center gap-1 !p-5">
                    <div className="relative flex items-center justify-center">
                      <svg width="90" height="90" className="-rotate-90">
                        <circle cx="45" cy="45" r="36" fill="none" strokeWidth="6" className="stroke-neutral-100 dark:stroke-white/5" />
                        <motion.circle cx="45" cy="45" r="36" fill="none" strokeWidth="6" strokeLinecap="round"
                          className={scoreBg(info.securityScore).replace("bg-", "stroke-")}
                          strokeDasharray={2 * Math.PI * 36}
                          initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - info.securityScore / 100) }}
                          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }} />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className={`text-2xl font-bold font-display ${scoreColor(info.securityScore)}`}>{info.securityScore}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">Security</span>
                  </SectionCard>

                  {/* Accessibility Score */}
                  <SectionCard className="flex flex-col items-center justify-center gap-1 !p-5">
                    <div className="relative flex items-center justify-center">
                      <svg width="90" height="90" className="-rotate-90">
                        <circle cx="45" cy="45" r="36" fill="none" strokeWidth="6" className="stroke-neutral-100 dark:stroke-white/5" />
                        <motion.circle cx="45" cy="45" r="36" fill="none" strokeWidth="6" strokeLinecap="round"
                          className={scoreBg(info.accessibilityScore).replace("bg-", "stroke-")}
                          strokeDasharray={2 * Math.PI * 36}
                          initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - info.accessibilityScore / 100) }}
                          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }} />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className={`text-2xl font-bold font-display ${scoreColor(info.accessibilityScore)}`}>{info.accessibilityScore}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">A11y</span>
                  </SectionCard>

                  {/* Content Metrics */}
                  <SectionCard className="flex flex-col justify-center gap-3 !p-5">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black tracking-widest uppercase">Content</span>
                    </div>
                    <div>
                      <p className="text-xl font-bold font-display text-neutral-900 dark:text-white">{info.contentMetrics.wordCount.toLocaleString()}</p>
                      <p className="text-[9px] text-neutral-400 uppercase tracking-widest">words</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold font-display text-neutral-900 dark:text-white">{info.contentMetrics.readingTimeMinutes} min</p>
                      <p className="text-[9px] text-neutral-400 uppercase tracking-widest">read time</p>
                    </div>
                  </SectionCard>
                </div>
              </div>

              {/* ── Row 2: SEO Audit full width ── */}
              <SectionCard className="relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                  <TrendingUp className="w-72 h-72 text-blue-600" />
                </div>
                <SectionHeader icon={<TrendingUp className="w-4 h-4" />} label="Technical SEO Audit" />
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                  <BoolBadge ok={info.seoAudit.hasCanonical} label="Canonical URL" />
                  <BoolBadge ok={info.seoAudit.hasSitemap} label="Sitemap" />
                  <BoolBadge ok={info.seoAudit.hasStructuredData} label="Structured Data" />
                  <BoolBadge ok={info.seoAudit.mobileOptimized} label="Mobile Optimized" />
                  <BoolBadge ok={info.seoAudit.crawlability === "Good"} label="Crawlability" />
                  <BoolBadge ok={info.seoAudit.indexability === "Good"} label="Indexability" />
                  <BoolBadge ok={info.openGraph.hasOgImage} label="OG Image" />
                  <BoolBadge ok={info.openGraph.hasTwitterCard} label="Twitter Card" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-[10px] font-black tracking-widest uppercase">Issues Identified</span>
                    </div>
                    <ul className="space-y-3">
                      {info.seoAudit.topIssues.map((issue, i) => (
                        <li key={i} className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300 font-light leading-relaxed">
                          <span className="text-red-400/60 font-mono text-[10px] mt-0.5 shrink-0 font-bold">{String(i + 1).padStart(2, "0")}</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
                      <Activity className="w-4 h-4" />
                      <span className="text-[10px] font-black tracking-widest uppercase">Recommendations</span>
                    </div>
                    <ul className="space-y-3">
                      {info.seoAudit.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300 font-light leading-relaxed">
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-500/60 mt-0.5 shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </SectionCard>

              {/* ── Row 3: Security Headers ── */}
              <div className="grid lg:grid-cols-2 gap-6">
                <SectionCard>
                  <SectionHeader icon={<Shield className="w-4 h-4" />} label="Security Headers" color="text-red-600 dark:text-red-400" />
                  <div className="grid grid-cols-2 gap-3">
                    <BoolBadge ok={info.securityHeaders.hsts} label="HSTS" />
                    <BoolBadge ok={info.securityHeaders.csp} label="Content-Security-Policy" />
                    <BoolBadge ok={info.securityHeaders.xFrameOptions} label="X-Frame-Options" />
                    <BoolBadge ok={info.securityHeaders.xContentType} label="X-Content-Type" />
                    <BoolBadge ok={info.securityHeaders.referrerPolicy} label="Referrer-Policy" />
                    <BoolBadge ok={info.securityHeaders.permissionsPolicy} label="Permissions-Policy" />
                  </div>
                  <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">Security Score</span>
                      <span className={`text-sm font-bold ${scoreColor(info.securityScore)}`}>{info.securityScore}/100</span>
                    </div>
                    <div className="h-2 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${scoreBg(info.securityScore)}`}
                        initial={{ width: 0 }} animate={{ width: `${info.securityScore}%` }} transition={{ duration: 1, ease: "easeOut" }} />
                    </div>
                  </div>
                </SectionCard>

                {/* Performance Signals */}
                <SectionCard>
                  <SectionHeader icon={<Zap className="w-4 h-4" />} label="Performance Signals" color="text-yellow-600 dark:text-yellow-400" />
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <BoolBadge ok={info.performanceSignals.hasPreconnect} label="Preconnect" />
                    <BoolBadge ok={info.performanceSignals.hasPreload} label="Preload" />
                    <BoolBadge ok={info.performanceSignals.lazyImages > 0} label="Lazy Images" />
                    <BoolBadge ok={info.performanceSignals.inlineScripts < 5} label="Low Inline JS" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Scripts", val: info.performanceSignals.totalScripts, icon: <Code2 className="w-3.5 h-3.5" /> },
                      { label: "Styles", val: info.performanceSignals.totalStyles, icon: <Layers className="w-3.5 h-3.5" /> },
                      { label: "Lazy Imgs", val: info.performanceSignals.lazyImages, icon: <Image className="w-3.5 h-3.5" /> },
                    ].map(({ label, val, icon }) => (
                      <div key={label} className="p-3 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/5 rounded-xl text-center">
                        <div className="flex justify-center text-neutral-400 mb-1">{icon}</div>
                        <p className="text-lg font-bold font-display text-neutral-900 dark:text-white">{val}</p>
                        <p className="text-[9px] text-neutral-400 uppercase tracking-widest">{label}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>

              {/* ── Row 4: Tech + Social + OG ── */}
              <div className="grid lg:grid-cols-3 gap-6">

                {/* Tech Stack */}
                <SectionCard>
                  <SectionHeader icon={<Cpu className="w-4 h-4" />} label="Technology Stack" color="text-blue-600 dark:text-blue-400" />
                  <div className="flex flex-wrap gap-2">
                    {info.techStack.split(",").map((t, i) => (
                      <span key={i} className="px-3 py-1.5 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-lg text-[11px] font-mono font-medium text-neutral-600 dark:text-neutral-300">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-white/5 space-y-3">
                    <div>
                      <p className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-1">Analytics & Tracking</p>
                      <div className="flex flex-wrap gap-1.5">
                        {info.analytics.split(",").map((a, i) => (
                          <span key={i} className="flex items-center gap-1 px-2 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            <Check className="w-2.5 h-2.5" />{a.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* Social Presence */}
                <SectionCard>
                  <SectionHeader icon={<Users className="w-4 h-4" />} label="Social Presence" color="text-purple-600 dark:text-purple-400" />
                  <div className="space-y-2">
                    {Object.entries(info.socialPresence).map(([platform, link]) => {
                      const resolvedLink = link || info.rawSocialLinks?.[platform] || null;
                      return (
                        <div key={platform} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${resolvedLink ? "bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/5 hover:border-blue-500/30" : "bg-neutral-50/50 dark:bg-white/[0.02] border-neutral-100 dark:border-white/[0.03] opacity-50"}`}>
                          <div className="flex items-center gap-2.5">
                            <span className="text-neutral-500 dark:text-neutral-400">{socialIcons[platform] ?? <Globe className="w-4 h-4" />}</span>
                            <span className="text-xs font-medium capitalize text-neutral-700 dark:text-neutral-300">{platform}</span>
                          </div>
                          {resolvedLink
                            ? <a href={resolvedLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors"><ArrowUpRight className="w-3.5 h-3.5" /></a>
                            : <XCircle className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700" />
                          }
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>

                {/* Open Graph + Content */}
                <SectionCard>
                  <SectionHeader icon={<Share2 className="w-4 h-4" />} label="Social Share & Content" color="text-indigo-600 dark:text-indigo-400" />
                  <div className="space-y-3 mb-5">
                    <BoolBadge ok={info.openGraph.hasOgImage} label="OG Image Present" />
                    <BoolBadge ok={info.openGraph.hasTwitterCard} label="Twitter Card" />
                    <BoolBadge ok={info.openGraph.socialShareReady} label="Share Optimized" />
                  </div>
                  {info.openGraph.ogSiteName && (
                    <div className="p-3 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/5 rounded-xl mb-3">
                      <p className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-1">Site Name</p>
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{info.openGraph.ogSiteName}</p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-neutral-100 dark:border-white/5 space-y-2">
                    <p className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">Content Quality</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light">{info.contentMetrics.contentQuality}</p>
                    <p className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mt-2">Heading Structure</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light">{info.contentMetrics.headingStructure}</p>
                  </div>
                </SectionCard>
              </div>

              {/* ── Row 5: Strategic Intelligence ── */}
              <div className="grid lg:grid-cols-2 gap-6">
                <SectionCard>
                  <SectionHeader icon={<Target className="w-4 h-4" />} label="Strategic Intelligence" color="text-orange-600 dark:text-orange-400" />
                  <div className="space-y-5">
                    <div>
                      <p className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-2">Target Audience</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">{info.targetAudience}</p>
                    </div>
                    <div className="pt-4 border-t border-neutral-100 dark:border-white/5">
                      <p className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-3">Core SEO Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {info.seoKeywords.split(/[,|]/).map((kw, i) => (
                          <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400">
                            <Hash className="w-2.5 h-2.5" />{kw.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard>
                  <SectionHeader icon={<LayoutGrid className="w-4 h-4" />} label="Quick Stats" color="text-teal-600 dark:text-teal-400" />
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Word Count", val: info.contentMetrics.wordCount.toLocaleString(), icon: <FileText className="w-4 h-4" /> },
                      { label: "Read Time", val: `${info.contentMetrics.readingTimeMinutes} min`, icon: <Clock className="w-4 h-4" /> },
                      { label: "Performance", val: info.performanceGrade, icon: <Zap className="w-4 h-4" />, color: gradeColor(info.performanceGrade) },
                      { label: "SEO Score", val: `${info.seoAudit.score}/100`, icon: <TrendingUp className="w-4 h-4" />, color: scoreColor(info.seoAudit.score) },
                      { label: "Security", val: `${info.securityScore}/100`, icon: <Lock className="w-4 h-4" />, color: scoreColor(info.securityScore) },
                      { label: "A11y Score", val: `${info.accessibilityScore}/100`, icon: <Eye className="w-4 h-4" />, color: scoreColor(info.accessibilityScore) },
                    ].map(({ label, val, icon, color }) => (
                      <div key={label} className="p-4 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/5 rounded-2xl flex items-center gap-3">
                        <span className="text-neutral-400 dark:text-neutral-500 shrink-0">{icon}</span>
                        <div>
                          <p className={`text-base font-bold font-display ${color ?? "text-neutral-900 dark:text-white"}`}>{val}</p>
                          <p className="text-[9px] text-neutral-400 uppercase tracking-widest">{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-200 dark:border-white/[0.06] py-12 md:py-16 px-4 md:px-6 bg-white dark:bg-[#060606] transition-colors">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 items-start gap-8 md:gap-12">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1 md:p-1.5 rounded-lg shadow-lg shadow-blue-600/30">
                <Globe className="w-3 md:w-4 h-3 md:h-4 text-white" />
              </div>
              <div className="flex flex-col -space-y-0.5">
                <span className="font-display font-bold tracking-tighter text-base md:text-lg text-neutral-900 dark:text-white leading-none">LinkScout</span>
                <span className="text-[6px] md:text-[7px] font-black tracking-[0.35em] uppercase text-blue-600 dark:text-blue-500">Enterprise</span>
              </div>
            </div>
            <p className="text-neutral-500 dark:text-neutral-600 text-[11px] md:text-xs tracking-wide font-mono max-w-xs leading-loose">
              The global standard for technical website intelligence. Built for the next generation of web engineers.
            </p>
            <div className="flex items-center gap-2 text-[8px] md:text-[9px] font-black tracking-widest text-emerald-600 dark:text-emerald-500 uppercase">
              <Wifi className="w-2.5 md:w-3 h-2.5 md:h-3" /> Powered by Gemini AI
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 md:gap-3">
            <p className="text-[8px] md:text-[9px] font-black tracking-[0.4em] text-neutral-400 dark:text-neutral-600 uppercase">Crafted by</p>
            <a href="https://www.almumeetusaikat.me" target="_blank" rel="noreferrer"
              className="text-lg md:text-xl font-display font-bold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors tracking-tight">
              Al Mumeetu Saikat
            </a>
            <div className="h-px w-12 md:w-16 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
            <p className="text-[8px] md:text-[9px] font-bold tracking-[0.3em] uppercase text-neutral-400 dark:text-neutral-600">Enterprise Edition // 2026</p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4 md:gap-5">
            <div className="flex flex-wrap gap-x-4 md:gap-x-8 gap-y-2 md:gap-y-3 text-[9px] md:text-[10px] font-black tracking-widest uppercase text-neutral-400">
              <a href="https://www.almumeetusaikat.me" target="_blank" rel="noreferrer"
                className="hover:text-blue-600 dark:hover:text-white transition-colors flex items-center gap-1">
                Client Portal <ArrowUpRight className="w-2.5 md:w-3 h-2.5 md:h-3" />
              </a>
              <a href="https://www.almumeetusaikat.me" target="_blank" rel="noreferrer"
                className="hover:text-blue-600 dark:hover:text-white transition-colors flex items-center gap-1">
                SLA <ArrowUpRight className="w-2.5 md:w-3 h-2.5 md:h-3" />
              </a>
              <a href="https://www.almumeetusaikat.me/contact" target="_blank" rel="noreferrer"
                className="hover:text-blue-600 dark:hover:text-white transition-colors flex items-center gap-1">
                Contact <ArrowUpRight className="w-2.5 md:w-3 h-2.5 md:h-3" />
              </a>
            </div>
            <p className="text-[8px] md:text-[9px] text-neutral-300 dark:text-neutral-700 font-mono">
              © 2026 LinkScout Enterprise. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
