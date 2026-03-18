// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getArticles, getArticleBySlug, getStrapiImageUrl } from "../../../lib/strapi";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const articles = await getArticles();
    // نتحقق إذا كانت articles موجودة وهي مصفوفة
    if (!articles || !Array.isArray(articles)) return [];
    
    return articles.map((article: any) => ({
      slug: article.attributes.slug,
    }));
  } catch (error) {
    console.error("Failed to fetch articles for build:", error);
    return []; // نرجع مصفوفة فارغة لكي ينجح الـ Build
  }
}
export async function generateMetadata({ params }: Props) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${article.attributes.title} | Aimen Kaour`,
    description: article.attributes.description,
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const { title, content, description, cover, publishedAt } = article.attributes;
  const imageUrl = getStrapiImageUrl(cover?.data?.attributes?.url);

  return (
    <main className="min-h-screen py-24 px-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link 
        href="/blog" 
        className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Blog
      </Link>

      {/* Article Header */}
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
          {title}
        </h1>
        
        <div className="flex flex-wrap gap-6 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-purple-500" />
            <span>{new Date(publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            })}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={16} className="text-purple-500" />
            <span>Aimen Kaour</span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {imageUrl && (
        <div className="relative w-full h-[450px] mb-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Article Content */}
      <article className="prose prose-invert prose-purple max-w-none prose-lg">
        {/* If using Markdown, use <ReactMarkdown>{content}</ReactMarkdown> */}
        {/* If using Rich Text/HTML: */}
        <div 
           className="text-gray-300 leading-relaxed"
           dangerouslySetInnerHTML={{ __html: content }} 
        />
      </article>

      {/* Footer / Call to action */}
      <div className="mt-20 pt-10 border-t border-white/10 flex flex-col items-center">
        <p className="text-gray-500 italic mb-4">Thanks for reading!</p>
        <Link 
          href="/#contact" 
          className="text-purple-400 hover:text-purple-300 font-medium transition-colors underline underline-offset-4"
        >
          Let's discuss this topic?
        </Link>
      </div>
    </main>
  );
}