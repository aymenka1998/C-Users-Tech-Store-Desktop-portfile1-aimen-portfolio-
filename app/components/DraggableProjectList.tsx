// app/components/DraggableProjectList.tsx
"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, Edit, Trash2 } from "lucide-react";
import { Project } from "../../lib/strapi";
import Link from "next/link";

interface SortableProjectItemProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

function SortableProjectItem({ project, onEdit, onDelete }: SortableProjectItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4 ${
        isDragging ? "opacity-50 shadow-2xl" : ""
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={20} className="text-gray-400" />
      </button>

      {/* Project Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{project.title}</h3>
          {project.featured && (
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
              ⭐ Featured
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {project.tags?.map((t) => t.name).join(", ")}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Link
          href={`/projects/${project.slug}`}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
        >
          <Eye size={18} />
        </Link>
        <button
          onClick={() => onEdit(project)}
          className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => onDelete(project)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

interface DraggableProjectListProps {
  projects: Project[];
  onReorder: (projects: Project[]) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export default function DraggableProjectList({
  projects,
  onReorder,
  onEdit,
  onDelete,
}: DraggableProjectListProps) {
  const [items, setItems] = useState(projects);

  useEffect(() => {
    setItems(projects);
  }, [projects]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((p) => p.id === active.id);
        const newIndex = items.findIndex((p) => p.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder(newItems);
        return newItems;
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((project) => (
            <SortableProjectItem
              key={project.id}
              project={project}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}