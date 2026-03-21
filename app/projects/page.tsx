// app/projects/page.tsx
// أجبر Next.js على جلب بيانات جديدة عند كل طلب
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { getProjects, getStrapiImageUrl, type Project } from "../../lib/strapi";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Users, Star, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Projects | Aimen Kaour",
  description: "Showcasing my latest full-stack development and math research projects.",
};

export default async function ProjectsPage() {
  // جلب المشاريع باستخدام الدالة المحدثة التي تستخدم cache: 'no-store'
  const fetchedProjects = await getProjects();
  const projects: Project[] = Array.isArray(fetchedProjects) ? fetchedProjects : [];
if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h1 className="text-white text-2xl">No Projects Found</h1>
        <p className="text-gray-500">Check if the API is returning data correctly to the server.</p>
        {/* هذا السطر سيساعدنا في معرفة ما إذا كان هناك خطأ في الربط */}
        <pre className="text-xs text-red-500 mt-10">
          API URL: {process.env.NEXT_PUBLIC_STRAPI_URL}
        </pre>
      </div>
    );
  }
  return (
    <main className="min-h-screen py-24 px-6 max-w-7xl mx-auto bg-[#050505]">
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-linear-to-r from-white to-gray-500 bg-clip-text text-transparent">
          Featured Projects
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          A collection of my work in web development, math, and technical research.
        </p>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project: Project) => (
            <Link 
              href={`/projects/${project.slug}`} 
              key={project.documentId || project.id}
              className="group bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
            >
              {/* Image */}
              <div className="relative h-56 w-full">
                <Image
                  src={getStrapiImageUrl(project.image?.url || null)}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                  {project.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-white/5 pt-4">
                  {project.date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(project.date).toLocaleDateString()}
                    </span>
                  )}
                  {project.stars !== null && (
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400" />
                      {project.stars}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#111]">
          <p className="text-gray-500 mb-2">No projects found in the database.</p>
          <p className="text-sm text-gray-600">Make sure you have published projects on your Strapi dashboard and permissions are set.</p>
        </div>
      )}
    </main>
  );
}