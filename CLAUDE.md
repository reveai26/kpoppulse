# KpopPulse

> Real-time AI-translated K-pop news, personalized by your favorite idols.

## Project Info

| Item | Value |
|------|-------|
| Path | `D:\claude\reveaiteam\kpoppulse` |
| Framework | Next.js 16 (App Router) |
| UI | shadcn/ui + Tailwind CSS v4 + next-themes (dark mode) |
| Backend | Supabase (Seoul - shgmarjifhvwgojduwzn) |
| AI | Cloudflare Workers AI (llama-3.1-8b-instruct) |
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

## Route Structure

### Public
- `/` — Main news feed (THE service page, NOT landing)
- `/trending` — Trending idols & groups (no competitive ranking)
- `/groups` — All groups list
- `/idols` — All idols list
- `/group/[slug]` — Group profile + members
- `/idol/[slug]` — Idol profile + member-level news
- `/article/[id]` — Article detail page
- `/search?q=` — Search results
- `/login` — Google OAuth

### Auth Required (Phase 2)
- `/my-feed` — Personalized feed (followed idols)
- `/my-idols` — My idols dashboard
- `/bookmarks` — Saved articles
- `/settings` — User preferences
- `/billing` — Subscription management

### API
- `/auth/callback` — OAuth callback
- `/api/pipeline/collect` — News collection (Google News RSS)
- `/api/pipeline/translate` — AI translation (Workers AI)
- `/api/pipeline/status` — Pipeline statistics
- `/api/cron/news` — Automated news pipeline (cron trigger)

---

## Database (12 tables)

sources, groups, idols, articles, translations,
article_idols, article_groups, profiles, follows,
bookmarks, subscriptions

Seed data: 15 news sources, 40+ groups, 90+ idols

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
| Cron | `*/15 * * * *` (15분마다 뉴스 수집+번역) |

### Worker Secrets (설정 완료)
- `SUPABASE_SERVICE_ROLE_KEY` — ✅

### GitHub Actions Secrets (Reve 설정 필요)
- `CLOUDFLARE_API_TOKEN` — ❌ 미설정

---

## Technical Notes

### Turbopack 비호환 (치명적)
- Next.js 16 기본 번들러인 Turbopack은 `@opennextjs/cloudflare`와 호환 안 됨
- 반드시 `next build --webpack` 플래그 사용
- package.json: `"build": "next build --webpack"`

### Workers AI 사용 (OpenAI 대체)
- OpenAI API는 Cloudflare Workers edge에서 403 (지역 차단)
- Workers AI binding (`[ai]` in wrangler.toml)으로 대체
- 모델: `@cf/meta/llama-3.1-8b-instruct`

### Dark Mode
- `next-themes` + ThemeProvider로 구현
- globals.css에 `.dark` 변수 (보라/마젠타 primary 유지)
- 헤더에 Sun/Moon 토글 버튼

### Ranking → Trending 전환 (K-pop 문화 고려)
- K-pop 팬덤에서 아이돌 순위는 극심한 팬전쟁 유발
- "Rankings" 대신 "Trending" 사용 (중립적 프레이밍)
- 순위 번호/뱃지 완전 제거
- Crown 아이콘 → Flame/TrendingUp 아이콘

---

## Progress

### ✅ Phase 1 완료 (2026-02-14)
- [x] Supabase 프로젝트 생성 (Seoul, shgmarjifhvwgojduwzn)
- [x] DB 스키마 (12 테이블) + seed data (15 sources, 40+ groups, 90+ idols)
- [x] 전체 공개 라우트 구현
- [x] News pipeline API routes (collect + translate via Workers AI)
- [x] shadcn/ui 컴포넌트 (ArticleCard, IdolCard, GroupCard 등)
- [x] Cloudflare Workers 배포 성공
- [x] GitHub repo + CI/CD workflow
- [x] 29개 기사 수집 + 번역 완료

### ✅ QA + UX/UI 개선 (2026-02-14)
- [x] QA 전수조사 (보안, 타입, SEO, 빈 페이지 등 22개 이슈 수정)
- [x] Rankings → Trending 전면 교체 (팬덤 갈등 방지)
- [x] 카드 컴포넌트 rank 뱃지 완전 제거
- [x] 다크모드 (next-themes ThemeProvider)
- [x] 헤더: 활성 페이지 표시, Sheet 모바일 메뉴, 다크모드 토글
- [x] 푸터 추가
- [x] 모바일: 수평 스크롤 카드 (아이돌/그룹)
- [x] 기사 카드: 제목 크기↑, 서머리 3줄, K-pop 감성 태그 색상
- [x] 디테일 페이지: 모바일 세로 정렬, Follow 버튼 disabled
- [x] globals.css: 중복 규칙 제거, 다크모드 primary 보라색 유지
- [x] Cron job: 15분마다 자동 수집+번역 (`/api/cron/news`)

### 🔲 Phase 2 (다음 작업)
- [ ] Auth 관련 페이지: /my-feed, /my-idols, /bookmarks, /settings, /billing
- [ ] Follow/unfollow API routes
- [ ] Polar 상품 생성 (Pro $4.99/mo, Premium $9.99/mo)
- [ ] 커스텀 도메인 연결 (kpoppulse.com)
- [ ] Google OAuth 설정

---

## Key Design Decisions

1. Main page (`/`) is the actual service (news feed), NOT a landing page
2. "Trending" instead of "Rankings" to avoid fandom toxicity
3. No rank numbers/badges anywhere — all idols shown equally
4. Member-level filtering: group page → click member → member's news only
5. "My Idols" dashboard for managing followed artists
6. Follow system works for both groups AND individual members
7. Dark mode with K-pop-appropriate purple/magenta primary colors
