import React from "react";

interface ContentBlock {
  id: string;
  type: "text" | "image";
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  order: number;
}

interface BlockContentRendererProps {
  content: string;
  className?: string;
}

const BlockContentRenderer: React.FC<BlockContentRendererProps> = ({
  content,
  className = "",
}) => {
  // Parse content into blocks
  const parseContentToBlocks = (body: string): ContentBlock[] => {
    const blocks: ContentBlock[] = [];

    // Check if this is new format (contains [IMAGE: markers)
    const hasImageMarkers = body.includes("[IMAGE:");

    if (hasImageMarkers) {
      // New format: parse with image markers
      const lines = body.split("\n").filter((line) => line.trim());

      let blockIndex = 0;

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
          id: `block-0`,
          type: "text",
          content: body.trim() || "",
          order: 0,
        });
      }
    }

    return blocks;
  };

  const blocks = parseContentToBlocks(content);

  // If no blocks found, render as plain text (fallback for old content)
  if (blocks.length === 0) {
    return (
      <div className={`prose prose-lg max-w-none ${className}`}>
        <div className="text-gray-800 leading-relaxed">
          {content.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {blocks.map((block) => (
        <div key={block.id} className="block-content">
          {block.type === "text" ? (
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-800 leading-relaxed">
                {block.content.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="image-block">
              <img
                src={block.imageUrl}
                alt={block.imageAlt || "Article image"}
                className="w-full max-h-96 object-cover rounded-lg shadow-md"
                loading="lazy"
              />
              {block.imageAlt && (
                <p className="text-sm text-gray-600 mt-2 italic text-center">
                  {block.imageAlt}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BlockContentRenderer;
