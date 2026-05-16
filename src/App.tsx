import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Globe, Github, Info, Layers, Tag, ExternalLink, 
  Loader2, Sparkles, Copy, Check, Share2, Server, 
  Activity, AlertCircle, TrendingUp,
  Cpu, Target, BarChart3, ShieldCheck, Zap, Sun, Moon
} from "lucide-react";

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
  seoAudit: {
    score: number;
    crawlability: string;
    indexability: string;
    topIssues: string[];
    recommendations: string[];
  };
  githubUrl: string | null;
  liveUrl: string;
  favicon: string | null;
  themeColor: string;
}

export default function App() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<WebsiteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleCopy = () => {
    if (!info) return;
    const text = `
Title: ${info.title}
Desc: ${info.description}
Tech: ${info.techStack}
Infra: ${info.infrastructure}
Cat: ${info.category}
URL: ${info.liveUrl}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!info) return;
    const shareText = `Analyzed ${info.title} on LinkScout. Tech: ${info.techStack}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "LinkScout Analysis", text: shareText, url: window.location.href });
      } catch (err) { console.error(err); }
    } else {
      navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Analysis failed");
      }
      const data = await response.json();
      setInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-neutral-900 dark:text-[#e0e0e0] font-sans selection:bg-blue-500/30 transition-colors duration-500 relative">
      <div className="fixed inset-0 enterprise-grid pointer-events-none opacity-50" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-xl border-b border-neutral-200 dark:border-white/5 bg-slate-50/80 dark:bg-[#050505]/80 transition-all">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="font-display font-bold tracking-tighter text-xl text-neutral-900 dark:text-white">LinkScout</span>
            <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-blue-600 dark:text-blue-500">Enterprise</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
             <ShieldCheck className="w-3 h-3" /> LICENSE ACTIVE
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-blue-500/50 transition-all shadow-sm active:scale-95"
          >
            {isDark ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>
        </div>
      </nav>

      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div 
          className="absolute top-[10%] left-[20%] w-[60%] h-[40%] rounded-full blur-[160px] opacity-20 dark:opacity-20 transition-all duration-1000"
          style={{ backgroundColor: info?.themeColor || (isDark ? '#3b82f6' : '#60a5fa') }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] brightness-200 dark:opacity-[0.03]" />
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24">
        <header className="max-w-2xl mx-auto text-center mb-20 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 dark:bg-white/5 border border-blue-500/10 dark:border-white/10 text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400"
          >
            <Zap className="w-3 h-3 fill-current" />
            AI-Powered Reconnaissance
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-display font-bold tracking-tighter text-neutral-900 dark:text-white"
          >
            LinkScout<span className="text-blue-600 dark:text-blue-500 font-light"> Enterprise</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-neutral-500 dark:text-neutral-400 text-lg md:text-xl font-light"
          >
            A professional developer tool for deep architectural insights into any web address.
          </motion.p>
        </header>

        <section className="max-w-3xl mx-auto mb-24">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleAnalyze}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-10 group-focus-within:opacity-30 transition duration-1000" />
            <div className="relative flex items-center bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-2xl p-2 focus-within:border-blue-500/50 transition-all shadow-xl shadow-neutral-200/50 dark:shadow-none">
              <Search className="w-5 h-5 ml-4 text-neutral-400 dark:text-neutral-500" />
              <input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 px-4 py-4 text-neutral-900 dark:text-white text-lg placeholder:text-neutral-400 dark:placeholder:text-neutral-600 font-mono"
              />
              <button
                disabled={loading}
                className="bg-neutral-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-bold tracking-tight hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>ANALYZE</span>}
              </button>
            </div>
          </motion.form>
          {error && <p className="mt-4 text-center text-red-500 dark:text-red-400 font-medium font-mono text-sm uppercase tracking-widest">{error}</p>}
        </section>

        <AnimatePresence mode="wait">
          {info && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="grid lg:grid-cols-3 gap-6 text-left">
                
                {/* Bento: Header Overview */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group shadow-xl shadow-neutral-200/30 dark:shadow-none">
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[80px]" />
                  
                  <div className="relative flex flex-col md:flex-row gap-8 items-start">
                    {info.favicon ? (
                      <img src={info.favicon} alt="favicon" className="w-20 h-20 rounded-2xl bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-4 object-contain shadow-sm" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center"><Globe className="w-10 h-10 text-neutral-400 dark:text-neutral-600" /></div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 text-[10px] font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">{info.category}</span>
                          <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-3 h-3" /> VERIFIED
                          </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">{info.title}</h2>
                      </div>
                      <p className="text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">{info.description}</p>
                    </div>
                  </div>

                  <div className="mt-12 flex flex-wrap gap-4 pt-10 border-t border-neutral-100 dark:border-white/5">
                    <button onClick={handleCopy} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-xl transition-all font-bold text-xs tracking-widest text-neutral-600 dark:text-neutral-300 active:scale-95">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'COPIED' : 'COPY SPECS'}
                    </button>
                    <button onClick={handleShare} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-xl transition-all font-bold text-xs tracking-widest text-neutral-600 dark:text-neutral-300 active:scale-95">
                       {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />} {shared ? 'LINKED' : 'SHARE'}
                    </button>
                    <a href={info.liveUrl} target="_blank" rel="noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-bold text-xs tracking-widest shadow-lg shadow-blue-500/20 active:scale-95">
                      VISIT SITE <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Bento: High Level Specs */}
                <div className="bg-blue-600 rounded-[2.5rem] p-10 flex flex-col justify-between text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
                  <div className="absolute bottom-0 right-0 opacity-10 translate-y-1/4 translate-x-1/4 pointer-events-none">
                    <BarChart3 className="w-64 h-64" />
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="text-xs font-bold tracking-[0.2em] opacity-70 uppercase">Technical Health</p>
                    <h3 className="text-8xl font-display font-bold tracking-tighter">{info.performanceGrade}</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/15 rounded-2xl backdrop-blur-md border border-white/10">
                      <p className="text-[10px] font-bold tracking-widest opacity-60 mb-2 uppercase">Infrastructure</p>
                      <p className="font-mono text-sm leading-none font-medium">{info.infrastructure}</p>
                    </div>
                    <div className="p-4 bg-white/15 rounded-2xl backdrop-blur-md border border-white/10">
                      <p className="text-[10px] font-bold tracking-widest opacity-60 mb-2 uppercase">CMS / Engine</p>
                      <p className="font-mono text-sm leading-none font-medium">{info.cms}</p>
                    </div>
                  </div>
                </div>

                {/* Bento: Technical SEO Audit */}
                <div className="lg:col-span-3 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group shadow-xl shadow-neutral-200/30 dark:shadow-none text-left">
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <TrendingUp className="w-64 h-64 text-blue-600 dark:text-blue-500" />
                   </div>
                   
                   <div className="relative flex flex-col lg:flex-row gap-12">
                      {/* Score Circle */}
                      <div className="flex flex-col items-center justify-center p-8 bg-blue-50 dark:bg-white/5 rounded-full border border-blue-100 dark:border-white/10 w-48 h-48 mx-auto lg:mx-0 shrink-0">
                         <span className="text-6xl font-display font-bold text-blue-600 dark:text-blue-500">{info.seoAudit.score}</span>
                         <span className="text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase mt-2">SEO SCORE</span>
                      </div>

                      <div className="flex-1 space-y-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <div>
                              <h3 className="text-3xl font-display font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">Technical SEO Audit</h3>
                              <p className="text-neutral-600 dark:text-neutral-400 font-light">Deep structural analysis of on-page elements, crawlability, and indexing protocols.</p>
                           </div>
                           <div className="flex gap-4">
                              <div className="px-5 py-3 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl space-y-1 min-w-[140px]">
                                 <p className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase flex items-center justify-between">
                                    Crawlability
                                    <span className={`w-1.5 h-1.5 rounded-full ${info.seoAudit.crawlability === 'Good' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                 </p>
                                 <p className={`text-sm font-bold ${info.seoAudit.crawlability === 'Good' ? 'text-emerald-600' : 'text-amber-600'}`}>{info.seoAudit.crawlability}</p>
                              </div>
                              <div className="px-5 py-3 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl space-y-1 min-w-[140px]">
                                 <p className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase flex items-center justify-between">
                                    Indexability
                                    <span className={`w-1.5 h-1.5 rounded-full ${info.seoAudit.indexability === 'Good' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                 </p>
                                 <p className={`text-sm font-bold ${info.seoAudit.indexability === 'Good' ? 'text-emerald-600' : 'text-amber-600'}`}>{info.seoAudit.indexability}</p>
                              </div>
                           </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                           <div className="space-y-6 p-6 bg-red-500/5 dark:bg-red-500/5 border border-red-500/10 rounded-[2rem]">
                              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                 <AlertCircle className="w-4 h-4" />
                                 <h4 className="text-[10px] font-bold tracking-widest uppercase">Critical Issues Identified</h4>
                              </div>
                              <ul className="space-y-3">
                                 {info.seoAudit.topIssues.map((issue, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300 font-light leading-relaxed">
                                       <span className="text-red-500/50 font-mono text-[10px] mt-1 shrink-0">{String(i+1).padStart(2, '0')}</span>
                                       {issue}
                                    </li>
                                 ))}
                              </ul>
                           </div>
                           <div className="space-y-6 p-6 bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem]">
                              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                 <Activity className="w-4 h-4" />
                                 <h4 className="text-[10px] font-bold tracking-widest uppercase">Actionable Recommendations</h4>
                              </div>
                              <ul className="space-y-3">
                                 {info.seoAudit.recommendations.map((rec, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300 font-light leading-relaxed group/item">
                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-2 shrink-0 group-hover/item:bg-emerald-500 transition-colors" />
                                       {rec}
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Bento Rows */}
                <div className="lg:col-span-1 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-neutral-200/20 shadow-xl dark:shadow-none text-left">
                   <div className="flex items-center gap-3 text-blue-600 dark:text-blue-500">
                      <Cpu className="w-5 h-5" />
                      <h4 className="font-bold tracking-widest text-xs uppercase">Core Technologies</h4>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {info.techStack.split(',').map((tech, i) => (
                       <span key={i} className="px-3 py-1.5 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-lg text-[11px] font-mono font-medium text-neutral-600 dark:text-neutral-300">
                         {tech.trim()}
                       </span>
                     ))}
                   </div>
                </div>

                <div className="lg:col-span-1 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-neutral-200/20 shadow-xl dark:shadow-none text-left">
                   <div className="flex items-center gap-3 text-purple-600 dark:text-purple-500">
                      <Target className="w-5 h-5" />
                      <h4 className="font-bold tracking-widest text-xs uppercase">Strategic Data</h4>
                   </div>
                   <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-neutral-400 mb-2 uppercase">Target Audience</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">{info.targetAudience}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-neutral-400 mb-2 uppercase">Core SEO Keywords</p>
                        <div className="flex flex-wrap gap-2">
                         {info.seoKeywords.split(/[,|]/).map((kw, i) => (
                           <span key={i} className="text-xs text-blue-600 dark:text-blue-400 font-medium italic underline decoration-blue-500/20 underline-offset-4">#{kw.trim()}</span>
                         ))}
                        </div>
                      </div>
                   </div>
                </div>

                <div className="lg:col-span-1 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-neutral-200/20 shadow-xl dark:shadow-none text-left">
                   <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-500">
                      <BarChart3 className="w-5 h-5" />
                      <h4 className="font-bold tracking-widest text-xs uppercase">Marketing & Tracking</h4>
                   </div>
                   <div className="space-y-1">
                      {info.analytics.split(',').map((tool, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5 border-b border-neutral-100 dark:border-white/5 last:border-0">
                          <span className="text-sm font-light text-neutral-500 dark:text-neutral-400">{tool.trim()}</span>
                          <Check className="w-3 h-3 text-emerald-500/50" />
                        </div>
                      ))}
                      {info.githubUrl && (
                        <a href={info.githubUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between py-4 mt-2 group border-t border-neutral-100 dark:border-none pt-4">
                          <div className="flex items-center gap-2">
                            <Github className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                            <span className="text-xs font-bold tracking-widest uppercase group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">VCS REPO</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-all transform group-hover:translate-x-1" />
                        </a>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-24 border-t border-neutral-200 dark:border-white/5 py-20 px-6 bg-white dark:bg-transparent transition-colors">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 items-center gap-12">
           <div className="space-y-4">
             <div className="flex items-center gap-3">
               <Globe className="w-6 h-6 text-blue-600" />
               <span className="font-display font-bold tracking-tighter text-2xl text-neutral-900 dark:text-white">LinkScout</span>
             </div>
             <p className="text-neutral-500 dark:text-neutral-600 text-xs tracking-widest font-mono max-w-xs leading-loose">
               The global standard for technical website intelligence. Developed for the next generation of web engineers.
             </p>
           </div>
           
           <div className="flex flex-col items-center gap-2">
             <p className="text-[10px] font-bold tracking-[0.4em] text-neutral-400 dark:text-neutral-600 uppercase">Crafted by</p>
             <a 
               href="https://almumeeetusaikat.me" 
               target="_blank" 
               rel="noreferrer"
               className="text-lg font-display font-bold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors tracking-tight"
             >
               Al Mumeetu Saikat
             </a>
             <div className="h-px w-12 bg-blue-500/30"></div>
           </div>

           <div className="flex flex-col items-center md:items-end gap-6 text-neutral-400">
             <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-50">Enterprise Edition // 2026</p>
             <div className="flex gap-8 text-[11px] font-bold tracking-widest uppercase">
                <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Client Portal</a>
                <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">SLA</a>
                <a href="#" className="hover:text-blue-600 dark:hover:text-white transition-colors">Contact</a>
             </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
