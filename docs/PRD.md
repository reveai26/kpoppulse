# KpopPulse - Product Requirements Document

> Version 1.0 | 2026-02-14
> Team 4 | reveaiteam

---

## 1. Product Overview

- **Product Name**: KpopPulse
- **One-liner**: A real-time AI-powered platform that translates and delivers Korean idol news to international K-pop fans, personalized by their favorite artists.
- **Core Value Proposition**: Unlike Soompi/AllKpop (manual editorial, general K-pop news) and Weverse (HYBE artists only), KpopPulse uses AI to translate Korean news articles in real-time, categorized by every idol across all agencies — delivering speed, personalization, and coverage no competitor offers.
- **Target Market**: International K-pop fans (40M+ globally, 70% of total K-pop fandom)
- **Revenue Model**: Freemium SaaS (Free / Pro $4.99/mo / Premium $9.99/mo)

### Target Personas

**Persona 1: "Mia" (Core Fan, 22, USA)**
- Follows 2-3 groups actively (Stray Kids, aespa, ENHYPEN)
- Checks Twitter/X multiple times daily for translated news
- Frustrated by slow fan translations and missing context
- Willing to pay $5-10/month for reliable, fast idol news
- Uses phone 80% of the time

**Persona 2: "Yuki" (Multi-fan, 28, Japan)**
- Follows 5+ groups casually, deep fan of 1 group
- Reads Soompi/AllKpop but finds them cluttered with irrelevant news
- Wants a clean feed filtered to her favorite idols only
- Prefers Japanese translation over English
- Higher spending power, already pays for Weverse/Bubble

---

## 2. Problem Definition

### Pain Points

| # | Pain Point | Severity |
|---|-----------|----------|
| 1 | Korean news articles published → international fans can't read them | Critical |
| 2 | Fan translators are slow (hours~days delay), incomplete, sometimes inaccurate | High |
| 3 | No single platform covers ALL idols across ALL agencies | High |
| 4 | Existing K-pop news sites (Soompi, AllKpop) are general, not personalized by idol | Medium |
| 5 | Information is scattered across Twitter, Reddit, Weverse, fan cafes | Medium |
| 6 | Fans miss important news about their idols buried in noise | Medium |

### Competitor Analysis

| Competitor | Strength | Weakness |
|-----------|----------|----------|
| **Soompi** (23M followers) | Established brand, reliable editorial | General news, slow (editorial delay), no personalization |
| **AllKpop** (24/7 coverage) | Speed, gossip appeal | Clickbait reputation, ad-heavy, no personalization |
| **Koreaboo** | Viral content, social sharing | Listicle-focused, not news-focused |
| **Weverse** (HYBE) | Official content, artist interaction | HYBE artists only, not a news platform |
| **Fan translators (Twitter)** | Free, community-driven | Slow, inconsistent, incomplete, burn out |

### How KpopPulse Solves This

1. **AI translates Korean news in minutes, not hours** — GPT-4o-mini translates articles as they're published
2. **Follow YOUR idols** — personalized feed shows only news about artists you care about
3. **All agencies, all idols** — SM, JYP, HYBE, YG, Starship, and 50+ more
4. **Multi-language** — English first, then Japanese, Spanish, Indonesian, Chinese
5. **One place for everything** — aggregated from 15+ Korean news sources

---

## 3. User Stories

### Core (P0)

```
AS A K-pop fan visiting the site
I WANT TO see a feed of translated K-pop idol news immediately
SO THAT I can browse news without signing up

AS A K-pop fan
I WANT TO filter news by specific idol or group
SO THAT I only see news about artists I care about

AS A registered user
I WANT TO follow my favorite idols
SO THAT my home feed is personalized to my interests

AS A user reading an article
I WANT TO see the AI-translated article with a link to the Korean original
SO THAT I can read it quickly and verify if needed

AS A user
I WANT TO search for specific idols, groups, or topics
SO THAT I can find news about anything K-pop related
```

### Important (P1)

```
AS A user
I WANT TO receive a daily AI digest of my followed idols' news
SO THAT I can catch up quickly each morning

AS A user
I WANT TO see trending topics and breaking news highlighted
SO THAT I don't miss important events

AS A user
I WANT TO bookmark articles to read later
SO THAT I can save interesting news

AS A user
I WANT TO see idol/group profile pages with their latest news
SO THAT I can explore new artists

AS A user
I WANT TO choose my preferred language for translations
SO THAT I can read comfortably in my native language
```

