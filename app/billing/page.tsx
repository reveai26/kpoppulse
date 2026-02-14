import type { Metadata } from "next";
import { BillingCards } from "@/components/billing-cards";

export const metadata: Metadata = {
  title: "Billing & Plans",
  description: "Manage your KpopPulse subscription and billing",
};

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Plans & Billing</h1>
      <p className="mb-8 text-muted-foreground">
        Choose the plan that fits your K-pop fandom
      </p>
      <BillingCards />
    </div>
  );
}
