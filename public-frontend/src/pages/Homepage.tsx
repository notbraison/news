import React from "react";
import ArticleCard from "@/components/ArticleCard";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Bookmark,
  Share2,
  TrendingUp,
  Globe,
  Briefcase,
  Film,
  Award,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { usePosts, useCategories } from "@/hooks/useApi";
import { Article } from "@/lib/api";

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = React.useState(0);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Fade transition duration in ms
  const FADE_DURATION = 900;
  // Slide interval in ms
  const SLIDE_INTERVAL = 6000;

  // Use cached hooks for data fetching
  const { data: articles = [], isLoading: loading, error } = usePosts();
  const { data: categoriesData = [] } = useCategories();

  // Extract unique categories from posts
  const categories = React.useMemo(() => {
    return [...new Set(articles.map((article) => article.category))];
  }, [articles]);

  // Auto-slide logic
  React.useEffect(() => {
    if (articles.length === 0) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % Math.min(articles.length, 5));
    }, SLIDE_INTERVAL);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [current, articles.length]);

  const handleArticleClick = (article: Article) => {
    navigate(`/article/${article.slug}`);
  };

  // Filter articles by category
  const getArticlesByCategory = (category: string) => {
    return articles
      .filter((article) => article.category === category)
      .slice(0, 4);
  };

  // Get featured articles for hero section
  const heroSlides = articles.slice(0, 5);

  // Get trending articles (most recent)
  const trendingArticles = articles.slice(0, 5);

  // Filter articles for different sections
  const businessArticles = getArticlesByCategory("Business");
  const techArticles = getArticlesByCategory("Technology");
  const worldArticles = getArticlesByCategory("World");
  const sportsArticles = getArticlesByCategory("Sports");
  const entertainmentArticles = getArticlesByCategory("Entertainment");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading latest news...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            Error Loading News
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error instanceof Error
              ? error.message
              : "Failed to load articles. Please try again later."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Articles Available</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Check back later for the latest news.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Fading Hero Section */}
      <section className="relative bg-black">
        <div className="container mx-auto px-0 sm:px-2 md:px-4 pt-2 pb-2">
          <div className="relative h-[220px] xs:h-[260px] sm:h-[320px] md:h-[420px] lg:h-[480px] w-full rounded-lg overflow-hidden shadow-lg">
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-900 ease-in-out ${
                  current === idx ? "opacity-100 z-10" : "opacity-0 z-0"
                } flex items-end cursor-pointer group`}
                style={{ pointerEvents: current === idx ? "auto" : "none" }}
                onClick={() => handleArticleClick(slide)}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="relative z-10 p-3 xs:p-4 sm:p-6 md:p-8 pb-8 md:pb-16 text-white w-full max-w-full sm:max-w-2xl">
                  <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase mb-2 sm:mb-3 inline-block rounded">
                    {slide.category}
                  </span>
                  <h2 className="text-lg xs:text-xl sm:text-2xl md:text-4xl font-extrabold mb-1 sm:mb-2 leading-tight drop-shadow-lg text-white hover:text-red-500 hover:underline transition-colors duration-300 cursor-pointer">
                    {slide.title}
                  </h2>
                  <p className="text-xs xs:text-sm sm:text-base md:text-lg text-white mb-1 sm:mb-2 line-clamp-2 drop-shadow hover:text-red-400 hover:underline transition-colors duration-300 cursor-pointer">
                    {slide.excerpt}
                  </p>
                </div>
              </div>
            ))}
            {/* Arrows */}
            <button
              className="absolute left-1 sm:left-2 md:left-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-red-600 rounded-full p-1 sm:p-2 z-20 shadow"
              onClick={() =>
                setCurrent(
                  (current - 1 + heroSlides.length) % heroSlides.length
                )
              }
              aria-label="Previous slide"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-left"
              >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>
            <button
              className="absolute right-1 sm:right-2 md:right-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-red-600 rounded-full p-1 sm:p-2 z-20 shadow"
              onClick={() => setCurrent((current + 1) % heroSlides.length)}
              aria-label="Next slide"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-right"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
            {/* Dots */}
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 ${
                    current === idx
                      ? "bg-red-600 border-white"
                      : "bg-white/60 border-white/80"
                  } transition-all`}
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top Headlines Ticker */}
      <section className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto py-2 px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
            <div className="shrink-0 font-bold text-red-600 dark:text-red-400 mr-0 sm:mr-4 text-sm sm:text-base">
              TOP HEADLINES
            </div>
            <div className="moving-stories overflow-hidden w-full">
              <div className="moving-stories-container">
                {articles.slice(0, 7).map((article, index) => (
                  <span
                    key={`headline-1-${index}`}
                    className="inline-block mr-8 sm:mr-12 cursor-pointer hover:text-red-600 dark:hover:text-red-400 text-xs sm:text-base"
                  >
                    {article.title}
                    <span className="mx-2 sm:mx-3 inline-block h-2 w-2 rounded-full bg-red-600"></span>
                  </span>
                ))}
              </div>
              <div className="moving-stories-container">
                {articles.slice(0, 7).map((article, index) => (
                  <span
                    key={`headline-2-${index}`}
                    className="inline-block mr-8 sm:mr-12 cursor-pointer hover:text-red-600 dark:hover:text-red-400 text-xs sm:text-base"
                  >
                    {article.title}
                    <span className="mx-2 sm:mx-3 inline-block h-2 w-2 rounded-full bg-red-600"></span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-2 sm:px-4">
        {/* Top Stories */}
        <section className="mb-8 sm:mb-12">
          <h2 className="cnn-section-heading-accent text-lg sm:text-xl md:text-2xl">
            Top Stories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {articles.slice(0, 6).map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                size="medium"
                onClick={handleArticleClick}
              />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs for different sections */}
            <Tabs defaultValue="latest" className="mb-8 sm:mb-12">
              <TabsList className="mb-4 sm:mb-6 border-b w-full rounded-none bg-transparent h-auto p-0 justify-start overflow-x-auto">
                <TabsTrigger
                  value="latest"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-red-600 data-[state=active]:shadow-none px-2 sm:px-4 py-2 font-semibold text-xs sm:text-base"
                >
                  Latest
                </TabsTrigger>
                <TabsTrigger
                  value="world"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-red-600 data-[state=active]:shadow-none px-2 sm:px-4 py-2 font-semibold text-xs sm:text-base"
                >
                  World
                </TabsTrigger>
                <TabsTrigger
                  value="business"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-red-600 data-[state=active]:shadow-none px-2 sm:px-4 py-2 font-semibold text-xs sm:text-base"
                >
                  Business
                </TabsTrigger>
                <TabsTrigger
                  value="tech"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-red-600 data-[state=active]:shadow-none px-2 sm:px-4 py-2 font-semibold text-xs sm:text-base"
                >
                  Tech
                </TabsTrigger>
              </TabsList>

              <TabsContent value="latest" className="mt-0">
                <div className="space-y-6">
                  {articles.slice(0, 5).map((article) => (
                    <div
                      key={article.id}
                      className="flex border-b border-gray-200 pb-6"
                    >
                      <div className="w-1/3 pr-4">
                        <div className="h-full aspect-video overflow-hidden rounded">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="w-2/3">
                        <span className="text-xs font-bold text-red-600 uppercase mb-1 block">
                          {article.category}
                        </span>
                        <h3
                          className="font-bold text-lg mb-2 hover:text-red-600 cursor-pointer"
                          onClick={() => handleArticleClick(article)}
                        >
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>
                            {new Date(article.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{article.readTime} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="world" className="mt-0">
                <div className="space-y-6">
                  {worldArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex border-b border-gray-200 pb-6"
                    >
                      <div className="w-1/3 pr-4">
                        <div className="h-full aspect-video overflow-hidden rounded">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="w-2/3">
                        <span className="text-xs font-bold text-red-600 uppercase mb-1 block">
                          {article.category}
                        </span>
                        <h3
                          className="font-bold text-lg mb-2 hover:text-red-600 cursor-pointer"
                          onClick={() => handleArticleClick(article)}
                        >
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>
                            {new Date(article.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{article.readTime} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="business" className="mt-0">
                <div className="space-y-6">
                  {businessArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex border-b border-gray-200 pb-6"
                    >
                      <div className="w-1/3 pr-4">
                        <div className="h-full aspect-video overflow-hidden rounded">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="w-2/3">
                        <span className="text-xs font-bold text-red-600 uppercase mb-1 block">
                          {article.category}
                        </span>
                        <h3
                          className="font-bold text-lg mb-2 hover:text-red-600 cursor-pointer"
                          onClick={() => handleArticleClick(article)}
                        >
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>
                            {new Date(article.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{article.readTime} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="tech" className="mt-0">
                <div className="space-y-6">
                  {techArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex border-b border-gray-200 pb-6"
                    >
                      <div className="w-1/3 pr-4">
                        <div className="h-full aspect-video overflow-hidden rounded">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="w-2/3">
                        <span className="text-xs font-bold text-red-600 uppercase mb-1 block">
                          {article.category}
                        </span>
                        <h3
                          className="font-bold text-lg mb-2 hover:text-red-600 cursor-pointer"
                          onClick={() => handleArticleClick(article)}
                        >
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>
                            {new Date(article.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{article.readTime} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* More Sections */}
            {entertainmentArticles.length > 0 && (
              <section className="mb-12">
                <h2 className="cnn-section-heading-accent">Entertainment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {entertainmentArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      size="medium"
                      onClick={handleArticleClick}
                    />
                  ))}
                </div>
              </section>
            )}

            {sportsArticles.length > 0 && (
              <section className="mb-12">
                <h2 className="cnn-section-heading-accent">Sports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sportsArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      size="medium"
                      onClick={handleArticleClick}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Trending Now */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-8">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-bold text-lg">Trending Now</h3>
              </div>
              <div className="space-y-4">
                {trendingArticles.map((article, index) => (
                  <div
                    key={article.id}
                    className="flex items-start cursor-pointer"
                    onClick={() => handleArticleClick(article)}
                  >
                    <span className="text-2xl font-bold text-gray-300 dark:text-gray-600 mr-4">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-medium hover:text-red-600 transition-colors">
                        {article.title}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {article.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ad Space */}
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8 text-center">
              <p className="text-xs text-gray-500 mb-2">Advertisement</p>
              <div className="bg-gray-200 dark:bg-gray-700 h-60 flex items-center justify-center">
                <span className="text-gray-400">Ad Space</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-red-600 text-white p-6 rounded-lg mb-8">
              <h3 className="font-bold text-lg mb-3">Get the Latest News</h3>
              <p className="text-sm mb-4">
                Subscribe to our newsletter for daily updates on the stories
                that matter.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-2 rounded border border-white/20 bg-white/10 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button className="w-full bg-white text-red-600 font-bold py-2 rounded hover:bg-gray-100 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Categories Quick Links */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-lg mb-4">Categories</h3>
              <div className="grid grid-cols-2 gap-3">
                {categories.slice(0, 4).map((category) => (
                  <div
                    key={category}
                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                    onClick={() =>
                      navigate(`/category/${category.toLowerCase()}`)
                    }
                  >
                    <Globe className="h-5 w-5 text-red-600 mr-3" />
                    <span className="font-medium">{category}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor's Picks */}
            <div className="mb-8">
              <h3 className="cnn-section-heading-accent">Editor's Picks</h3>
              <div className="space-y-4">
                {articles.slice(0, 3).map((article) => (
                  <div
                    key={article.id}
                    className="flex cursor-pointer"
                    onClick={() => handleArticleClick(article)}
                  >
                    <div className="w-1/3 pr-3">
                      <div className="aspect-video overflow-hidden rounded">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    <div className="w-2/3">
                      <h4 className="font-medium text-sm hover:text-red-600 transition-colors line-clamp-3">
                        {article.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catch up on today's global news section */}
      {articles.length > 0 && (
        <section className="mb-12 mt-8">
          <h2 className="cnn-section-heading-accent mb-6">
            Catch up on today's global news
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="aspect-video rounded-md overflow-hidden mb-4">
                <img
                  src={articles[0]?.imageUrl}
                  alt={articles[0]?.title || "Latest News"}
                  className="w-80 h-90 object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {articles[0]?.title || "Latest News"}
              </h3>
              <p className="text-gray-600">
                {articles[0]?.excerpt ||
                  "Stay updated with the latest news and developments."}
              </p>
            </div>
            <div>
              {articles.slice(1, 3).map((article, index) => (
                <div
                  key={article.id}
                  className="flex items-center mb-4 border-b border-gray-200 pb-4"
                >
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-bold text-sm">{article.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Homepage;
