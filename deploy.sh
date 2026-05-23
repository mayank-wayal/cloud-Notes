#!/bin/bash
# CloudNotes AWS EC2 Deployment Script
# Run this on your EC2 instance after cloning the repo

set -e

echo "🚀 CloudNotes AWS Deployment Script"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run with sudo${NC}"
   exit 1
fi

echo -e "${YELLOW}Step 1: Update system packages${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}Step 2: Install Node.js and npm${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version && npm --version

echo -e "${YELLOW}Step 3: Install PM2 globally${NC}"
npm install -g pm2

echo -e "${YELLOW}Step 4: Install PostgreSQL client${NC}"
apt install -y postgresql-client

echo -e "${YELLOW}Step 5: Install Nginx${NC}"
apt install -y nginx

echo -e "${YELLOW}Step 6: Install Certbot for SSL${NC}"
apt install -y certbot python3-certbot-nginx

# Project setup
PROJECT_DIR="/var/www/cloudnotes"

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Error: $PROJECT_DIR not found${NC}"
    echo "Please clone the repository first:"
    echo "  cd /var/www && git clone https://github.com/your-repo/cloudnotes.git"
    exit 1
fi

echo -e "${YELLOW}Step 7: Install backend dependencies${NC}"
cd "$PROJECT_DIR/backend"
npm ci --omit=dev

echo -e "${YELLOW}Step 8: Create production .env file${NC}"
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    echo "Copying .env.production template..."
    cp .env.production .env
    echo -e "${RED}⚠️  IMPORTANT: Edit .env with your AWS credentials${NC}"
    echo "   nano $PROJECT_DIR/backend/.env"
    echo ""
    echo "Required variables:"
    echo "  - DATABASE_URL (RDS endpoint)"
    echo "  - JWT_SECRET (secure random string)"
    echo "  - AWS_ACCESS_KEY_ID"
    echo "  - AWS_SECRET_ACCESS_KEY"
    echo "  - CLIENT_URL (your domain)"
    exit 0
fi

echo -e "${YELLOW}Step 9: Test database connection${NC}"
if command -v psql &> /dev/null; then
    echo "Testing database connection..."
    # This will fail if credentials are wrong, which is expected
    psql "$DATABASE_URL" -c "SELECT 1" 2>/dev/null || echo -e "${YELLOW}Database test skipped (credentials may not be set yet)${NC}"
fi

echo -e "${YELLOW}Step 10: Start backend with PM2${NC}"
pm2 delete cloudnotes-api 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save

echo -e "${YELLOW}Step 11: Configure PM2 to start on reboot${NC}"
pm2 startup -u root --hp /root

echo -e "${YELLOW}Step 12: Build frontend${NC}"
cd "$PROJECT_DIR/frontend"
npm ci
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-/api} npm run build
pm2 delete cloudnotes-web 2>/dev/null || true
pm2 start npm --name cloudnotes-web -- start
pm2 save

echo -e "${YELLOW}Step 13: Setup Nginx${NC}"
cp "$PROJECT_DIR/deployment/nginx/cloudnotes.conf" /etc/nginx/sites-available/cloudnotes

# Check if symlink exists
if [ ! -L /etc/nginx/sites-enabled/cloudnotes ]; then
    ln -s /etc/nginx/sites-available/cloudnotes /etc/nginx/sites-enabled/cloudnotes
fi

# Remove default site
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl restart nginx

echo ""
echo -e "${GREEN}✅ Deployment setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Edit your environment file:"
echo "   nano $PROJECT_DIR/backend/.env"
echo ""
echo "2. Update these variables with your AWS details:"
echo "   - DATABASE_URL (from RDS)"
echo "   - JWT_SECRET (use: openssl rand -base64 32)"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   - CLIENT_URL (your domain)"
echo ""
echo "3. Restart backend:"
echo "   pm2 restart cloudnotes-api"
echo ""
echo "4. Setup SSL certificate:"
echo "   certbot --nginx -d your-domain.com"
echo ""
echo "5. Edit Nginx config for your domain:"
echo "   nano /etc/nginx/sites-available/cloudnotes"
echo ""
echo "6. Test everything:"
echo "   curl http://localhost:5000/health"
echo "   curl http://localhost"
echo ""
echo "📊 Monitor logs:"
echo "   pm2 logs cloudnotes-api"
echo "   tail -f /var/log/nginx/error.log"
echo ""
echo -e "${GREEN}Good luck! 🚀${NC}"