### Nice to Have (P2)

```
AS A premium user
I WANT TO see Korean public sentiment analysis about my idols
SO THAT I understand how Korea perceives them

AS A user
I WANT TO see upcoming comeback schedules auto-detected from news
SO THAT I never miss a comeback

AS A user
I WANT TO share translated articles to social media
SO THAT I can share news with my fan community
```

---

## 4. Functional Requirements

### P0 — Must Have (MVP)

| Feature | Description | Acceptance Criteria |
|---------|------------|-------------------|
| **Public News Feed** | Main page (`/`) shows real-time translated K-pop news feed | - News displayed in card format with idol photo, translated title, summary, source, time ago - Infinite scroll pagination - No login required to browse - Mobile responsive |
| **News Data Pipeline** | Automated collection of Korean entertainment news | - RSS/scraping from 15+ Korean sources every 15 min - AI translation (title + summary) via GPT-4o-mini - Idol/group entity extraction and tagging - Store in Supabase with full-text search |
| **Popularity Ranking** | Idols/groups displayed by popularity | - Ranking score = article count + follower count + social buzz - Sidebar shows idols sorted by rank (1st, 2nd, 3rd...) - `/rankings` page with full leaderboard (daily/weekly/monthly) - Ranking badge on idol cards (crown icon for top 10) |
| **My Idols** | Dedicated "My Idols" dashboard for followed artists | - `/my-idols` page showing all followed idols as cards - Each idol card: photo, latest headline, news count today - Quick-access grid layout, drag to reorder favorites - "Add Idol" button for easy discovery |
| **Member-level News** | View news filtered by individual group members | - Group page shows member grid with photos - Click member → filtered news for that member only - Member tabs on group profile page - Article tags show specific member names, not just group |
| **Idol/Group Filter** | Filter news by specific idol or group | - Sidebar shows idols sorted by popularity ranking - Click idol name in article → filtered feed - URL-based: `/idol/[slug]`, `/group/[slug]` |
| **Article Detail Page** | Full translated article view | - AI-translated full article text - Original Korean source link - Related articles - Idol/group tags with member names - Share buttons |
| **Idol/Group Profiles** | Profile pages for each idol and group | - Photo, bio, agency, debut date, social links - Latest news feed - Member list with individual profile links (for groups) - Popularity rank badge |
| **Search** | Global search across articles, idols, groups | - Real-time search suggestions - Search results page with filters - Search by idol name (English/Korean/romanized) |
| **Google OAuth** | Sign in with Google | - One-click Google login - Auto-create profile on first login - Supabase Auth integration |
| **Follow System** | Follow idols/groups AND individual members | - Follow/unfollow button on idol/group/member profiles - "My Feed" tab showing only followed artists' news - "My Idols" dashboard for managing follows - Follow count displayed |
| **Responsive Design** | Mobile-first, works on all devices | - Mobile: single column, touch-friendly - Tablet: 2-column grid - Desktop: sidebar + content + trending |
| **Billing (Polar)** | Subscription management | - Free / Pro / Premium tiers - Polar checkout integration - Usage limits enforced per tier |

### P1 — Should Have (Phase 2)

| Feature | Description |
|---------|------------|
| **Multi-language Translation** | Support EN, JA, ES, ID, ZH translations |
| **AI Daily Digest** | Morning summary of followed idols' news (in-app + email) |
| **Trending Section** | Most-read articles, hot topics, breaking news badge |
| **Bookmarks** | Save articles to read later |
| **Push Notifications** | Breaking news alerts for followed idols (web push) |
| **Dark Mode** | System-aware dark/light theme toggle |

### P2 — Nice to Have (Phase 3)

| Feature | Description |
|---------|------------|
| **Sentiment Analysis** | Korean public opinion visualization per idol |
| **Comeback Tracker** | Auto-detected comeback/event schedule from news |
| **Social Sharing** | Share translated articles with preview cards |
| **Newsletter** | Weekly email digest of K-pop highlights |
| **Community Comments** | User comments on articles |

---

## 5. Non-Functional Requirements

