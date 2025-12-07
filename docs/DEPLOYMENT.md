# 10. DEPLOYMENT & DEVOPS

## 10.1 Environment Setup

### **Development Environment**

**Prerequisites:**
- Node.js 18+ (LTS)
- pnpm 8+ (package manager)
- Git
- PostgreSQL 15+ (local) OR Supabase account

**Initial Setup:**
```bash
# Clone repository
git clone https://github.com/yourusername/vetflow.git
cd vetflow

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Set up database
pnpm prisma generate
pnpm prisma db push  # For development
# OR
pnpm prisma migrate dev  # For migrations

# Seed database (optional)
pnpm prisma db seed

# Start development server
pnpm dev
```

**Environment Variables (.env.local):**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vetflow"

# Supabase (Alternative to local PostgreSQL)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Resend (Email)
RESEND_API_KEY="re_xxxxxxxxxxxx"
FROM_EMAIL="noreply@vetflow.dulain.dev"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_PHONE_NUMBER="+61xxxxxxxxx"

# PayHere (Sri Lanka Pilot)
PAYHERE_MERCHANT_ID="your-merchant-id"
PAYHERE_MERCHANT_SECRET="your-payhere-secret"

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"

# Encryption (Generate with: openssl rand -hex 32)
ENCRYPTION_KEY="64-character-hex-string"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 10.2 Production Environment

### **Hosting: Vercel**

**Why Vercel:**
- Built for Next.js (zero-config deployment)
- Global CDN (Edge Network)
- Automatic HTTPS
- Preview deployments for PRs
- Serverless functions (API routes)
- Free tier generous (Hobby plan)

**Deployment Steps:**

1. **Connect GitHub Repository**
   ```bash
   # Push to GitHub
   git remote add origin https://github.com/yourusername/vetflow.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit https://vercel.com
   - Click "New Project"
   - Import GitHub repository
   - Configure environment variables (copy from .env.local)
   - Click "Deploy"

3. **Configure Custom Domain**
   - Go to Project Settings → Domains
   - Add `vetflow.dulain.dev`
   - Add DNS records (Vercel provides instructions)
   - Wait for SSL certificate (automatic)

**Vercel Configuration (vercel.json):**
```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["syd1"],
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/check-vaccinations",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

### **Database: Supabase**

**Why Supabase:**
- Managed PostgreSQL (no server management)
- Built-in authentication (optional, using NextAuth instead)
- Real-time subscriptions (future feature)
- Storage included
- Free tier: 500MB database, 1GB storage
- Australian region available (Sydney)

**Setup:**

1. **Create Project**
   - Visit https://supabase.com
   - Click "New Project"
   - Choose Sydney region
   - Note down database password

2. **Configure Database**
   - Copy connection string from Settings → Database
   - Add to Vercel environment variables

3. **Run Migrations**
   ```bash
   # From local machine, pointing to production DB
   DATABASE_URL="production-url" pnpm prisma migrate deploy
   ```

4. **Enable Connection Pooling**
   - Use Supabase connection pooler for serverless
   - Update DATABASE_URL to use pooler endpoint (port 6543)

---

## 10.3 CI/CD Pipeline

### **GitHub Actions**

**Workflow: Test & Deploy**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type check
        run: pnpm tsc --noEmit
      
      - name: Lint
        run: pnpm lint
      
      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Workflow: Database Migrations**

```yaml
# .github/workflows/migrate.yml
name: Database Migration

on:
  workflow_dispatch:  # Manual trigger

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run migrations
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## 10.4 Database Migrations

### **Prisma Migrate Workflow**

**Development:**
```bash
# Create new migration
pnpm prisma migrate dev --name add_vaccination_table

# This will:
# 1. Update database schema
# 2. Generate migration file in prisma/migrations/
# 3. Regenerate Prisma Client
```

**Production:**
```bash
# Deploy migrations (in CI/CD or manually)
pnpm prisma migrate deploy

# This will:
# 1. Apply pending migrations
# 2. NOT create new migrations (safe for production)
```

**Migration Files Structure:**
```
prisma/
├── schema.prisma
└── migrations/
    ├── 20250101000000_init/
    │   └── migration.sql
    ├── 20250115000000_add_vaccination_table/
    │   └── migration.sql
    └── migration_lock.toml
```

**Best Practices:**
- Always test migrations in staging first
- Never edit migration files manually
- Use `prisma migrate diff` to preview changes
- Backup database before major migrations
- Use transactions in migration SQL

**Rollback Strategy:**
```bash
# Prisma doesn't have built-in rollback
# Manual rollback:

# 1. Restore database from backup
# 2. Or write a down migration manually

# Example down migration for adding a column:
# If migration added "vaccination_table", drop it:
DROP TABLE IF EXISTS "Vaccination";
```

---

## 10.5 Monitoring & Alerting

### **Application Monitoring**

**Vercel Analytics:**
- Automatic setup (zero config)
- Real User Monitoring (RUM)
- Web Vitals (LCP, FID, CLS)
- Serverless function metrics

**Sentry Error Tracking:**
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Filter PII
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
```

**Custom Alerting:**
```typescript
// lib/monitoring.ts
export async function sendAlert(params: {
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
}) {
  // Send to Slack, Discord, or email
  await fetch("https://hooks.slack.com/services/YOUR/WEBHOOK/URL", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `[${params.severity.toUpperCase()}] ${params.title}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: params.message,
          },
        },
      ],
    }),
  });
}

