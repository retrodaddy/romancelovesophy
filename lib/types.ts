export type Comment = {
  id: string;
  article_id: string;
  parent_id: string | null;
  name: string;
  body: string;
  is_admin: boolean;
  replied: boolean;
  status: "pending" | "approved" | "hidden";
  created_at: string;
};

export type NavItem = { href: string; label: string; visible: boolean };

export type Category = {
  id: string;
  name: string;
  slug: string;
  kind: "quote" | "article" | "both";
  description: string | null;
  sort_order: number;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string | null;
  cover_image: string | null;
  category_id: string | null;
  status: "draft" | "published";
  source: string;
  reading_time: number | null;
  seo_title: string | null;
  seo_desc: string | null;
  views: number | null;
  published_at: string | null;
  unpublish_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Quote = {
  id: string;
  title: string | null;
  image_path: string;
  alt_text: string | null;
  caption: string | null;
  category_id: string | null;
  tags: string[];
  width: number | null;
  height: number | null;
  download_count: number;
  status: "draft" | "published";
  published_at: string | null;
  unpublish_at: string | null;
  created_at: string;
};

export type DownloadFile = {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_type: string | null;
  size_bytes: number | null;
  download_count: number;
  status: "draft" | "published";
  created_at: string;
};

export type SocialLink = {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Settings = {
  id: number;
  site_title: string | null;
  hero_eyebrow: string | null;
  hero_headline: string | null;
  hero_sub: string | null;
  about_md: string | null;
  portrait_path: string | null;
  featured_quote_id: string | null;
  youtube_channel_id: string | null;
  spotify_show_id: string | null;
  spotify_episode_id: string | null;
  header_image: string | null;
  header_focus_x: number | null;
  sponsor_enabled: boolean | null;
  sponsor_text: string | null;
  sponsor_url: string | null;
  sponsor_font: string | null;
  sponsor_color: string | null;
  sponsor_bg: string | null;
  sponsor_speed: string | null;
  adsense_client: string | null;
  ads_enabled: boolean | null;
  show_view_counts: boolean | null;
  allowed_tags: string[] | null;
  shorts_enabled: boolean | null;
  videos_on_home: boolean | null;
  contact_subjects: string[] | null;
  site_live: boolean | null;
  nav_items: NavItem[] | null;
  comments_enabled: boolean | null;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  status: "new" | "replied" | "closed";
  is_read: boolean;
  created_at: string;
  last_activity: string;
};

export type ContactMessage = {
  id: string;
  contact_id: string;
  direction: "inbound" | "outbound";
  body: string;
  email_id: string | null;
  created_at: string;
};

export type VideoItem = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  published_at: string | null;
  duration_seconds?: number | null;
  is_short?: boolean | null;
};

export type SpotifyEpisode = {
  id: string;
  name: string;
  description: string;
  release_date: string;
  duration_ms: number;
  image: string | null;
};
