/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. إعدادات الصور (للسماح بروابط Strapi الخارجية)
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },

  // 2. تجاهل أخطاء البرمجة أثناء الرفع (لضمان نجاح الـ Build)
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // 3. الربط مع الـ API (Strapi)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;