import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Star, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd, personJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/jsonld";
import { FollowButton } from "@/components/follow-button";
import { ShareButtons } from "@/components/share-buttons";
import { SITE_URL } from "@/lib/constants";
import type { Group, Idol } from "@/types";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: idol } = await supabase
    .from("idols")
    .select("name, group:groups(name)")
    .eq("slug", slug)
    .single();

  if (!idol) return { title: "Idol Not Found" };
  const groupName = (idol as any).group?.name;
  const description = `${idol.name}${groupName ? ` of ${groupName}` : ""} — K-pop idol profile and latest news on KpopPulse`;
  return {
    title: `${idol.name}${groupName ? ` (${groupName})` : ""} — Profile & News`,
    description,
    alternates: { canonical: `/idol/${slug}` },
    openGraph: {
      type: "profile",
      title: `${idol.name} — K-pop Idol Profile`,
      description,
      url: `/idol/${slug}`,
    },
  };
}

export default async function IdolPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: idol } = await supabase
    .from("idols")
    .select("*, group:groups(*)")
    .eq("slug", slug)
    .single();

  if (!idol) notFound();

  const i = idol as Idol & { group: Group | null };

  // Get other members if in a group
  let groupMembers: Idol[] = [];
  if (i.group_id) {
    const { data: members } = await supabase
      .from("idols")
      .select("*")
      .eq("group_id", i.group_id)
      .neq("id", i.id)
      .order("popularity_score", { ascending: false })
      .limit(10);
    groupMembers = (members ?? []) as Idol[];
  }

  // GEO: FAQ data for AI engines
  const faqData = [
    ...(i.group ? [{
      question: `What group is ${i.name} in?`,
      answer: `${i.name} is a member of ${i.group.name}.`,
    }] : []),
    ...(i.position ? [{
      question: `What is ${i.name}'s position?`,
      answer: `${i.name}'s position is ${i.position}.`,
    }] : []),
    ...(i.nationality ? [{
      question: `Where is ${i.name} from?`,
      answer: `${i.name} is from ${i.nationality}.`,
    }] : []),
    ...(i.birth_date ? [{
      question: `When was ${i.name} born?`,
      answer: `${i.name} was born on ${i.birth_date}.`,
    }] : []),
  ];

  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    { name: "Idols", url: `${SITE_URL}/idols` },
    ...(i.group ? [{ name: i.group.name, url: `${SITE_URL}/group/${i.group.slug}` }] : []),
    { name: i.name, url: `${SITE_URL}/idol/${slug}` },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <JsonLd data={personJsonLd(i)} />
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
      {faqData.length > 0 && <JsonLd data={faqJsonLd(faqData)} />}

      {/* Breadcrumb nav */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link href="/idols" className="hover:text-primary transition-colors">Idols</Link>
        {i.group && (
          <>
            <span>/</span>
            <Link href={`/group/${i.group.slug}`} className="hover:text-primary transition-colors">{i.group.name}</Link>
          </>
        )}
        <span>/</span>
        <span>{i.name}</span>
      </nav>

      {/* Idol Header */}
      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6" itemScope itemType="https://schema.org/Person">
        <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/10">
          {i.photo_url ? (
            <img src={i.photo_url} alt={i.name} itemProp="image" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-primary/60">
              {i.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
            <h1 className="text-2xl font-bold" itemProp="name">{i.name}</h1>
            <Badge variant="secondary"><span itemProp="alternateName">{i.name_ko}</span></Badge>
            {i.group && (
              <span itemProp="memberOf" itemScope itemType="https://schema.org/MusicGroup">
                <Link href={`/group/${i.group.slug}`}>
                  <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                    <span itemProp="name">{i.group.name}</span>
                  </Badge>
                </Link>
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground sm:justify-start sm:gap-4">
            {i.position && (
              <span className="flex items-center gap-1" itemProp="jobTitle">
                <Star className="h-4 w-4" /> {i.position}
              </span>
            )}
            {i.birth_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> <time itemProp="birthDate" content={i.birth_date}>{i.birth_date}</time>
              </span>
            )}
            {i.nationality && (
              <span className="flex items-center gap-1" itemProp="nationality" itemScope itemType="https://schema.org/Country">
                <MapPin className="h-4 w-4" /> <span itemProp="name">{i.nationality}</span>
              </span>
            )}
          </div>

          {i.description && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed" itemProp="description">{i.description}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <FollowButton idolId={i.id} name={i.name} variant="idol" />
            <ShareButtons url={`${SITE_URL}/idol/${slug}`} title={`${i.name} — K-pop Idol Profile`} />
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* News placeholder */}
      <div className="mb-6">
        <h2 className="mb-4 font-bold">Latest News about {i.name}</h2>
        <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
          News articles mentioning {i.name} will appear here once the AI translation pipeline is active.
        </div>
      </div>

      {/* Other members */}
      {groupMembers.length > 0 && (
        <>
          <Separator className="mb-6" />
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-bold">
              <Users className="h-4 w-4 text-primary" />
              Other {i.group?.name} Members
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {groupMembers.map((member) => (
                <Link key={member.id} href={`/idol/${member.slug}`}>
                  <div className="group flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all hover:shadow-md hover:border-primary/30">
                    <div className="h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-primary/60">
                          {member.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">{member.name}</p>
                      <p className="text-[10px] text-muted-foreground">{member.name_ko}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
