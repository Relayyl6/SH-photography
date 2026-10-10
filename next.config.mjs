/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // No external image domains yet — client photos will be added via
    // Supabase/Cloudinary storage in Phase 2/6. See OPEN-QUESTIONS.md #4.
    remotePatterns: [],
  },
};

export default nextConfig;
