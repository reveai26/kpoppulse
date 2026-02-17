import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SITE_URL } from "@/lib/constants";

// Target groups: BTS, BLACKPINK, Stray Kids + top 10 by popularity
const PRIORITY_GROUP_SLUGS = ["bts", "blackpink", "stray-kids"];
const MAX_GROUPS = 13; // 3 priority + top 10

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();
  const errors: string[] = [];

  // Calculate week range (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon...
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setUTCDate(now.getUTCDate() - mondayOffset - 7); // Last Monday
  weekStart.setUTCHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6); // Last Sunday
  weekEnd.setUTCHours(23, 59, 59, 999);

  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  // Get target groups (priority + top by popularity)
  const [{ data: priorityGroups }, { data: topGroups }] = await Promise.all([
    serviceClient
      .from("groups")
      .select("id, name, name_ko, slug")
      .in("slug", PRIORITY_GROUP_SLUGS),
    serviceClient
      .from("groups")
      .select("id, name, name_ko, slug")
      .not("slug", "in", `(${PRIORITY_GROUP_SLUGS.join(",")})`)
      .order("popularity_score", { ascending: false })
      .limit(MAX_GROUPS - PRIORITY_GROUP_SLUGS.length),
  ]);

  const groups = [...(priorityGroups ?? []), ...(topGroups ?? [])];

  if (groups.length === 0) {
    return NextResponse.json({ error: "No groups found" }, { status: 500 });
  }

  // Check which groups already have roundups for this week
  const { data: existing } = await serviceClient
    .from("weekly_roundups")
    .select("group_id")
    .eq("week_start", weekStartStr);

  const existingGroupIds = new Set((existing ?? []).map((r: any) => r.group_id));
  const pendingGroups = groups.filter((g) => !existingGroupIds.has(g.id));

  if (pendingGroups.length === 0) {
    return NextResponse.json({
      message: "All roundups already generated",
      week: weekStartStr,
      groups: groups.length,
    });
  }

  // Get Workers AI binding
  let ai: any;
  try {
    const { env } = await getCloudflareContext({ async: true });
    ai = (env as any).AI;
  } catch (e: any) {
    errors.push(`Workers AI init: ${e.message}`);
    return NextResponse.json({ error: "AI unavailable", errors }, { status: 500 });
  }

  let generated = 0;

  for (const group of pendingGroups) {
    try {
      // Get articles for this group from the past week
      const { data: articleLinks } = await serviceClient
        .from("article_groups")
        .select("article_id")
        .eq("group_id", group.id);

      if (!articleLinks || articleLinks.length === 0) continue;

      const articleIds = articleLinks.map((a: any) => a.article_id);

      const { data: articles } = await serviceClient
        .from("articles")
        .select(`
          id, original_title, thumbnail_url, published_at,
          translations!inner(translated_title, translated_summary, language)
        `)
        .in("id", articleIds)
        .eq("translations.language", "en")
        .gte("published_at", weekStart.toISOString())
        .lte("published_at", weekEnd.toISOString())
        .order("published_at", { ascending: false });

      if (!articles || articles.length === 0) continue;

      // Build article summaries for AI prompt
      const articleSummaries = articles.slice(0, 20).map((a: any) => {
        const t = a.translations?.[0];
        return `- ${t?.translated_title || a.original_title}: ${t?.translated_summary || ""}`;
      }).join("\n");

      const prompt = `You are a K-pop news editor for KpopPulse. Write a weekly news roundup for ${group.name} (${group.name_ko}) covering the week of ${weekStartStr} to ${weekEndStr}.

Here are the news articles from this week:
${articleSummaries}

Write a comprehensive weekly roundup. Respond ONLY with valid JSON (no markdown):
{
  "title": "A catchy, SEO-friendly title like '${group.name} Weekly Roundup: [key theme] (${weekStartStr})'",
  "summary": "A 3-5 paragraph engaging summary covering the key events, releases, and news for ${group.name} fans this week. Make it informative and exciting for fans. Include specific details from the articles.",
  "highlights": ["highlight 1", "highlight 2", "highlight 3", "highlight 4", "highlight 5"]
}`;

      const aiResult = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.5,
      });

      let responseText = "";
      if (typeof aiResult === "string") {
        responseText = aiResult;
      } else if (typeof aiResult?.response === "string") {
        responseText = aiResult.response;
      } else {
        responseText = JSON.stringify(aiResult);
      }

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        errors.push(`${group.name}: No JSON in AI response`);
        continue;
      }

      const result = JSON.parse(jsonMatch[0]);
      if (!result.title || !result.summary) {
        errors.push(`${group.name}: Missing title or summary`);
        continue;
      }

      // Upsert the roundup
      const { error: upsertError } = await serviceClient
        .from("weekly_roundups")
        .upsert({
          group_id: group.id,
          week_start: weekStartStr,
          week_end: weekEndStr,
          title: result.title,
          summary: result.summary,
          highlights: result.highlights || [],
          article_count: articles.length,
          article_ids: articles.map((a: any) => a.id),
        }, { onConflict: "group_id,week_start" });

      if (upsertError) {
        errors.push(`${group.name} upsert: ${upsertError.message}`);
        continue;
      }

      generated++;
    } catch (e: any) {
      errors.push(`${group.name}: ${e.message}`);
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    generated,
    total: pendingGroups.length,
    week: weekStartStr,
    errors: errors.slice(0, 10),
    timestamp: new Date().toISOString(),
  });
}
