import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = new URL(request.url).origin;
  const headers = { authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` };
  const errors: string[] = [];

  // Step 1: Collect
  try {
    const collectRes = await fetch(`${baseUrl}/api/pipeline/collect`, {
      method: "POST",
      headers,
    });
    const collectData = await collectRes.json();
    if (!collectRes.ok) errors.push(`Collect failed: ${JSON.stringify(collectData)}`);
  } catch (e: any) {
    errors.push(`Collect error: ${e.message}`);
  }

  // Step 2: Translate (run twice to process more articles)
  for (let batch = 1; batch <= 2; batch++) {
    try {
      const translateRes = await fetch(`${baseUrl}/api/pipeline/translate?limit=10`, {
        method: "POST",
        headers,
      });
      const translateData = await translateRes.json();
      if (!translateRes.ok) errors.push(`Translate batch ${batch}: ${JSON.stringify(translateData)}`);
    } catch (e: any) {
      errors.push(`Translate batch ${batch} error: ${e.message}`);
    }
  }

  // Daily Digest: run once per day at ~09:00 UTC (cron runs every 15min)
  const hour = new Date().getUTCHours();
  const minute = new Date().getUTCMinutes();
  let digestResult = null;
  if (hour === 9 && minute < 15) {
    try {
      const digestRes = await fetch(`${baseUrl}/api/cron/daily-digest`, {
        headers,
      });
      digestResult = await digestRes.json();
      if (!digestRes.ok) errors.push(`Digest failed: ${JSON.stringify(digestResult)}`);
    } catch (e: any) {
      errors.push(`Digest error: ${e.message}`);
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    errors: errors.slice(0, 10),
    digest: digestResult,
    timestamp: new Date().toISOString(),
  });
}
