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
| Polar Org | 211a9a89-3b74-4ea8-a084-bc37c93e722d (K-POP_Pulse_reveAI) |
| Polar Pro Product ID | f5152e27-259a-45e9-be43-9be89e1cc87d |
| Polar Premium Product ID | a7e58669-57be-459c-9b82-e2d5877299b9 |
| Google OAuth | Configured in Supabase (see global CLAUDE.md for credentials) |
| GA4 Property | G-FSQ5Y78VKE |
| Resend API Key | re_aeEv7ter_EBQVb6YPLJSwqXV54cvAmh5H |

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
- `/weekly` — Weekly roundup index (all groups)
- `/weekly/[slug]/[date]` — Weekly roundup detail (SEO pages)
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
- `/api/cron/weekly-roundup` — Weekly news roundup generation (Monday 10:00 UTC)

---

## Database (13 tables)

sources, groups, idols, articles, translations,
article_idols, article_groups, profiles, follows,
bookmarks, subscriptions, weekly_roundups

Seed data: 15 news sources, 40+ groups, 90+ idols

---

## Deployment

| Item | Value |
|------|-------|
| Worker Name | `kpoppulse` |
| Worker URL | `https://kpoppulse.aireve26.workers.dev` |
| Custom Domain | `https://kpoppulse.app` (Zone ID: `e7acc3399ff7c08bb3c0a37965c35fe6`) |
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

### ✅ Phase 2 — 결제 시스템 (2026-02-15)
- [x] Polar 조직 생성 (K-POP_Pulse_reveAI)
- [x] Polar 상품 생성 (Pro $4.99/mo, Premium $9.99/mo)
- [x] Polar Webhook 등록
- [x] /api/checkout — Polar checkout 세션 생성
- [x] /api/checkout/verify — Checkout 검증 (webhook 백업)
- [x] /api/webhooks/polar — Webhook 수신 + DB 동기화
- [x] /api/user/subscription — 구독 상태 조회
- [x] /billing — 요금제 페이지 (3 tier 카드)
- [x] 팔로우 제한: 요금제별 적용 (Free 3, Pro 20, Premium 무제한)
- [x] Daily Digest 크론 (/api/cron/daily-digest) — Pro+ 유저에게 일일 뉴스 이메일
- [x] 헤더에 Plans & Billing 메뉴 추가
- [x] lib/polar.ts, lib/email.ts 헬퍼
- [x] Resend 패키지 설치
- [x] Google OAuth 설정 (Supabase Provider + Google Cloud redirect URI)

### ✅ Phase 2 — 추가 작업 (2026-02-15)
- [x] GA4 설정 (G-FSQ5Y78VKE)
- [x] Admin 대시보드 (/admin) — Overview, Members, Subscriptions, GA4 탭
- [x] Resend API Key 설정 완료
- [x] Cloudflare Workers Secrets 설정 완료 (POLAR_*, RESEND_API_KEY)
- [x] 결제 비활성화 (PAYMENTS_ENABLED = false) — 테스트 완료 전까지

### ✅ Phase 2 — 유저 기능 + 결제 활성화 (2026-02-17)
- [x] /my-feed — 팔로우한 아이돌/그룹 뉴스만 모아보는 피드
- [x] /my-idols — 내 팔로우 관리 대시보드 (요금제별 제한 표시)
- [x] /bookmarks — 저장한 기사 + BookmarkButton 컴포넌트
- [x] /settings — 유저 설정 (언어, 다이제스트 정보)
- [x] Admin 페이지 auth guard (SUPER_ADMIN_EMAILS 체크)
- [x] 헤더 유저 메뉴 완성 (My Feed, My Idols, Bookmarks, Settings, Plans & Billing)
- [x] PAYMENTS_ENABLED = true (결제 활성화)
- [x] billing-cards.tsx 업그레이드 버튼 활성화
- [x] Polar Stripe Connect 온보딩 완료

### ✅ 도메인 마이그레이션 (2026-02-17)
- [x] kpoppulse.app 도메인 구매 (Cloudflare)
- [x] Cloudflare Workers 도메인 바인딩 (kpoppulse.app + www.kpoppulse.app)
- [x] Supabase Auth redirect URL 업데이트
- [x] 코드 9개 파일 도메인 변경 (env, constants, layout, robots, checkout, daily-digest, email, deploy.yml, CLAUDE.md)
- [x] 배포 + 도메인 정상 작동 확인

### 🔲 남은 작업

#### Reve 액션 필요
- [ ] Google Cloud Console → Authorized JS Origins에 `https://kpoppulse.app` 추가 (Google OAuth 로그인 활성화)
- [ ] GitHub repo `reveai26/kpoppulse` → Settings → Secrets → `CLOUDFLARE_API_TOKEN` 추가 (CI/CD 활성화)
- [ ] Resend 도메인 인증 (kpoppulse.app) — 이메일 발송용

### ✅ Phase 3 — SEO/GEO + 소셜 + i18n (2026-02-17)
- [x] SEO/GEO 최적화 (llms.txt, JSON-LD mentions, microdata, sitemap 1000)
- [x] 소셜 공유 기능 (X, Facebook, Copy Link, Native Share)
- [x] 다국어 지원 (5 languages, cookie-based language switcher)
- [x] Weekly News Roundup — AI 자동 주간 뉴스 요약 (BTS, BLACKPINK, Stray Kids + top 10)
  - weekly_roundups DB 테이블
  - /api/cron/weekly-roundup — 매주 월요일 10:00 UTC 자동 생성
  - /weekly — 인덱스 페이지
  - /weekly/[slug]/[date] — 그룹별 주간 요약 상세 페이지
  - 사이트맵 자동 포함, BlogPosting JSON-LD

#### Phase 4 — 그로스
- [ ] Product Hunt 런칭 준비

---

## Key Design Decisions

1. Main page (`/`) is the actual service (news feed), NOT a landing page
2. "Trending" instead of "Rankings" to avoid fandom toxicity
3. No rank numbers/badges anywhere — all idols shown equally
4. Member-level filtering: group page → click member → member's news only
5. "My Idols" dashboard for managing followed artists
6. Follow system works for both groups AND individual members
7. Dark mode with K-pop-appropriate purple/magenta primary colors
