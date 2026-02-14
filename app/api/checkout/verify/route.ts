import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getPolar } from "@/lib/polar";
import { NextRequest, NextResponse } from "next/server";

const PRO_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID;
const PREMIUM_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_PREMIUM_PRODUCT_ID;

function resolvePlan(productId: string): "pro" | "premium" | "free" {
  if (productId === PRO_PRODUCT_ID) return "pro";
  if (productId === PREMIUM_PRODUCT_ID) return "premium";
  return "free";
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { checkoutId } = await request.json();
  if (!checkoutId) {
    return NextResponse.json(
      { error: "checkoutId is required" },
      { status: 400 },
    );
  }

  const checkout = await getPolar().checkouts.get({ id: checkoutId });
  if (checkout.status !== "succeeded") {
    return NextResponse.json(
      { error: "Checkout not completed", status: checkout.status },
      { status: 400 },
    );
  }

  const userId = checkout.metadata?.userId as string;
  if (userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const productId = checkout.products?.[0]?.id ?? checkout.productId;
  const plan = resolvePlan(productId ?? "");

  const serviceClient = createServiceClient();

  // Upsert subscription
  await serviceClient.from("subscriptions").upsert(
    {
      user_id: user.id,
      polar_subscription_id: checkout.subscriptionId ?? null,
      polar_customer_id: checkout.customerId ?? null,
      plan,
      status: "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  // Sync profiles.plan
  await serviceClient
    .from("profiles")
    .update({ plan })
    .eq("id", user.id);

  return NextResponse.json({ success: true, plan });
}
