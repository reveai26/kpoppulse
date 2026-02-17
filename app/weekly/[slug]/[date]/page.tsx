import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Newspaper, Star, ArrowLeft } from "lucide-react";
import { ShareButtons } from "@/components/share-buttons";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { JsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string; date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, date } = await params;
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("name, photo_url")
    .eq("slug", slug)
    .single();

  if (!group) return { title: "Roundup Not Found" };

  const { data: roundup } = await supabase
    .from("weekly_roundups")
    .select("title, summary")
    .eq("week_start", date)
    .eq("group_id", (await supabase.from("groups").select("id").eq("slug", slug).single()).data?.id)
    .single();

  const title = roundup?.title || `${group.name} Weekly Roundup — ${date}`;
  const description = roundup?.summary?.substring(0, 160) || `Weekly news roundup for ${group.name} K-pop group.`;

  return {
    title,
    description,
    alternates: { canonical: `/weekly/${slug}/${date}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/weekly/${slug}/${date}`,
      images: group.photo_url ? [{ url: group.photo_url }] : [],
    },
    twitter: {
      card: group.photo_url ? "summary_large_image" : "summary",
      title,
      description,
      images: group.photo_url ? [group.photo_url] : ["/icon.svg"],
    },
  };
}

export default async function WeeklyRoundupPage({ params }: Props) {
  const { slug, date } = await params;
  const supabase = await createClient();

  // Get group
  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!group) notFound();

  // Get roundup
  const { data: roundup } = await supabase
    .from("weekly_roundups")
    .select("*")
    .eq("group_id", group.id)
    .eq("week_start", date)
    .single();

  if (!roundup) notFound();

  // Get the articles referenced in the roundup
  const articleIds = roundup.article_ids || [];
  let articles: any[] = [];
  if (articleIds.length > 0) {
    const { data } = await supabase
      .from("articles")
      .select(`
        id, original_title, thumbnail_url, published_at,
        source:sources(name),
        translations!inner(translated_title, translated_summary, language)
      `)
      .in("id", articleIds)
      .eq("translations.language", "en")
      .order("published_at", { ascending: false });
    articles = data ?? [];
  }

  const highlights: string[] = Array.isArray(roundup.highlights) ? roundup.highlights : [];
  const pageUrl = `${SITE_URL}/weekly/${slug}/${date}`;
  const weekEndStr = roundup.week_end;

  // JSON-LD for blog posting (SEO)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: roundup.title,
    description: roundup.summary.substring(0, 160),
    datePublished: roundup.created_at,
    dateModified: roundup.created_at,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    about: {
      "@type": "MusicGroup",
      name: group.name,
      alternateName: group.name_ko,
      url: `${SITE_URL}/group/${group.slug}`,
    },
    image: group.photo_url || undefined,
    inLanguage: "en",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", url: SITE_URL },
        { name: "Weekly Roundups", url: `${SITE_URL}/weekly` },
        { name: group.name, url: `${SITE_URL}/group/${group.slug}` },
        { name: roundup.title, url: pageUrl },
      ])} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link href="/weekly" className="hover:text-primary transition-colors">Weekly</Link>
        <span>/</span>
        <Link href={`/group/${slug}`} className="hover:text-primary transition-colors">{group.name}</Link>
        <span>/</span>
        <span className="truncate max-w-[120px]">{date}</span>
      </nav>

      {/* Back link */}
      <Link href="/weekly" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="h-3 w-3" />
        All Roundups
      </Link>

      <article>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {group.photo_url && (
            <Link href={`/group/${slug}`}>
              <img src={group.photo_url} alt={group.name} className="w-12 h-12 rounded-full object-cover" />
            </Link>
          )}
          <div>
            <Link href={`/group/${slug}`} className="text-sm font-medium text-primary hover:underline">
              {group.name}
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              <span>{formatDate(date)} — {formatDate(weekEndStr)}</span>
              <Badge variant="outline" className="text-[10px]">
                {roundup.article_count} articles
              </Badge>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold leading-tight mb-4">{roundup.title}</h1>

        {/* Highlights */}
        {highlights.length > 0 && (
          <Card className="mb-6 p-4 bg-primary/5 border-primary/20">
            <h2 className="text-sm font-bold mb-2 flex items-center gap-1">
              <Star className="h-4 w-4 text-primary" />
              Key Highlights
            </h2>
            <ul className="space-y-1">
              {highlights.map((h, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">·</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Summary */}
        <div className="prose prose-sm max-w-none mb-6">
          <p className="text-sm leading-relaxed whitespace-pre-line">{roundup.summary}</p>
        </div>

        {/* Share */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-2">Share this roundup</p>
          <ShareButtons url={pageUrl} title={roundup.title} />
        </div>

        <Separator className="mb-6" />

        {/* Referenced Articles */}
        {articles.length > 0 && (
          <div>
            <h2 className="flex items-center gap-2 font-bold text-sm mb-3">
              <Newspaper className="h-4 w-4 text-primary" />
              Articles This Week
              <Badge variant="secondary" className="text-[10px]">{articles.length}</Badge>
            </h2>
            <div className="space-y-2">
              {articles.map((article: any) => {
                const t = article.translations?.[0];
                return (
                  <Link key={article.id} href={`/article/${article.id}`}>
                    <Card className="p-3 hover:bg-accent/50 transition-colors">
                      <div className="flex gap-3">
                        {article.thumbnail_url && (
                          <img
                            src={article.thumbnail_url}
                            alt=""
                            className="w-16 h-12 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {t?.translated_title || article.original_title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {t?.translated_summary}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {article.source?.name} · {formatDate(article.published_at?.split("T")[0])}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Other roundups for this group */}
        <Separator className="my-6" />
        <div className="text-center">
          <Link href={`/group/${slug}`} className="text-sm text-primary hover:underline">
            View all {group.name} news →
          </Link>
        </div>
      </article>
    </div>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00Z")).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
