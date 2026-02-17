import { Resend } from "resend";

// Lazy init — Cloudflare Workers 환경변수 제약
let _resend: Resend | null = null;

function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return _resend;
}

type DigestArticle = {
  title: string;
  summary: string;
  url: string;
};

type DigestSection = {
  name: string;
  articles: DigestArticle[];
};

export async function sendDailyDigest(
  to: string,
  sections: DigestSection[],
  date: string,
) {
  const totalArticles = sections.reduce((sum, s) => sum + s.articles.length, 0);

  const sectionsHtml = sections
    .map(
      (section) => `
      <div style="margin-bottom:24px">
        <h2 style="font-size:18px;color:#a855f7;margin:0 0 12px">${section.name}</h2>
        ${section.articles
          .map(
            (a) => `
          <div style="margin-bottom:16px;padding:12px;background:#f9fafb;border-radius:8px">
            <a href="${a.url}" style="font-size:15px;color:#1f2937;text-decoration:none;font-weight:600">${a.title}</a>
            <p style="font-size:13px;color:#6b7280;margin:6px 0 0;line-height:1.5">${a.summary}</p>
          </div>`,
          )
          .join("")}
      </div>`,
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1f2937">
  <div style="text-align:center;margin-bottom:24px">
    <h1 style="font-size:24px;margin:0">
      <span style="color:#a855f7">Kpop</span><span>Pulse</span>
    </h1>
    <p style="color:#6b7280;font-size:14px;margin:4px 0 0">Your Daily K-pop Digest &mdash; ${date}</p>
  </div>
  <p style="font-size:14px;color:#6b7280;margin-bottom:20px">${totalArticles} new articles about your followed artists</p>
  ${sectionsHtml}
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
  <p style="font-size:12px;color:#9ca3af;text-align:center">
    You're receiving this because you subscribed to KpopPulse Daily Digest.<br>
    <a href="https://kpoppulse.app/settings" style="color:#a855f7">Manage preferences</a>
    &middot;
    <a href="https://kpoppulse.app/billing" style="color:#a855f7">Manage subscription</a>
  </p>
</body>
</html>`;

  return getResend().emails.send({
    from: "KpopPulse <digest@kpoppulse.app>",
    to,
    subject: `Your Daily K-pop Digest — ${date}`,
    html,
  });
}
