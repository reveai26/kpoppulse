import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: check if an article is bookmarked
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ bookmarked: false });

  const articleId = new URL(request.url).searchParams.get("article_id");
  if (!articleId) return NextResponse.json({ bookmarked: false });

  const { data } = await supabase
    .from("bookmarks")
    .select("article_id")
    .eq("user_id", user.id)
    .eq("article_id", articleId)
    .maybeSingle();

  return NextResponse.json({ bookmarked: !!data });
}

// POST: bookmark an article
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { article_id } = await request.json();
  if (!article_id) return NextResponse.json({ error: "article_id required" }, { status: 400 });

  const { error } = await supabase
    .from("bookmarks")
    .insert({ user_id: user.id, article_id });

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Already bookmarked" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE: remove bookmark
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articleId = new URL(request.url).searchParams.get("article_id");
  if (!articleId) return NextResponse.json({ error: "article_id required" }, { status: 400 });

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("article_id", articleId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
