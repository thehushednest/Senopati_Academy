#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/home/senopati/Documents/project_2026/Senopati_Academy"
NGINX_SOURCE="$PROJECT_ROOT/deploy/nginx/asksenopati.com.academy.conf"
NGINX_TARGET="/etc/nginx/sites-available/asksenopati.com"

cp "$NGINX_SOURCE" "$NGINX_TARGET"
nginx -t
systemctl reload nginx

echo "asksenopati.com is now pointed at Senopati Academy on port 3003."