### Performance
- News feed initial load: < 2s (LCP)
- Article detail page: < 1.5s
- Search results: < 500ms
- News pipeline latency: Korean article published → translated article available < 30 min
- Support 10,000+ concurrent readers

### Security
- Authentication: Google OAuth via Supabase Auth
- Authorization: RLS on all user data (follows, bookmarks, preferences)
- API rate limiting: 100 req/min for free, 300 for Pro, 1000 for Premium
- No user data shared with third parties
- GDPR/CCPA compliant (international users)

### Scalability
- Supabase free tier initially, upgrade as needed
- Cloudflare Workers edge deployment for global speed
- News pipeline scales independently (Edge Functions / cron)
- CDN for all static assets and images
- Database: partitioning by date for articles table as data grows

### SEO
- Server-side rendered article pages for Google indexing
- Structured data (NewsArticle schema) for rich search results
- `sitemap.xml` with all idol/group pages and recent articles
- Canonical URLs and proper meta tags
- Potential for massive organic traffic from K-pop search queries

---

## 6. Technical Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 16 (App Router) | SSR for SEO, React 19, our standard stack |
| **Language** | TypeScript (strict) | Type safety, our standard |
| **UI** | shadcn/ui + Tailwind CSS v4 | Rapid development, consistent design |
| **Auth** | Supabase Auth (Google OAuth) | Standard across all projects |
| **Database** | Supabase PostgreSQL | RLS, real-time, full-text search, our standard |
| **AI Translation** | OpenAI GPT-4o-mini | Cost-effective ($0.15/1M input), fast, accurate Korean→English |
| **News Collection** | Supabase Edge Functions + pg_cron | Serverless, scheduled execution |
| **Payment** | Polar (Production) | MoR, global payments, our standard |
| **Deployment** | Cloudflare Workers | Edge network, global CDN, our standard |
| **Analytics** | GA4 + Vercel Analytics | Traffic + performance tracking |
| **Image CDN** | Cloudflare Images or Next.js Image | Idol photos, article thumbnails |

### AI Cost Estimation

| Item | Calculation | Monthly Cost |
|------|-----------|-------------|
| Article translation (GPT-4o-mini) | 500 articles/day x ~800 tokens x $0.60/1M output | ~$7.20/mo |
| Entity extraction | 500 articles/day x ~200 tokens | ~$1.80/mo |
| Daily digest generation | 10,000 users x ~500 tokens | ~$3.00/mo |
| **Total AI cost** | | **~$12/mo** |

### Data Pipeline Architecture

```
[Korean News Sources] ──RSS/Scrape──→ [Edge Function: Collector]
        (15+ sources)                    (every 15 min)
                                              │
                                              ▼
                                   [Edge Function: Translator]
                                    GPT-4o-mini: title + summary
                                    + full article translation
                                              │
                                              ▼
                                   [Edge Function: Tagger]
                                    Idol/Group entity extraction
                                    Category classification
                                              │
                                              ▼
                                      [Supabase DB]
                                    articles, translations,
                                    idol_mentions, categories
                                              │
                                              ▼
                                    [Next.js App (/)]
                                    Real-time news feed
```

### Korean News Sources (Initial 15+)

| Source | Type | Focus | Method |
|--------|------|-------|--------|
| Naver Entertainment | Portal | All entertainment | RSS |
| Dispatch | Exclusive | Celebrity/idol scoops | RSS/Scrape |
| Sports Chosun (Ent.) | Newspaper | General entertainment | RSS |
| OSEN | News agency | Entertainment | RSS |
| Star News | News agency | K-pop focused | RSS |
| Newsen | News agency | Entertainment | RSS |
| Herald Pop | Newspaper | K-pop/Hallyu | RSS |
| Xportsnews | News agency | Entertainment | RSS |
| MK Sports | Newspaper | Entertainment | RSS |
| SPOTV News | Media | Entertainment | RSS |
| Daily Pop (Hankyung) | Newspaper | Pop culture | RSS |
| Top Star News | Web media | Idol focused | RSS |
| Idol Issue | Web media | Idol focused | RSS |
| K-pop Herald | Newspaper | K-pop English | RSS |
| Tenasia | Web media | Entertainment | RSS |

---

## 7. MVP Scope Definition

