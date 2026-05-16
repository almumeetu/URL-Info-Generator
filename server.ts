import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as cheerio from "cheerio";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Lazy-loaded Gemini AI
let genAI: any = null;
function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

app.post("/api/analyze", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    
    // Robust production fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(formattedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LinkScoutEnterprise/2.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      throw new Error(`Target unreachable: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extraction
    const title = $("title").text() || $("meta[property='og:title']").attr("content") || "";
    const description = $("meta[name='description']").attr("content") || $("meta[property='og:description']").attr("content") || "";
    const favicon = $("link[rel='shortcut icon']").attr("href") || $("link[rel='icon']").attr("href") || "";
    const themeColor = $("meta[name='theme-color']").attr("content") || "";
    const canonical = $("link[rel='canonical']").attr("href") || "";
    const robots = $("meta[name='robots']").attr("content") || "index, follow";
    const language = $("html").attr("lang") || "en";
    
    const h1s = $("h1").map((i, el) => $(el).text().trim()).get();
    const h2s = $("h2").map((i, el) => $(el).text().trim()).get().slice(0, 8);
    const totalImages = $("img").length;
    const missingAltCount = $("img:not([alt])").length;

    const serverHeader = response.headers.get("server") || "";
    const powerByHeader = response.headers.get("x-powered-by") || "";
    const bodyExcerpt = $("body").text().replace(/\s+/g, ' ').substring(0, 4500);

    const prompt = `
      You are an elite web architect performing a Technical Reconnaissance for a premium auditing firm.
      Website Context:
      URL: ${formattedUrl}
      Title: ${title}
      Description: ${description}
      Security Hints: ${serverHeader} | ${powerByHeader}
      Structure: ${h1s.length} H1s, ${totalImages} images.

      Analyze the following content to identify the exact technology stack, infrastructure, and provide a 0-100 SEO Audit score.
      
      Content Excerpt: ${bodyExcerpt}

      Return a STRICT JSON object with these fields:
      - title, description, category, techStack (comma list), infrastructure, cms, analytics, seoKeywords, performanceGrade, targetAudience.
      - seoAudit: { score, crawlability, indexability, topIssues (array), recommendations (array) }
      - githubUrl, liveUrl.

      Be extremely precise with the technology stack (e.g., identify specific UI libs like Radix, HeadlessUI if possible).
      Return ONLY the raw JSON object.
    `;

    const aiResult = await getAI().models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const aiText = aiResult.candidates[0].content.parts[0].text;
    const cleanJson = aiText.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);

    res.json({
      ...data,
      favicon: favicon ? (favicon.startsWith('http') ? favicon : new URL(favicon, formattedUrl).href) : null,
      themeColor
    });

  } catch (error: any) {
    console.error("Enterprise Analysis Failure:", error);
    res.status(500).json({ 
      error: error.name === 'AbortError' ? "Target site took too long to respond." : (error.message || "Deep analysis failed.") 
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise Intelligence Engine running on http://localhost:${PORT}`);
  });
}

// Only start the server if we're not being required as a module (e.g. for Vercel)
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  startServer();
}

export default app;
