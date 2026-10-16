import galleryData from "./gallery-data.json";

export interface GalleryPhoto {
  src: string;
  width: number;
  height: number;
  aspectRatio: number;
  alt: string;
  title: string;
}

export type GalleryMap = Record<string, GalleryPhoto[]>;

const galleries: GalleryMap = galleryData as GalleryMap;

// Fallback placeholder gallery generator for sessions without a photo folder (e.g. Corporate)
export function getGalleryImages(slug: string): GalleryPhoto[] {
  if (galleries[slug] && galleries[slug].length > 0) {
    return galleries[slug];
  }

  // Placeholder generation for sessions without a dedicated local folder (e.g. corporate)
  return Array.from({ length: 12 }, (_, i) => ({
    src: "", // empty src triggers elegant editorial placeholder
    width: 1200,
    height: 1500,
    aspectRatio: 0.8,
    alt: `Corporate Editorial Photograph ${i + 1} by SH Photography`,
    title: `Corporate Editorial · #${String(i + 1).padStart(2, "0")}`,
  }));
}

export function getPreviewImages(slug: string, count: number = 6): GalleryPhoto[] {
  const images = getGalleryImages(slug);
  return images.slice(0, count);
}
