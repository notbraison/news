import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const categories = [
    "World",
    "Politics",
    "Business",
    "Sports",
    "Entertainment",
    "Technology",
    "Science",
    "Health",
    "Travel",
    "Opinion"
  ];
  
  const regions = [
    "North America",
    "Europe",
    "Asia",
    "Middle East",
    "Africa",
    "Latin America",
    "Australia"
  ];
  
  const otherLinks = [
    "About Us",
    "Contact",
    "Careers",
    "Advertise",
    "Terms of Use",
    "Privacy Policy",
    "Cookie Policy",
    "Accessibility",
    "Sitemap"
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Categories */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-bold text-lg mb-4 uppercase">Categories</h3>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((category) => (
                <li key={category}>
                  <Link
                    to={`/category/${category.toLowerCase()}`}
                    className="text-gray-400 hover:text-white text-sm flex items-center"
                  >
                    <ChevronRight className="h-3 w-3 mr-1" />
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-bold text-lg mb-4 uppercase md:opacity-0">.</h3>
            <ul className="space-y-2">
              {categories.slice(6).map((category) => (
                <li key={category}>
                  <Link
                    to={`/category/${category.toLowerCase()}`}
                    className="text-gray-400 hover:text-white text-sm flex items-center"
                  >
                    <ChevronRight className="h-3 w-3 mr-1" />
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Regions */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-bold text-lg mb-4 uppercase">Regions</h3>
            <ul className="space-y-2">
              {regions.map((region) => (
                <li key={region}>
                  <Link
                    to={`/region/${region.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-gray-400 hover:text-white text-sm flex items-center"
                  >
                    <ChevronRight className="h-3 w-3 mr-1" />
                    {region}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Other Links */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-bold text-lg mb-4 uppercase">Company</h3>
            <ul className="space-y-2">
              {otherLinks.slice(0, 7).map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-gray-400 hover:text-white text-sm flex items-center"
                  >
                    <ChevronRight className="h-3 w-3 mr-1" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="col-span-2 md:col-span-2">
            <h3 className="text-white font-bold text-lg mb-4 uppercase">NewsToday</h3>
            <p className="text-sm text-gray-400 mb-4">
              Your trusted source for the latest news and in-depth coverage of events that matter around the world.
            </p>
            
            <div className="mb-4">
              <h4 className="text-white font-bold mb-2">Subscribe to our newsletter</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-gray-800 text-white px-3 py-2 text-sm rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-red-600" 
                />
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm rounded-r-md">
                  Sign Up
                </button>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-4">
              <a
                href="https://facebook.com"
                className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://instagram.com"
                className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
          </div>

            <div className="mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                <Mail size={14} className="text-red-600" />
                <span>contact@newstoday.com</span>
          </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Phone size={14} className="text-red-600" />
                <span>+1 234 567 890</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-sm text-gray-400">
              © {currentYear} NewsToday. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <li>
                  <Link
                    to="/privacy"
                    className="text-gray-400 hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-gray-400 hover:text-white"
                  >
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cookies"
                    className="text-gray-400 hover:text-white"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
