// app/sections/Projects.tsx
"use client";

import { motion } from "framer-motion";
import { Github, ArrowRight, Loader2 } from "lucide-react";
import ProjectCard, { ProjectGrid, type ProjectCardProps } from "../components/ProjectCard";
import SkillBadge from "../components/SkillBadge";
import { useEffect, useState } from "react";
import { Project, getProjects, getStrapiImageUrl } from "../../lib/strapi";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const data = await getProjects(50); 
        setProjects(data);
      } catch (err) {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  // دالة مساعدة لضمان أن الرابط يبدأ بـ http أو https
  const sanitizeUrl = (url: string | null | undefined) => {
    if (!url) return undefined;
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  // دالة مساعدة لتحويل tags إلى مصفوفة strings
  const normalizeTags = (tags: Project['tags']): string[] => {
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
  };

  const formatProjectForCard = (project: Project, index: number): ProjectCardProps => ({
    id: project.documentId || project.id.toString(),
    title: project.title,
    description: project.description,
    image: getStrapiImageUrl(project.image?.url || null),
    tags: normalizeTags(project.tags), // <-- استخدام الدالة المساعدة هنا
    liveUrl: sanitizeUrl(project.liveUrl),
    githubUrl: sanitizeUrl(project.githubUrl),
    featured: project.featured,
    date: project.date ? new Date(project.date).getFullYear().toString() : undefined,
    teamSize: project.teamSize || undefined,
    stars: project.stars || undefined,
    forks: project.forks || undefined,
    index,
  });

  const featuredProjects = projects.filter(p => p.featured).slice(0, 2).map((p, i) => formatProjectForCard(p, i));
  const regularProjects = projects.filter(p => !p.featured).map((p, i) => formatProjectForCard(p, i));

  if (loading) return <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

  return (
    <section id="projects" className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-4"
          >
            Featured <span className="text-blue-600">Projects</span>
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-2">
            <SkillBadge name="Next.js" icon="nextjs" level="Expert" size="sm" />
            <SkillBadge name="TypeScript" icon="typescript" level="Advanced" size="sm" />
            <SkillBadge name="Strapi" icon="strapi" level="Advanced" size="sm" />
          </div>
        </div>

        {featuredProjects.length > 0 && (
          <div className="mb-16 space-y-12">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} layout="horizontal" />
            ))}
          </div>
        )}

        {regularProjects.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-8 text-gray-800 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              All Projects
            </h3>
            <ProjectGrid projects={regularProjects} columns={3} />
          </div>
        )}

        <div className="text-center mt-16">
          <a 
            href="https://github.com/aymenka1998/C-Users-Tech-Store-Desktop-portfile1-aimen-portfolio-.git" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-3 rounded-full border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all group"
          >
            <Github className="mr-2" size={20} /> 
            Explore more on GitHub 
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}