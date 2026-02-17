import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Crown } from "lucide-react";
import Link from "next/link";
import { PLANS } from "@/lib/constants";
import { FollowButton } from "@/components/follow-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Idols",
  description: "Manage your followed K-pop idols and groups",
};

export default async function MyIdolsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [
    { data: follows },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("follows")
      .select("*, idol:idols(*, group:groups(*)), group:groups(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single(),
  ]);

  const plan = (profile?.plan ?? "free") as keyof typeof PLANS;
  const maxFollows = PLANS[plan].maxFollows;
  const followCount = follows?.length ?? 0;

  const idolFollows = (follows ?? []).filter((f: any) => f.idol);
  const groupFollows = (follows ?? []).filter((f: any) => f.group);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">My Idols</h1>
        </div>
        <Badge variant="outline" className="text-xs">
          {followCount}/{maxFollows === -1 ? "∞" : maxFollows} follows
          <span className="ml-1 text-muted-foreground">({PLANS[plan].name})</span>
        </Badge>
      </div>

      {/* Upgrade prompt for free users */}
      {plan === "free" && followCount >= maxFollows && (
        <Card className="mb-6 p-4 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Follow limit reached</p>
              <p className="text-xs text-muted-foreground">Upgrade to Pro for up to 20 follows + daily digest emails</p>
            </div>
            <Link href="/billing">
              <Button size="sm">Upgrade</Button>
            </Link>
          </div>
        </Card>
      )}

      {followCount === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-primary/20 p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-primary/40 mb-4" />
          <h2 className="text-lg font-bold mb-2">Start Following</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Follow your favorite K-pop idols and groups to get personalized news and daily digest emails.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/idols">
              <Button>Browse Idols</Button>
            </Link>
            <Link href="/groups">
              <Button variant="outline">Browse Groups</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Idols section */}
          {idolFollows.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                <Heart className="h-4 w-4" />
                Idols ({idolFollows.length})
              </h2>
              <div className="space-y-2">
                {idolFollows.map((f: any) => (
                  <Card key={f.id} className="flex items-center gap-3 p-3">
                    <Link href={`/idol/${f.idol.slug}`} className="flex items-center gap-3 flex-1 min-w-0">
                      {f.idol.photo_url ? (
                        <img src={f.idol.photo_url} alt={f.idol.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {f.idol.name[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{f.idol.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {f.idol.name_ko}
                          {f.idol.group && ` · ${f.idol.group.name}`}
                        </p>
                      </div>
                    </Link>
                    <FollowButton idolId={f.idol_id} name={f.idol.name} variant="idol" />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Groups section */}
          {groupFollows.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                <Users className="h-4 w-4" />
                Groups ({groupFollows.length})
              </h2>
              <div className="space-y-2">
                {groupFollows.map((f: any) => (
                  <Card key={f.id} className="flex items-center gap-3 p-3">
                    <Link href={`/group/${f.group.slug}`} className="flex items-center gap-3 flex-1 min-w-0">
                      {f.group.photo_url ? (
                        <img src={f.group.photo_url} alt={f.group.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {f.group.name[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{f.group.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {f.group.name_ko} · {f.group.member_count} members
                        </p>
                      </div>
                    </Link>
                    <FollowButton groupId={f.group_id} name={f.group.name} variant="group" />
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
