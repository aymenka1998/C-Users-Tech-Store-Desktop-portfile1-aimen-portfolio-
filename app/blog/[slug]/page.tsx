// app/blog/[slug]/page.tsx
export const dynamic = 'force-dynamic';
import { getArticleBySlug, getStrapiImageUrl } from "../../../lib/strapi";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowLeft, Clock, User } from "lucide-react";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: `${article.title} | Aimen Kaour`,
    description: article.description,
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);

  // إذا لم يتم العثور على المقال، أظهر صفحة 404
  if (!article) {
    notFound();
  }

  const { title, description, content, cover, publishedAt } = article;
  const imageUrl = getStrapiImageUrl(cover?.url || null);

  return (
    <main className="min-h-screen py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* زر العودة */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-12 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Articles
        </Link>

        {/* رأس المقال (Header) */}
        <header className="mb-12">
          <div className="flex items-center gap-4 text-sm text-purple-400 mb-6 font-medium uppercase tracking-widest">
            <span>Technical Post</span>
            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
            <div className="flex items-center gap-1.5 text-gray-400 normal-case tracking-normal">
              <Calendar size={14} />
              {publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              }) : "Recently"}
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-[1.1]">
            {title}
          </h1>

          <p className="text-xl text-gray-400 leading-relaxed border-l-2 border-purple-500/30 pl-6 italic">
            {description}
          </p>
        </header>

        {/* صورة الغلاف */}
        {imageUrl && imageUrl !== "/placeholder-project.jpg" && (
          <div className="relative w-full h-75 md:h-125 rounded-3xl overflow-hidden mb-16 border border-white/10">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* محتوى المقال */}
        <div className="prose prose-invert prose-purple max-w-none">
          {/* ملاحظة: إذا كان المحتوى يأتي كـ Rich Text من Strapi، يفضل استخدام مكتبة مثل react-markdown */}
          <div className="text-gray-300 leading-loose text-lg space-y-6">
             {/* عرض المحتوى الخام مؤقتاً أو معالجته */}
             <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>

        {/* تذييل المقال */}
        <footer className="mt-20 pt-10 border-t border-white/10">
          <div className="bg-[#111111] p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                AK
              </div>
              <div>
                <h4 className="text-white font-semibold">Written by Aimen Kaour</h4>
                <p className="text-gray-500 text-sm">Full-stack Developer & Math Researcher</p>
              </div>
            </div>
            <Link 
              href="/#contact" 
              className="px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-purple-500 hover:text-white transition-all duration-300"
            >
              Get in Touch
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}