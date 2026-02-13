import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();
  const openai = getOpenAI();

  // Get untranslated articles (batch of 10)
  const { data: articles } = await serviceClient
    .from("articles")
    .select("id, original_title, original_content")
    .eq("is_translated", false)
    .order("published_at", { ascending: false })
    .limit(10);

  if (!articles || articles.length === 0) {
    return NextResponse.json({ translated: 0, message: "No articles to translate" });
  }

  let translated = 0;
  const errors: string[] = [];

  // Get all idols and groups for tagging
  const { data: idols } = await serviceClient
    .from("idols")
    .select("id, name, name_ko, group_id");
  const { data: groups } = await serviceClient
    .from("groups")
    .select("id, name, name_ko");

  for (const article of articles) {
    try {
      // Translate title + generate summary
      const prompt = `You are a K-pop news translator. Translate this Korean article title to English. Also write a 1-2 sentence summary in English based on the title.

Korean title: ${article.original_title}
${article.original_content ? `\nKorean content preview: ${article.original_content.substring(0, 500)}` : ""}

Respond in this exact JSON format:
{"title": "English translated title", "summary": "1-2 sentence English summary"}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 300,
        temperature: 0.3,
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");

      if (result.title && result.summary) {
        // Save translation
        await serviceClient.from("translations").upsert(
          {
            article_id: article.id,
            language: "en",
            translated_title: result.title,
            translated_summary: result.summary,
            model_used: "gpt-4o-mini",
          },
          { onConflict: "article_id,language" }
        );

        // Tag idols and groups mentioned in the title
        const titleText = `${article.original_title} ${result.title}`.toLowerCase();

        for (const idol of idols ?? []) {
          if (
            titleText.includes(idol.name.toLowerCase()) ||
            titleText.includes(idol.name_ko)
          ) {
            await serviceClient
              .from("article_idols")
              .upsert(
                { article_id: article.id, idol_id: idol.id, confidence: 0.9 },
                { onConflict: "article_id,idol_id" }
              );

            // Also tag the group if idol belongs to one
            if (idol.group_id) {
              await serviceClient
                .from("article_groups")
                .upsert(
                  { article_id: article.id, group_id: idol.group_id, confidence: 0.9 },
                  { onConflict: "article_id,group_id" }
                );
            }
          }
        }

        for (const group of groups ?? []) {
          if (
            titleText.includes(group.name.toLowerCase()) ||
            titleText.includes(group.name_ko)
          ) {
            await serviceClient
              .from("article_groups")
              .upsert(
                { article_id: article.id, group_id: group.id, confidence: 0.9 },
                { onConflict: "article_id,group_id" }
              );
          }
        }

        // Mark as translated + tagged
        await serviceClient
          .from("articles")
          .update({ is_translated: true, is_tagged: true })
          .eq("id", article.id);

        translated++;
      }
    } catch (e: any) {
      errors.push(`Article ${article.id}: ${e.message}`);
    }
  }

  return NextResponse.json({
    translated,
    total: articles.length,
    errors,
    timestamp: new Date().toISOString(),
  });
}
