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
      // /login, /forgot-password, and /reset-password remain crawlable so bots read <meta name="robots" content="noindex" />.
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      // 2. AI Search Retrieval Crawlers (ChatGPT Search, Perplexity, Claude Search, Bing/Copilot, Apple)
      {
        userAgent: [
          "OAI-SearchBot",
          "PerplexityBot",
          "Claude-SearchBot",
          "Bingbot",
          "Applebot",
        ],
        allow: "/",
        disallow: privatePaths,
      },
      // 3. User-Triggered AI Browsing Fetchers
      {
        userAgent: [
          "ChatGPT-User",
          "Claude-User",
        ],
        allow: "/",
        disallow: privatePaths,
      },
      // 4. Foundation Model Bulk Training Crawlers
      {
        userAgent: [
          "GPTBot",
          "Google-Extended",
          "ClaudeBot",
          "CCBot",
          "Bytespider",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
