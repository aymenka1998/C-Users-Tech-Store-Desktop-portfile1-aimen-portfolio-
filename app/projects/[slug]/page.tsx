// app/projects/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects, getStrapiImageUrl } from "../../../lib/strapi";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Calendar, Users, Star, GitFork } from "lucide-react";
// استيراد المعالج لحل مشكلة [object Object]
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} | Aimen Kaour`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#050505] pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/#projects"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-purple-400 mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Projects
        </Link>

        {/* Header Container */}
        <div className="bg-white dark:bg-[#111] rounded-2xl shadow-lg overflow-hidden border border-white/5">
          {/* Project Image */}
          {project.image && (
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src={getStrapiImageUrl(project.image.url)}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
              {/* تصحيح الكلاس بناءً على تحذير Tailwind */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {project.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-white/80 text-sm">
                  {project.date && (
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                      <Calendar size={14} />
                      {new Date(project.date).toLocaleDateString()}
                    </span>
                  )}
                  {project.teamSize && (
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                      <Users size={14} />
                      {project.teamSize} members
                    </span>
                  )}
                  {project.stars !== undefined && project.stars !== null && (
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                      <Star size={14} className="text-yellow-400" />
                      {project.stars} stars
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content Body */}
          <div className="p-6 md:p-10">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags?.map((tag) => (
                <span
                  key={tag.name}
                  className="px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider border border-purple-500/20"
                >
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Main Description */}
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed font-medium">
              {project.description}
            </p>

            {/* Rich Content (Fix for [object Object]) */}
            {project.content && (
              <div className="prose dark:prose-invert prose-purple max-w-none mb-12 
                prose-p:text-gray-400 prose-p:leading-loose prose-p:text-lg">
                <BlocksRenderer content={project.content as unknown as BlocksContent} />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-white/5">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-500 transition-all hover:scale-105 shadow-lg shadow-purple-600/20"
                >
                  <ExternalLink size={20} className="mr-2" />
                  Live Demo
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-all hover:scale-105"
                >
                  <Github size={20} className="mr-2" />
                  Source Code
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}