// Usage: Alert on critical errors
try {
  await sendReminderEmail();
} catch (error) {
  await sendAlert({
    severity: "critical",
    title: "Reminder Email Failed",
    message: `Failed to send reminder: ${error.message}`,
  });
}
```

### **Uptime Monitoring**

**UptimeRobot Configuration:**
- Monitor: https://vetflow.dulain.dev (HTTP/HTTPS check every 5 min)
- Monitor: https://vetflow.dulain.dev/api/health (API health)
- Alert contacts: your email, SMS
- Public status page: https://status.vetflow.dulain.dev

**Health Check Endpoint:**
```typescript
// app/api/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    // Check external services
    const checks = {
      database: true,
      // Add more checks as needed
    };
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      checks,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error.message,
      },
      { status: 503 }
    );
  }
}
```

---

## 10.6 Scaling Strategy

### **Current Architecture (Phase 1)**
- Vercel serverless functions (auto-scaling)
- Supabase PostgreSQL (single instance)
- Target: 10-50 clinics, 1,000-5,000 appointments/day

### **Scaling Plan (Phase 2+)**

**Database Scaling:**
1. **Vertical Scaling:** Upgrade Supabase plan (more CPU, RAM)
2. **Connection Pooling:** Use PgBouncer (included in Supabase)
3. **Read Replicas:** For reporting queries
4. **Caching:** Redis for frequently accessed data

**Application Scaling:**
1. **Edge Functions:** Move to Vercel Edge Runtime for lower latency
2. **CDN Caching:** Cache static content aggressively
3. **Image Optimization:** Use Vercel Image Optimization

**Database Optimization:**
```sql
-- Add indexes for common queries
CREATE INDEX idx_appointments_date ON "Appointment" ("clinicId", "appointmentDate");
CREATE INDEX idx_pets_owner ON "Pet" ("ownerId");
CREATE INDEX idx_users_clinic_role ON "User" ("clinicId", "role");

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM "Appointment" WHERE "clinicId" = '...' AND "appointmentDate" > NOW();
```

**Caching Strategy (Future):**
```typescript
// lib/cache.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // Try cache first
  const cached = await redis.get(key);
  if (cached) return cached as T;
  
  // Cache miss, fetch and store
  const data = await fetcher();
  await redis.set(key, data, { ex: ttl });
  
  return data;
}

// Usage:
const appointments = await getCached(
  `appointments:${clinicId}:${date}`,
  () => prisma.appointment.findMany({ where: { clinicId, date } }),
  300 // 5 min cache
);
```

---

## 10.7 Backup & Disaster Recovery

### **Automated Backups**

**Database Backups:**
- Supabase: Daily automatic backups (7-day retention)
- Custom script: Weekly backup to S3 (long-term archival)

**Backup Script:**
```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y-%m-%d)
BACKUP_FILE="vetflow-backup-$DATE.sql"

# Dump database
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Upload to S3 (or storage provider)
aws s3 cp $BACKUP_FILE.gz s3://vetflow-backups/

# Clean up local file
rm $BACKUP_FILE.gz

# Delete backups older than 30 days
aws s3 ls s3://vetflow-backups/ | while read -r line; do
  createDate=$(echo $line | awk {'print $1" "$2'})
  olderThan=$(date -d "30 days ago" +%Y-%m-%d)
  if [[ "$createDate" < "$olderThan" ]]; then
    fileName=$(echo $line | awk {'print $4'})
    aws s3 rm s3://vetflow-backups/$fileName
  fi
done
```

**Schedule (cron):**
```
0 2 * * 0  /path/to/backup.sh  # Every Sunday at 2 AM
```

### **Disaster Recovery**

**Scenario 1: Database Corruption**
1. Identify last good backup
2. Restore from Supabase dashboard or S3
3. Verify data integrity
4. Resume operations

**Scenario 2: Vercel Outage**
1. Check Vercel status page
2. If prolonged: Deploy to backup hosting (Railway, Fly.io)
3. Update DNS to point to backup
4. Revert after Vercel recovery

**Scenario 3: Data Breach**
1. Immediately revoke compromised API keys
2. Analyze breach scope
3. Notify affected users (legal requirement)
4. Rotate all secrets
5. Conduct security audit

---

## 10.8 Deployment Checklist

**Pre-Launch:**
- [ ] All environment variables set in Vercel
- [ ] Database migrations applied
- [ ] Seed demo data (optional)
- [ ] Test email delivery (Resend)
- [ ] Test SMS delivery (Twilio)
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Sentry error tracking configured
- [ ] Uptime monitoring configured
- [ ] Backup script scheduled

**Post-Launch:**
- [ ] Monitor error logs (Sentry)
- [ ] Monitor uptime (UptimeRobot)
- [ ] Check performance (Vercel Analytics)
- [ ] Test user registration flow
- [ ] Test booking flow end-to-end
- [ ] Verify reminder emails/SMS sent
- [ ] Monitor database performance

**Weekly Maintenance:**
- [ ] Review error logs
- [ ] Check uptime stats
- [ ] Review database metrics
- [ ] Update dependencies (security patches)
- [ ] Verify backups successful
