import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, ExternalLink, Newspaper } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import type { ArticleWithDetails } from "@/types";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select(`
      original_title,
      translations(translated_title, language)
    `)
    .eq("id", id)
    .eq("translations.language", "en")
    .single();

  if (!article) return { title: "Article Not Found" };

  const translation = (article as any).translations?.[0];
  const title = translation?.translated_title || article.original_title;

  return {
    title,
    description: `Read the latest K-pop news: ${title}`,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: rawArticle } = await supabase
    .from("articles")
    .select(`
      *,
      source:sources(*),
      translations!inner(translated_title, translated_summary, translated_content, language),
      article_idols(idol:idols(*, group:groups(*))),
      article_groups(group:groups(*))
    `)
    .eq("id", id)
    .eq("translations.language", "en")
    .single();

  if (!rawArticle) notFound();

  const article: ArticleWithDetails = {
    ...rawArticle,
    source: rawArticle.source,
    translation: (rawArticle as any).translations?.[0] ?? {
      translated_title: rawArticle.original_title,
      translated_summary: "",
    },
    mentioned_idols: ((rawArticle as any).article_idols ?? [])
      .map((ai: any) => ai.idol)
      .filter(Boolean),
    mentioned_groups: ((rawArticle as any).article_groups ?? [])
      .map((ag: any) => ag.group)
      .filter(Boolean),
  };

  const timeAgo = formatDistanceToNow(new Date(article.published_at), {
    addSuffix: true,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Back */}
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Feed
      </Link>

      {/* Article Header */}
      <article>
        <h1 className="text-2xl font-bold leading-tight mb-3">
          {article.translation.translated_title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Newspaper className="h-4 w-4" />
            {article.source.name}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {timeAgo}
          </span>
          <a
            href={article.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Original Article
          </a>
        </div>

        {/* Tags */}
        {(article.mentioned_groups.length > 0 ||
          article.mentioned_idols.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.mentioned_groups.map((g) => (
              <Link key={g.id} href={`/group/${g.slug}`}>
                <Badge
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {g.name}
                </Badge>
              </Link>
            ))}
            {article.mentioned_idols.map((idol) => (
              <Link key={idol.id} href={`/idol/${idol.slug}`}>
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {idol.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        <Separator className="mb-6" />

        {/* Thumbnail */}
        {article.thumbnail_url && (
          <div className="mb-6 overflow-hidden rounded-lg">
            <img
              src={article.thumbnail_url}
              alt=""
              className="w-full object-cover max-h-96"
            />
          </div>
        )}

        {/* Summary */}
        {article.translation.translated_summary && (
          <Card className="mb-6 p-4 bg-muted/50">
            <p className="text-sm font-medium mb-1 text-muted-foreground">
              Summary
            </p>
            <p className="text-sm leading-relaxed">
              {article.translation.translated_summary}
            </p>
          </Card>
        )}

        {/* Full Content */}
        {article.translation.translated_content && (
          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {article.translation.translated_content}
            </p>
          </div>
        )}

        <Separator className="mb-6" />

        {/* Original Title */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-1">
            Original Korean Title
          </p>
          <p className="text-sm font-medium">{article.original_title}</p>
        </div>

        {/* Published Date */}
        <div className="text-xs text-muted-foreground">
          Published:{" "}
          {new Date(article.published_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </article>
    </div>
  );
}
