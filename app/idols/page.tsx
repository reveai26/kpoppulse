import { createClient } from "@/lib/supabase/server";
import { IdolCard } from "@/components/idol-card";
import { Star } from "lucide-react";
import type { Group, Idol } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Idols",
  description: "Browse all K-pop idols on KpopPulse",
};

export const revalidate = 300;

export default async function IdolsPage() {
  const supabase = await createClient();

  const { data: idols } = await supabase
    .from("idols")
    .select("*, group:groups(*)")
    .order("popularity_score", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <Star className="h-6 w-6 text-primary" />
        All Idols ({idols?.length ?? 0})
      </h1>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {(idols ?? []).map((idol, i) => (
          <IdolCard key={idol.id} idol={idol as Idol & { group: Group }} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}
