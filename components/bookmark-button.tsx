"use client";

import { Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type BookmarkButtonProps = {
  articleId: string;
};

export const BookmarkButton = ({ articleId }: BookmarkButtonProps) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkStatus();
  }, [articleId]);

  const checkStatus = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    try {
      const res = await fetch(`/api/bookmarks?article_id=${articleId}`);
      const data = await res.json();
      setBookmarked(data.bookmarked);
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
      if (bookmarked) {
        await fetch(`/api/bookmarks?article_id=${articleId}`, { method: "DELETE" });
        setBookmarked(false);
      } else {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ article_id: articleId }),
        });
        if (res.ok) setBookmarked(true);
      }
    } catch {}
    setToggling(false);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleToggle}
      disabled={loading || toggling}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
    >
      {toggling ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current text-primary" : ""}`} />
      )}
    </Button>
  );
};
