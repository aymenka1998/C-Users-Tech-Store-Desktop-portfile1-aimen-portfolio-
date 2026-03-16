"use client";

import { motion } from "framer-motion";
import SkillBadge, { SkillBadgeGroup } from "../components/SkillBadge";

const skillCategories = [
  {
    title: "Frontend",
    skills: [
      { name: "React", icon: "react", level: "Expert" as const },
      { name: "Next.js", icon: "nextjs", level: "Expert" as const },
      { name: "TypeScript", icon: "typescript", level: "Advanced" as const },
      { name: "Tailwind CSS", icon: "tailwind", level: "Expert" as const },
      { name: "JavaScript", icon: "javascript", level: "Expert" as const },
      { name: "HTML/CSS", icon: "html", level: "Expert" as const },
    ],
  },
  {
    title: "Backend",
    skills: [
      { name: "Node.js", icon: "nodejs", level: "Advanced" as const },
      { name: "PostgreSQL", icon: "postgres", level: "Intermediate" as const },
      { name: "MongoDB", icon: "mongodb", level: "Advanced" as const },
      { name: "GraphQL", icon: "graphql", level: "Intermediate" as const },
      { name: "REST APIs", icon: "api", level: "Advanced" as const },
      { name: "Redis", icon: "database", level: "Intermediate" as const },
    ],
  },
  {
    title: "Tools & DevOps",
    skills: [
      { name: "Git/GitHub", icon: "git", level: "Advanced" as const },
      { name: "Docker", icon: "docker", level: "Intermediate" as const },
      { name: "AWS", icon: "aws", level: "Intermediate" as const },
      { name: "Figma", icon: "figma", level: "Intermediate" as const },
      { name: "Vercel", icon: "vercel", level: "Advanced" as const },
      { name: "CI/CD", icon: "workflow", level: "Intermediate" as const },
    ],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Technical <span className="gradient-text">Skills</span>
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mb-4" />
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            My tech stack is focused on modern, scalable technologies that enable me to build
            high-quality applications efficiently.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-xl font-bold mb-6 text-center gradient-text">
                {category.title}
              </h3>
              <SkillBadgeGroup 
                skills={category.skills} 
                columns={2}
                animated={true}
              />
            </motion.div>
          ))}
        </div>

        {/* All Skills Cloud */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <h3 className="text-lg font-semibold mb-6 text-gray-600 dark:text-gray-400">
            Technologies I Work With
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "React", icon: "react", level: "Expert" as const },
              { name: "Next.js", icon: "nextjs", level: "Expert" as const },
              { name: "TypeScript", icon: "typescript", level: "Advanced" as const },
              { name: "Tailwind", icon: "tailwind", level: "Expert" as const },
              { name: "Node.js", icon: "nodejs", level: "Advanced" as const },
              { name: "PostgreSQL", icon: "postgres", level: "Intermediate" as const },
              { name: "MongoDB", icon: "mongodb", level: "Advanced" as const },
              { name: "Docker", icon: "docker", level: "Intermediate" as const },
              { name: "AWS", icon: "aws", level: "Intermediate" as const },
              { name: "Git", icon: "git", level: "Advanced" as const },
              { name: "Figma", icon: "figma", level: "Intermediate" as const },
              { name: "Vercel", icon: "vercel", level: "Advanced" as const },
            ].map((skill) => (
              <SkillBadge
                key={skill.name}
                {...skill}
                size="md"
                showLevel={false}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}