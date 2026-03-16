"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Project, getProjectBySlug } from "../../../../lib/strapi";

export default function AdminProjectDetail() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getProjectBySlug(params.id as string);
      setProject(data);
    }
    load();
  }, [params.id]);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
      <p>{project.description}</p>
      {/* تفاصيل أكثر للإدارة */}
    </div>
  );
}