#!/usr/bin/env sh
set -eu

cd /var/www/html

mkdir -p storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache || true

php artisan optimize:clear
php artisan config:cache

exec php artisan queue:work --sleep=3 --tries=3 --timeout=120 --max-time=3600
