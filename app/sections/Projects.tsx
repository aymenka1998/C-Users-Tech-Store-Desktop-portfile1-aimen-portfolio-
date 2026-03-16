// app/sections/Projects.tsx
"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github, ArrowRight, Loader2 } from "lucide-react";
import ProjectCard, { ProjectGrid } from "../components/ProjectCard";
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
        const data = await getProjects({ limit: 50 });
        setProjects(data);
      } catch (err) {
        setError("Failed to load projects");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  // تحويل بيانات Strapi إلى تنسيق ProjectCard
  const formatProjectForCard = (project: Project, index: number) => ({
    id: project.documentId,
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

  const featuredProjects = projects
    .filter((p) => p.featured)
    .slice(0, 2)
    .map((p, i) => formatProjectForCard(p, i));

  const regularProjects = projects
    .filter((p) => !p.featured)
    .map((p, i) => formatProjectForCard(p, i));

  if (loading) {
    return (
      <section id="projects" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mb-4" />
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A selection of my recent work showcasing my expertise in full-stack development.
          </p>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <SkillBadge name="React" icon="react" level="Expert" size="sm" />
            <SkillBadge name="Next.js" icon="nextjs" level="Expert" size="sm" />
            <SkillBadge name="TypeScript" icon="typescript" level="Advanced" size="sm" />
            <SkillBadge name="Node.js" icon="nodejs" level="Advanced" size="sm" />
            <SkillBadge name="Tailwind" icon="tailwind" level="Expert" size="sm" />
          </div>
        </motion.div>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <div className="mb-12 space-y-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Featured Projects
            </h3>
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} layout="horizontal" />
            ))}
          </div>
        )}

        {/* Regular Projects */}
        {regularProjects.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Other Projects ({regularProjects.length})
            </h3>
            <ProjectGrid projects={regularProjects} columns={3} featuredFirst={false} />
          </div>
        )}

        {/* View More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com/aimenkaour"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 rounded-full border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-gray-900 transition-all group"
          >
            <Github className="mr-2" size={20} />
            View More on GitHub
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}