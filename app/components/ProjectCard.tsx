// app/components/ProjectCard.tsx
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

// التعديل: جعل id إلزامي هنا لشبكة المشاريع، و teamSize يقبل string
export interface ProjectCardProps {
  id: string; 
  title: string;
  description: string;
  image?: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  date?: string;
  teamSize?: number | string; 
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
  
  // دالة مساعدة لعرض عدد الفريق بشكل صحيح
  const renderTeamSize = () => {
    if (!teamSize) return null;
    const size = typeof teamSize === 'string' ? parseInt(teamSize) : teamSize;
    return (
      <div className="flex items-center gap-1">
        <Users size={14} />
        {size} {size === 1 ? "member" : "members"}
      </div>
    );
  };

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
          <div className="relative h-64 md:h-full bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-pink-900/20 overflow-hidden">
            {image ? (
              <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Layers size={64} className="text-gray-400 dark:text-gray-600" />
              </div>
            )}
            {featured && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                <Star size={12} fill="currentColor" /> Featured
              </div>
            )}
          </div>

          <div className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
                <ArrowUpRight size={24} className="text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{description}</p>
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
                {date && <div className="flex items-center gap-1"><Calendar size={14} /> {date}</div>}
                {renderTeamSize()}
                {stars !== undefined && <div className="flex items-center gap-1"><Star size={14} /> {stars}</div>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // التخطيط الافتراضي (Default Card)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-gray-50 dark:bg-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        {image ? (
          <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"><Layers size={48} className="text-gray-400" /></div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          {liveUrl && <a href={liveUrl} target="_blank" className="p-3 bg-white rounded-full hover:scale-110 transition-transform"><ExternalLink size={18} className="text-gray-900" /></a>}
          {githubUrl && <a href={githubUrl} target="_blank" className="p-3 bg-white rounded-full hover:scale-110 transition-transform"><Github size={18} className="text-gray-900" /></a>}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{description}</p>
        <div className="flex flex-wrap gap-2 mt-auto">
          {tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 text-xs rounded-full bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200">{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function ProjectGrid({ projects, columns = 3 }: { projects: ProjectCardProps[], columns?: number }) {
  const gridCols = { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" }[columns as 2|3|4] || "md:grid-cols-3";
  return (
    <div className={`grid gap-6 ${gridCols}`}>
      {projects.map((project, index) => (
        <ProjectCard key={project.id} {...project} index={index} />
      ))}
    </div>
  );
}