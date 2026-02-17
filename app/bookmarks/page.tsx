import { createClient } from "@/lib/supabase/server";
import { ArticleCard } from "@/components/article-card";
import { Bookmark, Sparkles } from "lucide-react";
import type { ArticleWithDetails } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Your saved K-pop articles",
};

export default async function BookmarksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: bookmarkRows } = await supabase
    .from("bookmarks")
    .select("article_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const articleIds = (bookmarkRows ?? []).map((b) => b.article_id);

  let articles: ArticleWithDetails[] = [];

  if (articleIds.length > 0) {
    const { data: rawArticles } = await supabase
      .from("articles")
      .select(`
        *,
        source:sources(*),
        translations!inner(translated_title, translated_summary, language),
        article_idols(idol:idols(*, group:groups(*))),
        article_groups(group:groups(*))
      `)
      .in("id", articleIds)
      .eq("translations.language", "en");

    // Preserve bookmark order
    const articleMap = new Map<string, any>();
    (rawArticles ?? []).forEach((a: any) => articleMap.set(a.id, a));

    articles = articleIds
      .map((id) => articleMap.get(id))
      .filter(Boolean)
      .map((a: any) => ({
        ...a,
        source: a.source,
        translation: a.translations?.[0] ?? { translated_title: a.original_title, translated_summary: "" },
        mentioned_idols: (a.article_idols ?? []).map((ai: any) => ai.idol).filter(Boolean),
        mentioned_groups: (a.article_groups ?? []).map((ag: any) => ag.group).filter(Boolean),
      }));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">Bookmarks</h1>
        <span className="text-sm text-muted-foreground">({articles.length})</span>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-primary/20 p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-primary/40 mb-4" />
          <h2 className="text-lg font-bold mb-2">No Bookmarks Yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Save articles you want to read later by clicking the bookmark icon on any article.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
