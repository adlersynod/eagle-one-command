#!/bin/bash
#===============================================================================
# EagleOne Command — Build & Start Script
# Mac Mini deployment via nginx
#===============================================================================

set -e

APP_DIR="/Volumes/Adler_Data/OpenClaw/workspace/agents/EagleOne/eagle-one-command"
DEPLOY_DIR="${APP_DIR}/deploy"
NGINX_CONF="${DEPLOY_DIR}/nginx.conf"
PORT=3000

echo "[EagleLaunch] EagleOne Command — Build & Deploy"
echo "================================================"

# Step 1: Build the application
echo "[1/3] Building production bundle..."
cd "${APP_DIR}"
if [ ! -d "node_modules" ]; then
    echo "  → Installing dependencies..."
    npm install
fi
echo "  → Running production build..."
npm run build

if [ ! -d "${APP_DIR}/dist" ]; then
    echo "[ERROR] Build failed — dist/ directory not found!"
    exit 1
fi
echo "  ✓ Build complete"

# Step 2: Validate nginx configuration
echo "[2/3] Validating nginx configuration..."
if ! nginx -t -c "${NGINX_CONF}" 2>&1; then
    echo "[ERROR] nginx configuration validation failed!"
    exit 1
fi
echo "  ✓ nginx config valid"

# Step 3: Reload nginx
echo "[3/3] Reloading nginx..."

# Check if nginx is running
if nginx -s reload -c "${NGINX_CONF}" 2>/dev/null; then
    echo "  ✓ nginx reloaded successfully on port ${PORT}"
else
    echo "  → Starting nginx fresh..."
    nginx -c "${NGINX_CONF}"
    echo "  ✓ nginx started on port ${PORT}"
fi

echo ""
echo "================================================"
echo "[EagleLaunch] Deploy complete!"
echo "  App URL: http://localhost:${PORT}"
echo "  API Proxy: http://localhost:${PORT}/api → 127.0.0.1:56565"
echo "================================================"
