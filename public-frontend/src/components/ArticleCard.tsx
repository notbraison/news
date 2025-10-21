import React from "react";
import { Clock, User } from "lucide-react";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  imageUrl: string;
  readTime: number;
  tags: string[];
  slug: string;
}

interface ArticleCardProps {
  article: Article;
  size?: "small" | "medium" | "large" | "featured";
  onClick: (article: Article) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  size = "medium",
  onClick,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (size === "featured") {
    return (
      <div className="cnn-card cursor-pointer" onClick={() => onClick(article)}>
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase mb-3 inline-block">
              {article.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              {article.title}
            </h1>
            <p className="text-base text-gray-200 mb-4 line-clamp-2 max-w-3xl">
              {article.excerpt}
            </p>
            <div className="flex items-center text-sm text-gray-300">
              <span className="mr-3">{article.author}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cardClasses = {
    small: "cnn-card cursor-pointer",
    medium: "cnn-card cursor-pointer",
    large: "cnn-card cursor-pointer mb-8",
  };

  const imageClasses = {
    small: "h-40",
    medium: "h-48",
    large: "h-64",
  };

  const titleClasses = {
    small: "text-base font-bold line-clamp-2",
    medium: "text-lg font-bold line-clamp-2",
    large: "text-xl font-bold line-clamp-2",
  };

  return (
    <div className={cardClasses[size]} onClick={() => onClick(article)}>
      <div className={`cnn-card-image ${imageClasses[size]}`}>
        <img src={article.imageUrl} alt={article.title} loading="lazy" />
        <div className="absolute top-3 left-3">
          <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase">
            {article.category}
          </span>
        </div>
      </div>

      <div className="cnn-card-content">
        <h3 className={`cnn-card-title ${titleClasses[size]}`}>
          {article.title}
        </h3>

        {size !== "small" && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {article.excerpt}
          </p>
        )}

        <div className="cnn-card-meta">
          <span>{formatDate(article.publishedAt)}</span>
          <span className="mx-2">•</span>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{article.readTime} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
