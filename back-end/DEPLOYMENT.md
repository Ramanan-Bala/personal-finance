# Deployment Guide

Complete guide for deploying Cashly backend to production.

## Deployment Options

### 1. Heroku (Recommended for beginners)

#### Prerequisites

- Heroku account
- Heroku CLI installed

#### Steps

1. **Create Heroku app:**

```bash
heroku create cashly-backend
```

2. **Add PostgreSQL add-on:**

```bash
heroku addons:create heroku-postgresql:hobby-dev --app cashly-backend
```

3. **Set environment variables:**

```bash
heroku config:set \
  NODE_ENV=production \
  JWT_SECRET=$(openssl rand -base64 32) \
  JWT_REFRESH_SECRET=$(openssl rand -base64 32) \
  --app cashly-backend
```

4. **Deploy:**

```bash
git push heroku main
```

5. **Run migrations:**

```bash
heroku run npm run prisma:migrate:prod --app cashly-backend
```

### 2. AWS (EC2 + RDS)

#### Prerequisites

- AWS account
- EC2 instance (t3.micro or larger)
- RDS PostgreSQL database

#### Steps

1. **SSH into EC2 instance:**

```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

2. **Install Node.js and dependencies:**

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs git
```

3. **Clone repository:**

```bash
git clone https://github.com/yourusername/cashly-backend.git
cd cashly-backend
```

4. **Install dependencies:**

```bash
npm install
```

5. **Configure environment:**

```bash
nano .env
```

Update with your RDS endpoint and secrets.

6. **Build and start:**

```bash
npm run build
npm start
```

Or use PM2 for process management:

```bash
npm install -g pm2
pm2 start dist/main.js --name "cashly-backend"
pm2 startup
pm2 save
```

### 3. Docker + Docker Compose (Any VPS)

#### Prerequisites

- Docker installed
- Docker Compose installed
- VPS or dedicated server

#### Steps

1. **SSH into your server:**

```bash
ssh root@your-server-ip
```

2. **Clone repository:**

```bash
git clone https://github.com/yourusername/cashly-backend.git
cd cashly-backend
```

3. **Create production environment file:**

```bash
cat > .env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://cashly_user:strong_password@postgres:5432/cashly_prod"
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
EOF
```

4. **Deploy with Docker Compose:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

5. **View logs:**

```bash
docker-compose logs -f app
```

### 4. Railway.app (No-config deployment)

#### Steps

1. **Connect GitHub repository to Railway**
2. **Create PostgreSQL plugin**
3. **Set environment variables** in Railway dashboard
4. **Deploy** (automatic on push to main)

### 5. DigitalOcean App Platform

#### Steps

1. **Connect GitHub repository to DigitalOcean App Platform**
2. **Select Node.js runtime**
3. **Add PostgreSQL database**
4. **Configure environment variables**
5. **Deploy**

## Production Checklist

- [ ] Database backups configured
- [ ] HTTPS/TLS enabled
- [ ] Environment variables set securely
- [ ] Database migrations run successfully
- [ ] Seed script executed (if needed)
- [ ] Monitoring and logging configured
- [ ] Error tracking (Sentry) installed
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Database connection pooling enabled
- [ ] Health check endpoint working
- [ ] Load balancer configured (if needed)
- [ ] SSL certificate installed
- [ ] Database user has minimal permissions
- [ ] Automatic deployments configured

## Environment Variables for Production

```env
# Core
NODE_ENV=production
PORT=3000

# Database (use strong password)
DATABASE_URL="postgresql://cashly_user:STRONG_PASSWORD@db-host:5432/cashly_prod"

# JWT (use openssl rand -base64 32 to generate)
JWT_SECRET=your_secure_32_char_random_string_here
JWT_REFRESH_SECRET=your_secure_32_char_random_string_here
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Monitoring
SENTRY_DSN=https://key@sentry.io/project-id

# CORS
CORS_ORIGIN=https://yourdomain.com

# Email (optional)
SENDGRID_API_KEY=your_sendgrid_key

# Analytics (optional)
ANALYTICS_KEY=your_analytics_key
```

## Database Backup Strategy

### Automated Backups

**AWS RDS:**

- Configure automated backups (7-30 days retention)
- Enable Multi-AZ for high availability

**DigitalOcean:**

- Enable automated backups in database settings
- Set 7-day backup retention

**Manual Backup Script:**

