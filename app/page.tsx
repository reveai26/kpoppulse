import { createClient } from "@/lib/supabase/server";
import { IdolCard } from "@/components/idol-card";
import { GroupCard } from "@/components/group-card";
import { ArticleCard } from "@/components/article-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Newspaper, Users, Flame, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Group, Idol, ArticleWithDetails } from "@/types";

export const revalidate = 300;

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: topIdols, error: idolsError },
    { data: topGroups, error: groupsError },
    { data: rawArticles, error: articlesError },
  ] = await Promise.all([
    supabase
      .from("idols")
      .select("*, group:groups(*)")
      .order("popularity_score", { ascending: false })
      .limit(20),
    supabase
      .from("groups")
      .select("*")
      .order("popularity_score", { ascending: false })
      .limit(15),
    supabase
      .from("articles")
      .select(`
        *,
        source:sources(*),
        translations!inner(translated_title, translated_summary, language),
        article_idols(idol:idols(*, group:groups(*))),
        article_groups(group:groups(*))
      `)
      .eq("is_translated", true)
      .eq("translations.language", "en")
      .order("published_at", { ascending: false })
      .limit(30),
  ]);

  if (idolsError) console.error("Home idols query error:", idolsError.message);
  if (groupsError) console.error("Home groups query error:", groupsError.message);
  if (articlesError) console.error("Home articles query error:", articlesError.message);

  const idols = (topIdols ?? []) as (Idol & { group: Group })[];
  const groups = (topGroups ?? []) as Group[];

  const articles: ArticleWithDetails[] = (rawArticles ?? []).map((a: any) => ({
    ...a,
    source: a.source,
    translation: a.translations?.[0] ?? { translated_title: a.original_title, translated_summary: "" },
    mentioned_idols: (a.article_idols ?? []).map((ai: any) => ai.idol).filter(Boolean),
    mentioned_groups: (a.article_groups ?? []).map((ag: any) => ag.group).filter(Boolean),
  }));

  const hasArticles = articles.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_260px]">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <h2 className="font-bold text-sm">Trending Idols</h2>
              <Link href="/trending" className="ml-auto text-xs text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-2">
              {idols.slice(0, 10).map((idol) => (
                <IdolCard key={idol.id} idol={idol} />
              ))}
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm">Popular Groups</h2>
              <Link href="/groups" className="ml-auto text-xs text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-2">
              {groups.slice(0, 5).map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER — News Feed */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">Latest K-pop News</h1>
            <Badge variant="secondary" className="ml-2 text-xs">AI Translated</Badge>
          </div>

          <div className="space-y-6">
            {hasArticles ? (
              <div className="space-y-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-primary/20 p-8 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-primary/40 mb-3" />
                <h2 className="text-lg font-bold mb-2">News Pipeline Starting Soon</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Our AI is preparing to translate Korean K-pop news in real-time.
                  Meanwhile, explore your favorite idols and groups below!
                </p>
              </div>
            )}

            {/* Mobile: Trending Idols — horizontal scroll */}
            <div className="lg:hidden">
              <h2 className="flex items-center gap-2 font-bold text-sm mb-3">
                <Flame className="h-4 w-4 text-orange-500" />
                Trending Idols
                <Link href="/trending" className="ml-auto text-xs text-primary hover:underline font-normal">
                  View All
                </Link>
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
                {idols.slice(0, 12).map((idol) => (
                  <div key={idol.id} className="min-w-[220px] snap-start">
                    <IdolCard idol={idol} />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: Browse Groups — horizontal scroll */}
            <div className="lg:hidden">
              <h2 className="flex items-center gap-2 font-bold text-sm mb-3">
                <Users className="h-4 w-4 text-primary" />
                Browse Groups
                <Link href="/groups" className="ml-auto text-xs text-primary hover:underline font-normal">
                  View All
                </Link>
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
                {groups.map((group) => (
                  <div key={group.id} className="min-w-[220px] snap-start">
                    <GroupCard group={group} />
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: Featured Idols grid (below feed) */}
            <div className="hidden lg:block">
              <h2 className="flex items-center gap-2 font-bold mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                Featured Idols
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {idols.slice(10, 20).map((idol) => (
                  <IdolCard key={idol.id} idol={idol} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm">Trending Now</h2>
            </div>

            <div className="rounded-lg border p-3 space-y-3">
              {groups.slice(0, 8).map((group) => (
                <Link
                  key={group.id}
                  href={`/group/${group.slug}`}
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <span className="font-medium truncate">{group.name}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">{group.name_ko}</span>
                </Link>
              ))}
            </div>

            <Separator />

            <div className="rounded-lg border p-3">
              <h3 className="font-semibold text-xs mb-2 text-muted-foreground uppercase tracking-wider">
                Agencies
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {[...new Set(groups.map((g) => g.agency.split(" (")[0]))].map((agency) => (
                  <Badge
                    key={agency}
                    variant="outline"
                    className="text-[10px]"
                  >
                    {agency}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
