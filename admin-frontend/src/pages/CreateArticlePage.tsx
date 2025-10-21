import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Save, Eye, Upload, X, Wand2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { postsApi, mediaApi, categoriesApi, tagsApi } from "@/lib/api";
import { generateSuggestions } from "@/lib/openai";
import { uploadImage } from "@/lib/firebase";
import ImageManager from "@/components/ImageManager";
import BlockEditor, { ContentBlock } from "@/components/BlockEditor";

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface MediaItem {
  id?: number;
  url: string;
  type: string;
  subtype?: string;
  alt_text?: string;
  order: number;
  preview?: string;
}

interface FormData {
  title: string;
  excerpt: string;
  body: string;
  status: "draft" | "published" | "archived";
  contentBlocks: ContentBlock[];
}

const CreateArticlePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [formData, setFormData] = useState<FormData>({
    title: "",
    excerpt: "",
    body: "",
    status: "draft",
    contentBlocks: [],
  });
  const [images, setImages] = useState<MediaItem[]>([]);
  const [isGenerating, setIsGenerating] = useState({
    title: false,
    excerpt: false,
    content: false,
  });
  const [insertAIContent, setInsertAIContent] = useState<
    ((content: string) => void) | null
  >(null);

  useEffect(() => {
    const loadData = async () => {
      setError(null);
      await Promise.all([fetchCategories(), fetchTags()]);
    };
    loadData();
  }, []);

  useEffect(() => {
    setFilteredCategories(
      categories.filter((category) =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
      )
    );
  }, [categorySearch, categories]);

  useEffect(() => {
    setFilteredTags(
      tags.filter((tag) =>
        tag.name.toLowerCase().includes(tagSearch.toLowerCase())
      )
    );
  }, [tagSearch, tags]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data as Category[]);
    } catch (error: unknown) {
      setError((error as Error).message || "Failed to fetch categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchTags = async () => {
    setIsLoadingTags(true);
    try {
      const response = await tagsApi.getAll();
      setTags(response.data as Tag[]);
    } catch (error: unknown) {
      setError((error as Error).message || "Failed to fetch tags");
    } finally {
      setIsLoadingTags(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value as "draft" | "published" | "archived",
    }));
  };

  const handleImagesChange = (newImages: MediaItem[]) => {
    setImages(newImages);
  };

  const handleContentBlocksChange = (blocks: ContentBlock[]) => {
    setFormData((prev) => ({
      ...prev,
      contentBlocks: blocks,
    }));
  };

  const handleInsertAIContent = (insertFn: (content: string) => void) => {
    setInsertAIContent(() => insertFn);
  };

  // Category logic
  const addCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    let category = categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (!category) {
      // Create new category
      try {
        const response = await categoriesApi.create({ name });
        category = response.data as Category;
        setCategories((prev) => [...prev, category]);
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: (error as Error).message || "Failed to create category",
          variant: "destructive",
        });
        return;
      }
    }
    if (category && !selectedCategories.includes(category.id)) {
      setSelectedCategories([...selectedCategories, category.id]);
    }
    setNewCategoryName("");
  };

  const removeCategory = (id: number) =>
    setSelectedCategories(selectedCategories.filter((cid) => cid !== id));

  // Tag logic
  const addTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    let tag = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (!tag) {
      // Create new tag
      try {
        const response = await tagsApi.create({ name });
        tag = response.data as Tag;
        setTags((prev) => [...prev, tag]);
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: (error as Error).message || "Failed to create tag",
          variant: "destructive",
        });
        return;
      }
    }
    if (tag && !selectedTags.includes(tag.id)) {
      setSelectedTags([...selectedTags, tag.id]);
    }
    setNewTagName("");
  };

  const removeTag = (id: number) =>
    setSelectedTags(selectedTags.filter((tid) => tid !== id));

  // AI Suggestions
  const generateSuggestion = async (type: "title" | "excerpt" | "content") => {
    // For title generation, we need some content to base it on
    if (type === "title" && formData.contentBlocks.length === 0) {
      toast({
        title: "Error",
        description: "Please add some content first to generate a title",
        variant: "destructive",
      });
      return;
    }

    // For excerpt and content generation, we need a title first
    if (type !== "title" && !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating((prev) => ({ ...prev, [type]: true }));
    try {
      // Determine the appropriate prompt based on the type
      let prompt = "";
      if (type === "title") {
        // For title generation, use the content blocks as prompt
        prompt = formData.contentBlocks
          .filter((block) => block.type === "text")
          .map((block) => block.content)
          .join("\n\n");

        if (!prompt.trim()) {
          toast({
            title: "Error",
            description:
              "Please add some text content first to generate a title",
            variant: "destructive",
          });
          return;
        }
      } else {
        // For excerpt and content, use the title as prompt
        prompt = formData.title;
      }

      const suggestion = await generateSuggestions(prompt, type);

      if (type === "content") {
        // For content, insert AI suggestion as a new block
        const contentText = suggestion.content || "";
        if (insertAIContent) {
          insertAIContent(contentText);
        } else {
          // Fallback: create a new text block with the AI suggestion
          const newBlock: ContentBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type: "text",
            content: contentText || "",
            order: formData.contentBlocks.length,
          };

          setFormData((prev) => ({
            ...prev,
            contentBlocks: [...prev.contentBlocks, newBlock],
          }));
        }
      } else {
        // For title and excerpt, update normally
        const fieldValue =
          type === "title" ? suggestion.title : suggestion.excerpt;
        setFormData((prev) => ({
          ...prev,
          [type]: fieldValue || "",
        }));
      }

      toast({
        title: "Success",
        description: `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } generated successfully`,
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          (error as Error).message || "Failed to generate suggestion",
        variant: "destructive",
      });
    } finally {
      setIsGenerating((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validate required fields
      if (!formData.title.trim()) {
        toast({
          title: "Error",
          description: "Please enter a title for your article",
          variant: "destructive",
        });
        return;
      }

      // Check if there's any content in the blocks
      const hasContent = formData.contentBlocks.some(
        (block) => block.type === "text" && block.content.trim() !== ""
      );

      if (!hasContent) {
        toast({
          title: "Error",
          description: "Please add some text content to your article",
          variant: "destructive",
        });
        return;
      }

      // Validate that at least one category is selected
      if (selectedCategories.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one category",
          variant: "destructive",
        });
        return;
      }

      // Convert content blocks to text for storage
      const bodyContent = formData.contentBlocks
        .map((block) => {
          if (block.type === "text") {
            return block.content || "";
          } else if (block.type === "image") {
            return `[IMAGE: ${block.imageUrl}] ${block.imageAlt || ""}`;
          }
          return "";
        })
        .filter((content) => content.trim())
        .join("\n\n");

      // Create article
      const articleData = {
        user_id: user?.id,
        title: formData.title,
        body: bodyContent,
        status: formData.status,
        published_at:
          formData.status === "published" ? new Date().toISOString() : null,
      };

      const articleResponse = await postsApi.create(articleData);
      const articleId = articleResponse.data.id;

      // Create media entries for images from both ImageManager and BlockEditor
      const allImages = [
        ...images,
        ...formData.contentBlocks
          .filter((block) => block.type === "image")
          .map((block, index) => ({
            url: block.imageUrl!,
            type: "image",
            subtype: "content" as const,
            alt_text: block.imageAlt || "",
            order: index,
          })),
      ];

      if (allImages.length > 0) {
        const imagesToSave = allImages.map((img) => ({
          url: img.url,
          type: img.type,
          subtype: img.subtype || "secondary",
          alt_text: img.alt_text || "",
          order: img.order,
        }));

        await mediaApi.createMultiple({
          post_id: articleId,
          images: imagesToSave,
        });
      }

      // Attach categories
      if (selectedCategories.length > 0) {
        await postsApi.syncCategories(articleId.toString(), selectedCategories);
      }

      // Attach tags
      if (selectedTags.length > 0) {
        await postsApi.syncTags(articleId.toString(), selectedTags);
      }

      toast({
        title: "Success",
        description: "Article created successfully",
      });

      navigate("/articles");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sort categories to show selected ones at the top
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    const aSelected = selectedCategories.includes(a.id);
    const bSelected = selectedCategories.includes(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return a.name.localeCompare(b.name);
  });

  // Sort tags to show selected ones at the top
  const sortedTags = [...filteredTags].sort((a, b) => {
    const aSelected = selectedTags.includes(a.id);
    const bSelected = selectedTags.includes(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Article</h1>
            <p className="text-gray-600 mt-1">
              Create a new article for your news platform
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/articles")}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Article
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Title
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateSuggestion("title")}
                    disabled={isGenerating.title}
                    title="Generate title from your content (add content first)"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {isGenerating.title
                      ? "Generating..."
                      : "Generate from Content"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter article title or write content first, then generate title with AI..."
                  className="text-lg"
                />
              </CardContent>
            </Card>

            {/* Excerpt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Excerpt
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateSuggestion("excerpt")}
                    disabled={isGenerating.excerpt}
                    title="Generate excerpt from your title"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {isGenerating.excerpt
                      ? "Generating..."
                      : "Generate from Title"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief description of the article (150-200 characters). Generate with AI after adding a title..."
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Content
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateSuggestion("content")}
                    disabled={isGenerating.content}
                    title="Generate content from your title"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {isGenerating.content
                      ? "Generating..."
                      : "Generate from Title"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BlockEditor
                  value={formData.contentBlocks}
                  onChange={handleContentBlocksChange}
                  onInsertAIContent={handleInsertAIContent}
                  placeholder="Start writing your article with text and image blocks..."
                />
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Wand2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">
                        AI Writing Assistant Tips:
                      </p>
                      <ul className="space-y-1 text-xs">
                        <li>
                          • <strong>Title:</strong> Write content first, then
                          generate a title from it
                        </li>
                        <li>
                          • <strong>Excerpt:</strong> Add a title first, then
                          generate an excerpt
                        </li>
                        <li>
                          • <strong>Content:</strong> Add a title first, then
                          generate article content
                        </li>
                        <li>
                          • <strong>Blocks:</strong> Mix text and images for
                          better storytelling
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image Manager */}
            <Card>
              <CardContent className="pt-6">
                <ImageManager
                  onImagesChange={handleImagesChange}
                  initialImages={images}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                  />
                  <Button
                    variant="outline"
                    onClick={() => setCategorySearch("")}
                  >
                    Clear
                  </Button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sortedCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="text-sm">{category.name}</span>
                      <Button
                        variant={
                          selectedCategories.includes(category.id)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          selectedCategories.includes(category.id)
                            ? removeCategory(category.id)
                            : setSelectedCategories([
                                ...selectedCategories,
                                category.id,
                              ])
                        }
                      >
                        {selectedCategories.includes(category.id)
                          ? "Selected"
                          : "Select"}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name..."
                    onKeyPress={(e) => e.key === "Enter" && addCategory()}
                  />
                  <Button variant="outline" onClick={addCategory}>
                    Add
                  </Button>
                </div>

                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((categoryId) => {
                      const category = categories.find(
                        (c) => c.id === categoryId
                      );
                      return (
                        <Badge
                          key={categoryId}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeCategory(categoryId)}
                        >
                          {category?.name}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="Search tags..."
                  />
                  <Button variant="outline" onClick={() => setTagSearch("")}>
                    Clear
                  </Button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sortedTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="text-sm">{tag.name}</span>
                      <Button
                        variant={
                          selectedTags.includes(tag.id) ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          selectedTags.includes(tag.id)
                            ? removeTag(tag.id)
                            : setSelectedTags([...selectedTags, tag.id])
                        }
                      >
                        {selectedTags.includes(tag.id) ? "Selected" : "Select"}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="New tag name..."
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tagId) => {
                      const tag = tags.find((t) => t.id === tagId);
                      return (
                        <Badge
                          key={tagId}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTag(tagId)}
                        >
                          {tag?.name}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateArticlePage;
