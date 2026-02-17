import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, ExternalLink, Newspaper } from "lucide-react";
import { BookmarkButton } from "@/components/bookmark-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { JsonLd, newsArticleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/constants";
import type { ArticleWithDetails } from "@/types";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select(`
      original_title, thumbnail_url, published_at,
      translations(translated_title, translated_summary, language)
    `)
    .eq("id", id)
    .eq("translations.language", "en")
    .single();

  if (!article) return { title: "Article Not Found" };

  const translation = (article as any).translations?.[0];
  const title = translation?.translated_title || article.original_title;
  const description = translation?.translated_summary || `Read the latest K-pop news: ${title}`;

  return {
    title,
    description,
    alternates: { canonical: `/article/${id}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/article/${id}`,
      publishedTime: article.published_at,
      images: article.thumbnail_url ? [{ url: article.thumbnail_url, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: article.thumbnail_url ? "summary_large_image" : "summary",
      title,
      description,
      images: article.thumbnail_url ? [article.thumbnail_url] : [],
    },
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
      <JsonLd data={newsArticleJsonLd(article)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "News", url: SITE_URL },
          { name: article.translation.translated_title, url: `${SITE_URL}/article/${id}` },
        ])}
      />

      {/* Breadcrumb nav */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span className="truncate max-w-[200px]">{article.translation.translated_title}</span>
      </nav>

      {/* Article */}
      <article itemScope itemType="https://schema.org/NewsArticle">
        <meta itemProp="datePublished" content={article.published_at} />
        <meta itemProp="dateModified" content={article.collected_at} />

        <h1 itemProp="headline" className="text-2xl font-bold leading-tight mb-3">
          {article.translation.translated_title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1" itemProp="publisher" itemScope itemType="https://schema.org/Organization">
            <Newspaper className="h-4 w-4" />
            <span itemProp="name">{article.source.name}</span>
          </span>
          <time className="flex items-center gap-1" dateTime={article.published_at}>
            <Clock className="h-4 w-4" />
            {timeAgo}
          </time>
          <a
            href={article.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Original Article
          </a>
          <BookmarkButton articleId={article.id} />
        </div>

        {/* Tags */}
        {(article.mentioned_groups.length > 0 ||
          article.mentioned_idols.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.mentioned_groups.map((g) => (
              <Link key={g.id} href={`/group/${g.slug}`}>
                <Badge className="text-xs cursor-pointer bg-primary/10 text-primary border-0 hover:bg-primary/20">
                  {g.name}
                </Badge>
              </Link>
            ))}
            {article.mentioned_idols.map((idol) => (
              <Link key={idol.id} href={`/idol/${idol.slug}`}>
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer border-pink-300/50 text-pink-600 dark:border-pink-500/30 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/20"
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
              alt={article.translation.translated_title}
              itemProp="image"
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
            <p className="text-sm leading-relaxed" itemProp="description">
              {article.translation.translated_summary}
            </p>
          </Card>
        )}

        {/* Full Content */}
        {article.translation.translated_content && (
          <div className="prose prose-sm max-w-none mb-6" itemProp="articleBody">
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
          <p className="text-sm font-medium" lang="ko">{article.original_title}</p>
        </div>

        {/* Published Date */}
        <div className="text-xs text-muted-foreground">
          Published:{" "}
          <time dateTime={article.published_at}>
            {new Date(article.published_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </div>
      </article>
    </div>
  );
}
