import { createClient } from "@/lib/supabase/server";
import { GroupCard } from "@/components/group-card";
import { Users } from "lucide-react";
import { JsonLd, collectionPageJsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/constants";
import type { Group } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All K-pop Groups",
  description: "Browse 40+ K-pop groups — BTS, BLACKPINK, aespa, NewJeans, SEVENTEEN, Stray Kids and more. Profiles, members, and latest news.",
  alternates: { canonical: "/groups" },
  openGraph: {
    title: "All K-pop Groups | KpopPulse",
    description: "Browse 40+ K-pop groups with profiles, members, and latest translated news.",
    url: "/groups",
  },
};

export const revalidate = 300;

export default async function GroupsPage() {
  const supabase = await createClient();

  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .order("popularity_score", { ascending: false });

  if (groupsError) console.error("Groups query error:", groupsError.message);

  const groupItems = (groups ?? []).map((g: any) => ({
    name: g.name,
    url: `${SITE_URL}/group/${g.slug}`,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <JsonLd data={collectionPageJsonLd(
        "All K-pop Groups",
        "Browse all K-pop groups on KpopPulse",
        `${SITE_URL}/groups`,
        groupItems
      )} />
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <Users className="h-6 w-6 text-primary" />
        All Groups ({groups?.length ?? 0})
      </h1>
      {(!groups || groups.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No groups found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group, i) => (
            <GroupCard key={group.id} group={group as Group} />
          ))}
        </div>
      )}
    </div>
  );
}