### MVP (Phase 1) — 2 Weeks

**Included:**
- News data pipeline (collect → translate → tag → store)
- Public news feed on main page (`/`) with infinite scroll
- Idol/group filter and profile pages
- Article detail page with full translation
- Search (idols, groups, articles)
- Google OAuth login
- Follow system (personalized "My Feed")
- Responsive design (mobile-first)
- Billing page with Polar (Free / Pro / Premium)
- Basic SEO (meta tags, sitemap, structured data)

**Excluded (Phase 2+):**
- Multi-language translation (JA, ES, ID, ZH)
- AI daily digest
- Push notifications
- Sentiment analysis
- Comeback tracker
- Dark mode
- Community features

### MVP Success KPIs

| KPI | Target (Month 1) | Target (Month 3) |
|-----|------------------|------------------|
| Daily Active Users | 500 | 5,000 |
| Articles translated/day | 200+ | 500+ |
| Average session duration | > 3 min | > 5 min |
| Paid conversion rate | 2% | 5% |
| MRR | $50 | $500 |
| SEO organic traffic | 100/day | 1,000/day |

---

## 8. Wireframe Structure

### Main Page (`/`) — Public News Feed

```
┌─────────────────────────────────────────────────────┐
│  [Logo: KpopPulse]    [Search 🔍]  [Login / Avatar] │
├──────────┬──────────────────────────────┬───────────┤
│          │                              │           │
│ SIDEBAR  │    NEWS FEED (Main Content)  │ TRENDING  │
│          │                              │           │
│ My Feed  │  ┌──────────────────────┐    │ 🔥 Hot    │
│ All News │  │ [Idol Photo]         │    │           │
│          │  │ Title (translated)   │    │ 1. BTS    │
│ GROUPS   │  │ Summary (2 lines)    │    │    news   │
│ ─────── │  │ Source · 5 min ago   │    │ 2. aespa  │
│ BTS      │  │ #aespa #SM           │    │    news   │
│ BLACKPINK│  └──────────────────────┘    │ 3. ...    │
│ Stray    │                              │           │
│ Kids     │  ┌──────────────────────┐    │ TRENDING  │
│ aespa    │  │ [Idol Photo]         │    │ TOPICS    │
│ NewJeans │  │ Title (translated)   │    │ ────────  │
│ ENHYPEN  │  │ Summary (2 lines)    │    │ #Comeback │
│ SEVENTEEN│  │ Source · 12 min ago  │    │ #Concert  │
│ ...      │  │ #BTS #HYBE           │    │ #Variety  │
│          │  └──────────────────────┘    │           │
│ AGENCIES │                              │           │
│ ─────── │  ┌──────────────────────┐    │           │
│ SM       │  │ ... more articles    │    │           │
│ JYP      │  │ (infinite scroll)    │    │           │
│ HYBE     │  └──────────────────────┘    │           │
│ YG       │                              │           │
│          │  [Load More / Infinite]      │           │
├──────────┴──────────────────────────────┴───────────┤
│  Footer: About · Privacy · Terms · Contact          │
└─────────────────────────────────────────────────────┘
```

**Mobile Layout:**
```
┌─────────────────────────┐
│ [☰] KpopPulse [🔍] [👤] │
├─────────────────────────┤
│ [All] [My Feed] [🔥Hot] │  ← Tab navigation
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ [Photo] Title       │ │
│ │ Summary text...     │ │
│ │ Source · 5 min ago  │ │
│ │ #aespa #SM          │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ [Photo] Title       │ │
│ │ Summary text...     │ │
│ │ Source · 12 min ago │ │
│ │ #BTS #HYBE          │ │
│ └─────────────────────┘ │
│                         │
│ ... (infinite scroll)   │
└─────────────────────────┘
```

### Article Detail Page (`/article/[id]`)

