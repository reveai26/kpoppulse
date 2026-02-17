import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/constants";
import { SettingsForm } from "@/components/settings-form";
import { Settings } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your KpopPulse preferences",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan ?? "free") as keyof typeof PLANS;
  const planInfo = PLANS[plan];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">Settings</h1>
      </div>

      <SettingsForm
        user={user}
        profile={profile}
        plan={plan}
        planName={planInfo.name}
      />
    </div>
  );
}
