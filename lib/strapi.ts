// lib/strapi.ts

// استخدام الروابط من متغيرات البيئة
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// ==================== Types ====================

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
 * دالة ذكية لتحويل هيكلية Strapi v5 المعقدة إلى كائنات بسيطة
 * تحل مشكلة الوصول للبيانات وتجعل العناوين تظهر بشكل صحيح
 */
function flattenStrapiData(data: any): any {
  if (!data) return null;

  if (Array.isArray(data)) {
    return data.map(flattenStrapiData);
  }

  let flattened = { ...data };

  // التعامل مع نظام attributes القديم لضمان التوافق الشامل
  if (data.attributes) {
    flattened = { ...flattened, ...data.attributes };
    delete flattened.attributes;
  }

  // تنظيف الكائنات المتداخلة (مثل الصور والوسوم)
  for (const key in flattened) {
    if (flattened[key] && typeof flattened[key] === "object") {
      if (flattened[key].data !== undefined) {
        flattened[key] = flattenStrapiData(flattened[key].data);
      } else if (!Array.isArray(flattened[key]) && key !== "tags") {
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

// ==================== READ Operations (Projects) ====================

export async function getProjects(limit = 100): Promise<Project[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects?populate=*&sort=publishedAt:desc&pagination[pageSize]=${limit}`, {
      headers: getHeaders(),
      next: { revalidate: 60 }
    });
    const json = await res.json();
    return flattenStrapiData(json.data) || [];
  } catch (error) {
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects?filters[slug][$eq]=${slug}&populate=*`, { headers: getHeaders() });
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
    const res = await fetch(`${STRAPI_URL}/api/articles?populate=*&sort=publishedAt:desc`, {
      headers: getHeaders(),
      next: { revalidate: 3600 }
    });
    const json = await res.json();
    return flattenStrapiData(json.data) || [];
  } catch (error) {
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*`, { headers: getHeaders() });
    const json = await res.json();
    const data = flattenStrapiData(json.data);
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    return null;
  }
}

// ==================== ADMIN & WRITE Operations ====================

export async function searchProjects(filters: any = {}): Promise<Project[]> {
  const { query } = filters;
  const params = new URLSearchParams({ populate: "*" });
  if (query) params.append("filters[title][$containsi]", query);
  
  const res = await fetch(`${STRAPI_URL}/api/projects?${params.toString()}`, { headers: getHeaders() });
  const json = await res.json();
  return flattenStrapiData(json.data) || [];
}

export async function getAllTags(): Promise<string[]> {
  const projects = await getProjects();
  const tags = projects.flatMap(p => p.tags?.map(t => t.name) || []);
  return Array.from(new Set(tags)).sort();
}

export async function createProject(data: any) {
  const res = await fetch(`${STRAPI_URL}/api/projects`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ data }),
  });
  return res.ok ? await res.json() : null;
}

export async function updateProject(id: string | number, data: any) {
  const res = await fetch(`${STRAPI_URL}/api/projects/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ data }),
  });
  return res.ok;
}

export async function deleteProject(id: string | number) {
  const res = await fetch(`${STRAPI_URL}/api/projects/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return res.ok;
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("files", file);
  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: "POST",
    headers: STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {},
    body: formData,
  });
  const data = await res.json();
  return { url: data[0].url };
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