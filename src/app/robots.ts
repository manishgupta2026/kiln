import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://digigrantha.com";

  // Internal and authenticated paths protected from crawling
  const privatePaths = [
    "/admin/",
    "/admin/*",
    "/dashboard/",
    "/dashboard/*",
    "/dev/",
    "/dev/*",
    "/api/",
    "/api/*",
    "/invoice/",
    "/invoice/*",
    "/quote/",
    "/quote/*",
    "/onboard/",
    "/onboard/*",
  ];

  return {
    rules: [
      // 1. General search crawlers (Google, Bing, Yahoo, DuckDuckGo)
      // Note: We leave /login, /forgot-password, and /reset-password crawlable so bots can read their <meta name="robots" content="noindex" /> tags.
      {
        userAgent: "*",
        allow: ["/", "/work", "/about", "/career", "/photos/*", "/llms.txt", "/llms-full.txt"],
        disallow: privatePaths,
      },
      // 2. AI Search Retrieval Crawlers (controls inclusion in real-time conversational search & citations)
      {
        userAgent: [
          "OAI-SearchBot",     // OpenAI real-time Search (ChatGPT Search / SearchGPT)
          "PerplexityBot",     // Perplexity AI search retrieval
          "Bingbot",           // Microsoft Bing & Copilot Search
          "Applebot",          // Apple Search & Siri Suggestions
        ],
        allow: ["/", "/work", "/about", "/career", "/photos/*", "/llms.txt", "/llms-full.txt"],
        disallow: privatePaths,
      },
      // 3. User-Triggered Browsing Fetchers
      {
        userAgent: [
          "ChatGPT-User",      // Initiated directly by an active ChatGPT user prompt to view a URL
        ],
        allow: ["/", "/work", "/about", "/career", "/photos/*", "/llms.txt", "/llms-full.txt"],
        disallow: privatePaths,
      },
      // 4. Foundation Model Training Crawlers (disallowed to prevent uncredited model pre-training)
      // These do not control real-time search discovery; blocking them preserves code/content ownership.
      {
        userAgent: [
          "GPTBot",            // OpenAI general model training crawler
          "Google-Extended",   // Google Gemini/Vertex AI training crawler (does NOT affect Google Search or AI Overviews)
          "ClaudeBot",         // Anthropic training crawler
          "CCBot",             // Common Crawl web archive/training crawler
          "Bytespider",        // ByteDance crawler
        ],
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
