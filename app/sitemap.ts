import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/constants";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: groups }, { data: idols }, { data: articles }] = await Promise.all([
    supabase.from("groups").select("slug, created_at"),
    supabase.from("idols").select("slug, created_at"),
    supabase
      .from("articles")
      .select("id, published_at")
      .eq("is_translated", true)
      .order("published_at", { ascending: false })
      .limit(1000),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
    { url: `${SITE_URL}/trending`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/groups`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/idols`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  ];

  const groupRoutes: MetadataRoute.Sitemap = (groups ?? []).map((g) => ({
    url: `${SITE_URL}/group/${g.slug}`,
    lastModified: new Date(g.created_at),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const idolRoutes: MetadataRoute.Sitemap = (idols ?? []).map((i) => ({
    url: `${SITE_URL}/idol/${i.slug}`,
    lastModified: new Date(i.created_at),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${SITE_URL}/article/${a.id}`,
    lastModified: new Date(a.published_at),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...groupRoutes, ...idolRoutes, ...articleRoutes];
}
