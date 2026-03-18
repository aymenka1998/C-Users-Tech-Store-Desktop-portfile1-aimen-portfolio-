// lib/strapi.ts

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
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

// تم حذف UpdateProjectInput الفارغة واستخدام المبدأ مباشرة في الدوال
// أو يمكنك تركها هكذا إذا كنت ستضيف حقولاً لاحقاً، لكن ESLint يفضل النوع المباشر
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
  meta: Record<string, unknown>; // تم استبدال {} بـ Record لتجنب خطأ ESLint
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

// ==================== READ Operations ====================

export async function getProjects(
  options: {
    featured?: boolean;
    limit?: number;
    sort?: string;
  } = {}
): Promise<Project[]> {
  const { featured, limit = 100, sort = "publishedAt:desc" } = options;

  const params = new URLSearchParams({
    sort,
    "pagination[pageSize]": limit.toString(),
    populate: "*",
  });

  if (featured !== undefined) {
    params.append("filters[featured][$eq]", featured.toString());
  }

  const url = `${STRAPI_URL}/api/projects?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: getHeaders(),
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("Failed to fetch projects");

    const json: StrapiResponse<Project> = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const params = new URLSearchParams({
    "filters[slug][$eq]": slug,
    populate: "*",
  });

  const url = `${STRAPI_URL}/api/projects?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: getHeaders(),
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("Failed to fetch project");

    const json: StrapiResponse<Project> = await res.json();
    return json.data[0] || null;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function getProjectById(id: number): Promise<Project | null> {
  const url = `${STRAPI_URL}/api/projects/${id}?populate=*`;

  try {
    const res = await fetch(url, {
      headers: getHeaders(),
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("Failed to fetch project");

    const json: StrapiSingleResponse<Project> = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  return getProjects({ featured: true, limit });
}

export async function getLatestProjects(limit = 6): Promise<Project[]> {
  return getProjects({ limit, sort: "publishedAt:desc" });
}

// ==================== CREATE Operations ====================

export async function createProject(
  data: CreateProjectInput
): Promise<Project | null> {
  const url = `${STRAPI_URL}/api/projects`;

  const formattedData = {
    data: {
      ...data,
      tags: data.tags?.map((name) => ({ name })) || [],
      publishedAt: new Date().toISOString(),
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(formattedData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || "Failed to create project");
    }

    const json: StrapiSingleResponse<Project> = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}


// ==================== UPDATE Operations ====================

// ==================== UPDATE Operations ====================

export async function updateProject(
  id: number,
  data: UpdateProjectInput
): Promise<Project | null> {
  const url = `${STRAPI_URL}/api/projects/${id}`;

  // 1. تفكيك التاجز بعيداً عن بقية البيانات
  const { tags, ...restOfData } = data;

  // 2. بناء الكائن النهائي بنوع صريح يتقبله TypeScript
  const payload: {
    data: Omit<UpdateProjectInput, 'tags'> & {
      tags?: Array<{ name: string }>;
    };
  } = {
    data: {
      ...restOfData,
      // تحويل التاجز فقط إذا كانت موجودة
      ...(tags && { tags: tags.map((name) => ({ name })) }),
    },
  };

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || "Failed to update project");
    }

    const json: StrapiSingleResponse<Project> = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}

// ==================== DELETE Operations ====================

export async function deleteProject(id: number): Promise<boolean> {
  const url = `${STRAPI_URL}/api/projects/${id}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || "Failed to delete project");
    }

    return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
}

// ==================== UPLOAD Operations ====================

export async function uploadImage(file: File): Promise<{ url: string } | null> {
  const url = `${STRAPI_URL}/api/upload`;

  const formData = new FormData();
  formData.append("files", file);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: STRAPI_API_TOKEN
        ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
        : {},
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload image");

    const data = await res.json();
    return { url: data[0].url };
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

// ==================== SEARCH & FILTER ====================

export interface SearchFilters {
  query?: string;
  tags?: string[];
  featured?: boolean;
  sortBy?: "date" | "title" | "stars" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export async function searchProjects(
  filters: SearchFilters = {},
  limit = 100
): Promise<Project[]> {
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
    tags.forEach((tag, index) => {
      params.append(`filters[tags][name][$in][${index}]`, tag);
    });
  }

  if (featured !== undefined) {
    params.append("filters[featured][$eq]", featured.toString());
  }

  const url = `${STRAPI_URL}/api/projects?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: getHeaders(),
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error("Failed to search projects");

    const json: StrapiResponse<Project> = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error searching projects:", error);
    return [];
  }
}

export async function getAllTags(): Promise<string[]> {
  const url = `${STRAPI_URL}/api/projects?populate[tags]=*&pagination[pageSize]=1000`;

  try {
    const res = await fetch(url, {
      headers: getHeaders(),
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error("Failed to fetch tags");

    const json: StrapiResponse<Project> = await res.json();
    const allTags = json.data.flatMap((p) => p.tags?.map((t) => t.name) || []);
    return [...new Set(allTags)].sort();
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

// ==================== REORDER Operations ====================

export async function updateProjectOrder(
  id: number,
  newOrder: number
): Promise<Project | null> {
  return updateProject(id, { teamSize: newOrder });
}

export async function saveProjectsOrder(
  projectsOrder: { id: number; order: number }[]
): Promise<boolean> {
  try {
    await Promise.all(
      projectsOrder.map(({ id, order }) => updateProjectOrder(id, order))
    );
    return true;
  } catch (error) {
    console.error("Error saving order:", error);
    return false;
  }
}

// ==================== CONTACT Operations ====================

export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

export async function sendContactMessage(data: ContactInput): Promise<boolean> {
  const url = `${STRAPI_URL}/api/contacts`; 

  const formattedData = {
    data: data,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: getHeaders(), 
      body: JSON.stringify(formattedData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || "Failed to send message");
    }

    return true;
  } catch (error) {
    console.error("Error in sendContactMessage:", error);
    throw error;
  }
}
export async function getArticles() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/articles?populate=*`, {
    //cache: 'no-store', // أو استخدم revalidate إذا كنت تفضل ISR
    next: { revalidate: 3600 }
  });
  const data = await res.json();
  return data.data;
}

export async function getArticleBySlug(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*`);
  const data = await res.json();
  return data.data[0];
}