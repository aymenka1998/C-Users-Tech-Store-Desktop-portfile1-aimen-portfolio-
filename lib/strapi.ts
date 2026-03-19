// lib/strapi.ts

// جلب الإعدادات من متغيرات البيئة
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// ==================== Types ====================

export interface Project {
  id: number;
  documentId?: string;
  title: string;
  description: string;
  slug: string;
  featured: boolean;
  liveUrl: string | null;
  githubUrl: string | null;
  date: string | null;
  content?: string;
  publishedAt: string | null;
  tags: Array<{ name: string }>;
  image: {
    url: string;
    alternativeText: string | null;
  } | null;
}

export interface Article {
  id: number;
  documentId?: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  publishedAt: string;
  cover?: {
    url: string;
    alternativeText: string | null;
  };
}

// ==================== Helper Functions ====================

/**
 * دالة ذكية لتحويل هيكلية Strapi v5/v4 المعقدة إلى كائنات بسيطة.
 * تعالج مشكلة data.attributes وتمنع التكرار اللانهائي.
 */
function flattenStrapiData(data: any): any {
  if (!data) return null;

  if (Array.isArray(data)) {
    return data.map(flattenStrapiData);
  }

  let flattened: any = {};

  // استخراج المعرفات الأساسية
  if (data.id) flattened.id = data.id;
  if (data.documentId) flattened.documentId = data.documentId;

  // فك تغليف attributes (للتوافق مع v4) أو استخدام البيانات مباشرة (v5)
  const attributes = data.attributes ? data.attributes : data;

  for (const key in attributes) {
    // تخطي الحقول التقنية المتكررة
    if (key === 'id' || key === 'documentId' || key === 'attributes') continue;

    const value = attributes[key];

    if (value && typeof value === "object") {
      // التعامل مع الحقول التي تحتوي على .data (العلاقات والصور في Strapi)
      if (value.data !== undefined) {
        flattened[key] = flattenStrapiData(value.data);
      } 
      // التعامل مع المصفوفات البسيطة (مثل المكونات المتداخلة أو التاجات)
      else if (Array.isArray(value)) {
        flattened[key] = value.map(flattenStrapiData);
      }
      // إذا كان كائن عادي نأخذه كما هو (لتجنب التكرار اللانهائي في الحقول النصية)
      else {
        flattened[key] = value;
      }
    } else {
      flattened[key] = value;
    }
  }

  return flattened;
}

/**
 * دالة بناء رابط الصورة بشكل صحيح مع ضمان عدم تكرار السلاش /
 */
export function getStrapiImageUrl(imagePath: string | null): string {
  if (!imagePath) return "/placeholder-project.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  
  const baseUrl = STRAPI_URL.endsWith('/') ? STRAPI_URL.slice(0, -1) : STRAPI_URL;
  return `${baseUrl}${imagePath}`;
}

/**
 * دالة إنشاء الـ Headers مع الـ Token
 */
function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (STRAPI_API_TOKEN) {
    headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
  }
  return headers;
}

// ==================== READ Operations (Projects) ====================

export async function getProjects(limit = 100): Promise<Project[]> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/projects?populate=*&sort=publishedAt:desc&pagination[pageSize]=${limit}`, 
      { 
        headers: getHeaders(),
        cache: 'no-store' // جلب حقيقي دائماً في بيئة النشر
      }
    );
    const json = await res.json();
    return flattenStrapiData(json.data) || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/projects?filters[slug][$eq]=${slug}&populate=*`, 
      { 
        headers: getHeaders(),
        cache: 'no-store'
      }
    );
    const json = await res.json();
    const data = flattenStrapiData(json.data);
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    return null;
  }
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const projects = await getProjects(limit);
  return projects.filter(p => p.featured);
}

// ==================== READ Operations (Articles) ====================

export async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/articles?populate=*&sort=publishedAt:desc`, 
      { 
        headers: getHeaders(),
        cache: 'no-store' 
      }
    );
    const json = await res.json();
    return flattenStrapiData(json.data) || [];
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*`, 
      { 
        headers: getHeaders(),
        cache: 'no-store'
      }
    );
    const json = await res.json();
    const data = flattenStrapiData(json.data);
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    return null;
  }
}

// ==================== CONTACT Operations ====================

export async function sendContactMessage(data: { name: string; email: string; message: string }): Promise<boolean> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/contacts`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ data }),
    });
    return res.ok;
  } catch (error) {
    return false;
  }
}