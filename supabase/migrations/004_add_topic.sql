-- Add topic classification to articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS topic text DEFAULT 'buzz';
