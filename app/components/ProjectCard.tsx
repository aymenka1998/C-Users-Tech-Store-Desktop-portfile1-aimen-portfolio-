"use client";

import { motion } from "framer-motion";
import { 
  ExternalLink, 
  Github, 
  ArrowUpRight, 
  Calendar, 
  Users,
  Star,
  GitFork,
  Layers
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProjectCardProps {
  title: string;
  description: string;
  image?: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  date?: string;
  teamSize?: number;
  stars?: number;
  forks?: number;
  index?: number;
  layout?: "default" | "horizontal" | "compact";
}

export default function ProjectCard({
  title,
  description,
  image,
  tags,
  liveUrl,
  githubUrl,
  featured = false,
  date,
  teamSize,
  stars,
  forks,
  index = 0,
  layout = "default",
}: ProjectCardProps) {
  // تخطيط أفقي (للقسم المميز)
  if (layout === "horizontal") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative h-64 md:h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Layers size={64} className="text-gray-400 dark:text-gray-600" />
              </div>
            )}
            
            {/* Featured Badge */}
            {featured && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                <Star size={12} fill="currentColor" />
                Featured
              </div>
            )}

            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-4">
                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white rounded-full hover:scale-110 transition-transform"
                  >
                    <ExternalLink size={20} className="text-gray-900" />
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white rounded-full hover:scale-110 transition-transform"
                  >
                    <Github size={20} className="text-gray-900" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {title}
                </h3>
                <ArrowUpRight 
                  size={24} 
                  className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors transform group-hover:translate-x-1 group-hover:-translate-y-1" 
                />
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {description}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                {date && (
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {date}
                  </div>
                )}
                {teamSize && (
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    {teamSize} {teamSize === 1 ? "member" : "members"}
                  </div>
                )}
                {stars !== undefined && (
                  <div className="flex items-center gap-1">
                    <Star size={14} />
                    {stars}
                  </div>
                )}
                {forks !== undefined && (
                  <div className="flex items-center gap-1">
                    <GitFork size={14} />
                    {forks}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // التخطيط المضغوط (للشريط الجانبي أو القوائم)
  if (layout === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-colors"
      >
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {title.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h4>
          <div className="flex gap-2 mt-1">
            {tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
            >
              <Github size={16} />
            </a>
          )}
        </div>
      </motion.div>
    );
  }

  // التخطيط الافتراضي (البطاقة العادية)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-gray-50 dark:bg-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Layers size={48} className="text-gray-400 dark:text-gray-600" />
          </div>
        )}

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
            <Star size={10} fill="currentColor" />
            Featured
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white rounded-full hover:scale-110 transition-transform shadow-lg"
              title="View Live"
            >
              <ExternalLink size={18} className="text-gray-900" />
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white rounded-full hover:scale-110 transition-transform shadow-lg"
              title="View Code"
            >
              <Github size={18} className="text-gray-900" />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {title}
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
          {description}
        </p>

        {/* Meta Info */}
        {(date || teamSize) && (
          <div className="flex gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
            {date && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {date}
              </span>
            )}
            {teamSize && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                {teamSize} members
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {tags.map((tag, i) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs rounded-full bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="px-6 py-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
        <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          {stars !== undefined && (
            <span className="flex items-center gap-1">
              <Star size={14} />
              {stars}
            </span>
          )}
          {forks !== undefined && (
            <span className="flex items-center gap-1">
              <GitFork size={14} />
              {forks}
            </span>
          )}
        </div>
        <Link
          href={liveUrl || githubUrl || "#"}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          Details <ArrowUpRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}

// مكون لعرض شبكة المشاريع
export function ProjectGrid({
  projects,
  columns = 3,
  featuredFirst = true,
}: {
  projects: Array<ProjectCardProps & { id: string }>;
  columns?: 2 | 3 | 4;
  featuredFirst?: boolean;
}) {
  const sortedProjects = featuredFirst
    ? [...projects].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    : projects;

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid gap-6 ${gridCols[columns]}`}>
      {sortedProjects.map((project, index) => (
        <ProjectCard
          key={project.id}
          {...project}
          index={index}
        />
      ))}
    </div>
  );
}