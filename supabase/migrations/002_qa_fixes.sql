-- KpopPulse QA Fixes Migration
-- 2026-02-14

-- ============================================================
-- 1. UNIQUE constraint on sources(name)
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_sources_name_unique ON public.sources(name);

-- ============================================================
-- 2. Index on articles(collected_at DESC)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_articles_collected ON public.articles(collected_at DESC);

-- ============================================================
-- 3. CHECK constraint on article_idols.confidence (0-1 range)
-- ============================================================
ALTER TABLE public.article_idols
  ADD CONSTRAINT chk_article_idols_confidence CHECK (confidence >= 0 AND confidence <= 1);

-- ============================================================
-- 4. CHECK constraint on article_groups.confidence (0-1 range)
-- ============================================================
ALTER TABLE public.article_groups
  ADD CONSTRAINT chk_article_groups_confidence CHECK (confidence >= 0 AND confidence <= 1);

-- ============================================================
-- 5. CHECK constraint on sources.category for valid values
-- ============================================================
ALTER TABLE public.sources
  ADD CONSTRAINT chk_sources_category CHECK (category IN ('portal', 'exclusive', 'newspaper', 'agency', 'media', 'web', 'news'));
