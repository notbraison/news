import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BlockEditor, { ContentBlock } from "@/components/BlockEditor";

const BlockEditorDemo: React.FC = () => {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [output, setOutput] = useState("");

  const handleBlocksChange = (newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks);

    // Convert blocks to text for preview
    const content = newBlocks
      .map((block) => {
        if (block.type === "text") {
          return block.content;
        } else if (block.type === "image") {
          return `[IMAGE: ${block.imageUrl}] ${block.imageAlt || ""}`;
        }
        return "";
      })
      .filter((content) => content.trim())
      .join("\n\n");

    setOutput(content);
  };

  const addSampleContent = () => {
    const sampleBlocks: ContentBlock[] = [
      {
        id: "1",
        type: "text",
        content:
          "This is a sample article with block-based content. You can write your text here and add images between paragraphs.",
        order: 0,
      },
      {
        id: "2",
        type: "text",
        content:
          "This is another paragraph. You can add as many text blocks as you need to create your article.",
        order: 1,
      },
    ];
    setBlocks(sampleBlocks);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Block Editor Demo
            </h1>
            <p className="text-gray-600 mt-1">
              Test the block-based content editor with drag-and-drop
              functionality
            </p>
          </div>
          <Button onClick={addSampleContent} variant="outline">
            Add Sample Content
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Block Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Block Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <BlockEditor
                value={blocks}
                onChange={handleBlocksChange}
                placeholder="Start writing your article with text and image blocks..."
              />
            </CardContent>
          </Card>

          {/* Output Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Raw Output:</h4>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {output || "No content yet..."}
                  </pre>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Block Structure:</h4>
                  <div className="space-y-2">
                    {blocks.map((block, index) => (
                      <div key={block.id} className="text-sm">
                        <span className="font-medium">Block {index + 1}:</span>{" "}
                        <span className="text-gray-600">
                          {block.type} -{" "}
                          {block.type === "text"
                            ? block.content.substring(0, 50) + "..."
                            : block.imageUrl}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use the Block Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Adding Blocks:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Click "Add Text" to add a new text block</li>
                  <li>Click "Add Image" to upload and add an image block</li>
                  <li>
                    Use the "+" buttons that appear when hovering over existing
                    blocks
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Reordering Blocks:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Drag and drop blocks to reorder them</li>
                  <li>Use the up/down arrow buttons on each block</li>
                  <li>Hover over blocks to see the drag handle</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Managing Blocks:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Hover over blocks to see control buttons</li>
                  <li>Click the trash icon to remove a block</li>
                  <li>For image blocks, you can edit the alt text</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default BlockEditorDemo;
