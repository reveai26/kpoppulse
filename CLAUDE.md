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

## Deployment

| Item | Value |
|------|-------|
| Worker Name | `kpoppulse` |
| Worker URL | `https://kpoppulse.aireve26.workers.dev` |
| Custom Domain | `kpoppulse.com` (미연결 — Reve가 Cloudflare에 zone 추가 필요) |
| GitHub Repo | `reveai26/kpoppulse` (master branch) |
| CI/CD | GitHub Actions (`.github/workflows/deploy.yml`) |
| Build | `next build --webpack` → `npx @opennextjs/cloudflare build` |

### Worker Secrets (설정 완료)
- `SUPABASE_SERVICE_ROLE_KEY` — ✅
- `OPENAI_API_KEY` — ✅

### GitHub Actions Secrets (Reve 설정 필요)
- `CLOUDFLARE_API_TOKEN` — ❌ 미설정

---

## Technical Notes

### Turbopack 비호환 (치명적)
- Next.js 16 기본 번들러인 Turbopack은 `@opennextjs/cloudflare`와 호환 안 됨
- 반드시 `next build --webpack` 플래그 사용
- package.json: `"build": "next build --webpack"`
- 참고: https://github.com/opennextjs/opennextjs-cloudflare/issues/569

---

## Progress

### ✅ Phase 1 완료 (2026-02-14)
- [x] Supabase 프로젝트 생성 (Seoul, shgmarjifhvwgojduwzn)
- [x] DB 스키마 (12 테이블) + seed data (15 sources, 40+ groups, 90+ idols)
- [x] 전체 공개 라우트 구현 (/, /rankings, /groups, /idols, /group/[slug], /idol/[slug], /search, /login)
- [x] News pipeline API routes (collect + translate)
- [x] shadcn/ui 컴포넌트 (ArticleCard, IdolCard, GroupCard, SearchBar 등)
- [x] Cloudflare Workers 배포 성공 (kpoppulse.aireve26.workers.dev)
- [x] GitHub repo + CI/CD workflow

### 🔲 Phase 2 (다음 작업)
- [ ] News pipeline 실가동 테스트 (collect → translate → display)
- [ ] Auth 관련 페이지: /my-feed, /my-idols, /bookmarks, /settings, /billing
- [ ] Follow/unfollow API routes
- [ ] Polar 상품 생성 (Pro $4.99/mo, Premium $9.99/mo)
- [ ] 자동 뉴스 수집 cron job 설정
- [ ] 커스텀 도메인 연결 (kpoppulse.com)
- [ ] Google OAuth 설정

---

## Key Design Decisions

1. Main page (`/`) is the actual service (news feed), NOT a landing page
2. Idols displayed by popularity ranking (popularity_score)
3. Member-level filtering: group page → click member → member's news only
4. "My Idols" dashboard for managing followed artists
5. Follow system works for both groups AND individual members
