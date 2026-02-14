"use client";

import { Heart, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type FollowButtonProps = {
  idolId?: string;
  groupId?: string;
  name: string;
  variant?: "idol" | "group";
};

export const FollowButton = ({ idolId, groupId, name, variant = "idol" }: FollowButtonProps) => {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkFollowStatus();
  }, [idolId, groupId]);

  const checkFollowStatus = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams();
    if (idolId) params.set("idol_id", idolId);
    if (groupId) params.set("group_id", groupId);

    try {
      const res = await fetch(`/api/follows?${params}`);
      const data = await res.json();
      setFollowing(data.following);
    } catch {}
    setLoading(false);
  };

  const handleToggle = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setToggling(true);
    try {
      if (following) {
        const params = new URLSearchParams();
        if (idolId) params.set("idol_id", idolId);
        if (groupId) params.set("group_id", groupId);
        await fetch(`/api/follows?${params}`, { method: "DELETE" });
        setFollowing(false);
      } else {
        const res = await fetch("/api/follows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idol_id: idolId ?? null, group_id: groupId ?? null }),
        });
        if (res.ok) setFollowing(true);
      }
    } catch {}
    setToggling(false);
  };

  const Icon = variant === "idol" ? Heart : UserPlus;

  return (
    <Button
      size="sm"
      variant={following ? "secondary" : "default"}
      className="gap-1"
      onClick={handleToggle}
      disabled={loading || toggling}
    >
      {toggling ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Icon className={`h-3 w-3 ${following ? "fill-current" : ""}`} />
      )}
      {following ? "Following" : `Follow${variant === "group" ? " Group" : ` ${name}`}`}
    </Button>
  );
};
