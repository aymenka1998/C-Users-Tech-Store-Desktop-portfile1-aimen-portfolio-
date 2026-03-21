
// lib/strapi.ts

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// ==================== Types ====================

// نوع الصورة في Strapi
export interface StrapiImage {
  url: string;
  alternativeText: string | null;
  width?: number;
  height?: number;
  formats?: any;
}

export interface Project {
  id: number;
  documentId?: string;
  title: string;
  description: string;
  slug: string;
  featured: boolean;
  status?: string | null; // مثل: "Completed", "In Progress", "On Hold"
  
  // الروابط
  liveUrl: string | null;
  githubUrl: string | null;
  documentationUrl?: string | null;
  
  // التواريخ والمدة
  date: string | null;
  duration?: string | null; // مثل: "3 months", "6 weeks"
  
  // الفريق والدور
  teamSize?: number | string | null;
  role?: string | null; // مثل: "Full Stack Developer", "Project Lead"
  
  // إحصائيات GitHub
  stars?: number | null;
  forks?: number | null;
  
  // المحتوى التفصيلي
  overview?: string | null; // وصف عام مفصل
  features?: string[] | null; // قائمة الميزات الرئيسية
  technicalDetails?: string | null; // تفاصيل تقنية
  challenges?: string | null; // التحديات والحلول
  results?: string | null; // النتائج والتأثير
  content?: string; // المحتوى الخام (Blocks من Strapi)
  
  // التصنيفات والتقنيات
  tags: Array<{ name: string }> | string[];
  technologies?: string[] | null; // قائمة التقنيات المستخدمة
  
  // الصور
  image: StrapiImage | null;
  gallery?: StrapiImage[] | null; // معرض الصور الإضافية
  
  publishedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
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

function flattenStrapiData(data: any): any {
  if (!data) return null;

  // التعامل مع المصفوفات (قائمة المشاريع)
  if (Array.isArray(data)) {
    return data.map(flattenStrapiData);
  }

  let flattened: any = {};

  // 1. جلب المعرفات الأساسية
  if (data.id) flattened.id = data.id;
  if (data.documentId) flattened.documentId = data.documentId;

  // 2. تحديد مصدر البيانات (attributes في v4 أو البيانات مباشرة في v5)
  const attributes = data.attributes || data;

  for (const key in attributes) {
    if (key === 'id' || key === 'documentId' || key === 'attributes') continue;

    const value = attributes[key];

    // 3. معالجة الصور والعلاقات (تجنب التداخل اللانهائي)
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        // معالجة المصفوفات (مثل gallery, tags, technologies, features)
        flattened[key] = value.map(item => {
          if (item.attributes) return flattenStrapiData(item);
          if (item.url) return flattenStrapiData(item); // صور
          return item; // قيم بسيطة مثل strings
        });
      } else if (value.data !== undefined) {
        // علاقة واحدة
        flattened[key] = flattenStrapiData(value.data);
      } else if (value.url) {
        // صورة مفردة
        flattened[key] = flattenStrapiData(value);
      } else {
        // اذا كان كائناً عادياً (مثل Blocks المحتوى), نأخذه كما هو
        flattened[key] = value;
      }
    } else {
      flattened[key] = value;
    }
  }

  return flattened;
}

export function getStrapiImageUrl(imagePath: string | null): string {
  if (!imagePath) return "/placeholder-project.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  const baseUrl = STRAPI_URL.endsWith('/') ? STRAPI_URL.slice(0, -1) : STRAPI_URL;
  return `${baseUrl}${imagePath}`;
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (STRAPI_API_TOKEN) headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
  return headers;
}

// ==================== READ Operations (Projects) ====================

export async function getProjects(limit = 100): Promise<Project[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects?populate=*&sort=publishedAt:desc&pagination[pageSize]=${limit}`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
    const json = await res.json();
    return flattenStrapiData(json.data) || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
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
    
    if (!res.ok) {
      console.error('Failed to fetch project:', res.status);
      return null;
    }
    
    const json = await res.json();
    const data = flattenStrapiData(json.data);
    
    // Strapi v4/v5 returns data as array
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    return data || null;
  } catch (error) {
    console.error('Error fetching project by slug:', error);
    return null;
  }
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const projects = await getProjects(limit * 2); // جلب أكثر للتصفية
  return projects.filter(p => p.featured).slice(0, limit);
}

export async function getProjectsByTag(tag: string): Promise<Project[]> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/projects?filters[tags][name][$eq]=${encodeURIComponent(tag)}&populate=*`,
      { 
        headers: getHeaders(),
        cache: 'no-store' 
      }
    );
    const json = await res.json();
    return flattenStrapiData(json.data) || [];
  } catch (error) {
    console.error('Error fetching projects by tag:', error);
    return [];
  }
}

