// app/admin/projects/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Project, 
  getProjects, 
  deleteProject, 
  searchProjects,
  getAllTags,
  SearchFilters 
} from "../../../lib/strapi";
import Link from "next/link";
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  RefreshCw, 
  AlertCircle,
  Search,
  Filter,
  GripVertical,
  LayoutGrid,
  List,
  X
} from "lucide-react";
import EditProjectModal from "../../components/EditProjectModal";
import DraggableProjectList from "../../../app/components/DraggableProjectList";

type ViewMode = "table" | "grid" | "drag";

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SearchFilters["sortBy"]>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  
  // Modal
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const [projectsData, tagsData] = await Promise.all([
        getProjects({ limit: 100 }),
        getAllTags(),
      ]);
      setProjects(projectsData);
      setFilteredProjects(projectsData);
      setAllTags(tagsData);
    } catch (error) {
      console.error("Failed to load projects:", error);
      showMessage("error", "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Search & Filter effect
  useEffect(() => {
    async function applyFilters() {
      const filters: SearchFilters = {
        query: searchQuery || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        featured: showFeaturedOnly || undefined,
        sortBy,
        sortOrder,
      };

      const results = await searchProjects(filters, 100);
      setFilteredProjects(results);
    }

    const timeoutId = setTimeout(applyFilters, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedTags, showFeaturedOnly, sortBy, sortOrder]);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleDelete(project: Project) {
    if (!confirm(`Are you sure you want to delete "${project.title}"?`)) {
      return;
    }

    try {
      setDeleting(project.id);
      await deleteProject(project.id);
      showMessage("success", `"${project.title}" deleted successfully`);
      await loadProjects();
    } catch (error) {
      showMessage("error", `Failed to delete "${project.title}"`);
      console.error(error);
    } finally {
      setDeleting(null);
    }
  }

  function handleEdit(project: Project) {
    setEditingProject(project);
    setIsModalOpen(true);
  }

  function handleCreate() {
    setEditingProject(null);
    setIsModalOpen(true);
  }

  function handleSave() {
    loadProjects();
    showMessage("success", "Project saved successfully");
  }

  function handleReorder(newOrder: Project[]) {
    setFilteredProjects(newOrder);
    // هنا يمكنك حفظ الترتيب في Strapi إذا أضفت حقل order
    console.log("New order:", newOrder.map((p) => p.id));
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Projects Management
          </h1>
          <div className="flex flex-wrap gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded ${viewMode === "table" ? "bg-white dark:bg-gray-600 shadow" : ""}`}
                title="Table View"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow" : ""}`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("drag")}
                className={`p-2 rounded ${viewMode === "drag" ? "bg-white dark:bg-gray-600 shadow" : ""}`}
                title="Drag to Reorder"
              >
                <GripVertical size={18} />
              </button>
            </div>

            <button
              onClick={loadProjects}
              className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              New Project
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Tags Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={16} className="text-gray-500" />
              {allTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-red-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Featured Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Featured only</span>
            </label>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field as SearchFilters["sortBy"]);
                setSortOrder(order as "asc" | "desc");
              }}
              className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
            >
              <option value="createdAt-desc">Newest first</option>
              <option value="createdAt-asc">Oldest first</option>
              <option value="title-asc">Name A-Z</option>
              <option value="title-desc">Name Z-A</option>
              <option value="stars-desc">Most stars</option>
              <option value="date-desc">Recent date</option>
            </select>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-500">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            <AlertCircle size={20} />
            {message.text}
          </div>
        )}

        {/* Projects Display */}
        {viewMode === "drag" ? (
          // Drag & Drop View
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
              <GripVertical size={16} />
              Drag items to reorder (order is saved locally)
            </p>
            <DraggableProjectList
              projects={filteredProjects}
              onReorder={handleReorder}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ) : viewMode === "grid" ? (
          // Grid View
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold line-clamp-1">{project.title}</h3>
                  {project.featured && (
                    <span className="text-amber-500">⭐</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags?.slice(0, 3).map((t) => (
                    <span
                      key={t.name}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="flex-1 px-3 py-1 text-center text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleEdit(project)}
                    className="px-3 py-1 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded hover:bg-amber-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project)}
                    disabled={deleting === project.id}
                    className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    {deleting === project.id ? "..." : "Del"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Table View (Default)
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {`No projects found. Click "New Project" to create one.`}
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr 
                      key={project.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {project.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {project.tags?.map((t) => t.name).join(", ") || "No tags"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            project.featured
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {project.featured ? `⭐ Featured` : "Published"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {project.date
                          ? new Date(project.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/projects/${project.slug}`}
                            className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                            title="View Project"
                          >
                            <Eye size={18} />
                          </Link>
                          <button
                            onClick={() => handleEdit(project)}
                            className="p-2 text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors"
                            title="Edit Project"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(project)}
                            disabled={deleting === project.id}
                            className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Project"
                          >
                            {deleting === project.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
            <div className="text-sm text-gray-500">Total Projects</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-amber-600">
              {projects.filter((p) => p.featured).length}
            </div>
            <div className="text-sm text-gray-500">Featured</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {projects.filter((p) => p.publishedAt).length}
            </div>
            <div className="text-sm text-gray-500">Published</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {allTags.length}
            </div>
            <div className="text-sm text-gray-500">Technologies</div>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Tip:</strong> {`Use the search bar to find projects quickly, or switch to "Drag" mode to reorder items. Click "New Project" to create without leaving the dashboard.`}
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      <EditProjectModal
        project={editingProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}