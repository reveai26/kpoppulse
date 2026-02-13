import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { ArticleWithDetails } from "@/types";

type ArticleCardProps = {
  article: ArticleWithDetails;
};

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(article.published_at), { addSuffix: true });

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md hover:border-primary/30">
      <Link href={`/article/${article.id}`} className="flex gap-4 p-4">
        {/* Thumbnail */}
        {article.thumbnail_url && (
          <div className="hidden h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg sm:block">
            <img
              src={article.thumbnail_url}
              alt=""
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
            {article.translation.translated_title}
          </h3>

          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {article.translation.translated_summary}
          </p>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {article.mentioned_groups.map((g) => (
              <Badge key={g.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                {g.name}
              </Badge>
            ))}
            {article.mentioned_idols.map((idol) => (
              <Badge key={idol.id} variant="outline" className="text-[10px] px-1.5 py-0">
                {idol.name}
              </Badge>
            ))}
          </div>

          {/* Meta */}
          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
            <span>{article.source.name}</span>
            <span className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <ExternalLink className="h-3 w-3" />
              Original
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
};
