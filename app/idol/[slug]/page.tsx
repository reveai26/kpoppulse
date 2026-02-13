import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, Calendar, MapPin, Star, TrendingUp, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Group, Idol } from "@/types";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: idol } = await supabase
    .from("idols")
    .select("name, group:groups(name)")
    .eq("slug", slug)
    .single();

  if (!idol) return { title: "Idol Not Found" };
  const groupName = (idol as any).group?.name;
  return {
    title: `${idol.name}${groupName ? ` (${groupName})` : ""} — News`,
    description: `Latest K-pop news about ${idol.name}`,
  };
}

export default async function IdolPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: idol } = await supabase
    .from("idols")
    .select("*, group:groups(*)")
    .eq("slug", slug)
    .single();

  if (!idol) notFound();

  const i = idol as Idol & { group: Group | null };

  // Get other members if in a group
  let groupMembers: Idol[] = [];
  if (i.group_id) {
    const { data: members } = await supabase
      .from("idols")
      .select("*")
      .eq("group_id", i.group_id)
      .neq("id", i.id)
      .order("popularity_score", { ascending: false })
      .limit(10);
    groupMembers = (members ?? []) as Idol[];
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link href={i.group ? `/group/${i.group.slug}` : "/"} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> {i.group ? `Back to ${i.group.name}` : "Back to Feed"}
      </Link>

      {/* Idol Header */}
      <div className="mb-6 flex items-start gap-6">
        <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
          {i.photo_url ? (
            <img src={i.photo_url} alt={i.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-primary/60">
              {i.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{i.name}</h1>
            <Badge variant="secondary">{i.name_ko}</Badge>
            {i.group && (
              <Link href={`/group/${i.group.slug}`}>
                <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                  {i.group.name}
                </Badge>
              </Link>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {i.position && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" /> {i.position}
              </span>
            )}
            {i.birth_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {i.birth_date}
              </span>
            )}
            {i.nationality && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {i.nationality}
              </span>
            )}
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Score: {i.popularity_score.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {i.follower_count.toLocaleString()} followers
            </span>
          </div>

          {i.description && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{i.description}</p>
          )}

          <div className="mt-3">
            <Button size="sm" className="gap-1">
              <Heart className="h-3 w-3" /> Follow {i.name}
            </Button>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* News placeholder */}
      <div className="mb-6">
        <h2 className="mb-4 font-bold">Latest News about {i.name}</h2>
        <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
          News articles mentioning {i.name} will appear here once the AI translation pipeline is active.
        </div>
      </div>

      {/* Other members */}
      {groupMembers.length > 0 && (
        <>
          <Separator className="mb-6" />
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-bold">
              <Users className="h-4 w-4 text-primary" />
              Other {i.group?.name} Members
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {groupMembers.map((member) => (
                <Link key={member.id} href={`/idol/${member.slug}`}>
                  <div className="group flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all hover:shadow-md hover:border-primary/30">
                    <div className="h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-primary/60">
                          {member.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">{member.name}</p>
                      <p className="text-[10px] text-muted-foreground">{member.name_ko}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