// ==================== READ Operations (Articles) ====================

export async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/articles?populate=*&sort=publishedAt:desc`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
    const json = await res.json();
    return flattenStrapiData(json.data) || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*`, { 
      headers: getHeaders(),
      cache: 'no-store' 
    });
    const json = await res.json();
    const data = flattenStrapiData(json.data);
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

// ==================== ADMIN & SEARCH Operations ====================

export async function searchProjects(filters: { query?: string; tag?: string; technology?: string } = {}): Promise<Project[]> {
  const params = new URLSearchParams({ populate: "*" });
  
  if (filters.query) {
    params.append("filters[title][$containsi]", filters.query);
  }
  
  if (filters.tag) {
    params.append("filters[tags][name][$eq]", filters.tag);
  }
  
  if (filters.technology) {
    params.append("filters[technologies][$containsi]", filters.technology);
  }
  
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects?${params.toString()}`, { 
      headers: getHeaders(),
      cache: 'no-store' 
    });
    const json = await res.json();
    return flattenStrapiData(json.data) || [];
  } catch (error) {
    console.error('Error searching projects:', error);
    return [];
  }
}

export async function getAllTags(): Promise<string[]> {
  try {
    const projects = await getProjects();
    const tags = projects.flatMap(p => {
      if (!p.tags) return [];
      if (Array.isArray(p.tags) && p.tags.length > 0) {
        // اذا كان العنصر الأول له خاصية name
        if (typeof p.tags[0] === 'object' && p.tags[0] !== null && 'name' in p.tags[0]) {
          return (p.tags as Array<{ name: string }>).map(t => t.name);
        }
      }
      return p.tags as string[];
    });
    return Array.from(new Set(tags)).sort();
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

export async function getAllTechnologies(): Promise<string[]> {
  try {
    const projects = await getProjects();
    const technologies = projects.flatMap(p => p.technologies || []);
    return Array.from(new Set(technologies)).sort();
  } catch (error) {
    console.error('Error fetching technologies:', error);
    return [];
  }
}

// ==================== WRITE Operations (Projects) ====================

export async function createProject(data: Partial<Project>) {
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ data }),
    });
    
    if (!res.ok) {
      console.error('Failed to create project:', res.status);
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
}

export async function updateProject(id: string | number, data: Partial<Project>) {
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ data }),
    });
    
    if (!res.ok) {
      console.error('Failed to update project:', res.status);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating project:', error);
    return false;
  }
}

export async function deleteProject(id: string | number) {
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    
    if (!res.ok) {
      console.error('Failed to delete project:', res.status);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

// ==================== Upload Operations ====================

export async function uploadImage(file: File): Promise<StrapiImage | null> {
  try {
    const formData = new FormData();
    formData.append("files", file);
    
    const headers: HeadersInit = {};
    if (STRAPI_API_TOKEN) {
      headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
    }
    
    const res = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    
    if (!res.ok) {
      console.error('Failed to upload image:', res.status);
      return null;
    }
    
    const data = await res.json();
    return data[0] || null;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

export async function uploadMultipleImages(files: File[]): Promise<StrapiImage[]> {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    
    const headers: HeadersInit = {};
    if (STRAPI_API_TOKEN) {
      headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
    }
    
    const res = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    
    if (!res.ok) {
      console.error('Failed to upload images:', res.status);
      return [];
    }
    
    return await res.json() || [];
  } catch (error) {
    console.error('Error uploading images:', error);
    return [];
  }
}

// ==================== CONTACT Operations ====================

export async function sendContactMessage(data: { name: string; email: string; message: string; subject?: string }): Promise<boolean> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/contacts`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ data }),
    });
    
    if (!res.ok) {
      console.error('Failed to send contact message:', res.status);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending contact message:', error);
    return false;
  }
}

// ==================== Utility Functions ====================

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatRelativeDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// Export STRAPI_URL for external use
export { STRAPI_URL };