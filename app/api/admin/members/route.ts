import { createClient, createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !SUPER_ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const offset = (page - 1) * limit;
  const planFilter = searchParams.get("plan");

  const sc = createServiceClient();

  let query = sc
    .from("profiles")
    .select(
      "id, email, display_name, avatar_url, role, plan, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (planFilter && planFilter !== "all") {
    query = query.eq("plan", planFilter);
  }

  const { data: members, count } = await query;

  // Get follow counts per user
  const userIds = members?.map((m: { id: string }) => m.id) ?? [];
  let followCounts: Record<string, number> = {};

  if (userIds.length > 0) {
    const { data: follows } = await sc
      .from("follows")
      .select("user_id")
      .in("user_id", userIds);

    if (follows) {
      follows.forEach((f: { user_id: string }) => {
        followCounts[f.user_id] = (followCounts[f.user_id] ?? 0) + 1;
      });
    }
  }

  const enriched = members?.map((m: { id: string }) => ({
    ...m,
    followCount: followCounts[m.id] ?? 0,
  }));

  return NextResponse.json({
    members: enriched ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}
