#!/bin/bash
# ==============================================================================
# PRAGYAM ENTERPRISES - AUTOMATED PRODUCTION DEPLOYMENT SCRIPT (LINUX / VPS)
# ==============================================================================

set -e

echo "=========================================================="
echo "  🌾 PRAGYAM ENTERPRISES - PRODUCTION DEPLOYMENT SCRIPT   "
echo "=========================================================="

# 1. Check Docker & Compose
if ! command -v docker &> /dev/null; then
    echo "Error: docker is not installed. Please install Docker first."
    exit 1
fi

# 2. Check Environment file
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "WARNING: Please review and edit .env with your real production secrets."
fi

# 3. Pull latest changes
echo "Pulling latest code repository..."
git pull origin main || true

# 4. Build and start containers with Docker Compose
echo "Building and starting production containers (PostgreSQL, Redis, API, Web)..."
docker compose down || true
docker compose up --build -d

# 5. Verify Health Checks
echo "Verifying service availability..."
sleep 5

API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/health || echo "000")
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")

echo "Backend API Status Code: $API_STATUS"
echo "Web Portal Status Code:  $WEB_STATUS"

if [ "$API_STATUS" -eq 200 ] && [ "$WEB_STATUS" -eq 200 ]; then
    echo "=========================================================="
    echo "  ✅ PRAGYAM ENTERPRISES SUCCESSFULLY DEPLOYED TO PROD!   "
    echo "  - Web & Admin Portal: http://localhost:3000            "
    echo "  - Backend REST API:   http://localhost:4000/api        "
    echo "=========================================================="
else
    echo "⚠️ Warning: One or more services did not return HTTP 200. Check logs with 'docker compose logs'."
fi