```
┌─────────────────────────────────────────┐
│ ← Back    KpopPulse    [🔍] [Avatar]    │
├─────────────────────────────────────────┤
│                                         │
│ [Article Thumbnail / Hero Image]        │
│                                         │
│ Translated Title (Large)                │
│ Source: Star News · 2026-02-14 · 5 min  │
│ Tags: #aespa #Karina #SM               │
│                                         │
│ ─────────────────────────────────       │
│                                         │
│ Translated full article body...         │
│ Paragraph 1...                          │
│                                         │
│ Paragraph 2...                          │
│                                         │
│ [📎 View Original (Korean)]             │
│                                         │
│ ─────────────────────────────────       │
│                                         │
│ Related Articles                        │
│ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │ Card │ │ Card │ │ Card │             │
│ └──────┘ └──────┘ └──────┘             │
│                                         │
└─────────────────────────────────────────┘
```

### Idol Profile Page (`/idol/[slug]`)

```
┌─────────────────────────────────────────┐
│ ← Back    KpopPulse    [🔍] [Avatar]    │
├─────────────────────────────────────────┤
│                                         │
│  [Idol Photo]  Karina                   │
│                aespa · SM Entertainment  │
│                Debut: 2020.11.17        │
│                                         │
│  [♡ Follow]  12.5K followers            │
│                                         │
│  [Instagram] [Twitter] [YouTube]        │
│                                         │
│ ─────────────────────────────────       │
│ [Latest News] [About] [Members*]        │
│ ─────────────────────────────────       │
│                                         │
│ News feed filtered to this idol...      │
│ ┌──────────────────────┐                │
│ │ Article card 1       │                │
│ └──────────────────────┘                │
│ ┌──────────────────────┐                │
│ │ Article card 2       │                │
│ └──────────────────────┘                │
│                                         │
└─────────────────────────────────────────┘
```

### Billing Page (`/billing`)

```
┌─────────────────────────────────────────┐
│ Choose Your Plan                        │
├─────────────────────────────────────────┤
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │   FREE   │ │   PRO    │ │ PREMIUM  │ │
│ │   $0     │ │ $4.99/mo │ │ $9.99/mo │ │
│ │          │ │          │ │          │ │
│ │ 20/day   │ │ 200/day  │ │ Unlimit  │ │
│ │ Basic    │ │ AI Digest│ │ All feat │ │
│ │ feed     │ │ Alerts   │ │ Multi-   │ │
│ │          │ │ Bookmark │ │ language │ │
│ │          │ │          │ │ Sentiment│ │
│ │ [Current]│ │[Upgrade] │ │[Upgrade] │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## 9. Pricing Structure

| Feature | Free | Pro ($4.99/mo) | Premium ($9.99/mo) |
|---------|------|----------------|-------------------|
| Daily article reads | 20 | 200 | Unlimited |
| Follow idols | 3 | 20 | Unlimited |
| News feed | Public feed only | + My Feed | + My Feed |
| Search | Basic | Advanced + filters | Advanced + filters |
| AI Daily Digest | - | Email + In-app | Email + In-app |
| Push Notifications | - | Breaking news | All news |
| Bookmarks | - | 50/month | Unlimited |
| Multi-language | English only | + 2 languages | All 5 languages |
| Sentiment Analysis | - | - | Full access |
| Comeback Tracker | - | - | Full access |
| Ads | Banner ads | No ads | No ads |

---

## 10. Database Schema (High-Level)

### Core Tables

```sql
-- News sources (Korean media outlets)
sources (id, name, url, rss_url, logo_url, category, is_active)

-- Raw Korean articles
articles (id, source_id, original_url, original_title, original_content,
          thumbnail_url, published_at, collected_at)

-- AI translations
translations (id, article_id, language, translated_title,
              translated_summary, translated_content, model_used, created_at)

-- K-pop groups
groups (id, name, name_ko, slug, agency, debut_date, photo_url,
        member_count, description, social_links, is_active)

-- Individual idols
idols (id, group_id, name, name_ko, slug, photo_url, birth_date,
       position, nationality, description, social_links, is_active)

-- Article ↔ Idol/Group tagging
article_idols (article_id, idol_id, confidence)
article_groups (article_id, group_id, confidence)

-- User profiles (extends Supabase Auth)
profiles (id, email, display_name, avatar_url, plan, preferred_language,
          daily_reads_today, daily_reads_reset_at, created_at)

-- User follows
follows (user_id, idol_id, group_id, created_at)
  -- CHECK: exactly one of idol_id or group_id is NOT NULL

-- Bookmarks
bookmarks (user_id, article_id, created_at)

