# Deployment Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL 15 (if not using Docker)
- Redis 7 (if not using Docker)

## Environment Configuration

1. **Copy Environment Template**
```bash
copy .env.example .env
```

2. **Configure Variables**

Edit `.env` with your settings:

```env
# Environment
NODE_ENV=production

# Server
PORT=3000
LOG_LEVEL=info

# Stellar Configuration
STELLAR_NETWORK=public  # Use 'public' for mainnet
STELLAR_HORIZON_URL=https://horizon.stellar.org
STELLAR_PASSPHRASE=Public Global Stellar Network ; September 2015

# XRPL Configuration
XRPL_NETWORK=mainnet
XRPL_SERVER=wss://xrplcluster.com

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digital_giant_stellar
DB_USER=postgres
DB_PASSWORD=your_secure_password_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here

# Security
JWT_SECRET=your_jwt_secret_minimum_32_characters
ENCRYPTION_KEY=your_encryption_key_minimum_32_characters

# Bridge
BRIDGE_ENABLED=true
BRIDGE_MIN_AMOUNT=1
BRIDGE_FEE_PERCENT=0.5

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

## Deployment Methods

### Method 1: Docker Compose (Recommended)

**Advantages:**
- Complete infrastructure included
- Easy to scale
- Isolated environment
- Production-ready

**Steps:**

1. **Build and Start Services**
```bash
docker-compose up -d
```

2. **View Logs**
```bash
docker-compose logs -f api
```

3. **Check Status**
```bash
docker-compose ps
```

4. **Stop Services**
```bash
docker-compose down
```

5. **Restart Services**
```bash
docker-compose restart
```

### Method 2: Manual Deployment

**Prerequisites:**
- PostgreSQL running and accessible
- Redis running and accessible

**Steps:**

1. **Install Dependencies**
```bash
npm ci --production
```

2. **Build Application**
```bash
npm run build
```

3. **Set Up Database**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE digital_giant_stellar;

-- Run schema (see database/schema.md)
```

4. **Start Application**
```bash
npm start
```

### Method 3: PM2 Process Manager

**For production deployments without Docker**

1. **Install PM2**
```bash
npm install -g pm2
```

2. **Create PM2 Config**

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'digital-giant-stellar',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

3. **Start with PM2**
```bash
pm2 start ecosystem.config.js
```

4. **Monitor**
```bash
pm2 monit
```

5. **View Logs**
```bash
pm2 logs
```

6. **Set up Auto-restart**
```bash
pm2 startup
pm2 save
```

## Cloud Deployment

### AWS Deployment

#### Using EC2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.medium or larger
   - Security group: Allow 80, 443, 22

2. **Install Docker**
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
```

3. **Deploy Application**
```bash
git clone <repository>
cd digital-giant-stellar
nano .env  # Configure
docker-compose up -d
```

#### Using ECS/Fargate

1. Build and push Docker image to ECR
2. Create ECS task definition
3. Configure load balancer
4. Deploy service

### Azure Deployment

#### Using Azure Container Instances

```bash
az container create \
  --resource-group digital-giant \
  --name stellar-api \
  --image <your-registry>/digital-giant-stellar:latest \
  --dns-name-label stellar-api \
  --ports 3000 \
  --environment-variables \
    NODE_ENV=production \
    PORT=3000
```

### Google Cloud Deployment

#### Using Cloud Run

```bash
gcloud run deploy digital-giant-stellar \
  --image <your-registry>/digital-giant-stellar:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Database Setup

### PostgreSQL Setup

1. **Create Database**
```sql
CREATE DATABASE digital_giant_stellar;
CREATE USER stellar_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE digital_giant_stellar TO stellar_user;
```

2. **Run Migrations**
```bash
# Execute SQL from database/schema.md
psql -U stellar_user -d digital_giant_stellar -f database/init.sql
```

### Redis Setup

```bash
# With authentication
redis-server --requirepass your_redis_password

# Verify connection
redis-cli -a your_redis_password
```

## SSL/TLS Configuration

### Using Let's Encrypt with Nginx

1. **Install Certbot**
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Obtain Certificate**
```bash
sudo certbot --nginx -d your-domain.com
```

3. **Auto-renewal**
```bash
sudo certbot renew --dry-run
```

## Monitoring & Logging

### Application Logs

**Docker:**
```bash
docker-compose logs -f api
```

**PM2:**
```bash
pm2 logs
```

**File System:**
```
logs/combined.log
logs/error.log
```

### Health Checks

```bash
# Local
curl http://localhost:3000/health

# Production
curl https://your-domain.com/health
```

### Metrics (if enabled)

```bash
curl http://localhost:9090/metrics
```

## Backup & Recovery

### Database Backup

```bash
# Backup
pg_dump -U stellar_user digital_giant_stellar > backup.sql

# Restore
psql -U stellar_user digital_giant_stellar < backup.sql
```

### Redis Backup

```bash
# Redis creates dump.rdb automatically
redis-cli BGSAVE

# Copy backup
cp /var/lib/redis/dump.rdb /backup/
```

## Scaling

### Horizontal Scaling

1. **Configure Load Balancer**
   - AWS ALB
   - Azure Load Balancer
   - GCP Load Balancing

2. **Scale API Instances**
```bash
docker-compose up -d --scale api=3
```

3. **Database Connection Pooling**
   - Already configured in application
   - Adjust pool size in config

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <pid> /F
```

**Database Connection Failed**
- Check database is running
- Verify credentials in `.env`
- Check network connectivity
- Review firewall rules

**Out of Memory**
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096`
- Scale horizontally
- Optimize queries

### Logs Location

- Application: `logs/`
- Docker: `docker-compose logs`
- System: `/var/log/`

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable monitoring and alerts
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Environment variables secured
- [ ] API keys rotated regularly

## Post-Deployment

1. **Verify Health**
```bash
curl https://your-domain.com/health
```

2. **Test Endpoints**
```bash
# Create account
curl -X POST https://your-domain.com/api/accounts/create

# Check account
curl https://your-domain.com/api/accounts/<account-id>
```

3. **Monitor Logs**
```bash
tail -f logs/combined.log
```

4. **Set Up Alerts**
   - Application errors
   - High response times
   - Resource usage
   - Failed transactions

## Maintenance

### Updates

```bash
# Pull latest code
git pull

# Rebuild
docker-compose build

# Restart services
docker-compose up -d
```

### Database Maintenance

```sql
-- Analyze and optimize
ANALYZE;
VACUUM;

-- Check indexes
SELECT * FROM pg_indexes WHERE schemaname = 'public';
```

## Support

For deployment issues:
- Check logs first
- Review configuration
- Consult documentation
- Open GitHub issue
- Contact: support@digitalgiant.com
