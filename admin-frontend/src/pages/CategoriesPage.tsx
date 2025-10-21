import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  FolderOpen,
  Loader2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { categoriesApi } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  posts_count?: number;
  color?: string; // Frontend-only field for UI
}

const CATEGORY_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-yellow-500",
];

type SortOption =
  | "name-asc"
  | "name-desc"
  | "usage-high"
  | "usage-low"
  | "date-new"
  | "date-old";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [usageFilter, setUsageFilter] = useState<"all" | "with-posts" | "empty">("all");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: CATEGORY_COLORS[0],
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Apply filters and sorting when categories, search, or sort changes
  useEffect(() => {
    applyFiltersAndSort();
  }, [categories, searchTerm, sortBy, usageFilter]);

  const applyFiltersAndSort = () => {
    let filtered = [...categories];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description &&
            category.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Apply usage filter
    if (usageFilter !== "all") {
      filtered = filtered.filter((category) => {
        const hasPosts = (category.posts_count || 0) > 0;
        return usageFilter === "with-posts" ? hasPosts : !hasPosts;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "usage-high":
          return (b.posts_count || 0) - (a.posts_count || 0);
        case "usage-low":
          return (a.posts_count || 0) - (b.posts_count || 0);
        case "date-new":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "date-old":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredCategories(filtered);
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoriesApi.getAll();
      // Add color field to categories for UI
      const categoriesWithColors = response.data.map(
        (category: Category, index: number) => ({
          ...category,
          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        })
      );
      setCategories(categoriesWithColors);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingCategory) {
        // Update existing category
        await categoriesApi.update(editingCategory.id.toString(), {
          name: formData.name,
          description: formData.description || null,
        });
        toast({
          title: "Success",
          description: `Category "${formData.name}" has been updated.`,
        });
        setEditingCategory(null);
      } else {
        // Create new category
        await categoriesApi.create({
          name: formData.name,
          description: formData.description || null,
        });
        toast({
          title: "Success",
          description: `Category "${formData.name}" has been created.`,
        });
        setIsCreateOpen(false);
      }

      // Refresh categories list
      await fetchCategories();

      // Reset form
      setFormData({ name: "", description: "", color: CATEGORY_COLORS[0] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || CATEGORY_COLORS[0],
    });
  };

  const handleDelete = async (category: Category) => {
    if (category.posts_count && category.posts_count > 0) {
      toast({
        title: "Cannot delete category",
        description: `"${category.name}" has ${category.posts_count} articles. Move or delete articles first.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await categoriesApi.delete(category.id.toString());
      await fetchCategories();
      toast({
        title: "Success",
        description: `Category "${category.name}" has been deleted.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const CategoryForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Category Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter category name..."
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Brief description..."
        />
      </div>
      <div>
        <Label>Color (UI only)</Label>
        <div className="flex gap-2 mt-2">
          {CATEGORY_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Select ${color
                .replace("bg-", "")
                .replace("-500", "")} color`}
              className={`w-8 h-8 rounded-full ${color} ${
                formData.color === color ? "ring-2 ring-gray-400" : ""
              }`}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {editingCategory ? "Update Category" : "Create Category"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsCreateOpen(false);
            setEditingCategory(null);
            setFormData({
              name: "",
              description: "",
              color: CATEGORY_COLORS[0],
            });
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-1">
              Organize your articles into categories
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Add a new category to organize your articles.
                </DialogDescription>
              </DialogHeader>
              <CategoryForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Name (A-Z)
                    </div>
                  </SelectItem>
                  <SelectItem value="name-desc">
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      Name (Z-A)
                    </div>
                  </SelectItem>
                  <SelectItem value="usage-high">
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      Most Used
                    </div>
                  </SelectItem>
                  <SelectItem value="usage-low">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Least Used
                    </div>
                  </SelectItem>
                  <SelectItem value="date-new">
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      Newest First
                    </div>
                  </SelectItem>
                  <SelectItem value="date-old">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Oldest First
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Usage Filter */}
            <div className="flex items-center gap-2">
              <Select value={usageFilter} onValueChange={(value: "all" | "with-posts" | "empty") => setUsageFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by usage..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="with-posts">With Posts</SelectItem>
                  <SelectItem value="empty">Empty Categories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500">
              {filteredCategories.length} of {categories.length} categories
            </div>

            {/* Clear Filters */}
            {(searchTerm || sortBy !== "name-asc" || usageFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSortBy("name-asc");
                  setUsageFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${category.color}`}
                    ></div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {category.posts_count || 0} articles
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(category)}
                        className="text-red-600"
                        disabled={
                          category.posts_count
                            ? category.posts_count > 0
                            : false
                        }
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{category.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Slug: {category.slug}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {editingCategory && (
          <Dialog
            open={!!editingCategory}
            onOpenChange={() => setEditingCategory(null)}
          >
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                  Update the category information.
                </DialogDescription>
              </DialogHeader>
              <CategoryForm />
            </DialogContent>
          </Dialog>
        )}

        {filteredCategories.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {categories.length === 0 ? "No categories yet" : "No categories found"}
            </h3>
            <p className="text-gray-600 mb-4">
              {categories.length === 0 
                ? "Create your first category to organize your articles"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {categories.length === 0 ? (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSortBy("name-asc");
                  setUsageFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CategoriesPage;
