import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Menu,
  X,
  User,
  Moon,
  Sun,
  Bell,
  Globe,
  ChevronDown,
  TrendingUp,
  Bookmark,
  Share2,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { breakingNewsService } from "@/lib/breakingNews";

interface NavigationProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

interface Category {
  id?: number;
  name: string;
  slug?: string;
  path: string;
  posts_count?: number;
}

const HARDCODED_BREAKING_NEWS = [
  "Trump promised 200 trade deals. He's made 3",
  "Trump threatens 50% tariffs on Brazil if it doesn't stop the Bolsonaro 'witch hunt' trial",
  "Bessent outlines final tariff warning as trade deadline nears",
  "Trump wants to talk business with Africa in hopes of countering China. But a US summit excluded big players",
  "Moscow ramps up attacks with fiery explosions seen in Kyiv. At least two are dead and more than a dozen wounded.",
];

const Navigation: React.FC<NavigationProps> = ({
  darkMode,
  toggleDarkMode,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeCategory, setActiveCategory] = useState("World");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [breakingNews, setBreakingNews] = useState<string[]>(
    HARDCODED_BREAKING_NEWS
  );
  const lastHeadlinesRef = useRef<string[]>(HARDCODED_BREAKING_NEWS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Remove hover logic for More dropdown
  // const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  // const moreDropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);

  const categories: Category[] = [
    { name: "World", path: "/category/world" },
    { name: "Politics", path: "/category/politics" },
    { name: "Business", path: "/category/business" },
    { name: "Entertainment", path: "/category/entertainment" },
    { name: "Sports", path: "/category/sports" },
  ];
  const moreCategories: Category[] = [
    { name: "Health", path: "/category/health" },
    { name: "Style", path: "/category/style" },
    { name: "Travel", path: "/category/travel" },
  ];

  const megaMenu = [
    {
      title: "World",
      items: ["Africa", "Americas", "Asia", "Europe", "Middle East", "UK"],
    },
    {
      title: "Politics",
      items: ["Elections", "Policy", "Leaders"],
    },
    {
      title: "Business",
      items: ["Markets", "Tech", "Media", "Economy"],
    },
    {
      title: "Health",
      items: ["Fitness", "Food", "Wellness"],
    },
    {
      title: "Entertainment",
      items: ["Movies", "TV", "Music"],
    },
    {
      title: "Style",
      items: ["Fashion", "Design", "Luxury"],
    },
    {
      title: "Travel",
      items: ["Destinations", "News", "Tips"],
    },
    {
      title: "Sports",
      items: ["Football", "Tennis", "Golf", "Olympics"],
    },
  ];

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
        setShowSearchBar(true);
      } else if (window.scrollY > 50) {
        setIsScrolled(true);
        setShowSearchBar(false);
      } else {
        setIsScrolled(false);
        setShowSearchBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // update every second for a smooth digital clock
    return () => clearInterval(timer);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isUserMenuOpen && !target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  const toggleSearch = () => {
    if (showSearchBar) {
      setShowSearchBar(false);
    } else {
      setShowSearchBar(true);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDigitalTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Fetch breaking news from backend
  const fetchBreakingNews = async () => {
    try {
      const headlines = await breakingNewsService.getBreakingNews();
      setBreakingNews(headlines);
      lastHeadlinesRef.current = headlines;
    } catch (error) {
      setBreakingNews(HARDCODED_BREAKING_NEWS);
      lastHeadlinesRef.current = HARDCODED_BREAKING_NEWS;
    }
  };

  useEffect(() => {
    fetchBreakingNews();
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchBreakingNews, 60 * 60 * 1000); // every hour
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, []);

  const handleCategoryClick = (category: string, path: string) => {
    setActiveCategory(category);
    navigate(path);
  };

  return (
    <header className={`header-sticky ${isScrolled ? "header-scrolled" : ""}`}>
      {/* Digital Timer Bar */}
      <div className="w-full relative bg-[linear-gradient(to_right,_#dc2626,_#1e3a8a,_#dc2626)] py-1 flex justify-center items-center">
        <div className="flex items-center gap-4">
          <span className="font-extrabold text-lg tracking-widest text-white drop-shadow-md shadow-black select-none timer-logo">
            NEWS WEBSITE
          </span>
          <span className="bg-black bg-opacity-40 rounded px-3 py-1 font-mono text-lg text-white shadow-md tracking-widest timer-clock">
            {formatDigitalTime(currentTime)}
          </span>
        </div>
        {/* Logo positioned on the right side of the top bar */}
        <img
          src="/logo.jpg"
          alt="News Website"
          className="absolute left-4 h-8 sm:h-9 md:h-10 w-auto object-contain"
          loading="eager"
        />
      </div>
      {/* Main Header */}
      <div className="bg-[hsl(var(--news-blue))] text-white border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Hamburger Menu Icon */}
            <button
              className="mr-2 p-2 focus:outline-none md:mr-4"
              aria-label="Open menu"
              onClick={() => setIsMegaMenuOpen(true)}
            >
              <Menu className="h-7 w-7 text-[hsl(var(--primary))]" />
            </button>
            {/* Logo moved to top bar */}
            <div className="flex items-center" />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() =>
                    handleCategoryClick(category.name, category.path)
                  }
                  className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                    activeCategory === category.name
                      ? "text-[hsl(var(--primary))] font-semibold"
                      : "text-white/90 hover:text-[hsl(var(--primary))]"
                  }`}
                >
                  {category.name}
                  {activeCategory === category.name && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-[hsl(var(--primary))] rounded-full animate-fade-in" />
                  )}
                </button>
              ))}
              {/* Topics Dropdown */}
              <div className="relative group">
                <button
                  className="px-3 py-2 text-sm font-medium text-white/90 hover:text-[hsl(var(--primary))] flex items-center"
                  onClick={() => setIsTopicsOpen((open) => !open)}
                >
                  Topics <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {isTopicsOpen && (
                  <div
                    className="absolute left-0 mt-2 w-[340px] max-h-[420px] overflow-y-auto bg-white dark:bg-gray-900 rounded-xl shadow-2xl py-3 z-50 border border-gray-200 dark:border-gray-700 flex flex-col gap-2"
                    onMouseLeave={() => setIsTopicsOpen(false)}
                  >
                    {categories.map((category) => (
                      <div
                        key={category.name}
                        className="px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-800 rounded transition-colors"
                      >
                        <Link
                          to={category.path}
                          className="block font-semibold text-gray-800 dark:text-white mb-2 text-base hover:text-red-600 transition-colors"
                          onClick={() => setIsTopicsOpen(false)}
                        >
                          {category.name}
                        </Link>
                        {/* Removed mockTopicStories and its usage. No hardcoded articles will be shown here. */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative group">
                <button
                  className="px-3 py-2 text-sm font-medium text-white/90 hover:text-[hsl(var(--primary))] flex items-center"
                  onClick={() => setIsMoreDropdownOpen((open) => !open)}
                >
                  More <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {isMoreDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-2xl py-3 z-50 border border-gray-200 dark:border-gray-700 flex flex-col gap-2"
                    onMouseLeave={() => setIsMoreDropdownOpen(false)}
                  >
                    {moreCategories.map((category) => (
                      <Link
                        key={category.name}
                        to={category.path}
                        className="px-4 py-2 text-gray-800 dark:text-white hover:bg-red-50 dark:hover:bg-gray-800 rounded transition-colors font-medium hover:text-red-600"
                        onClick={() => setIsMoreDropdownOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                    <Link
                      className="px-4 py-2 text-gray-800 dark:text-white hover:bg-red-50 dark:hover:bg-gray-800 rounded transition-colors font-medium hover:text-red-600"
                      to="/category/technology"
                      onClick={() => setIsMoreDropdownOpen(false)}
                    >
                      Tech
                    </Link>
                    <Link
                      className="px-4 py-2 text-gray-800 dark:text-white hover:bg-red-50 dark:hover:bg-gray-800 rounded transition-colors font-medium hover:text-red-600"
                      to="/category/science"
                      onClick={() => setIsMoreDropdownOpen(false)}
                    >
                      Science
                    </Link>
                    <Link
                      className="px-4 py-2 text-gray-800 dark:text-white hover:bg-red-50 dark:hover:bg-gray-800 rounded transition-colors font-medium hover:text-red-600"
                      to="/category/climate"
                      onClick={() => setIsMoreDropdownOpen(false)}
                    >
                      Climate
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSearch}
                className="p-2 hover-lift"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* User Menu or Sign In Button */}
              {isAuthenticated ? (
                <div className="relative user-menu-container">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex items-center hover-lift"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-haspopup="true"
                    aria-expanded={isUserMenuOpen}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user?.fname || "User"}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="font-semibold text-gray-800 dark:text-white">
                          {user?.fname} {user?.lname}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user?.email}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {user?.role}
                        </div>
                      </div>

                      <button
                        className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate("/profile");
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Profile
                      </button>

                      <button
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center hover-lift"
                  onClick={() => setIsAuthOpen(true)}
                >
                  Sign in
                </Button>
              )}

              {/* Toggle Dark Mode */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2 hover-lift"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col space-y-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => {
                    handleCategoryClick(category.name, category.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2 text-left ${
                    activeCategory === category.name
                      ? "text-red-600 dark:text-red-400 font-semibold"
                      : ""
                  }`}
                >
                  {category.name}
                </button>
              ))}
              <button className="p-2 text-left">More</button>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <button className="p-2 text-left">Sign in</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar - Shown when search is clicked */}
      {showSearchBar && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-2">
          <div className="container mx-auto px-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow border-gray-300 focus:border-red-600 focus:ring-red-600"
              />
              <Button type="submit" variant="ghost" className="ml-2">
                <Search className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowSearchBar(false)}
                className="ml-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Breaking News Ticker */}
      <div className="bg-red-600 text-white py-2 overflow-hidden">
        <div className="container mx-auto px-4 flex items-center">
          <span className="breaking-news-label shrink-0 mr-4">Breaking</span>
          <div className="overflow-hidden whitespace-nowrap relative flex-grow">
            <div className="animate-marquee inline-block">
              {(breakingNews.length > 0
                ? breakingNews
                : HARDCODED_BREAKING_NEWS
              ).map((news, index) => (
                <span
                  key={index}
                  className="inline-block mr-12 cursor-pointer hover:underline"
                >
                  {news}
                  <span className="breaking-news-dot mx-2"></span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mega Menu Overlay */}
      {isMegaMenuOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shadow-sm bg-white/90 dark:bg-gray-900/90 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <button
                className="p-2 focus:outline-none rounded-full hover:bg-red-50 dark:hover:bg-gray-800 transition"
                aria-label="Close menu"
                onClick={() => setIsMegaMenuOpen(false)}
              >
                <X className="h-7 w-7 text-red-600" />
              </button>
              <span className="cnn-logo-box ml-2 shadow-md rounded-lg px-3 py-1 text-lg">
                News Website
              </span>
            </div>
            <button
              className="p-2 focus:outline-none rounded-full hover:bg-red-50 dark:hover:bg-gray-800 transition"
              aria-label="Close menu"
              onClick={() => setIsMegaMenuOpen(false)}
            >
              <span className="text-lg font-bold">×</span>
            </button>
          </div>
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 shadow-sm">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                className="w-full px-5 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-lg focus:outline-none focus:ring-2 focus:ring-red-600 shadow-md placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Search News Website..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {megaMenu.map((col) => (
                <div key={col.title}>
                  <h3 className="font-bold text-lg mb-3 text-red-600 tracking-wide uppercase">
                    {col.title}
                  </h3>
                  <ul className="space-y-2">
                    {col.items.map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="text-gray-700 dark:text-gray-200 hover:text-white hover:bg-red-600 px-3 py-2 rounded-lg text-base transition-colors block font-medium"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={() => {
          setIsAuthOpen(false);
          // The auth context will handle the user state update
        }}
      />
    </header>
  );
};

export default Navigation;
