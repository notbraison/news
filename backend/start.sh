#!/bin/bash

cd /app

chmod -R 755 storage bootstrap/cache

php artisan config:clear
php artisan config:cache
php artisan route:cache

# Move into public and serve the index.php
cd public
php -S 0.0.0.0:$PORT
