import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Direct K-pop news RSS feeds (most reliable from Workers)
const DIRECT_RSS_FEEDS = [
  "https://www.soompi.com/feed",
  "https://feeds.feedburner.com/allkpop",
  "https://www.koreaboo.com/feed/",
];

// Google News RSS queries — rotate per cron run to stay under subrequest limits
// Each cron run picks a batch of 5 queries based on the current time
const ALL_GOOGLE_QUERIES = [
  "BTS 방탄소년단",
  "BLACKPINK 블랙핑크",
  "aespa 에스파",
  "NewJeans 뉴진스",
  "Stray Kids 스트레이키즈",
  "SEVENTEEN 세븐틴",
  "ENHYPEN 엔하이픈",
  "IVE 아이브",
  "LE SSERAFIM 르세라핌",
  "TWICE 트와이스",
  "NCT 127 NCT DREAM",
  "ATEEZ 에이티즈",
  "ITZY 있지 NMIXX",
  "(G)I-DLE 여자아이들",
  "Red Velvet 레드벨벳 EXO",
  "TREASURE 트레저 RIIZE",
  "BOYNEXTDOOR BABYMONSTER",
  "케이팝 컴백 앨범 발매",
  "K-pop 빌보드 차트 아이돌",
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
  "Soompi": "Soompi",
  "allkpop": "allkpop",
  "Koreaboo": "Koreaboo",
};

// K-pop related keywords for filtering non-relevant articles
const KPOP_KEYWORDS = [
  // Group names (English)
  "bts", "blackpink", "stray kids", "seventeen", "aespa", "newjeans",
  "enhypen", "txt", "twice", "ive", "le sserafim", "g)i-dle", "gidle",
  "nct", "ateez", "exo", "red velvet", "itzy", "nmixx", "dreamcatcher",
  "treasure", "monsta x", "shinee", "mamamoo", "kep1er", "boynextdoor",
  "tws", "illit", "babymonster", "riize", "zb1", "xikers", "got7",
  "kiss of life", "viviz", "fromis_9", "billlie",
  // Korean terms
  "아이돌", "컴백", "케이팝", "k-pop", "kpop", "걸그룹", "보이그룹",
  "음원", "차트", "빌보드", "뮤비", "팬미팅", "콘서트", "앨범",
  // Korean group names
  "방탄소년단", "블랙핑크", "스트레이키즈", "세븐틴", "에스파", "뉴진스",
  "엔하이픈", "투모로우바이투게더", "트와이스", "아이브", "르세라핌",
  "여자아이들", "에이티즈", "엑소", "레드벨벳", "있지", "트레저",
  "몬스타엑스", "샤이니", "마마무", "케플러", "보이넥스트도어",
  "베이비몬스터", "제로베이스원", "드림캐쳐",
];

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

function isKpopRelated(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return KPOP_KEYWORDS.some((kw) => text.includes(kw));
}

type RssItem = {
  title: string;
  link: string;
  pubDate: string;
  sourceName: string;
  sourceUrl: string;
  description: string;
};

async function fetchRss(url: string): Promise<{ items: RssItem[]; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KpopPulse/1.0; +https://kpoppulse.app)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      return { items: [], error: `HTTP ${res.status} from ${new URL(url).hostname}` };
    }
    const xml = await res.text();

    if (!xml.includes("<item>") && !xml.includes("<entry>")) {
      return { items: [], error: `No items in feed from ${new URL(url).hostname}` };
    }

    const items: RssItem[] = [];

    // Parse RSS <item> elements
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const raw = match[1];

      const title =
        raw.match(/<title><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ??
        raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] ??
        "";

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
          link: link.startsWith("http") ? link : "",
          pubDate,
          sourceName: decodeHtml(sourceName),
          sourceUrl,
          description: stripHtml(decodeHtml(desc)).substring(0, 500),
        });
      }
    }

    // Also parse Atom <entry> elements (for feeds like Soompi)
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    while ((match = entryRegex.exec(xml)) !== null) {
      const raw = match[1];
      const title =
        raw.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ??
        raw.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ??
        "";
      const link =
        raw.match(/<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1] ??
        raw.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.trim() ??
        "";
      const pubDate =
        raw.match(/<published>(.*?)<\/published>/)?.[1] ??
        raw.match(/<updated>(.*?)<\/updated>/)?.[1] ??
        "";
      const desc =
        raw.match(/<summary[^>]*><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ??
        raw.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1] ??
        raw.match(/<content[^>]*><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ??
        "";

      if (title && link) {
        items.push({
          title: decodeHtml(title.trim()),
          link,
          pubDate,
          sourceName: "",
          sourceUrl: "",
          description: stripHtml(decodeHtml(desc)).substring(0, 500),
        });
      }
    }

    return { items };
  } catch (e: any) {
    return { items: [], error: `Fetch error (${new URL(url).hostname}): ${e.message}` };
  }
}

function extractSourceFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    if (hostname.includes("soompi")) return "Soompi";
    if (hostname.includes("allkpop")) return "allkpop";
    if (hostname.includes("koreaboo")) return "Koreaboo";
    if (hostname.includes("naver")) return "Naver Entertainment";
    if (hostname.includes("chosun")) return "Sports Chosun";
    return hostname;
  } catch {
    return "Unknown";
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

  // Add alias lookups
  for (const [alias, english] of Object.entries(SOURCE_NAME_MAP)) {
    const id = sourceByName.get(english.toLowerCase());
    if (id) sourceByName.set(alias.toLowerCase(), id);
  }

  // Track sources needing creation
  const newSourcesNeeded: { name: string; url: string; category: string }[] = [];
  const fallbackSourceId = dbSources?.[0]?.id ?? "";

  function resolveSourceSync(name: string, url: string): string {
    if (!name) name = extractSourceFromUrl(url);

    const id = sourceByName.get(name.toLowerCase());
    if (id) return id;

    for (const [key, val] of sourceByName.entries()) {
      if (key.includes(name.toLowerCase()) || name.toLowerCase().includes(key)) {
        return val;
      }
    }

    // Queue for creation, use fallback for now
    if (!newSourcesNeeded.some((s) => s.name === name)) {
      newSourcesNeeded.push({ name, url: url || "https://news.google.com", category: "news" });
    }
    return fallbackSourceId;
  }

  const errors: string[] = [];
  const seenUrls = new Set<string>();
  const feedResults: { feed: string; count: number }[] = [];

  // Rotate Google News queries: pick 3 per cron run to minimize subrequests
  const batchIndex = Math.floor(Date.now() / (15 * 60 * 1000)) % Math.ceil(ALL_GOOGLE_QUERIES.length / 3);
  const googleBatch = ALL_GOOGLE_QUERIES.slice(batchIndex * 3, batchIndex * 3 + 3);

  // Collect all articles from all feeds first (minimize subrequests)
  type PendingArticle = {
    source_id: string;
    original_url: string;
    original_title: string;
    original_content: string | null;
    published_at: string;
  };
  const pendingArticles: PendingArticle[] = [];

  // 1) Direct RSS feeds
  for (const feedUrl of DIRECT_RSS_FEEDS) {
    const { items, error } = await fetchRss(feedUrl);
    if (error) {
      errors.push(error);
      continue;
    }

    let feedCount = 0;
    for (const article of items) {
      if (!article.link || seenUrls.has(article.link)) continue;
      seenUrls.add(article.link);

      const sourceName = article.sourceName || extractSourceFromUrl(article.link);
      const sourceId = resolveSourceSync(sourceName, article.sourceUrl || feedUrl);

      let publishedAt: string;
      try {
        publishedAt = article.pubDate
          ? new Date(article.pubDate).toISOString()
          : new Date().toISOString();
      } catch {
        publishedAt = new Date().toISOString();
      }

      pendingArticles.push({
        source_id: sourceId,
        original_url: article.link,
        original_title: article.title,
        original_content: article.description || null,
        published_at: publishedAt,
      });
      feedCount++;
    }
    feedResults.push({ feed: new URL(feedUrl).hostname, count: feedCount });
  }

  // 2) Google News RSS with rotating batch
  for (const query of googleBatch) {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
    const { items, error } = await fetchRss(rssUrl);
    if (error) {
      errors.push(error);
      continue;
    }

    let feedCount = 0;
    for (const article of items) {
      if (!article.link || seenUrls.has(article.link)) continue;
      seenUrls.add(article.link);

      const sourceName = article.sourceName || extractSourceFromUrl(article.link);
      const sourceId = resolveSourceSync(sourceName, article.sourceUrl || rssUrl);

      let publishedAt: string;
      try {
        publishedAt = article.pubDate
          ? new Date(article.pubDate).toISOString()
          : new Date().toISOString();
      } catch {
        publishedAt = new Date().toISOString();
      }

      pendingArticles.push({
        source_id: sourceId,
        original_url: article.link,
        original_title: article.title,
        original_content: article.description || null,
        published_at: publishedAt,
      });
      feedCount++;
    }
    if (feedCount > 0) {
      feedResults.push({ feed: `google:${query.substring(0, 20)}`, count: feedCount });
    }
  }

  // 3) Batch upsert all collected articles (1 DB call instead of N)
  let totalCollected = 0;
  if (pendingArticles.length > 0) {
    // Process in chunks of 50 to stay within Supabase limits
    for (let i = 0; i < pendingArticles.length; i += 50) {
      const chunk = pendingArticles.slice(i, i + 50);
      const { error: dbError, count } = await serviceClient
        .from("articles")
        .upsert(chunk, { onConflict: "original_url", count: "exact" });

      if (dbError) {
        errors.push(`DB batch: ${dbError.message}`);
      } else {
        totalCollected += count ?? chunk.length;
      }
    }
  }

  // 4) Create any new sources that weren't found
  if (newSourcesNeeded.length > 0) {
    const { error: srcError } = await serviceClient
      .from("sources")
      .upsert(newSourcesNeeded, { onConflict: "name" });
    if (srcError) errors.push(`Sources: ${srcError.message}`);
  }

  return NextResponse.json({
    collected: totalCollected,
    newSources: newSourcesNeeded.length,
    feedsChecked: DIRECT_RSS_FEEDS.length + googleBatch.length,
    feedResults: feedResults.slice(0, 20),
    errors: errors.slice(0, 15),
    timestamp: new Date().toISOString(),
  });
}
