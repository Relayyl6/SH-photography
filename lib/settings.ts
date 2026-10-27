// site_settings + social_links seed — DATA-MODEL.md §3.

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  isVisible: boolean;
}

export const socialLinks: SocialLink[] = [
  { id: "1", platform: "instagram", label: "Instagram", url: "https://www.instagram.com/_sh_fotography?rpxt=bTZyN2h4M3pubXVh", isVisible: true },
  { id: "2", platform: "youtube", label: "YouTube", url: "https://youtube.com/@shfotography?si=_beJ7rTNqElsJhEs", isVisible: true },
  { id: "3", platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/447350156054", isVisible: true },
];

export const featuredVideoId = "38xsz4Qoez4";
