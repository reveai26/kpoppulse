"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  DollarSign,
  Newspaper,
  Heart,
  TrendingUp,
  Crown,
  Sparkles,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Stats = {
  users: {
    total: number;
    today: number;
    thisWeek: number;
    planDistribution: { free: number; pro: number; premium: number };
  };
  revenue: {
    mrr: number;
    activeSubscriptions: number;
    cancelingSubscriptions: number;
  };
  content: {
    totalArticles: number;
    translatedArticles: number;
    totalFollows: number;
  };
};

type Member = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  plan: string;
  created_at: string;
  followCount: number;
};

type Sub = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  polar_subscription_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  updated_at: string;
  profile: { email: string; display_name: string | null } | null;
};

const GA_PROPERTY_ID = "G-FSQ5Y78VKE";

export const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersPage, setMembersPage] = useState(1);
  const [membersTotalPages, setMembersTotalPages] = useState(1);
  const [planFilter, setPlanFilter] = useState("all");
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [membersPage, planFilter]);

  const fetchMembers = () => {
    fetch(
      `/api/admin/members?page=${membersPage}&plan=${planFilter}`,
    )
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members);
        setMembersTotal(d.total);
        setMembersTotalPages(d.totalPages);
      });
  };

  const fetchSubs = () => {
    fetch("/api/admin/subscriptions")
      .then((r) => r.json())
      .then((d) => setSubs(d.subscriptions));
  };

  const planBadge = (plan: string) => {
    switch (plan) {
      case "premium":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Crown className="mr-1 h-3 w-3" />
            Premium
          </Badge>
        );
      case "pro":
        return (
          <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
            <Sparkles className="mr-1 h-3 w-3" />
            Pro
          </Badge>
        );
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const statusBadge = (status: string, canceling: boolean) => {
    if (canceling)
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-500/30">
          Canceling
        </Badge>
      );
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            Active
          </Badge>
        );
      case "revoked":
        return <Badge variant="destructive">Revoked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <Tabs
      defaultValue="overview"
      onValueChange={(v) => {
        if (v === "subscriptions" && subs.length === 0) fetchSubs();
      }}
    >
      <TabsList className="mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        <TabsTrigger value="analytics">GA4</TabsTrigger>
      </TabsList>

      {/* ── Overview ── */}
      <TabsContent value="overview">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-4 w-4" />}
            title="Total Users"
            value={stats.users.total}
            sub={`+${stats.users.today} today · +${stats.users.thisWeek} this week`}
          />
          <StatCard
            icon={<DollarSign className="h-4 w-4" />}
            title="MRR"
            value={`$${stats.revenue.mrr.toFixed(2)}`}
            sub={`${stats.revenue.activeSubscriptions} active subs`}
          />
          <StatCard
            icon={<Newspaper className="h-4 w-4" />}
            title="Articles"
            value={stats.content.totalArticles}
            sub={`${stats.content.translatedArticles} translated`}
          />
          <StatCard
            icon={<Heart className="h-4 w-4" />}
            title="Follows"
            value={stats.content.totalFollows}
            sub="Total idol/group follows"
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Plan Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <PlanBar
                  label="Free"
                  count={stats.users.planDistribution.free}
                  total={stats.users.total}
                  color="bg-gray-400"
                />
                <PlanBar
                  label="Pro"
                  count={stats.users.planDistribution.pro}
                  total={stats.users.total}
                  color="bg-purple-500"
                />
                <PlanBar
                  label="Premium"
                  count={stats.users.planDistribution.premium}
                  total={stats.users.total}
                  color="bg-amber-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active subs</span>
                  <span className="font-medium">
                    {stats.revenue.activeSubscriptions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Canceling</span>
                  <span className="font-medium text-amber-600">
                    {stats.revenue.cancelingSubscriptions}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">MRR</span>
                  <span className="text-lg font-bold">
                    ${stats.revenue.mrr.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ARR</span>
                  <span className="font-medium">
                    ${(stats.revenue.mrr * 12).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <QuickLink
                href="https://polar.sh/k-poppulsereveai"
                label="Polar Dashboard"
              />
              <QuickLink
                href="https://supabase.com/dashboard/project/shgmarjifhvwgojduwzn"
                label="Supabase Dashboard"
              />
              <QuickLink
                href={`https://analytics.google.com/analytics/web/#/p${GA_PROPERTY_ID.replace("G-", "")}/reports`}
                label="Google Analytics"
              />
              <QuickLink
                href="https://dash.cloudflare.com"
                label="Cloudflare Dashboard"
              />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* ── Members ── */}
      <TabsContent value="members">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {membersTotal} members
          </span>
          <div className="ml-auto flex gap-1">
            {["all", "free", "pro", "premium"].map((p) => (
              <Button
                key={p}
                size="sm"
                variant={planFilter === p ? "default" : "outline"}
                onClick={() => {
                  setPlanFilter(p);
                  setMembersPage(1);
                }}
                className="text-xs capitalize"
              >
                {p}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                  Plan
                </th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                  Follows
                </th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium truncate max-w-[200px]">
                        {m.display_name ?? m.email}
                      </p>
                      {m.display_name && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {m.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {planBadge(m.plan)}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {m.followCount}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {membersTotalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={membersPage <= 1}
              onClick={() => setMembersPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {membersPage} / {membersTotalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={membersPage >= membersTotalPages}
              onClick={() => setMembersPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TabsContent>

      {/* ── Subscriptions ── */}
      <TabsContent value="subscriptions">
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Plan</th>
                <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                  Period End
                </th>
                <th className="px-4 py-3 text-left font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-[180px]">
                      {s.profile?.display_name ?? s.profile?.email ?? s.user_id.slice(0, 8)}
                    </p>
                  </td>
                  <td className="px-4 py-3">{planBadge(s.plan)}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {statusBadge(s.status, s.cancel_at_period_end)}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {s.current_period_end
                      ? new Date(s.current_period_end).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(s.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No paid subscriptions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TabsContent>

      {/* ── GA4 Analytics ── */}
      <TabsContent value="analytics">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Google Analytics (GA4)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Property ID: <code className="rounded bg-muted px-1.5 py-0.5">{GA_PROPERTY_ID}</code>
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <QuickLink
                  href={`https://analytics.google.com/analytics/web/#/p${GA_PROPERTY_ID.replace("G-", "")}/reports/reportinghub`}
                  label="Reports Overview"
                />
                <QuickLink
                  href={`https://analytics.google.com/analytics/web/#/p${GA_PROPERTY_ID.replace("G-", "")}/reports/dashboard?params=_u..nav%3Dmaui`}
                  label="Real-time"
                />
                <QuickLink
                  href={`https://analytics.google.com/analytics/web/#/p${GA_PROPERTY_ID.replace("G-", "")}/reports/explorer?params=_u..nav%3Dmaui%26_r.explorerCard..selmet%3D%5B%22activeUsers%22%5D%26_r.explorerCard..seldim%3D%5B%22country%22%5D`}
                  label="Users by Country"
                />
                <QuickLink
                  href={`https://analytics.google.com/analytics/web/#/p${GA_PROPERTY_ID.replace("G-", "")}/reports/explorer?params=_u..nav%3Dmaui%26_r.explorerCard..selmet%3D%5B%22screenPageViews%22%5D%26_r.explorerCard..seldim%3D%5B%22unifiedPagePathScreen%22%5D`}
                  label="Top Pages"
                />
              </div>

              <div className="rounded-lg border bg-muted/30 p-6 text-center">
                <TrendingUp className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  GA4 data is available in the Google Analytics dashboard.
                  <br />
                  Data will start appearing within 24-48 hours after the first
                  visit.
                </p>
                <Button className="mt-4" asChild>
                  <a
                    href={`https://analytics.google.com/analytics/web/#/p${GA_PROPERTY_ID.replace("G-", "")}/reports/reportinghub`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Google Analytics
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

// ── Sub-components ──

const StatCard = ({
  icon,
  title,
  value,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  sub: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <span className="text-muted-foreground">{icon}</span>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </CardContent>
  </Card>
);

const PlanBar = ({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {count} ({pct.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${Math.max(pct, 1)}%` }}
        />
      </div>
    </div>
  );
};

const QuickLink = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
  >
    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
    {label}
  </a>
);
