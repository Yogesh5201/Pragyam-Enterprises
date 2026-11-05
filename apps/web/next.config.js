/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  async rewrites() {
    const apiTarget = process.env.INTERNAL_API_URL || process.env.API_URL;
    // When no external API URL is configured (e.g. standalone Vercel deployment),
    // Next.js native API route handlers in app/api handle all requests.
    if (!apiTarget || apiTarget.includes('localhost')) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
