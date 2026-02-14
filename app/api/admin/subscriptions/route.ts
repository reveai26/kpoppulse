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

  const { data: subscriptions } = await sc
    .from("subscriptions")
    .select("*")
    .neq("plan", "free")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ subscriptions: [] });
  }

  // Get user emails
  const userIds = subscriptions.map(
    (s: { user_id: string }) => s.user_id,
  );
  const { data: profiles } = await sc
    .from("profiles")
    .select("id, email, display_name")
    .in("id", userIds);

  const profileMap = new Map(
    profiles?.map((p: { id: string }) => [p.id, p]) ?? [],
  );

  const enriched = subscriptions.map(
    (s: { user_id: string }) => ({
      ...s,
      profile: profileMap.get(s.user_id) ?? null,
    }),
  );

  return NextResponse.json({ subscriptions: enriched });
}
