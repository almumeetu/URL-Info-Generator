import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";
import * as cheerio from "cheerio";

let genAI: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set in environment variables.");
    genAI = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
  }
  return genAI;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { url } = req.body ?? {};
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(formattedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    }).finally(() => clearTimeout(timeout));

    if (!response.ok)
      throw new Error(`Target unreachable: ${response.status} ${response.statusText}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    // ── Core Meta ──────────────────────────────────────────────────────────────
    const title       = $("title").text().trim() || $("meta[property='og:title']").attr("content") || "";
    const description = $("meta[name='description']").attr("content") || $("meta[property='og:description']").attr("content") || "";
    const canonical   = $("link[rel='canonical']").attr("href") || "";
    const robots      = $("meta[name='robots']").attr("content") || "index, follow";
    const language    = $("html").attr("lang") || "";
    const charset     = $("meta[charset]").attr("charset") || $("meta[http-equiv='Content-Type']").attr("content") || "";
    const viewport    = $("meta[name='viewport']").attr("content") || "";
    const themeColor  = $("meta[name='theme-color']").attr("content") || "";
    const author      = $("meta[name='author']").attr("content") || "";
    const generator   = $("meta[name='generator']").attr("content") || "";

    // ── Open Graph ─────────────────────────────────────────────────────────────
    const ogTitle    = $("meta[property='og:title']").attr("content") || "";
    const ogImage    = $("meta[property='og:image']").attr("content") || "";
    const ogType     = $("meta[property='og:type']").attr("content") || "";
    const ogSiteName = $("meta[property='og:site_name']").attr("content") || "";
    const ogUrl      = $("meta[property='og:url']").attr("content") || "";
    const ogLocale   = $("meta[property='og:locale']").attr("content") || "";

    // ── Twitter Card ───────────────────────────────────────────────────────────
    const twitterCard    = $("meta[name='twitter:card']").attr("content") || "";
    const twitterSite    = $("meta[name='twitter:site']").attr("content") || "";
    const twitterCreator = $("meta[name='twitter:creator']").attr("content") || "";
    const twitterImage   = $("meta[name='twitter:image']").attr("content") || "";

    // ── Favicon ────────────────────────────────────────────────────────────────
    const faviconRaw =
      $("link[rel='apple-touch-icon']").attr("href") ||
      $("link[rel='shortcut icon']").attr("href") ||
      $("link[rel='icon']").attr("href") ||
      "";

    // ── Structured Data ────────────────────────────────────────────────────────
    const jsonLdScripts: string[] = [];
    $("script[type='application/ld+json']").each((_i, el) => {
      const text = $(el).html()?.trim();
      if (text) jsonLdScripts.push(text.substring(0, 500));
    });

    // ── Links & Social ─────────────────────────────────────────────────────────
    const allLinks: string[] = [];
    $("a[href]").each((_i, el) => { allLinks.push($(el).attr("href") || ""); });
    const hostname = new URL(formattedUrl).hostname;
    const externalLinks = allLinks.filter(l => l.startsWith("http") && !l.includes(hostname)).length;
    const internalLinks = allLinks.filter(l => !l.startsWith("http") || l.includes(hostname)).length;

    const socialLinks: Record<string, string> = {};
    const socialPatterns: Record<string, RegExp> = {
      twitter:   /twitter\.com|x\.com/,
      github:    /github\.com/,
      linkedin:  /linkedin\.com/,
      facebook:  /facebook\.com/,
      instagram: /instagram\.com/,
      youtube:   /youtube\.com/,
      discord:   /discord\.gg|discord\.com/,
    };
    allLinks.forEach(l => {
      Object.entries(socialPatterns).forEach(([name, pattern]) => {
        if (pattern.test(l) && !socialLinks[name]) socialLinks[name] = l;
      });
    });

    // ── Heading Structure ──────────────────────────────────────────────────────
    const h1s = $("h1").map((_i, el) => $(el).text().trim()).get().filter(Boolean);
    const h2s = $("h2").map((_i, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 10);
    const h3s = $("h3").map((_i, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 8);

    // ── Images ─────────────────────────────────────────────────────────────────
    const totalImages = $("img").length;
    const missingAlt  = $("img:not([alt])").length;
    const lazyImages  = $("img[loading='lazy']").length;

    // ── Performance Signals ────────────────────────────────────────────────────
    const totalScripts   = $("script").length;
    const inlineScripts  = $("script:not([src])").length;
    const totalStyles    = $("link[rel='stylesheet']").length;
    const inlineStyles   = $("style").length;
    const hasPreconnect  = $("link[rel='preconnect']").length > 0;
    const hasPreload     = $("link[rel='preload']").length > 0;
    const hasDnsPrefetch = $("link[rel='dns-prefetch']").length > 0;

    // ── Security Headers ───────────────────────────────────────────────────────
    const serverHeader      = response.headers.get("server") || "";
    const poweredByHeader   = response.headers.get("x-powered-by") || "";
    const cacheControl      = response.headers.get("cache-control") || "";
    const strictTransport   = response.headers.get("strict-transport-security") || "";
    const xFrameOptions     = response.headers.get("x-frame-options") || "";
    const xContentTypeOpts  = response.headers.get("x-content-type-options") || "";
    const csp               = response.headers.get("content-security-policy") || "";
    const referrerPolicy    = response.headers.get("referrer-policy") || "";
    const permissionsPolicy = response.headers.get("permissions-policy") || "";

    // ── Content ────────────────────────────────────────────────────────────────
    const bodyText    = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount   = bodyText.split(/\s+/).filter(Boolean).length;
    const bodyExcerpt = bodyText.substring(0, 5000);

    // ── Accessibility ──────────────────────────────────────────────────────────
    const hasSkipLink        = $("a[href='#main'], a[href='#content'], a[href='#skip']").length > 0;
    const hasAriaLabels      = $("[aria-label]").length;
    const hasRoles           = $("[role]").length;
    const hasLangAttr        = !!language;
    const inputsWithoutLabel = $("input:not([aria-label]):not([id])").length;

    const prompt = `
You are a world-class web intelligence analyst. Perform a comprehensive Technical Reconnaissance Report.

=== RAW SCRAPED DATA ===

URL: ${formattedUrl}
Title: ${title}
Meta Description: ${description}
Author: ${author}
Generator: ${generator}
Language: ${language || "not set"}
Charset: ${charset || "not set"}
Viewport: ${viewport || "not set"}
Canonical: ${canonical || "NOT SET — penalize SEO"}
Robots: ${robots}

--- Open Graph ---
og:title: ${ogTitle}
og:image: ${ogImage ? "present" : "MISSING"}
og:type: ${ogType}
og:site_name: ${ogSiteName}
og:url: ${ogUrl}
og:locale: ${ogLocale}

--- Twitter Card ---
twitter:card: ${twitterCard || "MISSING"}
twitter:site: ${twitterSite}
twitter:creator: ${twitterCreator}
twitter:image: ${twitterImage ? "present" : "MISSING"}

--- Heading Structure ---
H1 count: ${h1s.length} — ${h1s.slice(0, 3).join(" | ") || "none"}
H2 count: ${h2s.length} — ${h2s.slice(0, 5).join(" | ") || "none"}
H3 count: ${h3s.length}

--- Images ---
Total: ${totalImages}, Missing alt: ${missingAlt}, Lazy-loaded: ${lazyImages}

--- Links ---
Internal: ${internalLinks}, External: ${externalLinks}
Social profiles found: ${Object.keys(socialLinks).join(", ") || "none"}

--- Performance Signals ---
Scripts: ${totalScripts} total (${inlineScripts} inline)
Stylesheets: ${totalStyles} external, ${inlineStyles} inline
Preconnect: ${hasPreconnect}, Preload: ${hasPreload}, DNS-prefetch: ${hasDnsPrefetch}

--- Security Headers ---
Server: ${serverHeader || "hidden"}
X-Powered-By: ${poweredByHeader || "hidden"}
HSTS: ${strictTransport || "MISSING"}
X-Frame-Options: ${xFrameOptions || "MISSING"}
X-Content-Type-Options: ${xContentTypeOpts || "MISSING"}
CSP: ${csp ? "present" : "MISSING"}
Referrer-Policy: ${referrerPolicy || "MISSING"}
Permissions-Policy: ${permissionsPolicy || "MISSING"}
Cache-Control: ${cacheControl || "not set"}

--- Accessibility ---
Skip link: ${hasSkipLink}, ARIA labels: ${hasAriaLabels}, ARIA roles: ${hasRoles}
Lang attribute: ${hasLangAttr}, Inputs without label: ${inputsWithoutLabel}

--- Structured Data (JSON-LD) ---
${jsonLdScripts.length > 0 ? jsonLdScripts.slice(0, 2).join("\n") : "NONE FOUND"}

--- Content ---
Word count: ${wordCount}
Excerpt: ${bodyExcerpt}

=== INSTRUCTIONS ===
Analyze ALL the above data deeply. Return a STRICT JSON object with EXACTLY these fields (no extra text):

{
  "title": string,
  "description": string (2-3 sentence professional summary),
  "category": string (e.g. "E-Commerce", "SaaS", "Portfolio", "News", "Blog", "Corporate"),
  "techStack": string (comma-separated detected technologies),
  "infrastructure": string (hosting/CDN/cloud provider),
  "cms": string (CMS or framework),
  "analytics": string (comma-separated tracking/analytics tools),
  "seoKeywords": string (comma-separated top 6 keywords),
  "performanceGrade": string (A/B/C/D/F),
  "targetAudience": string,
  "securityScore": number (0-100, based on headers present),
  "accessibilityScore": number (0-100),
  "socialPresence": { "twitter": string|null, "github": string|null, "linkedin": string|null, "facebook": string|null, "instagram": string|null, "youtube": string|null },
  "openGraph": { "hasOgImage": boolean, "hasTwitterCard": boolean, "ogType": string, "ogSiteName": string, "socialShareReady": boolean },
  "contentMetrics": { "wordCount": number, "readingTimeMinutes": number, "headingStructure": string, "contentQuality": string },
  "securityHeaders": { "hsts": boolean, "csp": boolean, "xFrameOptions": boolean, "xContentType": boolean, "referrerPolicy": boolean, "permissionsPolicy": boolean },
  "performanceSignals": { "hasPreconnect": boolean, "hasPreload": boolean, "lazyImages": number, "totalScripts": number, "totalStyles": number, "inlineScripts": number },
  "seoAudit": {
    "score": number (0-100),
    "crawlability": "Good" | "Poor",
    "indexability": "Good" | "Poor",
    "hasCanonical": boolean,
    "hasSitemap": boolean,
    "hasStructuredData": boolean,
    "mobileOptimized": boolean,
    "topIssues": string[] (4-6 specific issues),
    "recommendations": string[] (4-6 actionable items)
  },
  "githubUrl": string|null,
  "liveUrl": string
}
`;

    const aiResult = await Promise.race([
      getAI().models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI analysis timed out. Please try again.")), 55000)
      ),
    ]);

    const aiText = (aiResult as any).text;
    let data: Record<string, unknown>;
    try {
      if (!aiText) throw new Error("AI returned empty response");
      data = JSON.parse(aiText.replace(/```json|```/g, "").trim());
    } catch {
      const jsonMatch = aiText?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("AI returned invalid data format");
      }
    }

    const resolvedFavicon = faviconRaw
      ? faviconRaw.startsWith("http")
        ? faviconRaw
        : new URL(faviconRaw, formattedUrl).href
      : null;

    return res.status(200).json({ ...data, favicon: resolvedFavicon, themeColor, rawSocialLinks: socialLinks });
  } catch (error: any) {
    console.error("Analysis Failure:", error);
    return res.status(500).json({
      error:
        error.name === "AbortError"
          ? "Target site took too long to respond."
          : error.message || "Deep analysis failed.",
    });
  }
}
