// site_settings + social_links seed — DATA-MODEL.md §3.

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  isVisible: boolean;
}

export const socialLinks: SocialLink[] = [
  { id: "1", platform: "instagram", label: "Instagram", url: "https://instagram.com/shfotography1", isVisible: true },
  { id: "2", platform: "youtube", label: "YouTube", url: "https://youtube.com/@shphotography", isVisible: true },
  { id: "3", platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/447350156054", isVisible: true },
];

export const featuredVideoId = "Z8mnzVNaiD0";
