import { createClient } from "@/lib/supabase/server";
import { getPolar } from "@/lib/polar";
import { NextRequest, NextResponse } from "next/server";

const PAYMENTS_ENABLED = true;

export async function POST(request: NextRequest) {
  if (!PAYMENTS_ENABLED) {
    return NextResponse.json(
      { error: "Payments are coming soon! Stay tuned." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await request.json();
  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 },
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://kpoppulse.aireve26.workers.dev";

  const checkout = await getPolar().checkouts.create({
    products: [productId],
    successUrl: `${appUrl}/billing?checkout=success&checkout_id={CHECKOUT_ID}`,
    customerEmail: user.email!,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ checkoutUrl: checkout.url });
}
