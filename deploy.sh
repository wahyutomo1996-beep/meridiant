#!/bin/bash
# ============================================
# Meridiant - VPS Deployment Script
# ============================================
# Jalankan: chmod +x deploy.sh && sudo ./deploy.sh
# Tested on: Ubuntu 22.04 / 24.04

set -e

DOMAIN=""
EMAIL=""

echo "============================================"
echo "  Meridiant VPS Deployment"
echo "============================================"

# Ask for domain
read -p "Masukkan domain Anda (contoh: meridiant.com): " DOMAIN
read -p "Masukkan email untuk SSL (contoh: admin@meridiant.com): " EMAIL

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Error: Domain dan email harus diisi!"
    exit 1
fi

echo ""
echo "[1/6] Update sistem & install dependencies..."
apt-get update -y
apt-get install -y curl git

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "[2/6] Install Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "[2/6] Docker sudah terinstall, skip..."
fi

# Install Docker Compose plugin
if ! docker compose version &> /dev/null; then
    echo "[3/6] Install Docker Compose..."
    apt-get install -y docker-compose-plugin
else
    echo "[3/6] Docker Compose sudah terinstall, skip..."
fi

# Install Certbot
echo "[4/6] Install Certbot untuk SSL..."
apt-get install -y certbot

# Get SSL Certificate
echo "[5/6] Mendapatkan SSL certificate..."
echo "Pastikan domain $DOMAIN sudah mengarah ke IP server ini!"
read -p "Sudah pointing? (y/n): " CONFIRM
if [ "$CONFIRM" = "y" ]; then
    certbot certonly --standalone -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
else
    echo "Silakan pointing domain dulu, lalu jalankan script ini lagi."
    exit 1
fi

# Setup environment
echo "[6/6] Setup konfigurasi..."

# Update nginx config with actual domain
sed -i "s/YOUR_DOMAIN.com/$DOMAIN/g" docker/nginx/nginx-ssl.conf

# Create production env if not exists
if [ ! -f .env.production ]; then
    cp .env.production.example .env.production
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i "s/GANTI_DENGAN_RANDOM_STRING_YANG_PANJANG_DAN_AMAN/$JWT_SECRET/g" .env.production
    sed -i "s|APP_URL=https://yourdomain.com|APP_URL=https://$DOMAIN|g" .env.production
    sed -i "s|CORS_ORIGINS=https://yourdomain.com|CORS_ORIGINS=https://$DOMAIN|g" .env.production
    echo ""
    echo "File .env.production sudah dibuat."
    echo "Edit jika perlu: nano .env.production"
    read -p "Tekan Enter untuk lanjut build..."
fi

# Build and start
echo ""
echo "Building dan starting containers..."
docker compose build --no-cache
docker compose up -d

# Setup auto-renew SSL
echo "0 0 1 * * certbot renew --pre-hook 'docker compose stop nginx' --post-hook 'docker compose start nginx'" | crontab -

echo ""
echo "============================================"
echo "  Deployment Selesai!"
echo "============================================"
echo ""
echo "  URL: https://$DOMAIN"
echo ""
echo "  Cek status:  docker compose ps"
echo "  Lihat logs:  docker compose logs -f"
echo "  Restart:     docker compose restart"
echo "  Stop:        docker compose down"
echo ""
echo "  SSL auto-renew: aktif (setiap bulan)"
echo "============================================"
