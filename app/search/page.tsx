import { createClient } from "@/lib/supabase/server";
import { IdolCard } from "@/components/idol-card";
import { GroupCard } from "@/components/group-card";
import { Search } from "lucide-react";
import type { Group, Idol } from "@/types";
import type { Metadata } from "next";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
    description: "Search K-pop idols, groups, and news on KpopPulse",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  if (!q) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <Search className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
        <h1 className="text-xl font-bold mb-2">Search KpopPulse</h1>
        <p className="text-sm text-muted-foreground">Search for your favorite idols, groups, or news</p>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: idols } = await supabase
    .from("idols")
    .select("*, group:groups(*)")
    .or(`name.ilike.%${q}%,name_ko.ilike.%${q}%,slug.ilike.%${q}%`)
    .order("popularity_score", { ascending: false })
    .limit(20);

  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .or(`name.ilike.%${q}%,name_ko.ilike.%${q}%,slug.ilike.%${q}%`)
    .order("popularity_score", { ascending: false })
    .limit(20);

  const totalResults = (idols?.length ?? 0) + (groups?.length ?? 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-1 text-xl font-bold">
        Search results for &ldquo;{q}&rdquo;
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">{totalResults} results found</p>

      {groups && groups.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 font-bold">Groups ({groups.length})</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {groups.map((group, i) => (
              <GroupCard key={group.id} group={group as Group} rank={i + 1} />
            ))}
          </div>
        </div>
      )}

      {idols && idols.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 font-bold">Idols ({idols.length})</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {idols.map((idol, i) => (
              <IdolCard key={idol.id} idol={idol as Idol & { group: Group }} rank={i + 1} />
            ))}
          </div>
        </div>
      )}

      {totalResults === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p>No results found for &ldquo;{q}&rdquo;</p>
          <p className="mt-1 text-sm">Try searching with English or Korean name</p>
        </div>
      )}
    </div>
  );
}
