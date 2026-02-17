-- Weekly news roundup summaries per group (for SEO/organic traffic)
CREATE TABLE public.weekly_roundups (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        uuid        NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  week_start      date        NOT NULL,
  week_end        date        NOT NULL,
  title           text        NOT NULL,
  summary         text        NOT NULL,
  highlights      jsonb       DEFAULT '[]',
  article_count   int         NOT NULL DEFAULT 0,
  article_ids     uuid[]      DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, week_start)
);

-- Index for fast lookups
CREATE INDEX idx_weekly_roundups_group_week ON public.weekly_roundups(group_id, week_start DESC);
CREATE INDEX idx_weekly_roundups_created ON public.weekly_roundups(created_at DESC);

-- RLS: public read, service_role write
ALTER TABLE public.weekly_roundups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read roundups"
  ON public.weekly_roundups FOR SELECT
  USING (true);
