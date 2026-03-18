// lib/strapi.ts

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// ==================== Types (Updated for Strapi v5) ====================

export interface Project {
  id: number;
  documentId: string;
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
  documentId: string;
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
 * دالة سحرية لتحويل هيكلية Strapi v4/v5 المعقدة إلى كائنات بسيطة
 * تقوم بحذف .attributes وتجعل الوصول للبيانات مباشراً
 */
function flattenStrapiData(data: any): any {
  if (!data) return null;

  if (Array.isArray(data)) {
    return data.map(flattenStrapiData);
  }

  let flattened = { ...data };

  // التعامل مع نظام attributes القديم إذا وجد لضمان التوافق
  if (data.attributes) {
    flattened = { ...flattened, ...data.attributes };
    delete flattened.attributes;
  }

  // التكرار داخل الكائنات الملحقة (مثل images و tags) لتسطيحها أيضاً
  for (const key in flattened) {
    if (flattened[key] && typeof flattened[key] === "object") {
      // إذا كان كائن يحتوي على data بداخلها (مثل الصور في Strapi)
      if (flattened[key].data !== undefined) {
        flattened[key] = flattenStrapiData(flattened[key].data);
      } 
      // تسطيح الكائنات العادية
      else if (!Array.isArray(flattened[key]) && key !== "tags") {
        flattened[key] = flattenStrapiData(flattened[key]);
      }
    }
  }

  return flattened;
}

export function getStrapiImageUrl(imagePath: string | null): string {
  if (!imagePath) return "/placeholder-project.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  return `${STRAPI_URL}${imagePath}`;
}

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
  };
}

// ==================== Fetch Operations ====================

async function fetchFromStrapi(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
      ...options,
      headers: { ...getHeaders(), ...options.headers },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Strapi Error [${endpoint}]:`, error);
      return null;
    }

    const json = await response.json();
    return flattenStrapiData(json.data);
  } catch (err) {
    console.error(`Fetch error [${endpoint}]:`, err);
    return null;
  }
}

// ==================== Projects Logic ====================

export async function getProjects(limit = 100): Promise<Project[]> {
  const data = await fetchFromStrapi(`projects?populate=*&sort=publishedAt:desc&pagination[pageSize]=${limit}`, {
    next: { revalidate: 60 }
  });
  return data || [];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const data = await fetchFromStrapi(`projects?filters[slug][$eq]=${slug}&populate=*`);
  return data && data.length > 0 ? data[0] : null;
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const data = await fetchFromStrapi(`projects?filters[featured][$eq]=true&populate=*&pagination[pageSize]=${limit}`);
  return data || [];
}

// ==================== Articles Logic ====================

export async function getArticles(): Promise<Article[]> {
  const data = await fetchFromStrapi(`articles?populate=*&sort=publishedAt:desc`, {
    next: { revalidate: 3600 }
  });
  return data || [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const data = await fetchFromStrapi(`articles?filters[slug][$eq]=${slug}&populate=*`);
  return data && data.length > 0 ? data[0] : null;
}

// ==================== Contact Logic ====================

export async function sendContactMessage(data: { name: string; email: string; message: string }): Promise<boolean> {
  const res = await fetch(`${STRAPI_URL}/api/contacts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ data }),
  });
  return res.ok;
}