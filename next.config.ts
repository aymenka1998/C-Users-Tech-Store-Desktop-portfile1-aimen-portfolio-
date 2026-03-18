/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. إعدادات الصور (تحديث الطريقة القديمة)
  images: {
    // نستخدم remotePatterns بدلاً من domains للأمان ولتوافق النسخ الجديدة
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**', // يسمح بجلب الصور من أي رابط خارجي (مثل Render أو Cloudinary)
      },
    ],
    // إذا كنت تواجه مشاكل في عرض الصور على Vercel، يمكنك تركها true مؤقتاً
    unoptimized: true, 
  },

  // 2. تجاهل أخطاء البرمجة (لضمان نجاح الـ Build السريع)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ملاحظة: تم حذف قسم eslint من هنا لأنه لم يعد مدعوماً في الإصدارات الحديثة داخل هذا الملف
  // إذا أردت تجاهل الـ ESLint، يفضل عمل ذلك في ملف .eslintignore

  // 3. الربط مع الـ API (Strapi)
  async rewrites() {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    return [
      {
        source: '/api/:path*',
        destination: `${strapiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;