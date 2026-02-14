import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export async function GET() {
  const supabase = await createClient();

  const [
    { count: totalArticles },
    { count: translatedArticles },
    { count: totalSources },
    { data: recentArticles },
  ] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("is_translated", true),
    supabase.from("sources").select("*", { count: "exact", head: true }),
    supabase
      .from("articles")
      .select("original_title, published_at, is_translated")
      .order("collected_at", { ascending: false })
      .limit(5),
  ]);

  return NextResponse.json({
    totalArticles: totalArticles ?? 0,
    translatedArticles: translatedArticles ?? 0,
    untranslatedArticles: (totalArticles ?? 0) - (translatedArticles ?? 0),
    totalSources: totalSources ?? 0,
    recentArticles: recentArticles ?? [],
  });
}
