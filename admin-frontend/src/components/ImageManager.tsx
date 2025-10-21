import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Upload,
  X,
  GripVertical,
  Image as ImageIcon,
  Star,
} from "lucide-react";
import { uploadImage, deleteImage } from "@/lib/firebase";
import { mediaApi } from "@/lib/api";

interface MediaItem {
  id?: number;
  url: string;
  type: string;
  subtype?: string;
  alt_text?: string;
  order: number;
  preview?: string;
}

interface ImageManagerProps {
  postId?: number;
  onImagesChange: (images: MediaItem[]) => void;
  initialImages?: MediaItem[];
}

const ImageManager: React.FC<ImageManagerProps> = ({
  postId,
  onImagesChange,
  initialImages = [],
}) => {
  const [images, setImages] = useState<MediaItem[]>(initialImages);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  useEffect(() => {
    onImagesChange(images);
  }, [images, onImagesChange]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Show preview immediately
      const preview = URL.createObjectURL(file);

      // Upload to Firebase
      const imageUrl = await uploadImage(file);

      const newImage: MediaItem = {
        url: imageUrl,
        type: "image",
        subtype: "secondary", // Default to secondary, can be changed
        alt_text: file.name,
        order: images.length,
        preview,
      };

      setImages((prev) => [...prev, newImage]);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: unknown) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const image = images[index];

    try {
      // Delete from Firebase if it's a new upload
      if (!image.id && image.url) {
        await deleteImage(image.url);
      }

      // Remove from local state
      setImages((prev) => prev.filter((_, i) => i !== index));

      // Reorder remaining images
      setImages((prev) => prev.map((img, i) => ({ ...img, order: i })));

      toast({
        title: "Success",
        description: "Image removed successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (
    index: number,
    field: keyof MediaItem,
    value: any
  ) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    );
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;

    setImages((prev) => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);

      // Update order
      return newImages.map((img, i) => ({ ...img, order: i }));
    });
  };

  const setFeaturedImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        subtype: i === index ? "featured" : "secondary",
      }))
    );
  };

  const saveImagesToDatabase = async () => {
    if (!postId || images.length === 0) return;

    try {
      const imagesToSave = images.map((img) => ({
        url: img.url,
        type: img.type,
        subtype: img.subtype || "secondary",
        alt_text: img.alt_text || "",
        order: img.order,
      }));

      await mediaApi.createMultiple({
        post_id: postId,
        images: imagesToSave,
      });

      toast({
        title: "Success",
        description: "Images saved successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to save images",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Article Images</Label>
        <div className="flex gap-2">
          {postId && images.length > 0 && (
            <Button variant="outline" size="sm" onClick={saveImagesToDatabase}>
              Save Images
            </Button>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
        <div className="text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <div className="flex text-sm text-gray-600 justify-center">
            <label
              htmlFor="image-upload"
              className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary"
            >
              <span>Upload a file</span>
              <input
                id="image-upload"
                name="image-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          {uploading && (
            <p className="text-sm text-blue-600 mt-2">Uploading...</p>
          )}
        </div>
      </div>

      {/* Images List */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Uploaded Images ({images.length})</h4>
          {images.map((image, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    <CardTitle className="text-sm">
                      Image {index + 1}
                      {image.subtype === "featured" && (
                        <Badge variant="secondary" className="ml-2">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFeaturedImage(index)}
                      disabled={image.subtype === "featured"}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Set Featured
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Preview */}
                <div className="relative">
                  <img
                    src={image.preview || image.url}
                    alt={image.alt_text || "Article image"}
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>

                {/* Image Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`image-type-${index}`}>Image Type</Label>
                    <Select
                      value={image.subtype || "secondary"}
                      onValueChange={(value) =>
                        handleImageChange(index, "subtype", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured Image</SelectItem>
                        <SelectItem value="secondary">
                          Secondary Image
                        </SelectItem>
                        <SelectItem value="gallery">Gallery Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`image-alt-${index}`}>Alt Text</Label>
                    <Input
                      id={`image-alt-${index}`}
                      value={image.alt_text || ""}
                      onChange={(e) =>
                        handleImageChange(index, "alt_text", e.target.value)
                      }
                      placeholder="Describe the image for accessibility"
                    />
                  </div>
                </div>

                {/* Move Controls */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveImage(index, index - 1)}
                    disabled={index === 0}
                  >
                    Move Up
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveImage(index, index + 1)}
                    disabled={index === images.length - 1}
                  >
                    Move Down
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-600">
        <p>
          <strong>Featured Image:</strong> The main image displayed at the top
          of the article
        </p>
        <p>
          <strong>Secondary Image:</strong> Additional images that can be
          displayed within the article content
        </p>
        <p>
          <strong>Gallery Image:</strong> Images for photo galleries or
          slideshows
        </p>
      </div>
    </div>
  );
};

export default ImageManager;
