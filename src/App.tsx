import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Globe, Github, Info, Layers, Tag, ExternalLink, Loader2, Sparkles, Copy, Check, Share2 } from "lucide-react";

interface WebsiteInfo {
  title: string;
  description: string;
  category: string;
  techStack: string;
  githubUrl: string | null;
  liveUrl: string;
  favicon: string | null;
}

export default function App() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<WebsiteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = () => {
    if (!info) return;
    const text = `
Title: ${info.title}
Description: ${info.description}
Category: ${info.category}
Tech Stack: ${info.techStack}
Live URL: ${info.liveUrl}
${info.githubUrl ? `GitHub: ${info.githubUrl}` : ""}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!info) return;
    
    const shareText = `Check out this analysis of ${info.liveUrl} on LinkScout! It's a ${info.category} site using ${info.techStack}.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `LinkScout: ${info.title}`,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy shareable text
      navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`);
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
        throw new Error(data.error || "Failed to analyze website");
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
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Background Decorative Element */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-indigo-50/50 rounded-full blur-[100px]" />
      </div>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <header className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-neutral-100 mb-2">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold tracking-tight bg-gradient-to-br from-neutral-900 to-neutral-600 bg-clip-text text-transparent"
          >
            LinkScout
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-neutral-500 text-lg max-w-lg mx-auto"
          >
            Enter any website URL to instantly uncover its tech stack, category, and metadata with AI.
          </motion.p>
        </header>

        <section className="mb-12">
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleAnalyze}
            className="relative flex items-center"
          >
            <div className="absolute left-6 text-neutral-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Enter a website URL (e.g. google.com or https://ais.studio)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-14 pr-32 py-5 bg-white border border-neutral-200 rounded-2xl shadow-xl shadow-black/5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg placeholder:text-neutral-300"
            />
            <button
              disabled={loading}
              className="absolute right-3 px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group shadow-lg shadow-black/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Scout</span>
                  <Sparkles className="w-4 h-4 text-blue-300 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>
          </motion.form>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-red-500 font-medium"
            >
              {error}
            </motion.p>
          )}
        </section>

        <AnimatePresence mode="wait">
          {info && (
            <motion.div
              layoutId="result"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-neutral-200/60 shadow-2xl shadow-black/5 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-8 transform translate-x-1/4 -translate-y-1/4 opacity-[0.03] select-none">
                <Globe className="w-64 h-64" />
              </div>

              <div className="relative z-10 space-y-12">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {info.favicon ? (
                      <img src={info.favicon} alt="favicon" className="w-16 h-16 rounded-2xl bg-neutral-50 border border-neutral-100 flex-shrink-0 object-contain p-2" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-100 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-8 h-8 text-neutral-400" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold tracking-tight text-neutral-900">{info.title}</h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold border border-blue-100/50">
                          <Tag className="w-3.5 h-3.5" />
                          {info.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-sm font-medium transition-all group"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600" />
                          <span>Copy Info</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-sm font-medium transition-all group"
                    >
                      {shared ? (
                        <>
                          <Check className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-600">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600" />
                          <span>Share</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-400">
                    <Info className="w-4 h-4" />
                    Project Description
                  </h3>
                  <p className="text-xl text-neutral-700 leading-relaxed max-w-3xl">
                    {info.description}
                  </p>
                </div>

                {/* Grid Info */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-6 bg-neutral-50/50 rounded-3xl border border-neutral-100 space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-400">
                      <Layers className="w-4 h-4" />
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {info.techStack.split(',').map((tech, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 shadow-sm">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-neutral-50/50 rounded-3xl border border-neutral-100 space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-400">
                      <ExternalLink className="w-4 h-4" />
                      External Links
                    </h3>
                    <div className="space-y-2">
                      <a 
                        href={info.liveUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm group"
                      >
                        <span className="font-medium truncate mr-4">{info.liveUrl}</span>
                        <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 flex-shrink-0" />
                      </a>
                      {info.githubUrl && (
                        <a 
                          href={info.githubUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-xl hover:border-neutral-900 hover:text-neutral-900 transition-all shadow-sm group"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Github className="w-4 h-4" />
                            <span className="font-medium truncate">GitHub Repository</span>
                          </div>
                          <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 flex-shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 text-center text-neutral-400 text-sm border-t border-neutral-100">
        <p>&copy; 2026 LinkScout. Built with Google Gemini.</p>
      </footer>
    </div>
  );
}
