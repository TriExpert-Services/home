# TriExpert Services - Deployment Guide

Complete guide for deploying TriExpert Services with Supabase self-hosted using Docker Compose.

## 📋 Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- At least 4GB RAM available
- Ports available: 80, 443, 3000, 3001, 4000, 5000, 5001, 5432, 5678, 8000, 8080, 8443, 9999

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to project directory
cd /path/to/triexpert-services

# Copy environment example
cp .env.example .env

# Generate JWT secrets (Linux/Mac)
openssl rand -base64 32
# Copy the output to JWT_SECRET in .env

openssl rand -base64 32
# Copy the output to SECRET_KEY_BASE in .env
```

### 2. Configure Environment Variables

Edit `.env` file with your configurations:

```bash
nano .env
```

**Required changes:**
- `POSTGRES_PASSWORD` - Set a strong password
- `JWT_SECRET` - Use generated secret from step 1
- `SECRET_KEY_BASE` - Use generated secret from step 1
- `N8N_BASIC_AUTH_PASSWORD` - Set password for n8n
- `SMTP_*` - Configure email settings

### 3. Generate Supabase API Keys

The default keys in `.env.example` are for development only. For production:

```bash
# Generate new JWT tokens at: https://supabase.com/docs/guides/hosting/overview#api-keys
# Or use the JWT secret to generate custom tokens

# Update these in .env:
# ANON_KEY=your-generated-anon-key
# SERVICE_ROLE_KEY=your-generated-service-role-key
# VITE_SUPABASE_ANON_KEY=your-generated-anon-key
```

### 4. Build and Start Services

```bash
# Build the frontend
docker-compose build triexpert-frontend

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Initialize Database

```bash
# The migrations in supabase/migrations/ will run automatically
# Verify migrations ran successfully
docker-compose exec postgres psql -U postgres -d postgres -c "\dt"
```

### 6. Access Services

- **Frontend Application**: http://localhost
- **Supabase Studio (Dashboard)**: http://localhost:3001
- **Supabase API**: http://localhost:8000
- **n8n Workflow Automation**: http://localhost:5678
- **PostgreSQL**: localhost:5432

### 7. Create Admin User

Access Supabase Studio at http://localhost:3001 and:
1. Go to Authentication → Users
2. Create a new user with admin role
3. Or use SQL:

```sql
-- Create admin user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES ('admin@triexpert.com', crypt('your-password', gen_salt('bf')), now(), 'authenticated');

-- Add to admin_users table
INSERT INTO public.admin_users (id, email, role, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@triexpert.com'),
  'admin@triexpert.com',
  'admin',
  now()
);
```

## 🔧 Service Details

### Frontend (Port 80)
- Built with React + TypeScript + Vite
- Served via Nginx
- Auto-restarts on failure

### Supabase Stack
- **PostgreSQL** (5432) - Main database
- **Kong** (8000, 8443) - API Gateway
- **GoTrue** (9999) - Authentication
- **PostgREST** (3000) - REST API
- **Realtime** (4000) - WebSocket server
- **Storage** (5000) - File storage
- **Meta** (8080) - Database management
- **Studio** (3001) - Admin dashboard

### n8n (Port 5678)
- Workflow automation platform
- Connected to PostgreSQL
- Basic auth enabled

## 📦 Data Volumes

Persistent data is stored in Docker volumes:
- `triexpert-postgres-data` - Database data
- `triexpert-storage-data` - Uploaded files
- `triexpert-n8n-data` - n8n workflows

### Backup Data

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres postgres > backup.sql

# Backup storage files
docker run --rm -v triexpert-storage-data:/data -v $(pwd):/backup ubuntu tar czf /backup/storage-backup.tar.gz /data

# Backup n8n workflows
docker run --rm -v triexpert-n8n-data:/data -v $(pwd):/backup ubuntu tar czf /backup/n8n-backup.tar.gz /data
```

### Restore Data

```bash
# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U postgres postgres

