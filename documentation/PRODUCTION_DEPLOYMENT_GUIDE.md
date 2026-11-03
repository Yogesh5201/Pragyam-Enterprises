# PRAGYAM ENTERPRISES
## Complete Production Deployment Guide
### Multi-Cloud & Enterprise Self-Hosting Playbook

---

## 1. Cloud Hosting Options Comparison

| Option | Ideal For | Services Deployed | Effort |
| :--- | :--- | :--- | :--- |
| **Option A: Render Blueprint** (`render.yaml`) | Zero-devops cloud | Managed PostgreSQL, Redis, Backend API, Next.js Web | **1-Click** |
| **Option B: Railway** (`railway.json`) | Fast staging & scaling | Backend API, PostgreSQL, Next.js Web | **1-Click** |
| **Option C: Vercel + Managed API/DB** | High-performance CDN | Web on Vercel (`vercel.json`), API on Railway/Render | **Fast** |
| **Option D: Self-Hosted Linux VPS / Docker** | Full data sovereignty | Docker Compose (PostgreSQL 16, Redis, API, Web, Nginx) | **Enterprise** |

---

## 2. Option A: 1-Click Cloud Deployment via Render Blueprint

Pragyam Enterprises includes a pre-configured `render.yaml` specification.

### Steps:
1. Push this repository to GitHub or GitLab:
   ```bash
   git add .
   git commit -m "feat: complete production rice brokerage platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_ORG/pragyam-enterprises.git
   git push -u origin main
   ```
2. Open [dashboard.render.com](https://dashboard.render.com).
3. Click **New** ➔ **Blueprint**.
4. Connect the repository. Render automatically reads `render.yaml` and spins up:
   - **`pragyam-postgres`**: Managed PostgreSQL 16 database.
   - **`pragyam-api`**: Node.js backend REST API with health check.
   - **`pragyam-web`**: Next.js Web & Super Admin Portal.
5. All environment variables, connections, and secrets are auto-provisioned.

---

## 3. Option B: Vercel Web Deployment

Vercel is already installed locally (`vercel.ps1`).

### Steps:
1. Authenticate with Vercel:
   ```bash
   vercel login
   ```
2. Deploy the Next.js Web & Admin Portal:
   ```bash
   cd apps/web
   vercel --prod
   ```
3. Set the environment variable in Vercel project settings:
   - `NEXT_PUBLIC_API_URL`: Your live backend API URL (e.g. `https://api.pragyam.com`).

---

## 4. Option C: Self-Hosted VPS / AWS EC2 / DigitalOcean (Docker Compose)

For complete ownership and data control on a Linux server (Ubuntu 22.04 / 24.04 LTS).

### Steps:
1. Clone the repository onto the server:
   ```bash
   git clone https://github.com/YOUR_ORG/pragyam-enterprises.git /opt/pragyam
   cd /opt/pragyam
   ```
2. Configure production secrets:
   ```bash
   cp .env.example .env
   nano .env
   ```
3. Execute the automated deployment script:
   ```bash
   chmod +x infrastructure/scripts/deploy-linux.sh
   ./infrastructure/scripts/deploy-linux.sh
   ```
4. Configure Nginx with SSL (Let's Encrypt / Certbot):
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d pragyam.com -d api.pragyam.com
   ```

---

## 5. Automated Database Backups & Maintenance

Automated daily database dumps with 30-day retention:
```bash
# Add to crontab (daily at 2:00 AM)
crontab -e
# Add line:
0 2 * * * /opt/pragyam/infrastructure/scripts/backup-db.sh >> /var/log/pragyam_backup.log 2>&1
```

---

## 6. Mobile Application Release Deployment

### 1. Google Play Store Release (AAB Bundle)
```bash
cd apps/mobile
npx eas-cli build --platform android --profile production
```
Uploads the signed `.aab` to Google Play Console with Target SDK 34/35.

### 2. Apple App Store Release
```bash
cd apps/mobile
npx eas-cli build --platform ios --profile production
```
Distribute via TestFlight for internal testing, then submit for App Store review.
