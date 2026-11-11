import type { MetadataRoute } from "next";

/**
 * Generates the public robots.txt file for search engine crawlers.
 * Conforms to cybersecurity best practices: does not leak sensitive internal routes (e.g. /admin)
 * in the public disallow list; instead, private pages declare their own 'noindex' meta tags.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mareona.es";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
