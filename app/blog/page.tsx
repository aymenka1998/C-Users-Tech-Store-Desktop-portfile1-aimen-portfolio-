// app/blog/page.tsx
export const dynamic = 'force-dynamic';
import { getArticles, getStrapiImageUrl, type Article } from "../../lib/strapi";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <main className="min-h-screen py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-linear-to-r from-white to-gray-500 bg-clip-text text-transparent">
          Technical Articles
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Deep dives into modern technologies and full-stack development.
        </p>
      </div>

      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link 
              href={`/blog/${article.slug}`} 
              key={article.documentId || article.id}
              className="group bg-[#111111] border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all"
            >
              <div className="relative h-52 w-full">
                <Image
                  src={getStrapiImageUrl(article.cover?.url || null)}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                  <Calendar size={14} />
                  {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Draft"}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400">{article.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{article.description}</p>
                <div className="text-purple-400 text-sm font-semibold inline-flex items-center">
                  Read More <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <p className="text-gray-500">No articles found in the database.</p>
        </div>
      )}
    </main>
  );
}