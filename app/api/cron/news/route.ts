import { NextRequest, NextResponse } from "next/server";
import { POST as collectHandler } from "@/app/api/pipeline/collect/route";
import { POST as translateHandler } from "@/app/api/pipeline/translate/route";
import { GET as digestHandler } from "@/app/api/cron/daily-digest/route";
import { GET as roundupHandler } from "@/app/api/cron/weekly-roundup/route";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const errors: string[] = [];
  let collectResult = null;
  let translateResult = null;

  // Step 1: Collect articles (direct function call, no HTTP self-fetch)
  try {
    const collectReq = new NextRequest("http://internal/api/pipeline/collect", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
    });
    const collectRes = await collectHandler(collectReq);
    collectResult = await collectRes.json();
    if (collectRes.status !== 200) errors.push(`Collect failed: ${JSON.stringify(collectResult)}`);
  } catch (e: any) {
    errors.push(`Collect error: ${e.message}`);
  }

  // Step 2: Translate (single batch of 10)
  try {
    const translateReq = new NextRequest("http://internal/api/pipeline/translate?limit=10", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
    });
    const translateRes = await translateHandler(translateReq);
    translateResult = await translateRes.json();
    if (translateRes.status !== 200) errors.push(`Translate: ${JSON.stringify(translateResult)}`);
  } catch (e: any) {
    errors.push(`Translate error: ${e.message}`);
  }

  // Daily Digest: run once per day at ~09:00 UTC (cron runs every 15min)
  const hour = new Date().getUTCHours();
  const minute = new Date().getUTCMinutes();
  const dayOfWeek = new Date().getUTCDay(); // 0=Sun, 1=Mon
  let digestResult = null;
  if (hour === 9 && minute < 15) {
    try {
      const digestReq = new NextRequest("http://internal/api/cron/daily-digest", {
        headers: { authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
      });
      const digestRes = await digestHandler(digestReq);
      digestResult = await digestRes.json();
      if (digestRes.status !== 200) errors.push(`Digest failed: ${JSON.stringify(digestResult)}`);
    } catch (e: any) {
      errors.push(`Digest error: ${e.message}`);
    }
  }

  // Weekly Roundup: run on Monday at ~10:00 UTC
  let roundupResult = null;
  if (dayOfWeek === 1 && hour === 10 && minute < 15) {
    try {
      const roundupReq = new NextRequest("http://internal/api/cron/weekly-roundup", {
        headers: { authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
      });
      const roundupRes = await roundupHandler(roundupReq);
      roundupResult = await roundupRes.json();
      if (roundupRes.status !== 200) errors.push(`Roundup failed: ${JSON.stringify(roundupResult)}`);
    } catch (e: any) {
      errors.push(`Roundup error: ${e.message}`);
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    collect: collectResult,
    translate: translateResult,
    digest: digestResult,
    roundup: roundupResult,
    errors: errors.slice(0, 10),
    timestamp: new Date().toISOString(),
  });
}
