import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Newspaper } from "lucide-react";
import Link from "next/link";
import { SITE_URL } from "@/lib/constants";
import { JsonLd, breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/jsonld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly K-pop News Roundups",
  description: "Weekly news summaries for BTS, BLACKPINK, Stray Kids and top K-pop groups. Get caught up on everything that happened this week.",
  alternates: { canonical: "/weekly" },
  openGraph: {
    type: "website",
    title: "Weekly K-pop News Roundups — KpopPulse",
    description: "Weekly news summaries for BTS, BLACKPINK, Stray Kids and top K-pop groups.",
    url: "/weekly",
  },
};

export const revalidate = 3600;

export default async function WeeklyRoundupsPage() {
  const supabase = await createClient();

  const { data: roundups } = await supabase
    .from("weekly_roundups")
    .select(`
      id, week_start, week_end, title, summary, article_count, created_at,
      group:groups(id, name, name_ko, slug, photo_url)
    `)
    .order("week_start", { ascending: false })
    .limit(50);

  const items = (roundups ?? []) as any[];

  // Group by week
  const byWeek = new Map<string, any[]>();
  for (const r of items) {
    const week = r.week_start;
    if (!byWeek.has(week)) byWeek.set(week, []);
    byWeek.get(week)!.push(r);
  }

  const collectionItems = items.map((r: any) => ({
    name: r.title,
    url: `${SITE_URL}/weekly/${r.group?.slug}/${r.week_start}`,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", url: SITE_URL },
        { name: "Weekly Roundups", url: `${SITE_URL}/weekly` },
      ])} />
      <JsonLd data={collectionPageJsonLd(
        "Weekly K-pop News Roundups",
        "Weekly news summaries for top K-pop groups",
        `${SITE_URL}/weekly`,
        collectionItems,
      )} />

      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span>Weekly Roundups</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-primary" />
          Weekly K-pop News Roundups
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-generated weekly news summaries for top K-pop groups
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <h2 className="text-lg font-bold mb-2">No Roundups Yet</h2>
          <p className="text-sm text-muted-foreground">
            Weekly roundups will be generated every Monday. Check back soon!
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Array.from(byWeek.entries()).map(([weekStart, weekRoundups]) => {
            const weekEnd = weekRoundups[0]?.week_end;
            return (
              <div key={weekStart}>
                <h2 className="flex items-center gap-2 font-bold text-sm mb-3 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  Week of {formatDate(weekStart)} — {formatDate(weekEnd)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {weekRoundups.map((roundup: any) => (
                    <Link
                      key={roundup.id}
                      href={`/weekly/${roundup.group?.slug}/${roundup.week_start}`}
                    >
                      <Card className="p-4 hover:bg-accent/50 transition-colors h-full">
                        <div className="flex items-start gap-3">
                          {roundup.group?.photo_url && (
                            <img
                              src={roundup.group.photo_url}
                              alt={roundup.group.name}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm truncate">{roundup.group?.name}</span>
                              <Badge variant="outline" className="text-[10px] flex-shrink-0">
                                {roundup.article_count} articles
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {roundup.title}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