-- Subscriptions (Polar)
subscriptions (id, user_id, polar_subscription_id, polar_customer_id,
               plan, status, current_period_start, current_period_end,
               cancel_at_period_end, created_at, updated_at)

-- Categories / Topics
categories (id, name, slug, icon)
article_categories (article_id, category_id)
```

---

## 11. Route Structure

### Public Routes (No Auth Required)

```
/                           → Main news feed (THE service page)
/article/[id]               → Article detail
/group/[slug]               → Group profile + news
/idol/[slug]                → Idol profile + news
/search?q=                  → Search results
/trending                   → Trending news & topics
/login                      → Google OAuth login
/privacy                    → Privacy policy
/terms                      → Terms of service
```

### Protected Routes (Auth Required)

```
/my-feed                    → Personalized feed (followed idols)
/bookmarks                  → Saved articles
/settings                   → User preferences (language, notifications)
/billing                    → Subscription management
```

### API Routes

```
GET    /api/articles         → List articles (paginated, filterable)
GET    /api/articles/[id]    → Single article with translation
GET    /api/idols            → List idols (searchable)
GET    /api/idols/[slug]     → Idol profile + recent articles
GET    /api/groups           → List groups (searchable)
GET    /api/groups/[slug]    → Group profile + members + recent articles
GET    /api/search           → Global search
POST   /api/follow           → Follow/unfollow idol or group
GET    /api/user/feed        → Personalized feed
POST   /api/bookmarks        → Add/remove bookmark
GET    /api/trending         → Trending articles and topics
POST   /api/checkout         → Create Polar checkout session
POST   /api/checkout/verify  → Verify checkout (webhook backup)
POST   /api/webhooks/polar   → Polar webhook receiver
GET    /api/user/subscription → Current subscription status
```

### Edge Functions (Supabase)

```
news-collector              → RSS/scrape Korean news sources (every 15 min)
article-translator          → AI translate articles (every 20 min)
entity-tagger               → Extract idol/group mentions (every 20 min)
daily-digest                → Generate daily AI summary (daily 8AM UTC)
```

---

## 12. Phase Plan

### Phase 1: Foundation MVP (2 Weeks)

**Week 1:**
- Day 1-2: Project setup, DB schema, Supabase migration, seed data (50+ groups, 200+ idols)
- Day 3-4: News pipeline (collector → translator → tagger Edge Functions)
- Day 5: Main feed page, article cards, infinite scroll
- Day 6-7: Article detail page, idol/group profile pages

**Week 2:**
- Day 8-9: Search, filter by idol/group/agency
- Day 10: Google OAuth, follow system, My Feed
- Day 11: Billing page (Polar integration)
- Day 12: SEO (meta tags, sitemap, structured data)
- Day 13: Mobile responsive polish, testing
- Day 14: Cloudflare Workers deployment, domain setup

### Phase 2: Engagement (2 Weeks)
- Multi-language translation (JA, ES, ID, ZH)
- AI daily digest (in-app + email)
- Trending section + breaking news badge
- Bookmarks
- Dark mode
- Push notifications (web push)

### Phase 3: Premium & Growth (2 Weeks)
- Sentiment analysis visualization
- Comeback/schedule tracker
- Social sharing with preview cards
- Newsletter (weekly email)
- Community comments
- Advanced analytics dashboard

---

## 13. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Copyright: translating Korean news | High | Summarize + link to original, fair use for news reporting |
| AI translation errors | Medium | Show "AI-translated" badge, link to original, allow user reports |
| News source RSS changes/breaks | Medium | Multiple sources per topic, monitoring alerts, fallback scraping |
| Low initial traffic | Medium | SEO-first strategy (idol name + news = high search volume) |
| Korean source blocking | Low | Rotate user agents, respect robots.txt, use RSS where available |
| OpenAI API cost spike | Low | GPT-4o-mini is cheap ($12/mo est.), set budget alerts |

---

## 14. Success Metrics

### North Star Metric
**Daily Active Readers (DAR)** — unique users who read at least 1 translated article per day

### Supporting Metrics
- Articles translated per day (pipeline health)
- Translation latency (speed advantage)
- Follow-to-DAR ratio (personalization value)
- Free-to-paid conversion rate (monetization)
- SEO organic traffic growth (acquisition)
- Average articles read per session (engagement)
