-- KpopPulse Initial Schema
-- 2026-02-14

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- 1. News Sources
-- ============================================================
CREATE TABLE public.sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  rss_url text,
  logo_url text,
  category text NOT NULL DEFAULT 'entertainment',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. Groups (K-pop groups/bands)
-- ============================================================
CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ko text NOT NULL,
  slug text UNIQUE NOT NULL,
  agency text NOT NULL,
  debut_date date,
  photo_url text,
  cover_url text,
  member_count int NOT NULL DEFAULT 0,
  description text,
  social_links jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  popularity_score int NOT NULL DEFAULT 0,
  follower_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_groups_slug ON public.groups(slug);
CREATE INDEX idx_groups_popularity ON public.groups(popularity_score DESC);
CREATE INDEX idx_groups_name_trgm ON public.groups USING gin(name gin_trgm_ops);

-- ============================================================
-- 3. Idols (Individual members)
-- ============================================================
CREATE TABLE public.idols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL,
  name text NOT NULL,
  name_ko text NOT NULL,
  slug text UNIQUE NOT NULL,
  photo_url text,
  birth_date date,
  position text,
  nationality text,
  description text,
  social_links jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  popularity_score int NOT NULL DEFAULT 0,
  follower_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_idols_slug ON public.idols(slug);
CREATE INDEX idx_idols_group ON public.idols(group_id);
CREATE INDEX idx_idols_popularity ON public.idols(popularity_score DESC);
CREATE INDEX idx_idols_name_trgm ON public.idols USING gin(name gin_trgm_ops);

-- ============================================================
-- 4. Articles (Korean news articles)
-- ============================================================
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  original_url text UNIQUE NOT NULL,
  original_title text NOT NULL,
  original_content text,
  thumbnail_url text,
  published_at timestamptz NOT NULL DEFAULT now(),
  collected_at timestamptz NOT NULL DEFAULT now(),
  is_translated boolean NOT NULL DEFAULT false,
  is_tagged boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_articles_published ON public.articles(published_at DESC);
CREATE INDEX idx_articles_source ON public.articles(source_id);
CREATE INDEX idx_articles_untranslated ON public.articles(is_translated) WHERE is_translated = false;

-- ============================================================
-- 5. Translations
-- ============================================================
CREATE TABLE public.translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'en',
  translated_title text NOT NULL,
  translated_summary text NOT NULL,
  translated_content text,
  model_used text NOT NULL DEFAULT 'gpt-4o-mini',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(article_id, language)
);

CREATE INDEX idx_translations_article ON public.translations(article_id);
CREATE INDEX idx_translations_lang ON public.translations(language);

-- ============================================================
-- 6. Article <-> Idol/Group tagging
-- ============================================================
CREATE TABLE public.article_idols (
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  idol_id uuid NOT NULL REFERENCES public.idols(id) ON DELETE CASCADE,
  confidence real NOT NULL DEFAULT 1.0,
  PRIMARY KEY (article_id, idol_id)
);

CREATE TABLE public.article_groups (
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  confidence real NOT NULL DEFAULT 1.0,
  PRIMARY KEY (article_id, group_id)
);

CREATE INDEX idx_article_idols_idol ON public.article_idols(idol_id);
CREATE INDEX idx_article_groups_group ON public.article_groups(group_id);

-- ============================================================
-- 7. User Profiles
-- ============================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  avatar_url text,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  preferred_language text NOT NULL DEFAULT 'en',
  daily_reads_today int NOT NULL DEFAULT 0,
  daily_reads_reset_at timestamptz NOT NULL DEFAULT now(),
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. Follows (idol or group)
-- ============================================================
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idol_id uuid REFERENCES public.idols(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (idol_id IS NOT NULL AND group_id IS NULL) OR
    (idol_id IS NULL AND group_id IS NOT NULL)
  ),
  UNIQUE(user_id, idol_id),
  UNIQUE(user_id, group_id)
);

CREATE INDEX idx_follows_user ON public.follows(user_id);
CREATE INDEX idx_follows_idol ON public.follows(idol_id);
CREATE INDEX idx_follows_group ON public.follows(group_id);

-- ============================================================
-- 9. Bookmarks
-- ============================================================
CREATE TABLE public.bookmarks (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, article_id)
);

-- ============================================================
-- 10. Subscriptions (Polar)
-- ============================================================
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  polar_subscription_id text UNIQUE,
  polar_customer_id text,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'revoked')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_subscriptions_user ON public.subscriptions(user_id);

-- ============================================================
-- RLS Policies
-- ============================================================

-- Public read for sources, groups, idols, articles, translations, tags
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sources_public_read" ON public.sources FOR SELECT USING (true);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "groups_public_read" ON public.groups FOR SELECT USING (true);

ALTER TABLE public.idols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "idols_public_read" ON public.idols FOR SELECT USING (true);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles_public_read" ON public.articles FOR SELECT USING (true);

ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "translations_public_read" ON public.translations FOR SELECT USING (true);

ALTER TABLE public.article_idols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "article_idols_public_read" ON public.article_idols FOR SELECT USING (true);

ALTER TABLE public.article_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "article_groups_public_read" ON public.article_groups FOR SELECT USING (true);

-- User data: only own data
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own_read" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_own_read" ON public.follows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "follows_own_insert" ON public.follows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "follows_own_delete" ON public.follows FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookmarks_own_read" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_own_insert" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_own_delete" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_own_read" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture')
  );

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Function: update follower counts
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_follower_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.idol_id IS NOT NULL THEN
      UPDATE public.idols SET follower_count = follower_count + 1 WHERE id = NEW.idol_id;
    END IF;
    IF NEW.group_id IS NOT NULL THEN
      UPDATE public.groups SET follower_count = follower_count + 1 WHERE id = NEW.group_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.idol_id IS NOT NULL THEN
      UPDATE public.idols SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.idol_id;
    END IF;
    IF OLD.group_id IS NOT NULL THEN
      UPDATE public.groups SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.group_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.update_follower_counts();
