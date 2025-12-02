# VetFlow 🐾

**Modern, cloud-based veterinary clinic management system for Australian vet practices**

> Save $3,600/year vs. ezyVet + Vetstoria while providing better online booking, automated reminders, and simplified practice management.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Project Status](#project-status)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

VetFlow is a comprehensive veterinary clinic management and online booking system designed specifically for small to medium-sized Australian veterinary practices (2-10 vets, 5-15 staff).

### Target Market
- **Primary:** Australian vet clinics
- **Secondary:** Pet grooming, daycare, and pet services

### Value Propositions
- 💰 **Save $3,600/year** vs. ezyVet + Vetstoria
- ⏱️ **80% reduction** in manual booking administration
- 📉 **70% reduction** in appointment no-shows
- 🚀 **Simple, beautiful, fast** interface
- 🇦🇺 **Australian data hosting** (compliance-ready)

---

## ✨ Key Features

### Phase 1: MVP (Current)
- ✅ **Online Booking System** - 24/7 appointment booking with Guest Upsell & Account Claiming
- ✅ **Admin Dashboard** - Manage appointments, check-ins, and daily schedules
- ✅ **Authentication** - Separate secure flows for Clinic Staff and Pet Owners
- ✅ **Staff Management** - Invite system with role-based access control (Admin, Vet, Nurse, Receptionist)
- ✅ **Billing & Invoicing** - Create invoices, process Stripe payments, and track revenue
- ✅ **Reporting & Analytics** - Interactive charts for revenue, appointment trends, and service popularity
- ✅ **Pet & Owner Records** - Comprehensive patient database with medical history
- ✅ **Calendar View** - Visual scheduling with drag-and-drop

### Phase 2: Enhanced (In Progress)
- 📱 Client Portal (Partial)
- 🔔 Advanced Notifications (SMS/Email)
- 📦 Inventory Management
- 🏥 Multi-Location Support

### Phase 3+: Advanced (Roadmap)
- 📱 Mobile Apps (iOS/Android)
- 📹 Telemedicine
- 🔗 Accounting Integrations (Xero/MYOB)

See [docs/ROADMAP.md](./docs/ROADMAP.md) for full feature roadmap.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS 3.4+
- **UI Components:** shadcn/ui (Radix UI)
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **State:** React Context + Zustand
- **Icons:** Lucide React

### Backend
- **Framework:** Next.js Server Actions
- **ORM:** Prisma 5+
- **Database:** PostgreSQL 15+ (Supabase)
- **Authentication:** NextAuth.js v5
- **File Storage:** Supabase Storage

### Integrations
- **Email:** Resend
- **SMS:** Twilio
- **Payments:** Stripe

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase (PostgreSQL)
- **Domain:** vetflow.dulain.dev
- **Monitoring:** Vercel Analytics + Sentry

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (LTS)
- npm 9+ (or pnpm 8+)
- PostgreSQL 15+ OR Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vetflow.git
   cd vetflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```env
   DATABASE_URL="your-database-url"
   NEXTAUTH_SECRET="generate-with-openssl"
   RESEND_API_KEY="your-resend-key"
   STRIPE_SECRET_KEY="your-stripe-secret"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-public"
   # ... see .env.example for full list
   ```

4. **Set up database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed  # Optional: seed demo data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

### Production Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for production deployment guide.

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Architecture](./docs/ARCHITECTURE.md)** - Technical architecture & design decisions
- **[Database Schema](./docs/DATABASE.md)** - Complete database schema with relationships
- **[API Reference](./docs/API.md)** - All API endpoints and usage
- **[Features](./docs/FEATURES.md)** - Detailed feature specifications
- **[Design System](./docs/DESIGN_SYSTEM.md)** - UI/UX guidelines and component library
- **[Integrations](./docs/INTEGRATIONS.md)** - Third-party service integrations
- **[Security](./docs/SECURITY.md)** - Security best practices & compliance
- **[Deployment](./docs/DEPLOYMENT.md)** - DevOps and deployment guide
- **[Testing](./docs/TESTING.md)** - Testing strategy and examples
- **[Roadmap](./docs/ROADMAP.md)** - Product roadmap and future plans

---

## 📊 Project Status

**Current Phase:** Phase 1 - MVP Development

**Progress:**
- [x] Project setup & documentation
- [ ] Database schema implementation
- [ ] Authentication system
- [ ] Online booking flow
- [ ] Admin dashboard
- [ ] Automated reminders
- [ ] Testing & QA
- [ ] Pilot launch

**Timeline:**
- **Week 1-2:** Core setup (database, auth, basic UI)
- **Week 3-4:** Booking system & calendar
- **Week 5:** Reminders & notifications
- **Week 6:** Polish, testing, pilot launch

See [task.md](.gemini/brain/task.md) for detailed task breakdown.

---

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run E2E tests
pnpm playwright test

# Run E2E tests with UI
pnpm playwright test --ui
```

See [docs/TESTING.md](./docs/TESTING.md) for testing strategy.

---

## 🔒 Security

VetFlow takes security seriously:

- 🔐 **Authentication:** NextAuth.js with JWT + database sessions
- 🔒 **Encryption:** TLS 1.3 in transit, AES-256 at rest
- 🛡️ **Authorization:** Role-based access control (RBAC)
- 📝 **Audit Logging:** All sensitive operations logged
- 🔍 **Compliance:** Australian Privacy Act, GDPR-ready
- 🚨 **Monitoring:** Sentry error tracking + uptime monitoring

See [docs/SECURITY.md](./docs/SECURITY.md) for security details.

---

## 🤝 Contributing

This is currently a private project. Contributions, issues, and feature requests will be welcomed once the project is open-sourced (planned for Phase 2).

---

## 📄 License

Proprietary - All rights reserved  
© 2025 VetFlow (Dulain)

---

## 💬 Support

**For Clinics:**
- 📧 Email: support@vetflow.dulain.dev
- 📞 Phone: Coming soon
- 💬 Chat: In-app support (planned)

**For Developers:**
- 📧 Email: dev@vetflow.dulain.dev
- 📚 Docs: See `/docs` directory

---

## 🎯 Goals

**Year 1:**
- 50 active clinics
- $45,000 ARR
- 99.9% uptime
- NPS > 50

**Year 2:**
- 200 active clinics
- $216,000 ARR
- Expand to New Zealand
- Launch mobile apps

**Year 3:**
- 500 active clinics
- $600,000 ARR
- Expand to UK
- Enterprise features

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Hosted on [Vercel](https://vercel.com/)
- Database by [Supabase](https://supabase.com/)

---

**Made with ❤️ for Australian vet clinics by Dulain**
# VetFlow
