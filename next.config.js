/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize images for Vercel deployment
  images: {
    formats: ['image/webp', 'image/avif'],
    // Allow local static assets
    unoptimized: false,
  },
  // Strict mode for better React hygiene
  reactStrictMode: true,
};

module.exports = nextConfig;
