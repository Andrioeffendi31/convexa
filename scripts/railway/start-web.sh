#!/usr/bin/env sh
set -eu

cd /var/www/html

# Ensure runtime dirs exist.
mkdir -p storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache || true

# Run migrations first so the cache table exists for optimize:clear
if [ "${AUTO_RUN_MIGRATIONS:-true}" = "true" ]; then
  php artisan migrate --force
fi

php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
