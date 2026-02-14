import { createClient, createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !SUPER_ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sc = createServiceClient();
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString();
  const weekAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [
    { count: totalUsers },
    { count: todayUsers },
    { count: weekUsers },
    { data: planCounts },
    { data: subscriptions },
    { count: totalArticles },
    { count: translatedArticles },
    { count: totalFollows },
  ] = await Promise.all([
    sc.from("profiles").select("*", { count: "exact", head: true }),
    sc
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart),
    sc
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    sc.from("profiles").select("plan"),
    sc
      .from("subscriptions")
      .select("plan, status, cancel_at_period_end, current_period_end")
      .neq("plan", "free"),
    sc.from("articles").select("*", { count: "exact", head: true }),
    sc
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("is_translated", true),
    sc.from("follows").select("*", { count: "exact", head: true }),
  ]);

  // Plan distribution
  const planDistribution = { free: 0, pro: 0, premium: 0 };
  planCounts?.forEach((p: { plan: string }) => {
    const key = p.plan as keyof typeof planDistribution;
    if (key in planDistribution) planDistribution[key]++;
  });

  // MRR calculation
  const activeSubs = subscriptions?.filter(
    (s: { status: string }) => s.status === "active",
  );
  const mrr =
    activeSubs?.reduce((sum: number, s: { plan: string }) => {
      if (s.plan === "pro") return sum + 4.99;
      if (s.plan === "premium") return sum + 9.99;
      return sum;
    }, 0) ?? 0;

  const cancelingSubs =
    subscriptions?.filter(
      (s: { cancel_at_period_end: boolean }) => s.cancel_at_period_end,
    ).length ?? 0;

  return NextResponse.json({
    users: {
      total: totalUsers ?? 0,
      today: todayUsers ?? 0,
      thisWeek: weekUsers ?? 0,
      planDistribution,
    },
    revenue: {
      mrr: Math.round(mrr * 100) / 100,
      activeSubscriptions: activeSubs?.length ?? 0,
      cancelingSubscriptions: cancelingSubs,
    },
    content: {
      totalArticles: totalArticles ?? 0,
      translatedArticles: translatedArticles ?? 0,
      totalFollows: totalFollows ?? 0,
    },
  });
}
