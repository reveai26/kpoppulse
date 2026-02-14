import { createClient } from "@/lib/supabase/server";
import { IdolCard } from "@/components/idol-card";
import { GroupCard } from "@/components/group-card";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Users, Flame } from "lucide-react";
import { JsonLd, collectionPageJsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/constants";
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
        .order("popularity_score", { ascending: false })
        .limit(50),
      supabase
        .from("groups")
        .select("*")
        .order("popularity_score", { ascending: false }),
    ]);

  if (idolsError) console.error("Trending idols query error:", idolsError.message);
  if (groupsError) console.error("Trending groups query error:", groupsError.message);

  const idols = (allIdols ?? []) as (Idol & { group: Group })[];
  const groups = (allGroups ?? []) as Group[];

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
          {/* Buzzing Idols */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 font-bold text-lg">
              <Flame className="h-5 w-5 text-orange-500" />
              Buzzing Idols
            </h2>
            {idols.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No idol data yet</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {idols.map((idol) => (
                  <IdolCard key={idol.id} idol={idol} />
                ))}
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
