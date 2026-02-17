"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Globe, Mail, CreditCard, Loader2, Check } from "lucide-react";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Profile } from "@/types";

type SettingsFormProps = {
  user: SupabaseUser;
  profile: Profile | null;
  plan: string;
  planName: string;
};

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ko", label: "한국어 (Korean)" },
  { value: "ja", label: "日本語 (Japanese)" },
  { value: "zh", label: "中文 (Chinese)" },
  { value: "es", label: "Español (Spanish)" },
];

export const SettingsForm = ({ user, profile, plan, planName }: SettingsFormProps) => {
  const [language, setLanguage] = useState(profile?.preferred_language ?? "en");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_language: language }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const avatarUrl = user.user_metadata?.avatar_url;
  const displayName = user.user_metadata?.full_name ?? user.email;

  return (
    <div className="space-y-6">
      {/* Profile */}
      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
          <User className="h-4 w-4" />
          Profile
        </h2>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-14 w-14 rounded-full" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
              {(displayName ?? "U")[0]}
            </div>
          )}
          <div>
            <p className="font-medium">{displayName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </Card>

      {/* Subscription */}
      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
          <CreditCard className="h-4 w-4" />
          Subscription
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Current Plan</p>
            <Badge className="mt-1">{planName}</Badge>
          </div>
          <Link href="/billing">
            <Button variant="outline" size="sm">
              {plan === "free" ? "Upgrade" : "Manage"}
            </Button>
          </Link>
        </div>
      </Card>

      {/* Language */}
      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
          <Globe className="h-4 w-4" />
          Language
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Preferred Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="mt-1 w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Multi-language translations coming soon (Premium feature)
            </p>
          </div>
        </div>
      </Card>

      {/* Email Digest */}
      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
          <Mail className="h-4 w-4" />
          Daily Digest Email
        </h2>
        {plan === "free" ? (
          <div className="text-sm text-muted-foreground">
            <p>Daily digest emails are available on the Pro plan and above.</p>
            <p className="mt-1">Get a daily email summary of news about your followed idols.</p>
            <Link href="/billing">
              <Button size="sm" className="mt-3">Upgrade to Pro</Button>
            </Link>
          </div>
        ) : (
          <div className="text-sm">
            <p className="text-green-600 dark:text-green-400 font-medium">
              Daily digest is active for your {planName} plan.
            </p>
            <p className="text-muted-foreground mt-1">
              You&apos;ll receive a daily email at 6:00 PM KST (9:00 AM UTC) with news about your followed artists.
            </p>
          </div>
        )}
      </Card>

      <Separator />

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
          ) : saved ? (
            <><Check className="mr-2 h-4 w-4" />Saved!</>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
};
