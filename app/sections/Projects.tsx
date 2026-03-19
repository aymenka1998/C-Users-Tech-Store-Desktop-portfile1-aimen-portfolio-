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
        // إصلاح: تمرير الرقم مباشرة
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

  const formatProjectForCard = (project: Project, index: number): ProjectCardProps => ({
    id: project.documentId || project.id.toString(),
    title: project.title,
    description: project.description,
    image: getStrapiImageUrl(project.image?.url || null),
    tags: project.tags?.map((t) => t.name) || [],
    liveUrl: project.liveUrl || undefined,
    githubUrl: project.githubUrl || undefined,
    featured: project.featured,
    date: project.date ? new Date(project.date).getFullYear().toString() : undefined,
    teamSize: project.teamSize || undefined,
    stars: project.stars || undefined,
    forks: project.forks || undefined,
    index,
  });

  const featuredProjects = projects.filter(p => p.featured).slice(0, 2).map((p, i) => formatProjectForCard(p, i));
  const regularProjects = projects.filter(p => !p.featured).map((p, i) => formatProjectForCard(p, i));

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <section id="projects" className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Featured <span className="text-blue-600">Projects</span></h2>
          <div className="flex flex-wrap justify-center gap-2">
            <SkillBadge name="Next.js" icon="nextjs" level="Expert" size="sm" />
            <SkillBadge name="TypeScript" icon="typescript" level="Advanced" size="sm" />
          </div>
        </div>

        {featuredProjects.length > 0 && (
          <div className="mb-12 space-y-8">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} layout="horizontal" />
            ))}
          </div>
        )}

        {regularProjects.length > 0 && (
          <div className="mb-12">
            <ProjectGrid projects={regularProjects} columns={3} />
          </div>
        )}

        <div className="text-center mt-12">
          <a href="https://github.com/aimenkaour" target="_blank" className="inline-flex items-center px-6 py-3 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
            <Github className="mr-2" size={20} /> View More on GitHub <ArrowRight size={18} className="ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
}