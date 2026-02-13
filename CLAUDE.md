# KpopPulse

> Real-time AI-translated K-pop news, personalized by your favorite idols.

## Project Info

| Item | Value |
|------|-------|
| Path | `D:\claude\reveaiteam\kpoppulse` |
| Framework | Next.js 16 (App Router) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Backend | Supabase (Seoul - shgmarjifhvwgojduwzn) |
| AI | OpenAI GPT-4o-mini (translation) |
| Deploy | Cloudflare Workers (`@opennextjs/cloudflare`) |
| Target | Global (English first, multi-language later) |
| Team | 4 Team |

---

## Accounts

| Service | ID |
|---------|-----|
| Super Admin | aireve26@gmail.com |
| Supabase | shgmarjifhvwgojduwzn (Seoul) |
| Cloudflare Account | 81b3a0fbbf813fee5eaa92dd6f51bfc1 |
| Polar Org | 0ccf1684-f42a-463f-8ff0-1bd51bae3ce6 (reveai com.) |

---

## Pricing

| Plan | Price | Daily Reads | Max Follows |
|------|-------|------------|-------------|
| Free | $0 | 20 | 3 |
| Pro | $4.99/mo | 200 | 20 |
| Premium | $9.99/mo | Unlimited | Unlimited |

---

## Route Structure (10 routes)

### Public
- `/` — Main news feed (THE service page, NOT landing)
- `/rankings` — Idol & group popularity rankings
- `/groups` — All groups list
- `/idols` — All idols list
- `/group/[slug]` — Group profile + members
- `/idol/[slug]` — Idol profile + member-level news
- `/search?q=` — Search results
- `/login` — Google OAuth

### Auth Required
- `/my-feed` — Personalized feed (followed idols)
- `/my-idols` — My idols dashboard
- `/bookmarks` — Saved articles
- `/settings` — User preferences
- `/billing` — Subscription management

### API
- `/auth/callback` — OAuth callback

---

## Database (12 tables)

sources, groups, idols, articles, translations,
article_idols, article_groups, profiles, follows,
bookmarks, subscriptions

Seed data: 15 news sources, 40+ groups, 90+ idols (popularity ranked)

---

## Key Design Decisions

1. Main page (`/`) is the actual service (news feed), NOT a landing page
2. Idols displayed by popularity ranking (popularity_score)
3. Member-level filtering: group page → click member → member's news only
4. "My Idols" dashboard for managing followed artists
5. Follow system works for both groups AND individual members
