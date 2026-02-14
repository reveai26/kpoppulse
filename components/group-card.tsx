import Link from "next/link";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Group } from "@/types";

type GroupCardProps = {
  group: Group;
};

export const GroupCard = ({ group }: GroupCardProps) => {
  return (
    <Link href={`/group/${group.slug}`}>
      <Card className="group flex items-center gap-3 p-3 transition-all hover:shadow-md hover:border-primary/30 hover:scale-[1.01]">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/10">
          {group.photo_url ? (
            <img src={group.photo_url} alt={group.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary/60">
              {group.name[0]}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-sm group-hover:text-primary transition-colors">
            {group.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{group.name_ko}</p>
          <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0">
            {group.agency.split(" (")[0]}
          </Badge>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{group.member_count}</span>
        </div>
      </Card>
    </Link>
  );
};
