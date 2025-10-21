# News Portal - Modern News Management System

A comprehensive news management system built with Laravel backend and React frontends, featuring a public-facing news portal and an admin dashboard for content management.

---

## 🏗️ Architecture

This project is organized as a monorepo with three main components:

- **`backend/`** - Laravel 12 REST API with Sanctum authentication, user management, articles, categories, tags, comments, analytics, and media
- **`admin-frontend/`** - React 18 + Vite + TypeScript admin dashboard for managing users, articles, categories, tags, media, and analytics
- **`public-frontend/`** - React 18 + Vite + TypeScript public news portal for browsing, searching, and reading articles

  ## 🚀 Features

### Public News Portal

- 📰 **Article Browsing** - Browse and read published articles
- 🔍 **Search Functionality** - Search articles by title, content, and tags
- 📂 **Category Filtering** - Filter articles by categories
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Mobile-first responsive design
- ⚡ **Real-time Updates** - Live content updates

### Admin Dashboard

- 👤 **User Management** - Create, edit, and manage user accounts
- 📝 **Article Management** - Create, edit, publish, and archive articles
- 🏷️ **Category Management** - Organize content with categories
- 🏷️ **Tag Management** - Add tags for better content organization
- 📊 **Analytics Dashboard** - View article performance and analytics
- 💬 **Comment Management** - Moderate and manage user comments
- 📁 **Media Management** - Upload and manage images and files
- 🔄 **Revision History** - Track article changes and revisions
- 📈 **Post Analytics** - View detailed post statistics and trends

### Backend API

- 🔐 **Authentication** - Laravel Sanctum token-based authentication
- 📊 **RESTful API** - Complete CRUD operations for all entities
- 🗄️ **Database Management** - Comprehensive data models and relationships
- 📈 **Analytics** - Built-in analytics and reporting endpoints
- 🔍 **Search & Filtering** - Advanced search and filtering capabilities
- 📁 **File Management** - Secure file upload and management
- 🔄 **Revision Control** - Track content changes and versions
  ## 🛠️ Tech Stack

### Backend

- **Framework**: Laravel 12
- **Database**: MySQL/PostgreSQL
- **Authentication**: Laravel Sanctum
- **Testing**: Pest PHP
- **API**: RESTful API with JSON responses

### Frontend (Both Admin & Public)

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Additional Tools

- **Package Manager**: pnpm/npm
- **Code Quality**: ESLint + TypeScript
- **Version Control**: Git
  ## 📁 Project Structure

```
news/
├── backend/                 # Laravel API Backend
│   ├── app/
│   │   ├── Http/Controllers/    # API Controllers
│   │   │   └── Auth/           # Authentication Controllers
│   │   ├── Models/             # Eloquent Models
│   │   ├── Policies/           # Authorization Policies
│   │   └── Providers/          # Service Providers
│   ├── database/
│   │   ├── migrations/         # Database Migrations
│   │   ├── seeders/           # Database Seeders
│   │   └── factories/         # Model Factories
│   ├── routes/
│   │   └── api.php            # API Routes
│   └── tests/                 # PHP Tests
├── admin-frontend/           # Admin Dashboard
│   ├── src/
│   │   ├── components/        # React Components
│   │   ├── pages/            # Page Components
│   │   ├── hooks/            # Custom Hooks
│   │   └── lib/              # Utilities & Config
│   └── package.json
├── public-frontend/          # Public News Portal
│   ├── src/
│   │   ├── components/        # React Components
│   │   ├── pages/            # Page Components
│   │   ├── hooks/            # Custom Hooks
│   │   └── lib/              # Utilities & Config
│   └── package.json
└── docs/                     # Documentation
```

## 🚀 Quick Start

### Prerequisites

- PHP 8.2+
- Node.js 18+
- Composer
- MySQL/PostgreSQL
- Git

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Edit .env for your database credentials
php artisan migrate --seed
php artisan serve
```

### Admin Frontend Setup

```bash
cd admin-frontend
pnpm install  # or npm install
cp .env.example .env
# Edit .env for your API base URL
pnpm dev      # or npm run dev
```

### Public Frontend Setup

```bash
cd public-frontend
pnpm install  # or npm install
cp .env.example .env
# Edit .env for your API base URL
pnpm dev      # or npm run dev
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
APP_NAME="News Portal"
APP_ENV=local
APP_KEY=your-app-key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=news_portal
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:3001
SESSION_DOMAIN=localhost
```

#### Frontends (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=10000
VITE_APP_NAME=News Portal
VITE_SITE_URL=http://localhost:3000
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_SEARCH=true
VITE_ENABLE_CATEGORIES=true
VITE_ENABLE_COMMENTS=true
```

## 📊 Database Schema

### Core Models

- **Users** - User accounts and authentication
- **Posts** - News articles and content
- **Categories** - Content categorization
- **Tags** - Content tagging system
- **Comments** - User comments on articles
- **Media** - File and image management
- **PostViews** - Analytics tracking
- **PostRevisions** - Content version control
- **Attachments** - File attachments

### Key Relationships

- Users can create multiple Posts
- Posts belong to Categories (many-to-many)
- Posts have Tags (many-to-many)
- Posts can have multiple Comments
- Posts track Views for analytics
- Posts maintain Revision history
  ## 🔐 Authentication & Authorization

### User Roles

- **Admin** - Full system access
- **Author** - Content creation and management
- **Viewer** - Read-only access to public content

### API Authentication

- Laravel Sanctum token-based authentication
- Protected routes require valid tokens
- Role-based access control for different endpoints
  ## 📈 Analytics & Reporting

### Available Analytics

- Article view counts and trends
- Popular articles ranking
- User engagement metrics
- Content performance tracking
- Time-based analytics

### API Endpoints

- `/api/post/{id}` - Individual post statistics
- `/api/top-posts` - Most popular articles
- `/api/views-over-time/{id}` - Post view trends
- `/api/total-views-over-time` - Overall site analytics
  ## 🧪 Testing

### Backend Testing

```bash
cd backend
php artisan test
```

### Frontend Testing

```bash
# Admin Frontend
cd admin-frontend
npm run test

# Public Frontend
cd public-frontend
npm run test
```

## 🚀 Deployment

### Production Build

#### Backend

```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### Frontend

```bash
# Admin Frontend
cd admin-frontend
npm run build

# Public Frontend
cd public-frontend
npm run build
```

### Environment Considerations

- Set `APP_ENV=production` in backend
- Configure production database
- Set up proper CORS domains
- Configure file storage (S3, etc.)
- Set up SSL certificates
  ## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
   ## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the API documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - Basic CRUD operations for all entities
  - Authentication and authorization
  - Public news portal
  - Admin dashboard
  - Analytics and reporting

---

Built with ❤️ using Laravel and React
