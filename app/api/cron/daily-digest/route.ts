import { createServiceClient } from "@/lib/supabase/server";
import { sendDailyDigest } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured", skipped: true },
      { status: 200 },
    );
  }

  const serviceClient = createServiceClient();
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dateStr = format(now, "MMM d, yyyy");

  // Get active Pro/Premium subscribers
  const { data: subscribers } = await serviceClient
    .from("subscriptions")
    .select("user_id, plan")
    .in("plan", ["pro", "premium"])
    .eq("status", "active");

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ sent: 0, message: "No active subscribers" });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const sub of subscribers) {
    try {
      // Get user profile
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("email")
        .eq("id", sub.user_id)
        .single();

      if (!profile?.email) continue;

      // Get user's followed idols and groups
      const { data: follows } = await serviceClient
        .from("follows")
        .select("idol_id, group_id")
        .eq("user_id", sub.user_id);

      if (!follows || follows.length === 0) continue;

      const idolIds = follows
        .filter((f: { idol_id: string | null }) => f.idol_id)
        .map((f: { idol_id: string | null }) => f.idol_id!);
      const groupIds = follows
        .filter((f: { group_id: string | null }) => f.group_id)
        .map((f: { group_id: string | null }) => f.group_id!);

      const sections: { name: string; articles: { title: string; summary: string; url: string }[] }[] = [];

      // Fetch articles for followed idols
      if (idolIds.length > 0) {
        const { data: idolArticles } = await serviceClient
          .from("article_idols")
          .select(`
            idol:idols(name),
            article:articles!inner(
              id, published_at,
              translation:translations(translated_title, translated_summary)
            )
          `)
          .in("idol_id", idolIds)
          .gte("article.published_at", yesterday.toISOString());

        if (idolArticles) {
          const byIdol = new Map<string, { title: string; summary: string; url: string }[]>();
          for (const row of idolArticles) {
            const name = (row.idol as any)?.name ?? "Unknown";
            const article = row.article as any;
            const trans = Array.isArray(article?.translation)
              ? article.translation[0]
              : article?.translation;
            if (!trans) continue;

            if (!byIdol.has(name)) byIdol.set(name, []);
            byIdol.get(name)!.push({
              title: trans.translated_title,
              summary: trans.translated_summary ?? "",
              url: `https://kpoppulse.aireve26.workers.dev/article/${article.id}`,
            });
          }
          for (const [name, articles] of byIdol) {
            sections.push({ name, articles });
          }
        }
      }

      // Fetch articles for followed groups
      if (groupIds.length > 0) {
        const { data: groupArticles } = await serviceClient
          .from("article_groups")
          .select(`
            group:groups(name),
            article:articles!inner(
              id, published_at,
              translation:translations(translated_title, translated_summary)
            )
          `)
          .in("group_id", groupIds)
          .gte("article.published_at", yesterday.toISOString());

        if (groupArticles) {
          const byGroup = new Map<string, { title: string; summary: string; url: string }[]>();
          for (const row of groupArticles) {
            const name = (row.group as any)?.name ?? "Unknown";
            const article = row.article as any;
            const trans = Array.isArray(article?.translation)
              ? article.translation[0]
              : article?.translation;
            if (!trans) continue;

            if (!byGroup.has(name)) byGroup.set(name, []);
            byGroup.get(name)!.push({
              title: trans.translated_title,
              summary: trans.translated_summary ?? "",
              url: `https://kpoppulse.aireve26.workers.dev/article/${article.id}`,
            });
          }
          for (const [name, articles] of byGroup) {
            // Avoid duplicate sections if idol and group overlap
            if (!sections.find((s) => s.name === name)) {
              sections.push({ name, articles });
            }
          }
        }
      }

      if (sections.length === 0) continue;

      await sendDailyDigest(profile.email, sections, dateStr);
      sent++;
    } catch (e: any) {
      errors.push(`${sub.user_id}: ${e.message}`);
    }
  }

  return NextResponse.json({
    sent,
    total: subscribers.length,
    errors: errors.slice(0, 5),
    timestamp: now.toISOString(),
  });
}
