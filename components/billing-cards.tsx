"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/constants";
import { Check, Loader2, Crown, Sparkles, ExternalLink } from "lucide-react";

type SubscriptionInfo = {
  plan: "free" | "pro" | "premium";
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  polarCustomerId: string | null;
};

const PRODUCT_IDS: Record<string, string | undefined> = {
  pro: process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID,
  premium: process.env.NEXT_PUBLIC_POLAR_PREMIUM_PRODUCT_ID,
};

export const BillingCards = () => {
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/user/subscription");
      if (res.ok) {
        setSubscription(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify checkout on success redirect
  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    const checkoutId = searchParams.get("checkout_id");

    if (checkoutStatus === "success" && checkoutId) {
      setVerifyMessage("Verifying your subscription...");
      fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setVerifyMessage(
              "Subscription activated! Welcome to " +
                (data.plan === "premium" ? "Premium" : "Pro") +
                "!",
            );
            fetchSubscription();
          } else {
            setVerifyMessage("Verification pending. It may take a moment.");
            fetchSubscription();
          }
        })
        .catch(() => {
          setVerifyMessage(
            "Could not verify right now. Your subscription will activate shortly via webhook.",
          );
          fetchSubscription();
        });
    } else {
      fetchSubscription();
    }
  }, [searchParams]);

  const handleCheckout = async (planKey: string) => {
    const productId = PRODUCT_IDS[planKey];
    if (!productId) return;

    setCheckoutLoading(planKey);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } finally {
      setCheckoutLoading(null);
    }
  };

  const currentPlan = subscription?.plan ?? "free";

  const planKeys = ["free", "pro", "premium"] as const;
  const planIcons: Record<string, React.ReactNode> = {
    free: null,
    pro: <Sparkles className="h-5 w-5 text-purple-500" />,
    premium: <Crown className="h-5 w-5 text-amber-500" />,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      {verifyMessage && (
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
          {verifyMessage}
        </div>
      )}

      {subscription?.cancelAtPeriodEnd && (
        <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
          Your {PLANS[currentPlan].name} plan will end on{" "}
          {subscription.currentPeriodEnd
            ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
            : "the end of the billing period"}
          . You&apos;ll then be moved to the Free plan.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {planKeys.map((key) => {
          const plan = PLANS[key];
          const isCurrent = currentPlan === key;
          const isUpgrade =
            planKeys.indexOf(key) > planKeys.indexOf(currentPlan);

          return (
            <Card
              key={key}
              className={`relative ${isCurrent ? "border-primary ring-2 ring-primary/20" : ""}`}
            >
              {isCurrent && (
                <Badge className="absolute -top-3 left-4 bg-primary">
                  Current Plan
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {planIcons[key]}
                  {plan.name}
                </CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    className="w-full"
                    onClick={() => handleCheckout(key)}
                    disabled={!!checkoutLoading}
                  >
                    {checkoutLoading === key ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                ) : (
                  <Button className="w-full" variant="ghost" disabled>
                    &mdash;
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {currentPlan !== "free" && subscription?.polarCustomerId && (
        <div className="mt-8 text-center">
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://polar.sh/k-poppulsereveai/portal"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage Subscription on Polar
            </a>
          </Button>
        </div>
      )}
    </div>
  );
};
