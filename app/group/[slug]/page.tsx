import { createClient } from "@/lib/supabase/server";
import { IdolCard } from "@/components/idol-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, Calendar, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd, musicGroupJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/jsonld";
import { FollowButton } from "@/components/follow-button";
import { ShareButtons } from "@/components/share-buttons";
import { SITE_URL } from "@/lib/constants";
import type { Group, Idol } from "@/types";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: group } = await supabase
    .from("groups")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!group) return { title: "Group Not Found" };
  const description = group.description || `${group.name} — K-pop group profile, members, and latest news on KpopPulse`;
  return {
    title: `${group.name} — Members & News`,
    description,
    alternates: { canonical: `/group/${slug}` },
    openGraph: {
      type: "profile",
      title: `${group.name} — K-pop Group Profile`,
      description,
      url: `/group/${slug}`,
    },
  };
}

export default async function GroupPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!group) notFound();

  const { data: members } = await supabase
    .from("idols")
    .select("*")
    .eq("group_id", group.id)
    .order("popularity_score", { ascending: false });

  const idols = (members ?? []) as Idol[];
  const g = group as Group;

  // GEO: FAQ data for AI engines
  const faqData = [
    {
      question: `Who are the members of ${g.name}?`,
      answer: idols.length > 0
        ? `${g.name} has ${idols.length} members: ${idols.map(m => m.name).join(", ")}.`
        : `${g.name} has ${g.member_count} members.`,
    },
    {
      question: `What agency is ${g.name} under?`,
      answer: `${g.name} is managed by ${g.agency}.`,
    },
    ...(g.debut_date ? [{
      question: `When did ${g.name} debut?`,
      answer: `${g.name} debuted on ${g.debut_date}.`,
    }] : []),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <JsonLd data={musicGroupJsonLd(g, idols)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", url: SITE_URL },
        { name: "Groups", url: `${SITE_URL}/groups` },
        { name: g.name, url: `${SITE_URL}/group/${slug}` },
      ])} />
      <JsonLd data={faqJsonLd(faqData)} />

      {/* Breadcrumb nav */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link href="/groups" className="hover:text-primary transition-colors">Groups</Link>
        <span>/</span>
        <span>{g.name}</span>
      </nav>

      {/* Group Header */}
      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6" itemScope itemType="https://schema.org/MusicGroup">
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/10">
          {g.photo_url ? (
            <img src={g.photo_url} alt={g.name} itemProp="image" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary/60">
              {g.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
            <h1 className="text-2xl font-bold" itemProp="name">{g.name}</h1>
            <Badge variant="secondary" className="text-xs"><span itemProp="alternateName">{g.name_ko}</span></Badge>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground sm:justify-start sm:gap-4">
            <span className="flex items-center gap-1" itemProp="managementCompany" itemScope itemType="https://schema.org/Organization">
              <Building2 className="h-4 w-4" /> <span itemProp="name">{g.agency}</span>
            </span>
            {g.debut_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Debut: <time itemProp="foundingDate" content={g.debut_date}>{g.debut_date}</time>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> <meta itemProp="numberOfEmployees" content={String(g.member_count)} />{g.member_count} members
            </span>
          </div>
          {g.description && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed" itemProp="description">{g.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <FollowButton groupId={g.id} name={g.name} variant="group" />
            <ShareButtons url={`${SITE_URL}/group/${slug}`} title={`${g.name} — K-pop Group Profile`} />
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Members */}
      <div className="mb-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Users className="h-4 w-4 text-primary" />
          Members ({idols.length})
          <span className="text-xs font-normal text-muted-foreground ml-1">sorted by popularity</span>
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {idols.map((idol, i) => (
            <IdolCard key={idol.id} idol={{ ...idol, group: g }} showGroup={false} />
          ))}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* News section placeholder */}
      <div className="mb-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          Latest News about {g.name}
        </h2>
        <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
          News articles about {g.name} will appear here once the AI translation pipeline is active.
        </div>
      </div>
    </div>
  );
}
