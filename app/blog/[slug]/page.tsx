import { notFound } from "next/navigation";
import { getArticles, getArticleBySlug, getStrapiImageUrl } from "../../../lib/strapi";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const articles = await getArticles();
    
    // في Strapi v5 البيانات تكون مباشرة داخل المصفوفة بدون attributes
    if (!articles || !Array.isArray(articles)) return [];
    
    return articles.map((article: any) => ({
      // فحص الطريقتين لضمان عدم حدوث Error أثناء الـ Build
      slug: article.slug || article.attributes?.slug,
    }));
  } catch (error) {
    console.error("Failed to fetch articles for build:", error);
    return [];
  }
}

export default async function ArticlePage({ params }: Props) {
  // انتظر الـ params في Next.js 14/15
  const { slug } = params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // في Strapi v5، الخصائص تكون مباشرة في الكائن
  // نستخدم الاختيار الشرطي لدعم v4 و v5 معاً لضمان الأمان
  const data = article.attributes || article;
  const { title, content, publishedAt, cover } = data;
  
  // استخراج رابط الصورة في v5 يكون مباشر أكثر
  const imageUrl = getStrapiImageUrl(cover?.url || cover?.attributes?.url);

  return (
    <main className="min-h-screen py-24 px-6 max-w-4xl mx-auto">
      <Link 
        href="/blog" 
        className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Blog
      </Link>

      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
          {title}
        </h1>
        
        <div className="flex flex-wrap gap-6 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-purple-500" />
            <span>{publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            }) : 'No Date'}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={16} className="text-purple-500" />
            <span>Aimen Kaour</span>
          </div>
        </div>
      </header>

      {imageUrl && (
        <div className="relative w-full h-[450px] mb-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <Image
            src={imageUrl}
            alt={title || "Article Image"}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <article className="prose prose-invert prose-purple max-w-none prose-lg">
        {/* بما أن Strapi v5 يعيد Blocks، تأكد أن content هو String أو استخدم Renderer */}
        <div 
           className="text-gray-300 leading-relaxed"
           dangerouslySetInnerHTML={{ __html: content }} 
        />
      </article>
    </main>
  );
}