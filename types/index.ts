export type Group = {
  id: string;
  name: string;
  name_ko: string;
  slug: string;
  agency: string;
  debut_date: string | null;
  photo_url: string | null;
  cover_url: string | null;
  member_count: number;
  description: string | null;
  social_links: Record<string, string> | null;
  is_active: boolean;
  popularity_score: number;
  follower_count: number;
  created_at: string;
};

export type Idol = {
  id: string;
  group_id: string | null;
  name: string;
  name_ko: string;
  slug: string;
  photo_url: string | null;
  birth_date: string | null;
  position: string | null;
  nationality: string | null;
  description: string | null;
  social_links: Record<string, string> | null;
  is_active: boolean;
  popularity_score: number;
  follower_count: number;
  created_at: string;
  group?: Group;
};

export type Source = {
  id: string;
  name: string;
  url: string;
  rss_url: string | null;
  logo_url: string | null;
  category: string;
  is_active: boolean;
};

export type Article = {
  id: string;
  source_id: string;
  original_url: string;
  original_title: string;
  original_content: string | null;
  thumbnail_url: string | null;
  is_translated: boolean;
  is_tagged: boolean;
  published_at: string;
  collected_at: string;
  source?: Source;
  translation?: Translation;
  mentioned_idols?: (Idol & { group?: Group })[];
  mentioned_groups?: Group[];
};

export type Translation = {
  id: string;
  article_id: string;
  language: string;
  translated_title: string;
  translated_summary: string;
  translated_content: string | null;
  model_used: string;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin" | "super_admin";
  plan: "free" | "pro" | "premium";
  preferred_language: string;
  daily_reads_today: number;
  daily_reads_reset_at: string;
  created_at: string;
};

export type Follow = {
  id: string;
  user_id: string;
  idol_id: string | null;
  group_id: string | null;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  polar_subscription_id: string | null;
  polar_customer_id: string | null;
  plan: "free" | "pro" | "premium";
  status: "active" | "canceled" | "past_due" | "unpaid" | "revoked";
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

export type ArticleWithDetails = Article & {
  source: Source;
  translation: Translation;
  mentioned_idols: (Idol & { group?: Group })[];
  mentioned_groups: Group[];
};
