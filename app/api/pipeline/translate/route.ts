import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

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
  const translatedIds: string[] = [];
  const errors: string[] = [];

  for (const article of articles) {
    try {
      const prompt = `You are a K-pop news translator. Translate this Korean news headline into natural, engaging English. Then write a 1-2 sentence summary that provides context for international K-pop fans.

Korean headline: ${article.original_title}
${article.original_content ? `\nContext: ${article.original_content.substring(0, 500)}` : ""}

Important:
- Keep idol/group names in their official romanized form (e.g., 방탄소년단 = BTS, 블랙핑크 = BLACKPINK, 에스파 = aespa, 뉴진스 = NewJeans)
- Make the title concise and news-like
- The summary should explain what happened and why it matters to fans

Respond ONLY with valid JSON (no markdown, no explanation):
{"title": "English title here", "summary": "1-2 sentence summary here"}`;

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

      translations.push({
        article_id: article.id,
        language: "en",
        translated_title: result.title,
        translated_summary: result.summary,
        model_used: "llama-3.1-8b",
      });
      translatedIds.push(article.id);

      // Find matching idols and groups
      const titleText = `${article.original_title} ${result.title} ${result.summary}`.toLowerCase();

      for (const idol of idols ?? []) {
        const nameMatch =
          titleText.includes(idol.name.toLowerCase()) ||
          (idol.name_ko && titleText.includes(idol.name_ko));

        if (nameMatch) {
          idolTags.push({ article_id: article.id, idol_id: idol.id, confidence: 0.9 });
          if (idol.group_id) {
            groupTags.push({ article_id: article.id, group_id: idol.group_id, confidence: 0.9 });
          }
        }
      }

      for (const group of groups ?? []) {
        const nameMatch =
          titleText.includes(group.name.toLowerCase()) ||
          (group.name_ko && titleText.includes(group.name_ko));

        if (nameMatch) {
          groupTags.push({ article_id: article.id, group_id: group.id, confidence: 0.9 });
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

  // Batch mark articles as translated
  if (translatedIds.length > 0) {
    const { error: updateError } = await serviceClient
      .from("articles")
      .update({ is_translated: true, is_tagged: true })
      .in("id", translatedIds);
    if (updateError) {
      errors.push(`Articles update: ${updateError.message}`);
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
