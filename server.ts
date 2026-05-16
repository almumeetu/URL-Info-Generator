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
    const response = await fetch(formattedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (LinkScout/1.0; AI Analysis)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Basic Extracting
    const title = $("title").text() || $("meta[property='og:title']").attr("content") || "";
    const description = $("meta[name='description']").attr("content") || $("meta[property='og:description']").attr("content") || "";
    const favicon = $("link[rel='shortcut icon']").attr("href") || $("link[rel='icon']").attr("href") || "";
    
    // Get a bit of the body text to help Gemini identify tech stack/content
    const bodyExcerpt = $("body").text().replace(/\s+/g, ' ').substring(0, 2000);

    const prompt = `
      Analyze the following website metadata and content to provide structured information.
      URL: ${formattedUrl}
      Title: ${title}
      Description: ${description}
      Body Excerpt: ${bodyExcerpt}

      Respond with a JSON object specifically containing these fields:
      - title: The most accurate title.
      - description: A concise description of what the project/site does.
      - category: The category (e.g., E-commerce, SaaS, Portfolio, Blog, etc.).
      - techStack: A comma-separated list of identified technologies (e.g., React, Next.js, Tailwind, etc.).
      - githubUrl: If found in the content, provide the GitHub URL. If not, null.
      - liveUrl: The provided URL.

      Only return the JSON object, nothing else.
    `;

    const result = await getAI().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = result.text;
    // Clean JSON from potential markdown blocks
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);

    res.json({
      ...data,
      favicon: favicon ? (favicon.startsWith('http') ? favicon : new URL(favicon, formattedUrl).href) : null
    });

  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze website" });
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
