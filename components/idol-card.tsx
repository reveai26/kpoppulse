import Link from "next/link";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Idol, Group } from "@/types";

type IdolCardProps = {
  idol: Idol & { group?: Group };
  showGroup?: boolean;
};

export const IdolCard = ({ idol, showGroup = true }: IdolCardProps) => {
  return (
    <Link href={`/idol/${idol.slug}`}>
      <Card className="group flex items-center gap-3 p-3 transition-all hover:shadow-md hover:border-primary/30 hover:scale-[1.01]">
        {/* Photo */}
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/10">
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
            <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
              {idol.group.name}
            </Badge>
          )}
        </div>

        {/* Members indicator */}
        {idol.group && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
          </div>
        )}
      </Card>
    </Link>
  );
};