# Restore storage
docker run --rm -v triexpert-storage-data:/data -v $(pwd):/backup ubuntu tar xzf /backup/storage-backup.tar.gz -C /

# Restore n8n
docker run --rm -v triexpert-n8n-data:/data -v $(pwd):/backup ubuntu tar xzf /backup/n8n-backup.tar.gz -C /
```

## 🔐 Security Recommendations

### Production Deployment

1. **Use HTTPS**: Configure SSL certificates
   - Update nginx.conf for SSL
   - Add certificate volumes to docker-compose
   - Use Let's Encrypt or custom certs

2. **Secure Passwords**: Change all default passwords
   - PostgreSQL password
   - n8n credentials
   - SMTP credentials

3. **Restrict Access**: Use firewall rules
   ```bash
   # Example: Allow only specific IPs to Studio
   sudo ufw allow from YOUR_IP to any port 3001
   ```

4. **Update Environment URLs**: Change to production domains
   ```env
   VITE_SUPABASE_URL=https://api.yourdomain.com
   API_EXTERNAL_URL=https://api.yourdomain.com
   SITE_URL=https://yourdomain.com
   ```

5. **Enable PostgreSQL SSL**: Add to postgres service
   ```yaml
   command: postgres -c ssl=on -c ssl_cert_file=/etc/ssl/certs/server.crt
   ```

## 🐛 Troubleshooting

### Frontend not loading
```bash
# Check frontend logs
docker-compose logs triexpert-frontend

# Rebuild if needed
docker-compose build --no-cache triexpert-frontend
docker-compose up -d triexpert-frontend
```

### Database connection issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres
```

### Supabase API not responding
```bash
# Check Kong gateway
docker-compose logs kong

# Restart Kong
docker-compose restart kong

# Check all Supabase services
docker-compose ps
```

### Storage upload failures
```bash
# Check storage service
docker-compose logs storage

# Verify storage volume
docker volume inspect triexpert-storage-data

# Check permissions
docker-compose exec storage ls -la /var/lib/storage
```

### n8n workflow issues
```bash
# Check n8n logs
docker-compose logs n8n

# Access n8n shell
docker-compose exec n8n /bin/sh

# Reset n8n
docker-compose restart n8n
```

## 📊 Monitoring

### Health Checks

```bash
# Check all service health
docker-compose ps

# Frontend health
curl http://localhost/health

# Supabase health
curl http://localhost:8000/rest/v1/
```

### Resource Usage

```bash
# Monitor resource usage
docker stats

# Check specific service
docker stats triexpert-frontend
```

## 🔄 Updates

### Update Frontend

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose build triexpert-frontend
docker-compose up -d triexpert-frontend
```

### Update Supabase Services

```bash
# Edit docker-compose.yml to update image versions
nano docker-compose.yml

# Pull new images
docker-compose pull

# Restart services
docker-compose up -d
```

### Apply Database Migrations

```bash
# Place new migration files in supabase/migrations/
# Then run:
docker-compose exec postgres psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/your_migration.sql
```

## 🛑 Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: Deletes all data)
docker-compose down -v

# Stop specific service
docker-compose stop triexpert-frontend
```

## 📝 Environment Variables Reference

See `.env.example` for complete list and descriptions of all environment variables.

### Critical Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | Database password | `super-secret-password` |
| `JWT_SECRET` | JWT signing secret | Generated with openssl |
| `ANON_KEY` | Public API key | See Supabase docs |
| `SERVICE_ROLE_KEY` | Admin API key | See Supabase docs |
| `SMTP_*` | Email configuration | Gmail SMTP settings |

## 🆘 Support

For issues or questions:
1. Check logs: `docker-compose logs [service-name]`
2. Review this documentation
3. Check Supabase docs: https://supabase.com/docs
4. Contact: admin@triexpert.com

## 📄 License

TriExpert Services - All Rights Reserved
