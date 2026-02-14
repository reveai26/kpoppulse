import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

const BASE_URL = "https://kpoppulse.aireve26.workers.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: groups }, { data: idols }] = await Promise.all([
    supabase.from("groups").select("slug, created_at"),
    supabase.from("idols").select("slug, created_at"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
    { url: `${BASE_URL}/trending`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/groups`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/idols`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  const groupRoutes: MetadataRoute.Sitemap = (groups ?? []).map((g) => ({
    url: `${BASE_URL}/group/${g.slug}`,
    lastModified: new Date(g.created_at),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const idolRoutes: MetadataRoute.Sitemap = (idols ?? []).map((i) => ({
    url: `${BASE_URL}/idol/${i.slug}`,
    lastModified: new Date(i.created_at),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...groupRoutes, ...idolRoutes];
}
