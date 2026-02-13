import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Korean entertainment news RSS feeds
const RSS_SOURCES = [
  {
    name: "Naver Entertainment",
    rssUrl: "https://rss.blog.naver.com/PostKeywordRss.naver?encodingType=utf8&keyword=%EC%95%84%EC%9D%B4%EB%8F%8C",
  },
];

// Simple RSS parser (no external dependency)
async function fetchRssArticles(rssUrl: string): Promise<{ title: string; link: string; pubDate: string }[]> {
  try {
    const res = await fetch(rssUrl, {
      headers: { "User-Agent": "KpopPulse/1.0 (news aggregator)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const items: { title: string; link: string; pubDate: string }[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1]
        || item.match(/<title>(.*?)<\/title>/)?.[1]
        || "";
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || new Date().toISOString();
      if (title && link) {
        items.push({ title: title.trim(), link: link.trim(), pubDate });
      }
    }
    return items;
  } catch {
    return [];
  }
}

// Scrape Korean entertainment news from web (backup when RSS unavailable)
async function scrapeNaverEntertainment(): Promise<{ title: string; link: string; pubDate: string }[]> {
  try {
    const res = await fetch("https://entertain.naver.com/ranking", {
      headers: { "User-Agent": "KpopPulse/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const html = await res.text();

    const articles: { title: string; link: string; pubDate: string }[] = [];
    // Extract article links and titles from ranking page
    const linkRegex = /href="(https:\/\/entertain\.naver\.com\/read\?oid=\d+&aid=\d+)"[^>]*>([^<]+)/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      articles.push({
        link: match[1],
        title: match[2].trim(),
        pubDate: new Date().toISOString(),
      });
    }
    return articles.slice(0, 30);
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  // Simple auth check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  // Get active sources
  const { data: sources } = await serviceClient
    .from("sources")
    .select("*")
    .eq("is_active", true);

  let totalCollected = 0;
  const errors: string[] = [];

  // Try Naver scraping as primary source
  const naverArticles = await scrapeNaverEntertainment();
  if (naverArticles.length > 0) {
    const naverSource = sources?.find((s: any) => s.name === "Naver Entertainment");
    if (naverSource) {
      for (const article of naverArticles) {
        const { error } = await serviceClient
          .from("articles")
          .upsert(
            {
              source_id: naverSource.id,
              original_url: article.link,
              original_title: article.title,
              published_at: article.pubDate,
            },
            { onConflict: "original_url" }
          );
        if (!error) totalCollected++;
      }
    }
  }

  // Try RSS feeds
  for (const source of sources ?? []) {
    if (!source.rss_url) continue;
    try {
      const articles = await fetchRssArticles(source.rss_url);
      for (const article of articles) {
        const { error } = await serviceClient
          .from("articles")
          .upsert(
            {
              source_id: source.id,
              original_url: article.link,
              original_title: article.title,
              published_at: new Date(article.pubDate).toISOString(),
            },
            { onConflict: "original_url" }
          );
        if (!error) totalCollected++;
      }
    } catch (e: any) {
      errors.push(`${source.name}: ${e.message}`);
    }
  }

  return NextResponse.json({
    collected: totalCollected,
    sources: sources?.length ?? 0,
    errors,
    timestamp: new Date().toISOString(),
  });
}
