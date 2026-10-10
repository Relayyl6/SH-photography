// site_settings + social_links seed — DATA-MODEL.md §3.
// Empty until the client supplies real accounts/video (OPEN-QUESTIONS.md #1, #2).
// UI must handle both gracefully (hide, don't show broken links/embeds).

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  isVisible: boolean;
}

export const socialLinks: SocialLink[] = [];

export const featuredVideoId = ""; // empty => video section hides itself
