# Stage 1: Build Composer dependencies
FROM composer:2 AS vendor

WORKDIR /app

# Copy only composer files first for caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Stage 2: PHP runtime
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libjpeg-dev libfreetype6-dev zip unzip libonig-dev libxml2-dev libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo_mysql bcmath zip opcache

# Copy Composer dependencies from previous stage
COPY --from=vendor /app/vendor /var/www/html/vendor

# Set working directory
WORKDIR /var/www/html

# Copy application source code
COPY . .

# Copy .env.example to .env if .env doesn't exist (Render doesn't auto-generate)
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Generate app key safely
RUN php artisan key:generate --force || true

# Expose port 80
EXPOSE 80

# Run migrations automatically and start server
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=80
