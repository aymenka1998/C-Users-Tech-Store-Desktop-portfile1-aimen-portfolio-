// app/blog/[slug]/page.tsx
export const dynamic = 'force-dynamic';
import { getArticleBySlug, getStrapiImageUrl } from "../../../lib/strapi";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowLeft } from "lucide-react";
// المكون السحري لحل مشكلة [object Object]
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const { title, description, content, cover, publishedAt } = article;
  const imageUrl = getStrapiImageUrl(cover?.url || null);

  return (
    <main className="min-h-screen py-24 px-6 bg-[#050505]">
      <div className="max-w-4xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 mb-12 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Articles
        </Link>

        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">{title}</h1>
          <p className="text-xl text-gray-400 border-l-4 border-purple-600 pl-6 italic">{description}</p>
        </header>

        {imageUrl && (
          <div className="relative w-full h-64 md:h-112.5 rounded-3xl overflow-hidden mb-16 border border-white/10">
            <Image src={imageUrl} alt={title} fill className="object-cover" priority />
          </div>
        )}

        {/* الحل هنا: تحويل الكائنات إلى نص مقروء */}
        <article className="prose prose-invert prose-purple max-w-none">
          <div className="text-gray-300 leading-loose text-lg">
            {content ? (
              <BlocksRenderer content={content as unknown as BlocksContent} />
            ) : (
              <p>No content available.</p>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}