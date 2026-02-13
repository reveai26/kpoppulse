import Link from "next/link";
import { Crown, Users, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Idol, Group } from "@/types";

type IdolCardProps = {
  idol: Idol & { group?: Group };
  rank?: number;
  showGroup?: boolean;
};

export const IdolCard = ({ idol, rank, showGroup = true }: IdolCardProps) => {
  return (
    <Link href={`/idol/${idol.slug}`}>
      <Card className="group relative flex items-center gap-3 p-3 transition-all hover:shadow-md hover:border-primary/30">
        {/* Rank badge */}
        {rank && rank <= 3 && (
          <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow">
            {rank === 1 ? <Crown className="h-3 w-3" /> : rank}
          </div>
        )}
        {rank && rank > 3 && (
          <div className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
            {rank}
          </div>
        )}

        {/* Photo */}
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
          {idol.photo_url ? (
            <img src={idol.photo_url} alt={idol.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary/60">
              {idol.name[0]}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-sm group-hover:text-primary transition-colors">
            {idol.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{idol.name_ko}</p>
          {showGroup && idol.group && (
            <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
              {idol.group.name}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-col items-end gap-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {formatScore(idol.popularity_score)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {formatScore(idol.follower_count)}
          </span>
        </div>
      </Card>
    </Link>
  );
};

const formatScore = (n: number) => {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
};
