// app/projects/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects, getStrapiImageUrl } from "../../../lib/strapi";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Calendar, Users, Star, GitFork } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  params: { slug: string };
}

// Generate static params for all projects
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

// Generate metadata for the page
export async function generateMetadata({ params }: Props) {
  const project = await getProjectBySlug(params.slug);
  
  if (!project) {
    return { title: "Project Not Found" };
  }

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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/#projects"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Projects
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {project.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-white/80 text-sm">
                  {project.date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(project.date).toLocaleDateString()}
                    </span>
                  )}
                  {project.teamSize && (
                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      {project.teamSize} members
                    </span>
                  )}
                  {project.stars !== null && (
                    <span className="flex items-center gap-1">
                      <Star size={16} />
                      {project.stars} stars
                    </span>
                  )}
                  {project.forks !== null && (
                    <span className="flex items-center gap-1">
                      <GitFork size={16} />
                      {project.forks} forks
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags?.map((tag) => (
                <span
                  key={tag.name}
                  className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium"
                >
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {project.description}
            </p>

            {/* Rich Content */}
            {project.content && (
              <div 
                className="prose dark:prose-invert max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink size={20} className="mr-2" />
                  View Live Demo
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-full border-2 border-gray-300 dark:border-gray-600 font-semibold hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors"
                >
                  <Github size={20} className="mr-2" />
                  View Source Code
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}