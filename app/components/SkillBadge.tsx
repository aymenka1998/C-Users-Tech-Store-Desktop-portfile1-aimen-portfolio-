"use client";

import { motion } from "framer-motion";
import { 
  Code2, 
  Palette, 
  Database, 
  Globe, 
  Server, 
  Layout, 
  GitBranch, 
  Cloud,
  Terminal,
  Cpu,
  Smartphone,
  Figma,
  Layers,
  Zap,
  Box,
  Container,
  Workflow,
  Shield,
  Wifi,
  Monitor
} from "lucide-react";

type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

interface SkillBadgeProps {
  name: string;
  icon?: string;
  level?: SkillLevel;
  color?: string;
  showLevel?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const iconMap: { [key: string]: React.ElementType } = {
  react: Code2,
  nextjs: Globe,
  typescript: Terminal,
  javascript: Code2,
  tailwind: Palette,
  nodejs: Server,
  database: Database,
  mongodb: Database,
  postgres: Database,
  git: GitBranch,
  github: GitBranch,
  docker: Container,
  aws: Cloud,
  vercel: Zap,
  figma: Figma,
  html: Layout,
  css: Palette,
  redux: Box,
  graphql: Workflow,
  rest: Wifi,
  testing: Shield,
  mobile: Smartphone,
  desktop: Monitor,
  cloud: Cloud,
  api: Server,
  ui: Layout,
  ux: Figma,
  performance: Cpu,
  default: Code2,
};

const levelColors: { [key in SkillLevel]: string } = {
  Beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Advanced: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Expert: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const sizeClasses = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 20,
};

export default function SkillBadge({
  name,
  icon = "default",
  level,
  color,
  showLevel = true,
  size = "md",
  animated = true,
}: SkillBadgeProps) {
  const IconComponent = iconMap[icon.toLowerCase()] || iconMap.default;
  const levelStyle = level ? levelColors[level] : "";
  const customColorStyle = color
    ? `bg-${color}-100 text-${color}-700 dark:bg-${color}-900/30 dark:text-${color}-400`
    : "";

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.8 } : false}
      whileInView={animated ? { opacity: 1, scale: 1 } : false}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${sizeClasses[size]}
        ${level ? levelStyle : customColorStyle || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}
        hover:shadow-md transition-shadow cursor-default
        border border-transparent hover:border-current/20
      `}
    >
      <IconComponent size={iconSizes[size]} className="flex-shrink-0" />
      <span>{name}</span>
      {showLevel && level && (
        <span className="ml-1 text-[10px] opacity-60 font-normal">
          • {level}
        </span>
      )}
    </motion.div>
  );
}

// مكون لعرض مجموعة من المهارات
export function SkillBadgeGroup({
  skills,
  columns = 3,
  animated = true,
}: {
  skills: Array<{
    name: string;
    icon?: string;
    level?: SkillLevel;
  }>;
  columns?: number;
  animated?: boolean;
}) {
  return (
    <div
      className={`grid gap-3`}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {skills.map((skill, index) => (
        <motion.div
          key={skill.name}
          initial={animated ? { opacity: 0, y: 20 } : false}
          whileInView={animated ? { opacity: 1, y: 0 } : false}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <SkillBadge {...skill} size="md" />
        </motion.div>
      ))}
    </div>
  );
}