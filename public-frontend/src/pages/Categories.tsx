import React from "react";
import { Link } from "react-router-dom";

const Categories: React.FC = () => (
  <div className="container mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-4">Categories</h1>
    <ul className="space-y-2">
      <li>
        <Link to="/category/world" className="text-primary underline">
          World
        </Link>
      </li>
      <li>
        <Link to="/category/politics" className="text-primary underline">
          Politics
        </Link>
      </li>
      <li>
        <Link to="/category/business" className="text-primary underline">
          Business
        </Link>
      </li>
      <li>
        <Link to="/category/sports" className="text-primary underline">
          Sports
        </Link>
      </li>
      <li>
        <Link to="/category/entertainment" className="text-primary underline">
          Entertainment
        </Link>
      </li>
    </ul>
  </div>
);

export default Categories;
