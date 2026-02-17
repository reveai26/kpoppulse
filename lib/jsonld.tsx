import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import type { Group, Idol, ArticleWithDetails } from "@/types";

// Organization schema (used in root layout)
export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description: SITE_DESCRIPTION,
  sameAs: [],
});

// WebSite schema with SearchAction (used in root layout)
export const webSiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

// NewsArticle schema
export const newsArticleJsonLd = (article: ArticleWithDetails) => ({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: article.translation.translated_title,
  description: article.translation.translated_summary,
  image: article.thumbnail_url || undefined,
  datePublished: article.published_at,
  dateModified: article.collected_at,
  author: {
    "@type": "Organization",
    name: article.source.name,
    url: article.source.url,
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${SITE_URL}/article/${article.id}`,
  },
  inLanguage: "en",
  about: [
    ...article.mentioned_groups.map((g) => ({
      "@type": "MusicGroup",
      name: g.name,
      url: `${SITE_URL}/group/${g.slug}`,
    })),
    ...article.mentioned_idols.map((idol) => ({
      "@type": "Person",
      name: idol.name,
      url: `${SITE_URL}/idol/${idol.slug}`,
    })),
  ],
  mentions: [
    ...article.mentioned_groups.map((g) => ({
      "@type": "MusicGroup",
      name: g.name,
      url: `${SITE_URL}/group/${g.slug}`,
    })),
    ...article.mentioned_idols.map((idol) => ({
      "@type": "Person",
      name: idol.name,
      url: `${SITE_URL}/idol/${idol.slug}`,
    })),
  ],
});

// Person schema for idols (GEO: explicit entity data)
export const personJsonLd = (idol: Idol & { group?: Group | null }) => {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: idol.name,
    alternateName: idol.name_ko,
    url: `${SITE_URL}/idol/${idol.slug}`,
    image: idol.photo_url || undefined,
    description: idol.description || `${idol.name} (${idol.name_ko}) is a K-pop idol${idol.group ? ` and member of ${idol.group.name}` : ""}.`,
    jobTitle: idol.position || "K-pop Idol",
    nationality: idol.nationality ? { "@type": "Country", name: idol.nationality } : undefined,
    birthDate: idol.birth_date || undefined,
    inLanguage: "en",
  };

  if (idol.group) {
    schema.memberOf = {
      "@type": "MusicGroup",
      name: idol.group.name,
      url: `${SITE_URL}/group/${idol.group.slug}`,
    };
  }

  if (idol.social_links) {
    schema.sameAs = Object.values(idol.social_links);
  }

  return schema;
};

// MusicGroup schema for groups (GEO: rich entity data)
export const musicGroupJsonLd = (group: Group, members?: Idol[]) => {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: group.name,
    alternateName: group.name_ko,
    url: `${SITE_URL}/group/${group.slug}`,
    image: group.photo_url || undefined,
    description: group.description || `${group.name} (${group.name_ko}) is a K-pop group under ${group.agency} with ${group.member_count} members.`,
    foundingDate: group.debut_date || undefined,
    numberOfEmployees: group.member_count,
    inLanguage: "en",
  };

  if (group.agency) {
    schema.managementCompany = {
      "@type": "Organization",
      name: group.agency.split(" (")[0],
    };
  }

  if (members && members.length > 0) {
    schema.member = members.map((m) => ({
      "@type": "Person",
      name: m.name,
      alternateName: m.name_ko,
      url: `${SITE_URL}/idol/${m.slug}`,
    }));
  }

  if (group.social_links) {
    schema.sameAs = Object.values(group.social_links);
  }

  return schema;
};

// BreadcrumbList schema
export const breadcrumbJsonLd = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
});

// CollectionPage schema (for list pages)
export const collectionPageJsonLd = (
  name: string,
  description: string,
  url: string,
  items: { name: string; url: string }[]
) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name,
  description,
  url,
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.slice(0, 30).map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  },
});

// FAQ schema for GEO (AI engines extract Q&A pairs)
export const faqJsonLd = (questions: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.map((q) => ({
    "@type": "Question",
    name: q.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: q.answer,
    },
  })),
});

// Helper: render JSON-LD script tag
export const JsonLd = ({ data }: { data: Record<string, unknown> }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
);
