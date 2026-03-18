// app/blog/page.tsx
export const dynamic = 'force-dynamic';
import { getArticles, getStrapiImageUrl } from "../../lib/strapi";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Blog | Aimen Kaour",
  description: "Technical articles and insights about full-stack development.",
};

export default async function BlogPage() {
  // جلب البيانات مع التأكد أنها مصفوفة حتى لو فشل الطلب أو كانت قاعدة البيانات فارغة
  const fetchedArticles = await getArticles();
  const articles = Array.isArray(fetchedArticles) ? fetchedArticles : [];

  return (
    <main className="min-h-screen py-24 px-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          Technical Articles
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Deep dives into modern technologies, tutorials, and my journey through the world of full-stack development.
        </p>
      </div>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article: any) => {
            const { title, description, cover, slug, publishedAt } = article.attributes || {};
            const imageUrl = getStrapiImageUrl(cover?.data?.attributes?.url);

            return (
              <Link 
                href={`/blog/${slug}`} 
                key={article.id}
                className="group relative bg-[#111111] border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative h-52 w-full overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={title || "Blog Post"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-black flex items-center justify-center">
                      <span className="text-gray-600">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    New Post
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 text-gray-500 text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>
                        {publishedAt 
                          ? new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : "Recently"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                    {title || "Untitled Post"}
                  </h3>

                  <p className="text-gray-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                    {description || "No description available for this post."}
                  </p>

                  <div className="flex items-center text-purple-400 text-sm font-semibold group-hover:gap-2 transition-all">
                    Read Article <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* الحالة التي تظهر عند عدم وجود مقالات أو فشل الجلب (تحمي الـ Build) */
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <p className="text-gray-500 mb-4">No articles found in the database.</p>
          <p className="text-sm text-gray-600">Make sure you have published articles on your Strapi dashboard.</p>
        </div>
      )}
    </main>
  );
}