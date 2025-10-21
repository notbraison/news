#!/bin/bash

# Laravel Memory Optimization Script
# Run this script after deployment to optimize memory usage

echo "🚀 Starting Laravel Memory Optimization..."

# Clear all caches
echo "🧹 Clearing caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize autoloader
echo "📦 Optimizing autoloader..."
composer install --optimize-autoloader --no-dev

# Cache configurations
echo "⚙️ Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize database
echo "🗄️ Optimizing database..."
php artisan migrate --force

# Set proper permissions
echo "🔐 Setting permissions..."
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Optimize Composer
echo "🎼 Optimizing Composer..."
composer dump-autoload --optimize --no-dev

echo "✅ Laravel optimization complete!"
echo "📊 Memory usage should be significantly reduced."
