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
      <a
        href={article.original_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-4 p-4 sm:p-5"
      >
        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-semibold text-base leading-snug group-hover:text-primary transition-colors">
            {article.translation.translated_title}
          </h3>

          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {article.translation.translated_summary}
          </p>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {article.mentioned_groups.map((g) => (
              <Badge key={g.id} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-0 hover:bg-primary/20">
                {g.name}
              </Badge>
            ))}
            {article.mentioned_idols.slice(0, 3).map((idol) => (
              <Badge key={idol.id} variant="outline" className="text-[10px] px-2 py-0.5 border-pink-300/50 text-pink-600 dark:border-pink-500/30 dark:text-pink-400">
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
            <span className="ml-auto flex items-center gap-1 text-primary/70">
              <ExternalLink className="h-3 w-3" />
              Read
            </span>
          </div>
        </div>
      </a>
    </Card>
  );
};
