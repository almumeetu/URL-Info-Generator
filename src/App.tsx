import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Globe, Github, ExternalLink, Loader2, Copy, Check,
  Share2, Activity, AlertCircle, TrendingUp, Cpu, Target,
  BarChart3, ShieldCheck, Zap, Sun, Moon, Twitter, Linkedin,
  Facebook, Instagram, Youtube, Lock, Eye, FileText,
  Code2, Layers, BookOpen, Users, Clock,
  CheckCircle2, XCircle, ArrowUpRight, Sparkles, Radio,
  Shield, Hash, ChevronRight, LayoutGrid, Image
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
  openGraph: { hasOgImage: boolean; hasTwitterCard: boolean; ogType: string; ogSiteName: string; socialShareReady: boolean };
  contentMetrics: { wordCount: number; readingTimeMinutes: number; headingStructure: string; contentQuality: string };
  securityHeaders: { hsts: boolean; csp: boolean; xFrameOptions: boolean; xContentType: boolean; referrerPolicy: boolean; permissionsPolicy: boolean };
  performanceSignals: { hasPreconnect: boolean; hasPreload: boolean; lazyImages: number; totalScripts: number; totalStyles: number; inlineScripts: number };
  seoAudit: SeoAudit;
  githubUrl: string | null;
  liveUrl: string;
  favicon: string | null;
  themeColor: string;
  rawSocialLinks: Record<string, string>;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "https://github.com", "https://vercel.com", "https://stripe.com",
  "https://linear.app", "https://notion.so", "https://figma.com",
  "https://tailwindcss.com", "https://nextjs.org", "https://supabase.com",
  "https://openai.com", "https://shopify.com", "https://airbnb.com",
];

// ── Score helpers — explicit classes so Tailwind includes them ─────────────────
function scoreTextClass(n: number) {
  if (n >= 80) return "text-emerald-500";
  if (n >= 60) return "text-blue-500";
  if (n >= 40) return "text-yellow-500";
  return "text-red-500";
}
function scoreStrokeClass(n: number) {
  if (n >= 80) return "stroke-emerald-500";
  if (n >= 60) return "stroke-blue-500";
  if (n >= 40) return "stroke-yellow-500";
  return "stroke-red-500";
}
function scoreBgClass(n: number) {
  if (n >= 80) return "bg-emerald-500";
  if (n >= 60) return "bg-blue-500";
  if (n >= 40) return "bg-yellow-500";
  return "bg-red-500";
}
function gradeTextClass(g: string) {
  const m: Record<string, string> = { A: "text-emerald-500", B: "text-blue-500", C: "text-yellow-500", D: "text-orange-500", F: "text-red-500" };
  return m[g] ?? "text-neutral-400";
}

