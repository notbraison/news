# ======================
# Stage 1: Build vendor deps with PHP + Composer + MongoDB ext
# ======================
FROM php:8.2-cli AS vendor

# Install dependencies required by Composer and MongoDB ext
RUN apt-get update && apt-get install -y git unzip libssl-dev pkg-config

# Install MongoDB PHP extension
RUN pecl install mongodb \
    && docker-php-ext-enable mongodb

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy composer files and install deps
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts


# ======================
# Stage 2: Laravel Runtime (FPM)
# ======================
FROM php:8.2-fpm

# Install system packages and PHP extensions
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libjpeg-dev libfreetype6-dev zip unzip libonig-dev libxml2-dev libzip-dev libssl-dev pkg-config \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo_mysql bcmath zip opcache

# Install MongoDB PHP extension again for runtime
RUN pecl install mongodb \
    && docker-php-ext-enable mongodb

# Copy vendor folder from build stage
COPY --from=vendor /app/vendor /var/www/html/vendor

# Set working directory
WORKDIR /var/www/html

# Copy source files
COPY . .

# Ensure .env exists
#RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Generate Laravel key
RUN php artisan key:generate --force || true

EXPOSE 80

# Run migrations + serve app
CMD php artisan migrate --force && php artisan db:seed && php artisan serve --host=0.0.0.0 --port=80
