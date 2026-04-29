FROM composer:2.8 AS vendor

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

COPY . .
RUN composer dump-autoload --no-dev --optimize \
    && php artisan package:discover --ansi

FROM node:22-alpine AS frontend

WORKDIR /var/www/html

COPY package.json package-lock.json ./
RUN npm ci

COPY resources ./resources
COPY public ./public
COPY vite.config.js tailwind.config.js postcss.config.js jsconfig.json ./
RUN npm run build

FROM php:8.3-cli-alpine AS app

WORKDIR /var/www/html

RUN apk add --no-cache \
    icu-dev \
    libpq-dev \
    libzip-dev \
    oniguruma-dev \
    unzip \
    zip \
    && docker-php-ext-install \
    bcmath \
    intl \
    mbstring \
    pdo_pgsql \
    zip

COPY --from=vendor /var/www/html /var/www/html
COPY --from=frontend /var/www/html/public/build /var/www/html/public/build

RUN chmod -R ug+rwx storage bootstrap/cache

EXPOSE 10000

CMD ["sh", "-lc", "php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]
