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

  const { data: allIdols } = await supabase
    .from("idols")
    .select("*, group:groups(*)")
    .order("popularity_score", { ascending: false })
    .limit(50);

  const { data: allGroups } = await supabase
    .from("groups")
    .select("*")
    .order("popularity_score", { ascending: false });

  const idols = (allIdols ?? []) as (Idol & { group: Group })[];
  const groups = (allGroups ?? []) as Group[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <Crown className="h-6 w-6 text-primary" />
        K-pop Rankings
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Idol Rankings */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 font-bold text-lg">
            <Crown className="h-5 w-5 text-primary" />
            Top Idols
          </h2>
          <div className="space-y-2">
            {idols.map((idol, i) => (
              <IdolCard key={idol.id} idol={idol} rank={i + 1} />
            ))}
          </div>
        </div>

        {/* Group Rankings */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 font-bold text-lg">
            <Users className="h-5 w-5 text-primary" />
            Top Groups
          </h2>
          <div className="space-y-2">
            {groups.map((group, i) => (
              <GroupCard key={group.id} group={group} rank={i + 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
