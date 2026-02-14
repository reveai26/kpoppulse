import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Korean K-pop news search queries for Google News RSS
const KPOP_QUERIES = [
  "케이팝 아이돌 뉴스",
  "아이돌 컴백 앨범 발매",
  "걸그룹 보이그룹 활동",
  "K-pop 콘서트 차트 빌보드",
];

// Map Korean outlet names to our DB source names
const SOURCE_NAME_MAP: Record<string, string> = {
  "오센": "OSEN",
  "스포츠조선": "Sports Chosun",
  "스타뉴스": "Star News",
  "뉴스엔": "Newsen",
  "헤럴드팝": "Herald Pop",
  "엑스포츠뉴스": "Xportsnews",
  "MK스포츠": "MK Sports",
  "스포티비뉴스": "SPOTV News",
  "톱스타뉴스": "Top Star News",
  "텐아시아": "Tenasia",
  "디스패치": "Dispatch",
  "데일리팝": "Daily Pop",
  "아이돌이슈": "Idol Issue",
  "코리아헤럴드": "K-pop Herald",
};

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

type RssItem = {
  title: string;
  link: string;
  pubDate: string;
  sourceName: string;
  sourceUrl: string;
  description: string;
};

async function fetchRss(url: string): Promise<RssItem[]> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const items: RssItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const raw = match[1];

      const title =
        raw.match(/<title><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ??
        raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] ??
        "";

      // Google News RSS sometimes uses <link/> followed by URL on next line
      const link =
        raw.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ??
        raw.match(/<link\s*\/>\s*(https?:\/\/[^\s<]+)/)?.[1]?.trim() ??
        "";

      const pubDate = raw.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";

      const srcMatch = raw.match(/<source\s+url="([^"]*)"[^>]*>([\s\S]*?)<\/source>/);
      const sourceName = srcMatch?.[2]?.trim() ?? "";
      const sourceUrl = srcMatch?.[1]?.trim() ?? "";

      const desc =
        raw.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ??
        raw.match(/<description>([\s\S]*?)<\/description>/)?.[1] ??
        "";

      if (title && link) {
        items.push({
          title: decodeHtml(title.trim()),
          link,
          pubDate,
          sourceName: decodeHtml(sourceName),
          sourceUrl,
          description: stripHtml(decodeHtml(desc)).substring(0, 500),
        });
      }
    }

    return items;
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  // Load existing sources and build lookup map
  const { data: dbSources } = await serviceClient
    .from("sources")
    .select("id, name");

  const sourceByName = new Map<string, string>();
  for (const s of dbSources ?? []) {
    sourceByName.set(s.name.toLowerCase(), s.id);
  }

  // Add Korean alias lookups
  for (const [korean, english] of Object.entries(SOURCE_NAME_MAP)) {
    const id = sourceByName.get(english.toLowerCase());
    if (id) sourceByName.set(korean.toLowerCase(), id);
  }

  // Track dynamically created sources in this run
  const createdSources = new Map<string, string>();

  async function resolveSource(name: string, url: string): Promise<string> {
    if (!name) name = "Unknown";

    // Try existing (exact or alias match)
    const id = sourceByName.get(name.toLowerCase());
    if (id) return id;

    // Try partial match
    for (const [key, val] of sourceByName.entries()) {
      if (key.includes(name.toLowerCase()) || name.toLowerCase().includes(key)) {
        return val;
      }
    }

    // Check if created this run
    const created = createdSources.get(name);
    if (created) return created;

    // Create new source record
    const { data } = await serviceClient
      .from("sources")
      .insert({ name, url: url || "https://news.google.com", category: "news" })
      .select("id")
      .single();

    if (data) {
      createdSources.set(name, data.id);
      sourceByName.set(name.toLowerCase(), data.id);
      return data.id;
    }

    // Absolute fallback: first source in DB
    return dbSources?.[0]?.id ?? "";
  }

  let totalCollected = 0;
  const errors: string[] = [];
  const seenUrls = new Set<string>();

  for (const query of KPOP_QUERIES) {
    try {
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
      const articles = await fetchRss(rssUrl);

      for (const article of articles) {
        if (seenUrls.has(article.link)) continue;
        seenUrls.add(article.link);

        const sourceId = await resolveSource(article.sourceName, article.sourceUrl);

        let publishedAt: string;
        try {
          publishedAt = article.pubDate
            ? new Date(article.pubDate).toISOString()
            : new Date().toISOString();
        } catch {
          publishedAt = new Date().toISOString();
        }

        const { error } = await serviceClient.from("articles").upsert(
          {
            source_id: sourceId,
            original_url: article.link,
            original_title: article.title,
            original_content: article.description || null,
            published_at: publishedAt,
          },
          { onConflict: "original_url" }
        );

        if (!error) totalCollected++;
        else errors.push(`DB: ${error.message}`);
      }
    } catch (e: any) {
      errors.push(`Feed "${query}": ${e.message}`);
    }
  }

  return NextResponse.json({
    collected: totalCollected,
    newSources: createdSources.size,
    newSourceNames: [...createdSources.keys()],
    feedsChecked: KPOP_QUERIES.length,
    errors: errors.slice(0, 10),
    timestamp: new Date().toISOString(),
  });
}
