import { createClient } from "@/lib/supabase/server";
import { IdolCard } from "@/components/idol-card";
import { GroupCard } from "@/components/group-card";
import { Separator } from "@/components/ui/separator";
import { Crown, Users } from "lucide-react";
import type { Group, Idol } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rankings",
  description: "K-pop idol and group popularity rankings on KpopPulse",
};

export const revalidate = 300;

export default async function RankingsPage() {
  const supabase = await createClient();

  const { data: allIdols, error: idolsError } = await supabase
    .from("idols")
    .select("*, group:groups(*)")
    .order("popularity_score", { ascending: false })
    .limit(50);

  const { data: allGroups, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .order("popularity_score", { ascending: false });

  if (idolsError) console.error("Rankings idols query error:", idolsError.message);
  if (groupsError) console.error("Rankings groups query error:", groupsError.message);

  const idols = (allIdols ?? []) as (Idol & { group: Group })[];
  const groups = (allGroups ?? []) as Group[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <Crown className="h-6 w-6 text-primary" />
        K-pop Rankings
      </h1>

      {idols.length === 0 && groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Crown className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No ranking data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Idol Rankings */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-bold text-lg">
              <Crown className="h-5 w-5 text-primary" />
              Top Idols
            </h2>
            {idols.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No idol rankings yet</p>
            ) : (
              <div className="space-y-2">
                {idols.map((idol, i) => (
                  <IdolCard key={idol.id} idol={idol} rank={i + 1} />
                ))}
              </div>
            )}
          </div>

          {/* Group Rankings */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-bold text-lg">
              <Users className="h-5 w-5 text-primary" />
              Top Groups
            </h2>
            {groups.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No group rankings yet</p>
            ) : (
              <div className="space-y-2">
                {groups.map((group, i) => (
                  <GroupCard key={group.id} group={group} rank={i + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
