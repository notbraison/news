import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Upload,
  X,
  GripVertical,
  Image as ImageIcon,
  Type,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { uploadImage, deleteImage } from "@/lib/firebase";

export interface ContentBlock {
  id: string;
  type: "text" | "image";
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  order: number;
}

interface BlockEditorProps {
  value: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  placeholder?: string;
  onInsertAIContent?: (content: string) => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing your article...",
  onInsertAIContent,
}) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>(value);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBlocks(value);
  }, [value]);

  useEffect(() => {
    onChange(blocks);
  }, [blocks, onChange]);

  // Method to insert AI content
  const insertAIContent = (content: string) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type: "text",
      content: content || "",
      order: blocks.length,
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  // Expose insertAIContent method to parent
  useEffect(() => {
    if (onInsertAIContent) {
      onInsertAIContent(insertAIContent);
    }
  }, [onInsertAIContent]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addTextBlock = (afterIndex?: number) => {
    const newBlock: ContentBlock = {
      id: generateId(),
      type: "text",
      content: "",
      order: afterIndex !== undefined ? afterIndex + 1 : blocks.length,
    };

    const newBlocks = [...blocks];
    if (afterIndex !== undefined) {
      newBlocks.splice(afterIndex + 1, 0, newBlock);
      // Reorder blocks after insertion
      newBlocks.forEach((block, index) => {
        block.order = index;
      });
    } else {
      newBlocks.push(newBlock);
    }

    setBlocks(newBlocks);
  };

  const addImageBlock = async (afterIndex?: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      const newBlock: ContentBlock = {
        id: generateId(),
        type: "image",
        content: "",
        imageUrl,
        imageAlt: file.name,
        order: blocks.length,
      };

      setBlocks((prev) => [...prev, newBlock]);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, ...updates } : block))
    );
  };

  const removeBlock = async (id: string) => {
    const block = blocks.find((b) => b.id === id);
    if (block?.type === "image" && block.imageUrl) {
      try {
        await deleteImage(block.imageUrl);
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }

    setBlocks((prev) => {
      const newBlocks = prev.filter((b) => b.id !== id);
      // Reorder remaining blocks
      return newBlocks.map((block, index) => ({
        ...block,
        order: index,
      }));
    });
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= blocks.length) return;

    setBlocks((prev) => {
      const newBlocks = [...prev];
      const [movedBlock] = newBlocks.splice(fromIndex, 1);
      newBlocks.splice(toIndex, 0, movedBlock);

      // Update order
      return newBlocks.map((block, index) => ({
        ...block,
        order: index,
      }));
    });
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedBlock) return;

    const draggedIndex = blocks.findIndex((b) => b.id === draggedBlock);
    if (draggedIndex !== -1) {
      moveBlock(draggedIndex, targetIndex);
    }
    setDraggedBlock(null);
  };

  const renderBlock = (block: ContentBlock, index: number) => {
    const isDragging = draggedBlock === block.id;

    return (
      <div
        key={block.id}
        className={`relative group ${
          isDragging ? "opacity-50" : ""
        } transition-all duration-200`}
        draggable
        onDragStart={(e) => handleDragStart(e, block.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
      >
        {/* Block Controls */}
        <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => addTextBlock(index)}
            title="Add text block"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => addImageBlock(index)}
            title="Add image block"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => removeBlock(block.id)}
            title="Remove block"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Drag Handle */}
        <div className="absolute -left-6 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
        </div>

        {/* Block Content */}
        <Card className="mb-4 border-2 border-transparent hover:border-gray-200 transition-colors duration-200">
          <CardContent className="p-4">
            {block.type === "text" ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Type className="h-3 w-3 mr-1" />
                    Text
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveBlock(index, index - 1)}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveBlock(index, index + 1)}
                      disabled={index === blocks.length - 1}
                    >
                      <MoveDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={block.content || ""}
                  onChange={(e) =>
                    updateBlock(block.id, { content: e.target.value })
                  }
                  placeholder="Write your content here... (You can also use AI to generate content from your title)"
                  className="min-h-[120px] resize-none border-0 focus:ring-0 p-0 text-base"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Image
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveBlock(index, index - 1)}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveBlock(index, index + 1)}
                      disabled={index === blocks.length - 1}
                    >
                      <MoveDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={block.imageUrl}
                    alt={block.imageAlt || "Article image"}
                    className="w-full max-h-96 object-cover rounded-md"
                  />
                </div>
                <Input
                  value={block.imageAlt || ""}
                  onChange={(e) =>
                    updateBlock(block.id, { imageAlt: e.target.value })
                  }
                  placeholder="Image description (alt text)"
                  className="text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
        disabled={uploading}
        title="Upload image"
      />

      {/* Empty state */}
      {blocks.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => addTextBlock()}
                className="flex items-center gap-2"
              >
                <Type className="h-4 w-4" />
                Add Text Block
              </Button>
              <Button
                variant="outline"
                onClick={() => addImageBlock()}
                className="flex items-center gap-2"
                disabled={uploading}
              >
                <ImageIcon className="h-4 w-4" />
                {uploading ? "Uploading..." : "Add Image Block"}
              </Button>
            </div>
            <p className="text-gray-500">{placeholder}</p>
            <div className="text-xs text-gray-400 max-w-md mx-auto">
              <p>
                💡 <strong>Pro tip:</strong> Start with a text block, then use
                the AI "Generate from Title" button to create content based on
                your article title.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Blocks */}
      <div className="space-y-0">
        {blocks.map((block, index) => renderBlock(block, index))}
      </div>

      {/* Add blocks button when there are existing blocks */}
      {blocks.length > 0 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => addTextBlock()}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Text
          </Button>
          <Button
            variant="outline"
            onClick={() => addImageBlock()}
            className="flex items-center gap-2"
            disabled={uploading}
          >
            <Plus className="h-4 w-4" />
            {uploading ? "Uploading..." : "Add Image"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlockEditor;
