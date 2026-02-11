# Panduan Deployment Meridiant ke VPS

## Kebutuhan VPS
- **OS**: Ubuntu 22.04 atau 24.04
- **RAM**: Minimal 2GB (rekomendasi 4GB)
- **Storage**: Minimal 20GB
- **CPU**: 2 vCPU

## Langkah Deployment

### 1. Siapkan Domain
Pointing domain Anda ke IP VPS di DNS provider:
```
A Record: @ -> IP_VPS_ANDA
A Record: www -> IP_VPS_ANDA
```
Tunggu propagasi DNS (5-30 menit).

### 2. Login ke VPS
```bash
ssh root@IP_VPS_ANDA
```

### 3. Clone/Upload Project
**Opsi A - Git Clone:**
```bash
cd /opt
git clone https://github.com/USERNAME/meridiant.git
cd meridiant
```

**Opsi B - Upload Manual (SCP):**
```bash
# Dari laptop/PC lokal:
scp -r /path/to/meridiant root@IP_VPS:/opt/meridiant

# Di VPS:
cd /opt/meridiant
```

### 4. Jalankan Script Deploy
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```
Script akan:
- Install Docker & Docker Compose
- Install Certbot & ambil SSL certificate
- Setup environment variables
- Build & start semua containers

### 5. Verifikasi
```bash
# Cek semua container running
docker compose ps

# Test API
curl https://DOMAIN_ANDA/api/

# Lihat logs
docker compose logs -f backend
docker compose logs -f frontend
```

## Update Google OAuth
Setelah deploy, tambahkan domain baru di Google Cloud Console:
1. Buka https://console.cloud.google.com/apis/credentials
2. Edit OAuth 2.0 Client ID
3. Tambahkan di **Authorized JavaScript Origins**:
   - `https://DOMAIN_ANDA`
4. Tambahkan di **Authorized redirect URIs**:
   - `https://DOMAIN_ANDA`
5. Simpan

## Perintah Berguna

| Perintah | Fungsi |
|----------|--------|
| `docker compose ps` | Cek status |
| `docker compose logs -f` | Lihat semua logs |
| `docker compose logs -f backend` | Lihat backend logs |
| `docker compose restart` | Restart semua |
| `docker compose restart backend` | Restart backend saja |
| `docker compose down` | Stop semua |
| `docker compose up -d --build` | Rebuild & start |

## Update Aplikasi
```bash
cd /opt/meridiant
git pull
docker compose up -d --build
```

## Backup Database
```bash
# Backup
docker exec meridiant-db mongodump --out /data/backup
docker cp meridiant-db:/data/backup ./backup_$(date +%Y%m%d)

# Restore
docker cp ./backup_TANGGAL meridiant-db:/data/restore
docker exec meridiant-db mongorestore /data/restore
```

## Troubleshooting

### Container tidak start
```bash
docker compose logs backend  # Cek error backend
docker compose logs frontend # Cek error frontend
docker compose logs nginx    # Cek error nginx
```

### SSL Error
```bash
# Renew manual
certbot renew
docker compose restart nginx
```

### Database connection error
```bash
# Cek MongoDB running
docker compose ps mongodb
docker compose logs mongodb
```
