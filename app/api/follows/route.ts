import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

// GET: check if current user follows a specific idol or group
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ following: false });

  const { searchParams } = new URL(request.url);
  const idolId = searchParams.get("idol_id");
  const groupId = searchParams.get("group_id");

  if (!idolId && !groupId) {
    return NextResponse.json({ following: false });
  }

  let query = supabase.from("follows").select("id").eq("user_id", user.id);
  if (idolId) query = query.eq("idol_id", idolId);
  if (groupId) query = query.eq("group_id", groupId);

  const { data } = await query.maybeSingle();
  return NextResponse.json({ following: !!data, followId: data?.id ?? null });
}

// POST: follow an idol or group
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { idol_id, group_id } = body;

  if (!idol_id && !group_id) {
    return NextResponse.json({ error: "idol_id or group_id required" }, { status: 400 });
  }

  // Check plan-based follow limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan ?? "free") as keyof typeof PLANS;
  const maxFollows = PLANS[plan]?.maxFollows ?? PLANS.free.maxFollows;

  if (maxFollows > 0) {
    const { count } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count ?? 0) >= maxFollows) {
      return NextResponse.json(
        { error: "Follow limit reached. Upgrade your plan for more follows.", limit: maxFollows, plan },
        { status: 403 },
      );
    }
  }

  const { data, error } = await supabase
    .from("follows")
    .insert({ user_id: user.id, idol_id: idol_id ?? null, group_id: group_id ?? null })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already following" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ followId: data.id });
}

// DELETE: unfollow
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const idolId = searchParams.get("idol_id");
  const groupId = searchParams.get("group_id");

  let query = supabase.from("follows").delete().eq("user_id", user.id);
  if (idolId) query = query.eq("idol_id", idolId);
  if (groupId) query = query.eq("group_id", groupId);

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
