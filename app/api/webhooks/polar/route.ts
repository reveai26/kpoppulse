import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const PRO_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID;
const PREMIUM_PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_PREMIUM_PRODUCT_ID;

function resolvePlan(productId: string | undefined): "pro" | "premium" | "free" {
  if (productId === PRO_PRODUCT_ID) return "pro";
  if (productId === PREMIUM_PRODUCT_ID) return "premium";
  return "free";
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let event: ReturnType<typeof validateEvent>;
  try {
    event = validateEvent(body, headers, process.env.POLAR_WEBHOOK_SECRET!);
  } catch (e) {
    if (e instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  switch (event.type) {
    case "subscription.created":
    case "subscription.updated": {
      const sub = event.data;
      const userId = sub.metadata?.userId as string | undefined;
      const customerId = sub.customerId;
      const productId = sub.product?.id ?? sub.productId;
      const plan = resolvePlan(productId);

      // subscription.canceled sets cancel_at_period_end but status stays active
      const isCanceled = sub.cancelAtPeriodEnd === true;
      const status = sub.status === "active" ? "active" : (sub.status as string);

      if (!userId && !customerId) break;

      const upsertData: Record<string, unknown> = {
        polar_subscription_id: sub.id,
        polar_customer_id: customerId,
        plan,
        status,
        current_period_start: sub.currentPeriodStart,
        current_period_end: sub.currentPeriodEnd,
        cancel_at_period_end: isCanceled,
        updated_at: new Date().toISOString(),
      };

      if (userId) {
        upsertData.user_id = userId;
        await serviceClient
          .from("subscriptions")
          .upsert(upsertData, { onConflict: "user_id" });

        await serviceClient
          .from("profiles")
          .update({ plan })
          .eq("id", userId);
      } else {
        // Fallback: find user by polar_customer_id
        const { data: existing } = await serviceClient
          .from("subscriptions")
          .select("user_id")
          .eq("polar_customer_id", customerId)
          .maybeSingle();

        if (existing) {
          upsertData.user_id = existing.user_id;
          await serviceClient
            .from("subscriptions")
            .upsert(upsertData, { onConflict: "user_id" });

          await serviceClient
            .from("profiles")
            .update({ plan })
            .eq("id", existing.user_id);
        }
      }
      break;
    }

    case "subscription.canceled": {
      const sub = event.data;
      const { data: existing } = await serviceClient
        .from("subscriptions")
        .select("user_id")
        .eq("polar_subscription_id", sub.id)
        .maybeSingle();

      if (existing) {
        await serviceClient
          .from("subscriptions")
          .update({
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", existing.user_id);
      }
      break;
    }

    case "subscription.revoked": {
      const sub = event.data;
      const { data: existing } = await serviceClient
        .from("subscriptions")
        .select("user_id")
        .eq("polar_subscription_id", sub.id)
        .maybeSingle();

      if (existing) {
        await serviceClient
          .from("subscriptions")
          .update({
            plan: "free",
            status: "revoked",
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", existing.user_id);

        await serviceClient
          .from("profiles")
          .update({ plan: "free" })
          .eq("id", existing.user_id);
      }
      break;
    }

    case "order.refunded": {
      const order = event.data;
      const subscriptionId = order.subscriptionId;
      if (!subscriptionId) break;

      const { data: existing } = await serviceClient
        .from("subscriptions")
        .select("user_id")
        .eq("polar_subscription_id", subscriptionId)
        .maybeSingle();

      if (existing) {
        await serviceClient
          .from("subscriptions")
          .update({
            plan: "free",
            status: "revoked",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", existing.user_id);

        await serviceClient
          .from("profiles")
          .update({ plan: "free" })
          .eq("id", existing.user_id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
