import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Names that are too short or common for simple substring matching
// These require word boundary matching to avoid false positives
const SHORT_AMBIGUOUS_NAMES = new Set([
  "v", "rm", "jin", "han", "jun", "dk", "the8", "i.n",
  "jay", "rei", "liz", "key", "do", "lay", "chen",
  "joy", "mark", "win", "ten", "leon",
]);

function matchName(
  name: string,
  nameKo: string | null,
  text: string,
): { confidence: number } | null {
  const nameLower = name.toLowerCase();

  // Korean name match — reliable, use directly (min 2 chars)
  if (nameKo && nameKo.length >= 2 && text.includes(nameKo)) {
    return { confidence: 0.95 };
  }

  // Skip single-character English names entirely (too ambiguous)
  if (nameLower.length <= 1) {
    return null;
  }

  // For short/ambiguous names, require word boundary matching
  if (nameLower.length <= 3 || SHORT_AMBIGUOUS_NAMES.has(nameLower)) {
    // Use word boundary regex for short names
    const escaped = nameLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text)) {
      return { confidence: 0.8 };
    }
    return null;
  }

  // For longer names (4+ chars), simple includes is reliable enough
  if (text.toLowerCase().includes(nameLower)) {
    return { confidence: 0.9 };
  }

  return null;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  // Get batch size from query param (default 5, max 15 to stay within limits)
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "5") || 5, 15);

  // Get untranslated articles
  const { data: articles } = await serviceClient
    .from("articles")
    .select("id, original_title, original_content")
    .eq("is_translated", false)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (!articles || articles.length === 0) {
    return NextResponse.json({ translated: 0, message: "No articles to translate" });
  }

  // Get all idols and groups for tagging
  const [{ data: idols }, { data: groups }] = await Promise.all([
    serviceClient.from("idols").select("id, name, name_ko, group_id"),
    serviceClient.from("groups").select("id, name, name_ko"),
  ]);

  // Get Cloudflare Workers AI binding
  const { env } = await getCloudflareContext({ async: true });
  const ai = (env as any).AI;

  const translations: any[] = [];
  const idolTags: any[] = [];
  const groupTags: any[] = [];
  const translatedIds: { id: string; topic: string }[] = [];
  const errors: string[] = [];

  for (const article of articles) {
    try {
      const prompt = `You are a K-pop news translator. Translate this Korean news headline into natural, engaging English. Then write a 1-2 sentence summary and classify the topic.

Korean headline: ${article.original_title}
${article.original_content ? `\nContext: ${article.original_content.substring(0, 500)}` : ""}

Important:
- Keep idol/group names in their official romanized form (e.g., 방탄소년단 = BTS, 블랙핑크 = BLACKPINK, 에스파 = aespa, 뉴진스 = NewJeans)
- Make the title concise and news-like
- The summary should explain what happened and why it matters to fans
- Classify the topic as one of: "music" (comebacks, releases, charts, music shows), "events" (concerts, fan meetings, awards, variety shows), or "buzz" (everything else: dating, social media, general news)

Respond ONLY with valid JSON (no markdown, no explanation):
{"title": "English title here", "summary": "1-2 sentence summary here", "topic": "music|events|buzz"}`;

      const aiResult = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.3,
      });

      // Workers AI returns { response: string }
      let responseText = "";
      if (typeof aiResult === "string") {
        responseText = aiResult;
      } else if (typeof aiResult?.response === "string") {
        responseText = aiResult.response;
      } else {
        responseText = JSON.stringify(aiResult);
      }

      if (!responseText || responseText === "{}") {
        errors.push(`Article ${article.id}: Empty AI response (type: ${typeof aiResult}, keys: ${Object.keys(aiResult || {}).join(",")})`);
        continue;
      }

      // Extract JSON from response (handle potential markdown wrapping)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        errors.push(`Article ${article.id}: No JSON found: ${responseText.substring(0, 150)}`);
        continue;
      }

      const result = JSON.parse(jsonMatch[0]);

      if (!result.title || !result.summary) {
        errors.push(`Article ${article.id}: Missing fields: ${JSON.stringify(result).substring(0, 150)}`);
        continue;
      }

      // Validate topic
      const validTopics = ["music", "events", "buzz"];
      const topic = validTopics.includes(result.topic) ? result.topic : "buzz";

      translations.push({
        article_id: article.id,
        language: "en",
        translated_title: result.title,
        translated_summary: result.summary,
        model_used: "llama-3.1-8b",
      });
      translatedIds.push({ id: article.id, topic });

      // Find matching idols and groups with improved accuracy
      const originalText = article.original_title + " " + (article.original_content ?? "");
      const translatedText = `${result.title} ${result.summary}`;
      const fullText = `${originalText} ${translatedText}`;

      for (const idol of idols ?? []) {
        const matched = matchName(idol.name, idol.name_ko, fullText);
        if (matched) {
          idolTags.push({ article_id: article.id, idol_id: idol.id, confidence: matched.confidence });
          if (idol.group_id) {
            groupTags.push({ article_id: article.id, group_id: idol.group_id, confidence: matched.confidence });
          }
        }
      }

      for (const group of groups ?? []) {
        const matched = matchName(group.name, group.name_ko, fullText);
        if (matched) {
          groupTags.push({ article_id: article.id, group_id: group.id, confidence: matched.confidence });
        }
      }
    } catch (e: any) {
      errors.push(`Article ${article.id}: ${e.message}`);
    }
  }

  // Batch upsert all translations
  if (translations.length > 0) {
    const { error: translationsError } = await serviceClient
      .from("translations")
      .upsert(translations, { onConflict: "article_id,language" });
    if (translationsError) {
      errors.push(`Translations upsert: ${translationsError.message}`);
    }
  }

  // Batch upsert idol tags (deduplicate)
  if (idolTags.length > 0) {
    const uniqueIdolTags = dedup(idolTags, (t: any) => `${t.article_id}-${t.idol_id}`);
    const { error: idolTagsError } = await serviceClient
      .from("article_idols")
      .upsert(uniqueIdolTags, { onConflict: "article_id,idol_id" });
    if (idolTagsError) {
      errors.push(`Idol tags upsert: ${idolTagsError.message}`);
    }
  }

  // Batch upsert group tags (deduplicate)
  if (groupTags.length > 0) {
    const uniqueGroupTags = dedup(groupTags, (t: any) => `${t.article_id}-${t.group_id}`);
    const { error: groupTagsError } = await serviceClient
      .from("article_groups")
      .upsert(uniqueGroupTags, { onConflict: "article_id,group_id" });
    if (groupTagsError) {
      errors.push(`Group tags upsert: ${groupTagsError.message}`);
    }
  }

  // Batch mark articles as translated + set topic per article
  if (translatedIds.length > 0) {
    // Group by topic for batch updates
    const byTopic = new Map<string, string[]>();
    for (const { id, topic } of translatedIds) {
      if (!byTopic.has(topic)) byTopic.set(topic, []);
      byTopic.get(topic)!.push(id);
    }
    for (const [topic, ids] of byTopic) {
      const { error: updateError } = await serviceClient
        .from("articles")
        .update({ is_translated: true, is_tagged: true, topic })
        .in("id", ids);
      if (updateError) {
        errors.push(`Articles update (${topic}): ${updateError.message}`);
      }
    }
  }

  return NextResponse.json({
    translated: translations.length,
    total: articles.length,
    errors: errors.slice(0, 10),
    timestamp: new Date().toISOString(),
  });
}

function dedup<T>(arr: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
