import { createClient } from "@/lib/supabase/server";
import { IdolCard } from "@/components/idol-card";
import { GroupCard } from "@/components/group-card";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Users, Flame } from "lucide-react";
import { JsonLd, collectionPageJsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/constants";
import Link from "next/link";
import type { Group, Idol } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending in K-pop",
  description: "Discover who's trending in K-pop right now. See the hottest idols and groups making waves — BTS, BLACKPINK, aespa, NewJeans and more.",
  alternates: { canonical: "/trending" },
  openGraph: {
    title: "Trending in K-pop | KpopPulse",
    description: "Discover who's trending in K-pop right now. See the hottest idols and groups making waves.",
    url: "/trending",
  },
};

export const revalidate = 300;

export default async function TrendingPage() {
  const supabase = await createClient();

  const [{ data: allIdols, error: idolsError }, { data: allGroups, error: groupsError }] =
    await Promise.all([
      supabase
        .from("idols")
        .select("*, group:groups(*)")
        .order("popularity_score", { ascending: false }),
      supabase
        .from("groups")
        .select("*")
        .order("popularity_score", { ascending: false }),
    ]);

  if (idolsError) console.error("Trending idols query error:", idolsError.message);
  if (groupsError) console.error("Trending groups query error:", groupsError.message);

  const idols = (allIdols ?? []) as (Idol & { group: Group })[];
  const groups = (allGroups ?? []) as Group[];

  // Group idols by their group, sorted by group popularity
  const groupedIdols = new Map<string, { group: Group; members: (Idol & { group: Group })[] }>();
  const soloIdols: (Idol & { group: Group })[] = [];

  for (const idol of idols) {
    if (idol.group) {
      const key = idol.group.id;
      if (!groupedIdols.has(key)) {
        groupedIdols.set(key, { group: idol.group, members: [] });
      }
      groupedIdols.get(key)!.members.push(idol);
    } else {
      soloIdols.push(idol);
    }
  }

  // Sort groups by popularity score
  const sortedGroups = [...groupedIdols.values()].sort(
    (a, b) => b.group.popularity_score - a.group.popularity_score,
  );

  const allItems = [
    ...idols.map((idol) => ({ name: idol.name, url: `${SITE_URL}/idol/${idol.slug}` })),
    ...groups.map((group) => ({ name: group.name, url: `${SITE_URL}/group/${group.slug}` })),
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <JsonLd data={collectionPageJsonLd(
        "Trending in K-pop",
        "Discover who's trending in K-pop right now",
        `${SITE_URL}/trending`,
        allItems
      )} />
      <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold">
        <TrendingUp className="h-6 w-6 text-primary" />
        Trending in K-pop
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Discover who&apos;s making waves in the K-pop scene right now
      </p>

      {idols.length === 0 && groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Flame className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No trending data available yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Buzzing Idols — grouped by group */}
          <section>
            <h2 className="mb-6 flex items-center gap-2 font-bold text-lg">
              <Flame className="h-5 w-5 text-orange-500" />
              Buzzing Idols
            </h2>
            {sortedGroups.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No idol data yet</p>
            ) : (
              <div className="space-y-6">
                {sortedGroups.map(({ group, members }) => (
                  <div key={group.id} className="rounded-lg border bg-card/50 p-4">
                    <Link
                      href={`/group/${group.slug}`}
                      className="mb-3 flex items-center gap-3 group/header"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
                        {group.photo_url ? (
                          <img src={group.photo_url} alt={group.name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary">{group.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm group-hover/header:text-primary transition-colors">
                          {group.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {group.name_ko} · {group.agency.split(" (")[0]} · {members.length} members
                        </p>
                      </div>
                    </Link>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {members.map((idol) => (
                        <IdolCard key={idol.id} idol={idol} showGroup={false} />
                      ))}
                    </div>
                  </div>
                ))}

                {soloIdols.length > 0 && (
                  <div className="rounded-lg border bg-card/50 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted ring-2 ring-muted-foreground/20">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Solo Artists</p>
                        <p className="text-xs text-muted-foreground">{soloIdols.length} artists</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {soloIdols.map((idol) => (
                        <IdolCard key={idol.id} idol={idol} showGroup={false} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <Separator />

          {/* Hot Groups */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 font-bold text-lg">
              <Users className="h-5 w-5 text-primary" />
              Hot Groups
            </h2>
            {groups.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No group data yet</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
