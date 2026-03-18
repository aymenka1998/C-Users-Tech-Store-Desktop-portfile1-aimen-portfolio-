// lib/strapi.ts

// استخدام الرابط من متغيرات البيئة مع حماية افتراضية
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
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
  teamSize: number | null;
  stars: number | null;
  forks: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  tags: Array<{ name: string }>;
  image: {
    url: string;
    alternativeText: string | null;
  } | null;
  content?: string;
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

export interface CreateProjectInput {
  title: string;
  description: string;
  slug?: string;
  featured?: boolean;
  liveUrl?: string;
  githubUrl?: string;
  date?: string;
  teamSize?: number;
  stars?: number;
  forks?: number;
  tags?: string[];
  content?: string;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

// ==================== Helper Functions ====================

export function getStrapiImageUrl(imagePath: string | null): string {
  if (!imagePath) return "/placeholder-project.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  return `${STRAPI_URL}${imagePath}`;
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (STRAPI_API_TOKEN) {
    headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
  }
  
  return headers;
}

// ==================== READ Operations (Projects) ====================

export async function getProjects(
  options: {
    featured?: boolean;
    limit?: number;
    sort?: string;
  } = {}
): Promise<Project[]> {
  if (!STRAPI_URL) return [];

  const { featured, limit = 100, sort = "publishedAt:desc" } = options;
  const params = new URLSearchParams({
    sort,
    "pagination[pageSize]": limit.toString(),
    populate: "*",
  });

  if (featured !== undefined) {
    params.append("filters[featured][$eq]", featured.toString());
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api/projects?${params.toString()}`, {
      headers: getHeaders(),
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("Failed to fetch projects");
    const json: StrapiResponse<Project> = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!STRAPI_URL) return null;
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects?filters[slug][$eq]=${slug}&populate=*`, {
      headers: getHeaders(),
      next: { revalidate: 60 },
    });
    const json: StrapiResponse<Project> = await res.json();
    return json.data?.[0] || null;
  } catch (error) {
    return null;
  }
}

export async function getProjectById(id: number | string): Promise<Project | null> {
  if (!STRAPI_URL) return null;
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects/${id}?populate=*`, {
      headers: getHeaders(),
      next: { revalidate: 60 },
    });
    const json: StrapiSingleResponse<Project> = await res.json();
    return json.data || null;
  } catch (error) {
    return null;
  }
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  return getProjects({ featured: true, limit });
}

// ==================== READ Operations (Articles) ====================

export async function getArticles(): Promise<Article[]> {
  if (!STRAPI_URL) return [];
  try {
    const res = await fetch(`${STRAPI_URL}/api/articles?populate=*&sort=publishedAt:desc`, {
      headers: getHeaders(),
      next: { revalidate: 3600 }
    });
    const json: StrapiResponse<Article> = await res.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!STRAPI_URL) return null;
  try {
    const res = await fetch(`${STRAPI_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*`, {
      headers: getHeaders(),
      next: { revalidate: 3600 }
    });
    const json: StrapiResponse<Article> = await res.json();
    return json.data?.[0] || null;
  } catch (error) {
    return null;
  }
}

// ==================== CREATE Operations ====================

export async function createProject(data: CreateProjectInput): Promise<Project | null> {
  if (!STRAPI_URL) return null;
  const formattedData = {
    data: {
      ...data,
      tags: data.tags?.map((name) => ({ name })) || [],
      publishedAt: new Date().toISOString(),
    },
  };
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(formattedData),
    });
    const json: StrapiSingleResponse<Project> = await res.json();
    return json.data;
  } catch (error) {
    throw error;
  }
}

// ==================== UPDATE/DELETE Operations ====================

export async function updateProject(id: number | string, data: UpdateProjectInput): Promise<Project | null> {
  if (!STRAPI_URL) return null;
  const { tags, ...restOfData } = data;
  const payload = {
    data: {
      ...restOfData,
      ...(tags && { tags: tags.map((name) => ({ name })) }),
    },
  };
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const json: StrapiSingleResponse<Project> = await res.json();
    return json.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteProject(id: number | string): Promise<boolean> {
  if (!STRAPI_URL) return false;
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.ok;
  } catch (error) {
    return false;
  }
}

// ==================== UPLOAD Operations ====================

export async function uploadImage(file: File): Promise<{ url: string } | null> {
  if (!STRAPI_URL) return null;
  const formData = new FormData();
  formData.append("files", file);
  try {
    const res = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      headers: STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {},
      body: formData,
    });
    const data = await res.json();
    return { url: data[0].url };
  } catch (error) {
    return null;
  }
}

// ==================== SEARCH & FILTER ====================

export async function searchProjects(filters: any = {}, limit = 100): Promise<Project[]> {
  if (!STRAPI_URL) return [];
  const { query, tags, featured, sortBy = "createdAt", sortOrder = "desc" } = filters;
  const params = new URLSearchParams({
    "pagination[pageSize]": limit.toString(),
    populate: "*",
    sort: `${sortBy}:${sortOrder}`,
  });
  if (query) {
    params.append("filters[$or][0][title][$containsi]", query);
    params.append("filters[$or][1][description][$containsi]", query);
  }
  if (tags && tags.length > 0) {
    tags.forEach((tag: string, index: number) => {
      params.append(`filters[tags][name][$in][${index}]`, tag);
    });
  }
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects?${params.toString()}`, { headers: getHeaders() });
    const json: StrapiResponse<Project> = await res.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
}

export async function getAllTags(): Promise<string[]> {
  if (!STRAPI_URL) return [];
  try {
    const res = await fetch(`${STRAPI_URL}/api/projects?populate[tags]=*&pagination[pageSize]=1000`, { headers: getHeaders() });
    const json: StrapiResponse<Project> = await res.json();
    const allTags = json.data.flatMap((p) => p.tags?.map((t) => t.name) || []);
    return [...new Set(allTags)].sort();
  } catch (error) {
    return [];
  }
}

// ==================== CONTACT Operations ====================

export async function sendContactMessage(data: { name: string; email: string; message: string }): Promise<boolean> {
  if (!STRAPI_URL) return false;
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