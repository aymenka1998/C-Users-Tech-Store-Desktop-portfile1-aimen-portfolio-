// app/projects/[slug]/page.tsx
import { getProjectBySlug, getStrapiImageUrl, type Project } from "@/lib/strapi";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  Calendar, 
  Users, 
  Star, 
  ArrowLeft, 
  ExternalLink, 
  Github,
  Clock,
  Tag,
  GitFork
} from "lucide-react";

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  
  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.title} | Aimen Kaour`,
    description: project.description,
  };
}

// Generate static params for all projects (optional - for SSG)
export async function generateStaticParams() {
  // If you want SSG, implement getProjects() here and return slugs
  // For now, we'll use dynamic rendering
  return [];
}

// Helper function to normalize tags
function normalizeTags(tags: Project['tags']): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map(tag => {
      if (typeof tag === 'string') return tag;
      if (typeof tag === 'object' && tag !== null && 'name' in tag) {
        return tag.name;
      }
      return String(tag);
    });
  }
  return [];
}

export default async function ProjectDetailPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  // Normalize tags for rendering
  const normalizedTags = normalizeTags(project.tags);

  return (
    <main className="min-h-screen bg-[#050505]">
      {/* Back Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link 
            href="/projects" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Projects</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {project.featured && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full flex items-center gap-1 border border-amber-500/30">
                  <Star size={12} fill="currentColor" /> Featured
                </span>
              )}
              {project.status && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                  {project.status}
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
              {project.title}
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Project Image */}
          <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden border border-white/10 mb-12">
            <Image
              src={getStrapiImageUrl(project.image?.url || null)}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
          </div>

          {/* Project Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {project.date && (
              <div className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Calendar size={18} />
                  <span className="text-sm">Date</span>
                </div>
                <p className="text-white font-medium">
                  {new Date(project.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}
            
            {project.teamSize && (
              <div className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Users size={18} />
                  <span className="text-sm">Team Size</span>
                </div>
                <p className="text-white font-medium">
                  {project.teamSize} {project.teamSize === 1 ? 'Member' : 'Members'}
                </p>
              </div>
            )}
            
            {project.duration && (
              <div className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Clock size={18} />
                  <span className="text-sm">Duration</span>
                </div>
                <p className="text-white font-medium">{project.duration}</p>
              </div>
            )}
            
            {project.role && (
              <div className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Tag size={18} />
                  <span className="text-sm">Role</span>
                </div>
                <p className="text-white font-medium">{project.role}</p>
              </div>
            )}
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              {project.overview && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-1 bg-purple-500 rounded-full"></span>
                    Overview
                  </h2>
                  <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">
                    {project.overview}
                  </div>
                </section>
              )}

              {/* Key Features */}
              {project.features && project.features.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-8 h-1 bg-purple-500 rounded-full"></span>
                    Key Features
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {project.features.map((feature, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 bg-[#111] border border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-purple-400 text-xs font-bold">{index + 1}</span>
                        </div>
                        <p className="text-gray-300">{feature}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Technical Details */}
              {project.technicalDetails && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-1 bg-purple-500 rounded-full"></span>
                    Technical Details
                  </h2>
                  <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed bg-[#111] border border-white/5 rounded-2xl p-6">
                    {project.technicalDetails}
                  </div>
                </section>
              )}

              {/* Challenges & Solutions */}
              {project.challenges && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-1 bg-purple-500 rounded-full"></span>
                    Challenges & Solutions
                  </h2>
                  <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">
                    {project.challenges}
                  </div>
                </section>
              )}

              {/* Results */}
              {project.results && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-1 bg-purple-500 rounded-full"></span>
                    Results & Impact
                  </h2>
                  <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">
                    {project.results}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Action Buttons */}
              <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Project Links</h3>
                
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ExternalLink size={18} />
                    View Live Demo
                  </a>
                )}
                
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white border border-white/10 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Github size={18} />
                    View Source Code
                  </a>
                )}
                
                {project.documentationUrl && (
                  <a
                    href={project.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white border border-white/10 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ExternalLink size={18} />
                    Documentation
                  </a>
                )}
              </div>

              {/* Tech Stack */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span 
                        key={tech}
                        className="px-3 py-1.5 text-sm bg-white/5 text-gray-300 rounded-lg border border-white/5 hover:border-purple-500/30 hover:text-purple-400 transition-colors cursor-default"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {normalizedTags.length > 0 && (
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {normalizedTags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 text-xs bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* GitHub Stats */}
              {(project.stars !== null && project.stars !== undefined) || (project.forks !== null && project.forks !== undefined) ? (
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Repository Stats</h3>
                  <div className="flex gap-6">
                    {project.stars !== null && project.stars !== undefined && (
                      <div className="flex items-center gap-2">
                        <Star size={20} className="text-yellow-400" />
                        <div>
                          <p className="text-2xl font-bold text-white">{project.stars}</p>
                          <p className="text-xs text-gray-500">Stars</p>
                        </div>
                      </div>
                    )}
                    {project.forks !== null && project.forks !== undefined && (
                      <div className="flex items-center gap-2">
                        <GitFork size={20} className="text-gray-400" />
                        <div>
                          <p className="text-2xl font-bold text-white">{project.forks}</p>
                          <p className="text-xs text-gray-500">Forks</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Gallery Preview */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Gallery</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {project.gallery.slice(0, 4).map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-white/5 hover:border-purple-500/30 transition-colors cursor-pointer group">
                        <Image
                          src={getStrapiImageUrl(img.url)}
                          alt={`${project.title} screenshot ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                  {project.gallery.length > 4 && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                      +{project.gallery.length - 4} more images
                    </p>
                  )}
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Next/Prev Navigation */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <Link 
              href="/projects"
              className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
            >
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-purple-500/50 group-hover:bg-purple-500/10 transition-all">
                <ArrowLeft size={20} />
              </div>
              <div className="hidden md:block">
                <p className="text-sm text-gray-500">Back to</p>
                <p className="font-medium">All Projects</p>
              </div>
            </Link>
            
            <Link 
              href="/contact"
              className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
            >
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-500">Interested?</p>
                <p className="font-medium">Get in Touch</p>
              </div>
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-purple-500/50 group-hover:bg-purple-500/10 transition-all">
                <ArrowLeft size={20} className="rotate-180" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}