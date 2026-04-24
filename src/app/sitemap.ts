import type { MetadataRoute } from "next";
import { ARTICLES, CATEGORIES, MENTORS, MODULES } from "../lib/content";
import { getCourseSlugs } from "../lib/cms";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://asksenopati.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const cmsSlugs = await getCourseSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/home`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/tentang`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/modul`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/referral`, lastModified: now, changeFrequency: "monthly", priority: 0.6 }
  ];

  const moduleRoutes: MetadataRoute.Sitemap = MODULES.map((m) => ({
    url: `${siteUrl}/modul/${m.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75
  }));

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${siteUrl}/kategori/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7
  }));

  const mentorRoutes: MetadataRoute.Sitemap = MENTORS.map((m) => ({
    url: `${siteUrl}/mentor/${m.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6
  }));

  const articleRoutes: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${siteUrl}/blog/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "monthly",
    priority: 0.65
  }));

  const courseLegacyRoutes: MetadataRoute.Sitemap = cmsSlugs.map((slug: string) => ({
    url: `${siteUrl}/courses/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5
  }));

  return [
    ...staticRoutes,
    ...moduleRoutes,
    ...categoryRoutes,
    ...mentorRoutes,
    ...articleRoutes,
    ...courseLegacyRoutes
  ];
}
