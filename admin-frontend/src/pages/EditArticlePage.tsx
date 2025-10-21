import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Save, Eye, Upload, X, ArrowLeft, Wand2 } from "lucide-react";
import { postsApi, categoriesApi, tagsApi, mediaApi } from "@/lib/api";
import { uploadImage, deleteImage } from "@/lib/firebase";
import { generateSuggestions } from "@/lib/openai";
import BlockEditor, { ContentBlock } from "@/components/BlockEditor";

interface Category {
  id: number;
  name: string;
}
interface Tag {
  id: number;
  name: string;
}

interface Article {
  id: number;
  title: string;
  body: string;
  excerpt?: string;
  status: "draft" | "published" | "archived";
  image_url?: string;
  media?: Array<{
    id: number;
    type: string;
    url: string;
    alt_text?: string;
  }>;
  categories: Category[];
  tags: Tag[];
}

const EditArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState({
    title: false,
    excerpt: false,
    content: false,
  });
  const [insertAIContent, setInsertAIContent] = useState<
    ((content: string) => void) | null
  >(null);
  const [previousImage, setPreviousImage] = useState<string | null>(null);

  // Parse existing content into blocks
  const parseContentToBlocks = (
    body: string,
    media: Array<{ id: number; type: string; url: string; alt_text?: string }>
  ): ContentBlock[] => {
    const blocks: ContentBlock[] = [];
    let blockIndex = 0;

    // Check if this is new format (contains [IMAGE: markers)
    const hasImageMarkers = body.includes("[IMAGE:");

    if (hasImageMarkers) {
      // New format: parse with image markers
      const lines = body.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        // Check if line contains image marker
        const imageMatch = line.match(/\[IMAGE: (.+?)\]/);
        if (imageMatch) {
          const imageUrl = imageMatch[1];
          const altText = line.replace(/\[IMAGE: .+?\]/, "").trim();

          blocks.push({
            id: `block-${blockIndex++}`,
            type: "image",
            content: "",
            imageUrl,
            imageAlt: altText,
            order: blocks.length,
          });
        } else if (line.trim()) {
          // Text block
          blocks.push({
            id: `block-${blockIndex++}`,
            type: "text",
            content: line || "",
            order: blocks.length,
          });
        }
      }
    } else {
      // Old format: treat entire content as one text block
      if (body.trim()) {
        blocks.push({
          id: `block-${blockIndex++}`,
          type: "text",
          content: body.trim() || "",
          order: 0,
        });
      }
    }

    return blocks;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch article data
        const articleResponse = await postsApi.getById(id!);
        const article: Article = articleResponse.data;

        setTitle(article.title);
        setContent(article.body);
        setExcerpt(article.excerpt || "");
        setStatus(article.status === "published" ? "published" : "draft");

        // Parse content into blocks
        const blocks = parseContentToBlocks(article.body, article.media || []);
        setContentBlocks(blocks);

        // Handle image URL - check image_url first, then media relationship
        const imageUrl =
          article.image_url ||
          (article.media && article.media.length > 0
            ? article.media.find((m) => m.type === "image")?.url
            : null);

        setImage(imageUrl || null);
        setImagePreview(imageUrl || null);
        setPreviousImage(imageUrl || null);

        // Fetch categories and tags first
        const [categoriesResponse, tagsResponse] = await Promise.all([
          categoriesApi.getAll(),
          tagsApi.getAll(),
        ]);
        setCategories(categoriesResponse.data as Category[]);
        setTags(tagsResponse.data as Tag[]);

        // Now set selected categories and tags after the lists are loaded
        if (article.categories && Array.isArray(article.categories)) {
          const categoryIds = article.categories.map((cat: Category) => cat.id);
          setSelectedCategories(categoryIds);
        } else {
          setSelectedCategories([]);
        }

        if (article.tags && Array.isArray(article.tags)) {
          const tagIds = article.tags.map((tag: Tag) => tag.id);
          setSelectedTags(tagIds);
        } else {
          setSelectedTags([]);
        }
      } catch (error: unknown) {
        toast({
          title: "Error",
          description:
            (error as Error).message || "Failed to load article data",
          variant: "destructive",
        });
      }
    };
    if (id) fetchData();
  }, [id]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Delete old media record and image from Firebase if it exists
        if (previousImage) {
          await mediaApi.deleteByUrl(previousImage);
          await deleteImage(previousImage);
        }
        // Upload new image
        const imageUrl = await uploadImage(file);
        setImage(imageUrl);
        setImagePreview(URL.createObjectURL(file));
        setPreviousImage(imageUrl);
        toast({ title: "Success", description: "Image uploaded successfully" });
      } catch (error: unknown) {
        setImagePreview(null);
        toast({
          title: "Error",
          description: (error as Error).message || "Failed to upload image",
          variant: "destructive",
        });
      }
    }
  };

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
    if (!selectedTags.includes(tag.id))
      setSelectedTags([...selectedTags, tag.id]);
    setNewTagName("");
  };
  const removeTag = (id: number) =>
    setSelectedTags(selectedTags.filter((tid) => tid !== id));

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
    if (!selectedCategories.includes(category.id))
      setSelectedCategories([...selectedCategories, category.id]);
    setNewCategoryName("");
  };
  const removeCategory = (id: number) =>
    setSelectedCategories(selectedCategories.filter((cid) => cid !== id));

  // AI Suggestion logic
  const handleAISuggest = async (type: "title" | "excerpt" | "content") => {
    try {
      setIsGenerating((prev) => ({ ...prev, [type]: true }));
      let prompt = "";

      switch (type) {
        case "title":
          // For title generation, use the content blocks as prompt
          prompt = contentBlocks
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
          break;
        case "excerpt":
          // For excerpt, use title and content blocks
          const contentText = contentBlocks
            .filter((block) => block.type === "text")
            .map((block) => block.content)
            .join("\n\n");
          prompt = `${title}\n\n${contentText}`;
          break;
        case "content":
          // For content, use the title as prompt
          prompt = title;
          break;
      }

      const suggestion = await generateSuggestions(prompt, type);
      if (suggestion.error) throw new Error(suggestion.error);

      if (type === "title") {
        setTitle(suggestion.title || "");
      } else if (type === "excerpt") {
        setExcerpt(suggestion.excerpt || "");
      } else if (type === "content") {
        // For content, insert AI suggestion as a new block
        if (insertAIContent) {
          insertAIContent(suggestion.content || "");
        } else {
          // Fallback: create a new text block with the AI suggestion
          const newBlock: ContentBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type: "text",
            content: suggestion.content || "",
            order: contentBlocks.length,
          };

          setContentBlocks((prev) => [...prev, newBlock]);
        }
      }
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

  const handleSave = async (newStatus: "draft" | "published") => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    // Check if there's any content in the blocks
    const hasContent = contentBlocks.some(
      (block) => block.type === "text" && block.content.trim() !== ""
    );

    if (!hasContent) {
      toast({
        title: "Validation Error",
        description: "Please add some text content to your article",
        variant: "destructive",
      });
      return;
    }

    // Validate that at least one category is selected
    if (selectedCategories.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one category",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Convert content blocks to text for storage
      const bodyContent = contentBlocks
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

      // First, save the article with categories and tags
      await postsApi.update(id!, {
        title,
        body: bodyContent,
        excerpt,
        status: newStatus,
        categories: selectedCategories,
        tags: selectedTags,
        image_url: image,
      });

      // Then handle images (with error handling)
      try {
        // Handle images from content blocks
        const contentImages = contentBlocks
          .filter((block) => block.type === "image")
          .map((block, index) => ({
            url: block.imageUrl!,
            type: "image",
            subtype: "content" as const,
            alt_text: block.imageAlt || "",
            order: index,
          }));

        if (contentImages.length > 0) {
          await mediaApi.createMultiple({
            post_id: Number(id),
            images: contentImages,
          });
        }

        if (image) {
          await mediaApi.create({
            post_id: Number(id),
            type: "image",
            url: image,
            alt_text: title,
          });
        }
      } catch (mediaError) {
        console.error("Media creation failed:", mediaError);
        toast({
          title: "Warning",
          description:
            "Article saved but there was an issue with image processing. You may need to re-upload images.",
          variant: "destructive",
        });
      }

      toast({
        title: "Success",
        description: `Article has been ${
          newStatus === "published" ? "published" : "saved as draft"
        } successfully.`,
      });

      // Redirect to articles list
      navigate("/articles");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to save article",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href="/articles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Articles
              </a>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
              <p className="text-gray-600 mt-1">
                Currently {status} • ID: {id}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave("draft")}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave("published")}
              disabled={isLoading}
            >
              <Eye className="h-4 w-4 mr-2" />
              {status === "published" ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter article title or generate from content..."
                      className="text-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAISuggest("title")}
                      disabled={isGenerating.title}
                      title="Generate title from your content (add content first)"
                    >
                      <Wand2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <div className="flex gap-2 items-center">
                    <Textarea
                      id="excerpt"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Brief description of the article (150-200 characters). Generate with AI after adding a title..."
                      rows={3}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAISuggest("excerpt")}
                      disabled={isGenerating.excerpt}
                      title="Generate excerpt from your title"
                    >
                      <Wand2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <BlockEditor
                        value={contentBlocks}
                        onChange={setContentBlocks}
                        onInsertAIContent={setInsertAIContent}
                        placeholder="Write your article content with text and image blocks..."
                      />
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Wand2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">
                            AI Writing Assistant Tips:
                          </p>
                          <ul className="space-y-1 text-xs">
                            <li>
                              • <strong>Title:</strong> Write content first,
                              then generate a title from it
                            </li>
                            <li>
                              • <strong>Excerpt:</strong> Add a title first,
                              then generate an excerpt
                            </li>
                            <li>
                              • <strong>Content:</strong> Add a title first,
                              then generate article content
                            </li>
                            <li>
                              • <strong>Blocks:</strong> Mix text and images for
                              better storytelling
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAISuggest("content")}
                      disabled={isGenerating.content}
                      title="Generate content from your title"
                    >
                      <Wand2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Article Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Categories *</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Select at least one category for your article
                  </p>
                  <Input
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                    className="mb-2"
                  />
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedCategories.map((cid) => {
                      const cat = categories.find((c) => c.id === cid);
                      return cat ? (
                        <Badge key={cid} variant="secondary" className="gap-1">
                          {cat.name}
                          <button
                            onClick={() => removeCategory(cid)}
                            className="ml-1 hover:text-red-500"
                            aria-label={`Remove ${cat.name} category`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Add new category..."
                      onKeyPress={(e) => e.key === "Enter" && addCategory()}
                    />
                    <Button
                      onClick={addCategory}
                      type="button"
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  <div
                    className={`max-h-32 overflow-y-auto border rounded p-2 ${
                      selectedCategories.length === 0
                        ? "border-red-300 bg-red-50"
                        : ""
                    }`}
                  >
                    {selectedCategories.length === 0 && (
                      <p className="text-sm text-red-600 mb-2">
                        Please select at least one category
                      </p>
                    )}
                    {filteredCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center gap-2 py-1"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => {
                            if (selectedCategories.includes(cat.id))
                              removeCategory(cat.id);
                            else
                              setSelectedCategories([
                                ...selectedCategories,
                                cat.id,
                              ]);
                          }}
                          id={`cat-${cat.id}`}
                        />
                        <label htmlFor={`cat-${cat.id}`}>{cat.name}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <Input
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="Search tags..."
                    className="mb-2"
                  />
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map((tid) => {
                      const tag = tags.find((t) => t.id === tid);
                      return tag ? (
                        <Badge key={tid} variant="secondary" className="gap-1">
                          {tag.name}
                          <button
                            onClick={() => removeTag(tid)}
                            className="ml-1 hover:text-red-500"
                            aria-label={`Remove ${tag.name} tag`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Add new tag..."
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                    />
                    <Button onClick={addTag} type="button" variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="max-h-32 overflow-y-auto border rounded p-2">
                    {filteredTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-2 py-1"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.id)}
                          onChange={() => {
                            if (selectedTags.includes(tag.id))
                              removeTag(tag.id);
                            else setSelectedTags([...selectedTags, tag.id]);
                          }}
                          id={`tag-${tag.id}`}
                        />
                        <label htmlFor={`tag-${tag.id}`}>{tag.name}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Featured Image</Label>
                  {imagePreview ? (
                    <div className="mt-2 relative">
                      <img
                        src={imagePreview}
                        alt="Featured"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg bg-gray-50">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500 font-medium">
                          No image attached
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          Click below to upload an image
                        </span>
                      </div>
                      <Label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 mt-2"
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">
                          Click to upload image
                        </span>
                        <Input
                          id="image-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </Label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditArticlePage;