// ── Reusable components ────────────────────────────────────────────────────────
function BoolBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-colors
      ${ok
        ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/25 dark:text-emerald-400"
        : "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/25 dark:text-red-400"
      }`}>
      {ok
        ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        : <XCircle className="w-3.5 h-3.5 shrink-0" />
      }
      <span className="truncate">{label}</span>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/[0.08] rounded-2xl md:rounded-3xl shadow-sm dark:shadow-none ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, label, colorClass, iconBgClass }: { icon: React.ReactNode; label: string; colorClass: string; iconBgClass: string }) {
  return (
    <div className={`flex items-center gap-2.5 mb-5 ${colorClass}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBgClass}`}>
        {icon}
      </div>
      <span className="font-black tracking-widest text-[10px] uppercase">{label}</span>
    </div>
  );
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center w-20 h-20">
        <svg width="80" height="80" className="-rotate-90 absolute inset-0">
          <circle cx="40" cy="40" r={r} fill="none" strokeWidth="6"
            className="stroke-neutral-200 dark:stroke-white/10" />
          <motion.circle cx="40" cy="40" r={r} fill="none" strokeWidth="6"
            strokeLinecap="round"
            className={scoreStrokeClass(score)}
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - score / 100) }}
            transition={{ duration: 1.2, ease: "easeOut" }} />
        </svg>
        <span className={`text-xl font-black font-display relative z-10 ${scoreTextClass(score)}`}>{score}</span>
      </div>
      <span className="text-[9px] font-black tracking-widest text-neutral-400 dark:text-neutral-500 uppercase text-center">{label}</span>
    </div>
  );
}

function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden ${className}`}>
      <motion.div className={`h-full rounded-full ${scoreBgClass(value)}`}
        initial={{ width: 0 }} animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }} />
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<WebsiteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ls-theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestRef = useRef<HTMLDivElement>(null);

  // Sync dark mode to DOM + localStorage
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("ls-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Close suggestions on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!suggestRef.current?.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleUrlChange = (val: string) => {
    setUrl(val);
    const filtered = val.length
      ? SUGGESTIONS.filter(s => s.includes(val.toLowerCase()))
      : SUGGESTIONS.slice(0, 6);
    setFilteredSuggestions(filtered.length ? filtered : SUGGESTIONS.slice(0, 6));
    setShowSuggestions(true);
  };

  const handleCopy = () => {
    if (!info) return;
    navigator.clipboard.writeText([
      "=== LinkScout Enterprise Report ===",
      `URL: ${info.liveUrl}`, `Title: ${info.title}`, `Category: ${info.category}`,
      `Tech: ${info.techStack}`, `Infrastructure: ${info.infrastructure}`,
      `Grade: ${info.performanceGrade}`, `SEO: ${info.seoAudit.score}/100`,
      `Security: ${info.securityScore}/100`, `A11y: ${info.accessibilityScore}/100`,
      `Keywords: ${info.seoKeywords}`,
    ].join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!info) return;
    const text = `🔍 ${info.title} — SEO ${info.seoAudit.score}/100 · Security ${info.securityScore}/100 · Grade ${info.performanceGrade} via LinkScout`;
    if (navigator.share) {
      try { await navigator.share({ title: "LinkScout Analysis", text, url: window.location.href }); } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true); setError(null); setInfo(null); setShowSuggestions(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const text = await res.text();
      let d: any;
      try { d = JSON.parse(text); }
      catch { throw new Error("Server returned an unexpected response. Please try again."); }
      if (!res.ok) throw new Error(d.error || "Analysis failed");
      setInfo(d);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const socialIcons: Record<string, React.ReactNode> = {
    twitter: <Twitter className="w-4 h-4" />, github: <Github className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />, facebook: <Facebook className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />, youtube: <Youtube className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080808] text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-300 relative">
      {/* dot grid */}
      <div className="fixed inset-0 enterprise-grid pointer-events-none opacity-50 dark:opacity-30" />

      {/* ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-1/2 h-1/3 rounded-full blur-[160px] opacity-20 dark:opacity-15 transition-all duration-1000"
          style={{ backgroundColor: info?.themeColor || "#3b82f6" }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-4 md:px-6
        bg-white/80 dark:bg-[#080808]/80 backdrop-blur-xl
        border-b border-neutral-200 dark:border-white/[0.07]">

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-md shadow-blue-600/30">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div className="leading-none">
            <div className="font-display font-bold tracking-tighter text-base text-neutral-900 dark:text-white">LinkScout</div>
            <div className="text-[7px] font-black tracking-[0.3em] uppercase text-blue-600 dark:text-blue-400">Enterprise</div>
          </div>
          <div className="hidden sm:flex items-center gap-1 ml-2 px-2.5 py-1 rounded-full
            bg-emerald-500/10 border border-emerald-500/20
            text-[8px] font-black tracking-widest text-emerald-600 dark:text-emerald-400">
            <Radio className="w-2 h-2 animate-pulse" /> PRODUCTION
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(d => !d)}
          aria-label="Toggle theme"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl
            bg-neutral-100 dark:bg-white/5
            border border-neutral-200 dark:border-white/10
            hover:border-blue-500/40 active:scale-95 transition-all text-xs font-bold
            text-neutral-600 dark:text-neutral-300">
          {isDark
            ? <><Sun className="w-3.5 h-3.5 text-yellow-400" /><span className="hidden sm:inline">Light</span></>
            : <><Moon className="w-3.5 h-3.5 text-indigo-500" /><span className="hidden sm:inline">Dark</span></>
          }
        </button>
      </nav>

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-20">

        {/* Hero */}
        <header className="text-center mb-10 md:mb-14 space-y-3 md:space-y-4">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full
              bg-blue-500/10 border border-blue-500/15 dark:border-blue-500/20
              text-[10px] font-black tracking-widest uppercase text-blue-600 dark:text-blue-400">
            <Sparkles className="w-3 h-3 fill-current" /> AI-Powered Web Intelligence
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter
              text-neutral-900 dark:text-white">
            LinkScout<span className="text-blue-600 dark:text-blue-400 font-light"> Enterprise</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 font-light max-w-lg mx-auto">
            SEO · Security · Performance · Social · Content — all in one deep report.
          </motion.p>
        </header>

        {/* Search */}
        <section className="max-w-2xl mx-auto mb-14 md:mb-20 relative">
          <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            onSubmit={handleAnalyze} className="relative group">
            <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-500 blur-sm" />
            <div className="relative flex items-center gap-2 p-2
              bg-white dark:bg-[#111]
              border border-neutral-200 dark:border-white/10
              rounded-2xl shadow-lg shadow-neutral-200/50 dark:shadow-none
              focus-within:border-blue-500/50 transition-colors">
              <Search className="w-4 h-4 ml-2 text-neutral-400 dark:text-neutral-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={e => handleUrlChange(e.target.value)}
                onFocus={() => { setFilteredSuggestions(url ? filteredSuggestions : SUGGESTIONS.slice(0, 6)); setShowSuggestions(true); }}
                className="flex-1 bg-transparent border-none outline-none focus:ring-0
                  py-3 text-sm md:text-base font-mono
                  text-neutral-900 dark:text-white
                  placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
              />
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl
                  bg-neutral-900 dark:bg-white text-white dark:text-neutral-900
                  hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white
                  font-black text-xs md:text-sm tracking-wide
                  disabled:opacity-40 disabled:cursor-not-allowed
                  active:scale-95 transition-all shadow-md whitespace-nowrap">
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Zap className="w-3.5 h-3.5" /><span>ANALYZE</span></>
                }
              </button>
            </div>
          </motion.form>

          {/* Suggestions */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div ref={suggestRef}
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute top-full inset-x-0 mt-2 z-50
                  bg-white dark:bg-[#111]
                  border border-neutral-200 dark:border-white/10
                  rounded-2xl shadow-xl overflow-hidden">
                <div className="px-4 py-2 border-b border-neutral-100 dark:border-white/5">
                  <span className="text-[9px] font-black tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">Suggestions</span>
                </div>
                {filteredSuggestions.map((s, i) => (
                  <button key={i} type="button"
                    onClick={() => { setUrl(s); setShowSuggestions(false); inputRef.current?.focus(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5
                      hover:bg-blue-50 dark:hover:bg-white/5
                      text-left transition-colors group/s">
                    <Globe className="w-3.5 h-3.5 text-neutral-400 group-hover/s:text-blue-500 shrink-0 transition-colors" />
                    <span className="font-mono text-sm text-neutral-600 dark:text-neutral-300 group-hover/s:text-blue-600 dark:group-hover/s:text-blue-400 transition-colors">{s}</span>
                    <ArrowUpRight className="w-3 h-3 ml-auto text-neutral-300 dark:text-neutral-600 group-hover/s:text-blue-500 transition-colors" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-3 flex items-center justify-center gap-2 text-red-500 dark:text-red-400 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </section>

        {/* Results */}
        <AnimatePresence mode="wait">
          {info && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4 md:space-y-5">

              {/* ── 1. Identity ── */}
              <Card className="p-5 md:p-8">
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                  {/* Favicon */}
                  {info.favicon
                    ? <img src={info.favicon} alt="favicon"
                        className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-contain p-2
                          bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 shrink-0" />
                    : <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0
                          bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
                        <Globe className="w-7 h-7 text-neutral-400" />
                      </div>
                  }
                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase
                        bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20
                        text-blue-700 dark:text-blue-400">{info.category}</span>
                      <span className="flex items-center gap-1 text-[9px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                      </span>
                      {info.openGraph.socialShareReady && (
                        <span className="flex items-center gap-1 text-[9px] font-black tracking-widest uppercase text-purple-600 dark:text-purple-400">
                          <Share2 className="w-3 h-3" /> SHARE READY
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight
                      text-neutral-900 dark:text-white line-clamp-2">{info.title}</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light leading-relaxed line-clamp-2">{info.description}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-white/5 flex flex-wrap gap-2">
                  <button onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wide
                      bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10
                      text-neutral-700 dark:text-neutral-300 active:scale-95 transition-all">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy Report"}
                  </button>
                  <button onClick={handleShare}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wide
                      bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10
                      text-neutral-700 dark:text-neutral-300 active:scale-95 transition-all">
                    {shared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    {shared ? "Shared!" : "Share"}
                  </button>
                  <a href={info.liveUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wide
                      bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all">
                    Visit Site <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {info.githubUrl && (
                    <a href={info.githubUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wide
                        bg-neutral-900 dark:bg-white/10 hover:bg-neutral-800 dark:hover:bg-white/20
                        text-white active:scale-95 transition-all">
                      <Github className="w-3.5 h-3.5" /> Repo
                    </a>
                  )}
                </div>
              </Card>

              {/* ── 2. Scores row ── */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 md:gap-4">
                {/* Grade */}
                <Card className="p-5 flex flex-col items-center justify-center gap-1
                  bg-neutral-900 dark:bg-[#111] border-neutral-800 dark:border-white/5">
                  <span className="text-[9px] font-black tracking-widest text-white/40 uppercase">Grade</span>
                  <span className={`text-6xl font-display font-black tracking-tighter ${gradeTextClass(info.performanceGrade)}`}>
                    {info.performanceGrade}
                  </span>
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Technical Health</span>
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center gap-1">
                  <ScoreRing score={info.seoAudit.score} label="SEO" />
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center gap-1">
                  <ScoreRing score={info.securityScore} label="Security" />
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center gap-1">
                  <ScoreRing score={info.accessibilityScore} label="A11y" />
                </Card>
              </div>

              {/* ── 3. Infrastructure + Content ── */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: "Infrastructure", val: info.infrastructure, icon: <BarChart3 className="w-4 h-4" /> },
                  { label: "CMS / Engine", val: info.cms, icon: <Layers className="w-4 h-4" /> },
                  { label: "Word Count", val: info.contentMetrics.wordCount.toLocaleString(), icon: <FileText className="w-4 h-4" /> },
                  { label: "Read Time", val: `${info.contentMetrics.readingTimeMinutes} min`, icon: <Clock className="w-4 h-4" /> },
                ].map(({ label, val, icon }) => (
                  <div key={label} className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/[0.08] rounded-2xl md:rounded-3xl shadow-sm dark:shadow-none p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black tracking-widest text-neutral-400 dark:text-neutral-500 uppercase mb-0.5">{label}</p>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white truncate font-mono">{val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── 4. SEO Audit ── */}
              <Card className="p-5 md:p-7">
                <CardHeader icon={<TrendingUp className="w-4 h-4" />} label="Technical SEO Audit" colorClass="text-blue-600 dark:text-blue-400" iconBgClass="bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                  <BoolBadge ok={info.seoAudit.hasCanonical} label="Canonical" />
                  <BoolBadge ok={info.seoAudit.hasSitemap} label="Sitemap" />
                  <BoolBadge ok={info.seoAudit.hasStructuredData} label="Structured Data" />
                  <BoolBadge ok={info.seoAudit.mobileOptimized} label="Mobile Ready" />
                  <BoolBadge ok={info.seoAudit.crawlability === "Good"} label="Crawlable" />
                  <BoolBadge ok={info.seoAudit.indexability === "Good"} label="Indexable" />
                  <BoolBadge ok={info.openGraph.hasOgImage} label="OG Image" />
                  <BoolBadge ok={info.openGraph.hasTwitterCard} label="Twitter Card" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/15 space-y-3">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] font-black tracking-widest uppercase">Issues</span>
                    </div>
                    <ul className="space-y-2.5">
                      {info.seoAudit.topIssues.map((issue, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-neutral-700 dark:text-neutral-300 font-light leading-relaxed">
                          <span className="text-red-400 font-mono text-[10px] font-bold mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/15 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <Activity className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] font-black tracking-widest uppercase">Recommendations</span>
                    </div>
                    <ul className="space-y-2.5">
                      {info.seoAudit.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-neutral-700 dark:text-neutral-300 font-light leading-relaxed">
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              {/* ── 5. Security + Performance ── */}
              <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                <Card className="p-5 md:p-6">
                  <CardHeader icon={<Shield className="w-4 h-4" />} label="Security Headers" colorClass="text-red-600 dark:text-red-400" iconBgClass="bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400" />
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <BoolBadge ok={info.securityHeaders.hsts} label="HSTS" />
                    <BoolBadge ok={info.securityHeaders.csp} label="CSP" />
                    <BoolBadge ok={info.securityHeaders.xFrameOptions} label="X-Frame-Options" />
                    <BoolBadge ok={info.securityHeaders.xContentType} label="X-Content-Type" />
                    <BoolBadge ok={info.securityHeaders.referrerPolicy} label="Referrer-Policy" />
                    <BoolBadge ok={info.securityHeaders.permissionsPolicy} label="Permissions" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-neutral-500 dark:text-neutral-400">Security Score</span>
                      <span className={scoreTextClass(info.securityScore)}>{info.securityScore}/100</span>
                    </div>
                    <ProgressBar value={info.securityScore} />
                  </div>
                </Card>

                <Card className="p-5 md:p-6">
                  <CardHeader icon={<Zap className="w-4 h-4" />} label="Performance Signals" colorClass="text-yellow-600 dark:text-yellow-400" iconBgClass="bg-yellow-100 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" />
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <BoolBadge ok={info.performanceSignals.hasPreconnect} label="Preconnect" />
                    <BoolBadge ok={info.performanceSignals.hasPreload} label="Preload" />
                    <BoolBadge ok={info.performanceSignals.lazyImages > 0} label="Lazy Images" />
                    <BoolBadge ok={info.performanceSignals.inlineScripts < 5} label="Low Inline JS" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Scripts", val: info.performanceSignals.totalScripts, icon: <Code2 className="w-3.5 h-3.5" /> },
                      { label: "Styles", val: info.performanceSignals.totalStyles, icon: <Layers className="w-3.5 h-3.5" /> },
                      { label: "Lazy Imgs", val: info.performanceSignals.lazyImages, icon: <Image className="w-3.5 h-3.5" /> },
                    ].map(({ label, val, icon }) => (
                      <div key={label} className="p-3 rounded-xl text-center
                        bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/5">
                        <div className="flex justify-center text-neutral-400 dark:text-neutral-500 mb-1">{icon}</div>
                        <p className="text-base font-black font-display text-neutral-900 dark:text-white">{val}</p>
                        <p className="text-[9px] text-neutral-400 uppercase tracking-widest">{label}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* ── 6. Tech + Social + OG ── */}
              <div className="grid md:grid-cols-3 gap-4 md:gap-5">
                {/* Tech Stack */}
                <Card className="p-5 md:p-6">
                  <CardHeader icon={<Cpu className="w-4 h-4" />} label="Technology Stack" colorClass="text-blue-600 dark:text-blue-400" iconBgClass="bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400" />
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {info.techStack.split(",").map((t, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium
                        bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10
                        text-neutral-700 dark:text-neutral-300">{t.trim()}</span>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-neutral-100 dark:border-white/5">
                    <p className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-2">Analytics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {info.analytics.split(",").map((a, i) => (
                        <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium
                          bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/15
                          text-emerald-700 dark:text-emerald-400">
                          <Check className="w-2.5 h-2.5" />{a.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Social Presence */}
                <Card className="p-5 md:p-6">
                  <CardHeader icon={<Users className="w-4 h-4" />} label="Social Presence" colorClass="text-purple-600 dark:text-purple-400" iconBgClass="bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400" />
                  <div className="space-y-1.5">
                    {Object.entries(info.socialPresence).map(([platform, link]) => {
                      const resolved = link || info.rawSocialLinks?.[platform] || null;
                      return (
                        <div key={platform}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors
                            ${resolved
                              ? "bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/5 hover:border-blue-400/40"
                              : "bg-neutral-50/50 dark:bg-white/[0.02] border-neutral-100 dark:border-white/[0.03] opacity-40"
                            }`}>
                          <div className="flex items-center gap-2.5">
                            <span className="text-neutral-500 dark:text-neutral-400">{socialIcons[platform] ?? <Globe className="w-4 h-4" />}</span>
                            <span className="text-xs font-semibold capitalize text-neutral-700 dark:text-neutral-300">{platform}</span>
                          </div>
                          {resolved
                            ? <a href={resolved} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </a>
                            : <XCircle className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700" />
                          }
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* OG + Content */}
                <Card className="p-5 md:p-6">
                  <CardHeader icon={<Share2 className="w-4 h-4" />} label="Social Share" colorClass="text-indigo-600 dark:text-indigo-400" iconBgClass="bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400" />
                  <div className="space-y-2 mb-5">
                    <BoolBadge ok={info.openGraph.hasOgImage} label="OG Image" />
                    <BoolBadge ok={info.openGraph.hasTwitterCard} label="Twitter Card" />
                    <BoolBadge ok={info.openGraph.socialShareReady} label="Share Optimized" />
                  </div>
                  <div className="pt-4 border-t border-neutral-100 dark:border-white/5 space-y-3">
                    <div>
                      <p className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-1">Content Quality</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">{info.contentMetrics.contentQuality}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-1">Heading Structure</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light">{info.contentMetrics.headingStructure}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* ── 7. Keywords + Quick Stats ── */}
              <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                <Card className="p-5 md:p-6">
                  <CardHeader icon={<Target className="w-4 h-4" />} label="Strategic Intelligence" colorClass="text-orange-600 dark:text-orange-400" iconBgClass="bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400" />
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-2">Target Audience</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">{info.targetAudience}</p>
                    </div>
                    <div className="pt-4 border-t border-neutral-100 dark:border-white/5">
                      <p className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-2.5">SEO Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {info.seoKeywords.split(/[,|]/).map((kw, i) => (
                          <span key={i} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                            bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20
                            text-blue-700 dark:text-blue-400">
                            <Hash className="w-2.5 h-2.5" />{kw.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 md:p-6">
                  <CardHeader icon={<LayoutGrid className="w-4 h-4" />} label="Quick Stats" colorClass="text-teal-600 dark:text-teal-400" iconBgClass="bg-teal-100 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400" />
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: "Words", val: info.contentMetrics.wordCount.toLocaleString(), icon: <FileText className="w-3.5 h-3.5" /> },
                      { label: "Read Time", val: `${info.contentMetrics.readingTimeMinutes}m`, icon: <Clock className="w-3.5 h-3.5" /> },
                      { label: "Grade", val: info.performanceGrade, icon: <Zap className="w-3.5 h-3.5" />, color: gradeTextClass(info.performanceGrade) },
                      { label: "SEO", val: `${info.seoAudit.score}/100`, icon: <TrendingUp className="w-3.5 h-3.5" />, color: scoreTextClass(info.seoAudit.score) },
                      { label: "Security", val: `${info.securityScore}/100`, icon: <Lock className="w-3.5 h-3.5" />, color: scoreTextClass(info.securityScore) },
                      { label: "A11y", val: `${info.accessibilityScore}/100`, icon: <Eye className="w-3.5 h-3.5" />, color: scoreTextClass(info.accessibilityScore) },
                    ].map(({ label, val, icon, color }) => (
                      <div key={label} className="flex items-center gap-2.5 p-3 rounded-xl
                        bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/5">
                        <span className="text-neutral-400 dark:text-neutral-500 shrink-0">{icon}</span>
                        <div>
                          <p className={`text-sm font-black font-display ${color ?? "text-neutral-900 dark:text-white"}`}>{val}</p>
                          <p className="text-[9px] text-neutral-400 uppercase tracking-widest">{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-200 dark:border-white/[0.07] bg-white dark:bg-[#080808] transition-colors">

        {/* Creator strip */}
        <div className="border-b border-neutral-100 dark:border-white/[0.04] py-7 md:py-9 px-4 md:px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-600/25">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-bold tracking-tighter text-lg text-neutral-900 dark:text-white">LinkScout</span>
                  <span className="text-[7px] font-black tracking-[0.3em] uppercase text-blue-600 dark:text-blue-400
                    border border-blue-500/30 px-1.5 py-0.5 rounded">Enterprise</span>
                </div>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-600 font-mono">AI-Powered Web Intelligence Platform</p>
              </div>
            </div>

            {/* Creator card */}
            <a href="https://www.almumeetusaikat.me" target="_blank" rel="noreferrer"
              className="group flex items-center gap-3.5 px-5 py-3 rounded-2xl
                border border-neutral-200 dark:border-white/10
                bg-neutral-50 dark:bg-white/[0.03]
                hover:border-blue-500/40 hover:bg-blue-50 dark:hover:bg-blue-500/5
                transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600
                flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                <span className="text-white font-black text-sm">AS</span>
              </div>
              <div>
                <p className="text-[8px] font-black tracking-[0.3em] text-neutral-400 dark:text-neutral-500 uppercase">Designed & Built by</p>
                <p className="font-display font-bold text-base text-neutral-900 dark:text-white
                  group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Al Mumeetu Saikat</p>
                <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono">Full-Stack Developer · Bangladesh</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600
                group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all ml-1" />
            </a>

            {/* Tech badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { icon: <Zap className="w-3 h-3 text-blue-500" />, label: "React + TypeScript" },
                { icon: <Cpu className="w-3 h-3 text-purple-500" />, label: "Gemini 2.5 Flash" },
                { icon: <Shield className="w-3 h-3 text-emerald-500" />, label: "Node + Express" },
              ].map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold
                  bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10
                  text-neutral-500 dark:text-neutral-400">
                  {icon} {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-4 px-4 md:px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[9px] text-neutral-400 dark:text-neutral-600 font-mono order-2 sm:order-1">
              © 2026 LinkScout Enterprise · All rights reserved
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 order-1 sm:order-2">
              {[
                { label: "Portfolio", href: "https://www.almumeetusaikat.me" },
                { label: "Client Portal", href: "https://www.almumeetusaikat.me" },
                { label: "SLA", href: "https://www.almumeetusaikat.me" },
                { label: "Contact", href: "https://www.almumeetusaikat.me/contact" },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-[9px] md:text-[10px] font-black tracking-widest uppercase
                    text-neutral-400 hover:text-blue-600 dark:hover:text-white transition-colors">
                  {label} <ArrowUpRight className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
