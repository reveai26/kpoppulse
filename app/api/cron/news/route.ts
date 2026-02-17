import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use the public URL to avoid self-referencing subrequest issues on Workers
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const headers: Record<string, string> = {
    authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    "content-type": "application/json",
  };
  const errors: string[] = [];
  let collectResult = null;
  let translateResult = null;

  // Step 1: Collect articles from RSS feeds
  try {
    const collectRes = await fetch(`${baseUrl}/api/pipeline/collect`, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(25000),
    });
    collectResult = await collectRes.json();
    if (!collectRes.ok) errors.push(`Collect failed: ${JSON.stringify(collectResult)}`);
  } catch (e: any) {
    errors.push(`Collect error: ${e.message}`);
  }

  // Step 2: Translate (single batch to stay within time limits)
  try {
    const translateRes = await fetch(`${baseUrl}/api/pipeline/translate?limit=10`, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(25000),
    });
    translateResult = await translateRes.json();
    if (!translateRes.ok) errors.push(`Translate: ${JSON.stringify(translateResult)}`);
  } catch (e: any) {
    errors.push(`Translate error: ${e.message}`);
  }

  // Daily Digest: run once per day at ~09:00 UTC (cron runs every 15min)
  const hour = new Date().getUTCHours();
  const minute = new Date().getUTCMinutes();
  let digestResult = null;
  if (hour === 9 && minute < 15) {
    try {
      const digestRes = await fetch(`${baseUrl}/api/cron/daily-digest`, {
        headers,
        signal: AbortSignal.timeout(25000),
      });
      digestResult = await digestRes.json();
      if (!digestRes.ok) errors.push(`Digest failed: ${JSON.stringify(digestResult)}`);
    } catch (e: any) {
      errors.push(`Digest error: ${e.message}`);
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    collect: collectResult,
    translate: translateResult,
    digest: digestResult,
    errors: errors.slice(0, 10),
    timestamp: new Date().toISOString(),
  });
}
