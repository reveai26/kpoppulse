import { createClient } from "@/lib/supabase/server";
import { ArticleCard } from "@/components/article-card";
import { Button } from "@/components/ui/button";
import { Rss, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ArticleWithDetails, Idol, Group } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Feed",
  description: "Personalized K-pop news from your followed idols and groups",
};

export default async function MyFeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Get user's follows
  const { data: follows } = await supabase
    .from("follows")
    .select("idol_id, group_id")
    .eq("user_id", user.id);

  const followedIdolIds = (follows ?? []).filter((f) => f.idol_id).map((f) => f.idol_id!);
  const followedGroupIds = (follows ?? []).filter((f) => f.group_id).map((f) => f.group_id!);

  const hasFollows = followedIdolIds.length > 0 || followedGroupIds.length > 0;

  let articles: ArticleWithDetails[] = [];

  if (hasFollows) {
    // Get articles mentioning followed idols
    const idolArticleIds: string[] = [];
    const groupArticleIds: string[] = [];

    if (followedIdolIds.length > 0) {
      const { data: idolArticles } = await supabase
        .from("article_idols")
        .select("article_id")
        .in("idol_id", followedIdolIds);
      idolArticleIds.push(...(idolArticles ?? []).map((a) => a.article_id));
    }

    if (followedGroupIds.length > 0) {
      const { data: groupArticles } = await supabase
        .from("article_groups")
        .select("article_id")
        .in("group_id", followedGroupIds);
      groupArticleIds.push(...(groupArticles ?? []).map((a) => a.article_id));
    }

    const allArticleIds = [...new Set([...idolArticleIds, ...groupArticleIds])];

    if (allArticleIds.length > 0) {
      const { data: rawArticles } = await supabase
        .from("articles")
        .select(`
          *,
          source:sources(*),
          translations!inner(translated_title, translated_summary, language),
          article_idols(idol:idols(*, group:groups(*))),
          article_groups(group:groups(*))
        `)
        .in("id", allArticleIds)
        .eq("is_translated", true)
        .eq("translations.language", "en")
        .order("published_at", { ascending: false })
        .limit(50);

      articles = (rawArticles ?? []).map((a: any) => ({
        ...a,
        source: a.source,
        translation: a.translations?.[0] ?? { translated_title: a.original_title, translated_summary: "" },
        mentioned_idols: (a.article_idols ?? []).map((ai: any) => ai.idol).filter(Boolean),
        mentioned_groups: (a.article_groups ?? []).map((ag: any) => ag.group).filter(Boolean),
      }));
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Rss className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">My Feed</h1>
        <span className="text-sm text-muted-foreground">
          ({followedIdolIds.length + followedGroupIds.length} following)
        </span>
      </div>

      {!hasFollows ? (
        <div className="rounded-xl border-2 border-dashed border-primary/20 p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-primary/40 mb-4" />
          <h2 className="text-lg font-bold mb-2">No Follows Yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Follow your favorite idols and groups to see their news here.
            Your personalized feed will update automatically!
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/idols">
              <Button>Browse Idols</Button>
            </Link>
            <Link href="/groups">
              <Button variant="outline">Browse Groups</Button>
            </Link>
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-primary/20 p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-primary/40 mb-4" />
          <h2 className="text-lg font-bold mb-2">No News Yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We haven&apos;t found any translated news for your followed artists yet.
            Check back soon — our AI translates new articles every 15 minutes!
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