```bash
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/cashly_backup_$TIMESTAMP.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp "$BACKUP_FILE.gz" s3://your-bucket/backups/

# Keep only last 30 backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

Schedule with cron:

```bash
# Backup every night at 2 AM
0 2 * * * /home/user/backup.sh
```

## SSL/TLS Certificate Setup

### Let's Encrypt (Free)

**Using Certbot:**

```bash
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com
```

**Auto-renewal:**

```bash
sudo systemctl enable certbot-renew.timer
sudo systemctl start certbot-renew.timer
```

### Cloudflare (Easy)

1. Point domain to Cloudflare nameservers
2. Enable SSL/TLS in Cloudflare dashboard
3. Set to "Full" or "Full (Strict)"

## Monitoring & Logging

### Health Check Endpoint

The application includes a health check. Monitor it:

```bash
# Every 30 seconds
curl -f http://your-api.com/health || alert
```

### Sentry Integration

1. **Create account at sentry.io**
2. **Install Sentry:**

```bash
npm install @sentry/node @sentry/tracing
```

3. **Initialize in main.ts:**

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### CloudWatch (AWS)

Configure log groups to monitor:

- Error rates
- Response times
- Database connection issues
- CPU/Memory usage

### Logs

View logs based on deployment method:

**Heroku:**

```bash
heroku logs -t --app cashly-backend
```

**Docker:**

```bash
docker-compose logs -f app
```

**EC2 + PM2:**

```bash
pm2 logs
```

## Performance Optimization

### Database Connection Pooling

Already configured in Prisma with default settings. For high traffic, adjust:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // for migrations
}
```

Add to DATABASE_URL for connection pooling:

```
?schema=public&pool_mode=transaction&max_client_conn=25
```

### Caching with Redis

Install Redis:

```bash
npm install @nestjs/cache-manager cache-manager redis
```

### CDN for Static Assets

If serving static files, use Cloudflare or AWS CloudFront.

## Rollback Strategy

### Git-based Rollback

```bash
# View deployment history
git log --oneline -10

# Rollback to previous commit
git revert HEAD
git push
```

### Database Rollback

```bash
# View migration history
npx prisma migrate status

# Rollback migration
npx prisma migrate resolve --rolled-back "<migration-name>"
```

## Scaling

### Horizontal Scaling (Multiple Instances)

1. **Use load balancer (AWS ELB, nginx, etc.)**
2. **Database connection pooling (PgBouncer)**
3. **Session storage (Redis)**

### Vertical Scaling (Larger Instance)

1. Upgrade server resources
2. Increase database connection pool
3. Optimize queries with indexes

## Cost Optimization

| Service      | Tier        | Monthly Cost          |
| ------------ | ----------- | --------------------- |
| Heroku       | Hobby       | Free (limited)        |
| Heroku       | Standard    | $7-14                 |
| DigitalOcean | Droplet     | $4-60                 |
| AWS EC2      | t3.micro    | Free (1 year) then $7 |
| AWS RDS      | db.t3.micro | Free (1 year) then $9 |
| Railway.app  | Usage-based | $5-50                 |

**Tips:**

- Use free tier while developing
- Start with smallest instance size
- Scale up as traffic increases
- Use spot instances for non-critical workloads

## Disaster Recovery Plan

1. **Regular automated backups** (daily)
2. **Test backup restoration** (monthly)
3. **Document recovery procedures**
4. **Maintain secondary database replica**
5. **Multi-region deployment** (for critical apps)

## Post-Deployment

After deployment:

1. Test all API endpoints
2. Verify database connectivity
3. Check monitoring dashboards
4. Monitor error logs for 24 hours
5. Performance test under load
6. Document deployment details
7. Create runbook for common issues

## Troubleshooting Deployment

### App won't start

```bash
# Check logs
docker-compose logs app

# Verify environment variables
echo $DATABASE_URL

# Check database connection
psql $DATABASE_URL -c "SELECT 1"
```

### Database migration fails

```bash
# Check migration status
npx prisma migrate status

# Resolve stuck migration
npx prisma migrate resolve --rolled-back "migration-name"

# Reset database (WARNING: data loss)
npx prisma migrate reset
```

### High CPU/Memory usage

- Check query performance
- Add database indexes
- Implement caching
- Scale up instance
- Monitor for memory leaks

## Support Contacts

- **NestJS**: https://docs.nestjs.com
- **Prisma**: https://www.prisma.io/docs
- **PostgreSQL**: https://www.postgresql.org/docs
- **Node.js**: https://nodejs.org/docs
