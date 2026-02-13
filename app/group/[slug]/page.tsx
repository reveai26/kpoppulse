import { createClient } from "@/lib/supabase/server";
import { IdolCard } from "@/components/idol-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, Calendar, Building2, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Group, Idol } from "@/types";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: group } = await supabase
    .from("groups")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!group) return { title: "Group Not Found" };
  return {
    title: `${group.name} — News & Members`,
    description: group.description || `Latest K-pop news about ${group.name}`,
  };
}

export default async function GroupPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!group) notFound();

  const { data: members } = await supabase
    .from("idols")
    .select("*")
    .eq("group_id", group.id)
    .order("popularity_score", { ascending: false });

  const idols = (members ?? []) as Idol[];
  const g = group as Group;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Back */}
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Feed
      </Link>

      {/* Group Header */}
      <div className="mb-6 flex items-start gap-6">
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
          {g.photo_url ? (
            <img src={g.photo_url} alt={g.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary/60">
              {g.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{g.name}</h1>
            <Badge variant="secondary" className="text-xs">{g.name_ko}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" /> {g.agency}
            </span>
            {g.debut_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Debut: {g.debut_date}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {g.member_count} members
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Score: {g.popularity_score.toLocaleString()}
            </span>
          </div>
          {g.description && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{g.description}</p>
          )}
          <div className="mt-3">
            <Button size="sm" className="gap-1">
              <Users className="h-3 w-3" /> Follow Group
            </Button>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Members */}
      <div className="mb-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Users className="h-4 w-4 text-primary" />
          Members ({idols.length})
          <span className="text-xs font-normal text-muted-foreground ml-1">sorted by popularity</span>
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {idols.map((idol, i) => (
            <IdolCard key={idol.id} idol={{ ...idol, group: g }} rank={i + 1} showGroup={false} />
          ))}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* News section placeholder */}
      <div className="mb-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          Latest News about {g.name}
        </h2>
        <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
          News articles about {g.name} will appear here once the AI translation pipeline is active.
        </div>
      </div>
    </div>
  );
}
