# Golf Charity Subscription Platform

A modern, full-stack MVP web application built with **Next.js 15**, **Supabase**, and **Tailwind CSS**. Users subscribe, enter golf scores, pick a charity, and join draws for a chance to win prizes — all while giving back.

> **Due to time constraints, payment integration and advanced analytics were intentionally simplified to focus on core system architecture and logic.**

---

## Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | Next.js 15 (App Router) |
| Backend    | Next.js API Routes      |
| Database   | Supabase (PostgreSQL)   |
| Auth       | Supabase Auth           |
| Styling    | Tailwind CSS v4         |
| State      | React Hooks             |
| Deployment | Vercel-ready            |

---

## Features Implemented

### Authentication
- Email/password signup and login via Supabase Auth
- Protected routes via middleware (dashboard, admin)
- Auth state management via React Context

### Subscription System
- One-click subscribe (simplified — no real payment)
- Features gated behind active subscription
- Score entry blocked for non-subscribers (server-side + UI lock)

### Score System (Critical Business Logic)
- Users enter scores in range 1–45
- **Only latest 5 scores stored at any time**
- When adding a 6th score → oldest is automatically deleted
- Scores displayed in reverse chronological order (latest first)
- Server-side validation + subscription check

### Charity Selection
- Browse 6 seed charities with images and descriptions
- Select one charity per user (stored in DB)
- Selection persists across sessions

### Draw System
- Admin generates 5 unique random numbers (1–45)
- System compares draw numbers against ALL users' scores
- Match tiers: 3 matches = $50, 4 matches = $500, 5 matches = $10,000
- Winners stored in database with status tracking

### User Dashboard
- Subscription status card with activate button
- Score management with add form, ball display, max-5 indicator
- Charity selection dropdown
- Winnings history with match count and amounts
- Latest draw results with match highlighting

### Admin Panel
- Stats overview (total users, active subscribers, total winners)
- Trigger draw button with result display
- Recent draws with number balls
- Users table (ID, status, plan, score count)
- Winners table (user, matches, amount, status)

### UI/UX
- Modern dark theme with glassmorphism cards
- Gradient accents and smooth animations
- Toast notifications for all user actions
- Loading spinners and disabled states during actions
- Fully responsive (mobile, tablet, desktop)

---

## Setup

### 1. Install Dependencies

```bash
cd golf-charity
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **Anon Key** from Settings → API

### 3. Configure Environment

Edit `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Schema

1. Open Supabase Dashboard → **SQL Editor**
2. Paste contents of `supabase/schema.sql` and click **Run**
3. Creates all tables, RLS policies, and seeds 6 charities

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Routing

| Route        | Access       | Description              |
|--------------|--------------|--------------------------|
| `/`          | Public       | Landing page             |
| `/login`     | Public       | Login page               |
| `/signup`    | Public       | Signup page              |
| `/dashboard` | Auth required | User dashboard           |
| `/admin`     | Admin only   | Admin panel              |

---

## Admin Access

Admin is gated by email (`admin@golfcharity.com`):

1. Sign up with email `admin@golfcharity.com`
2. Log in — the "Admin" link appears in the navbar
3. Access `/admin` to manage draws and view users

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `subscriptions` | Tracks user subscription status and plan type |
| `scores` | Stores user scores (max 5 per user, enforced server-side) |
| `charities` | Charity list with name, description, image |
| `user_charity_selections` | One-per-user charity selection |
| `draws` | Draw records with 5 random numbers |
| `winners` | Match results with amounts and payment status |

All tables have **Row Level Security (RLS)** enabled.

---

## Assumptions

- No real payment integration — subscription is instant activation
- Admin access hardcoded to `admin@golfcharity.com` (not RBAC)
- Draw uses `Math.random()` not cryptographic RNG
- Scores range: 1–45 (matches draw number range)
- Prize structure: 3 matches = $50, 4 = $500, 5 = $10,000 (jackpot)
- No email confirmation required

---

## Deployment (Vercel)

1. Push to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy — zero configuration needed

---

## Project Structure

```
golf-charity/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── charities/
│   │   │   │   ├── route.ts           # List charities
│   │   │   │   └── select/route.ts    # User charity selection
│   │   │   ├── draws/route.ts         # Get/trigger draws
│   │   │   ├── scores/route.ts        # Get/add scores (max 5 enforced)
│   │   │   ├── subscriptions/route.ts # Manage subscription
│   │   │   ├── users/route.ts         # Admin: list users
│   │   │   └── winners/route.ts       # Get winners
│   │   ├── admin/page.tsx             # Admin panel
│   │   ├── dashboard/page.tsx         # User dashboard
│   │   ├── login/page.tsx             # Login
│   │   ├── signup/page.tsx            # Signup
│   │   ├── page.tsx                   # Landing page
│   │   ├── layout.tsx                 # Root layout + providers
│   │   └── globals.css                # Design system
│   ├── components/
│   │   ├── Navbar.tsx                 # Auth-aware navigation
│   │   └── Toast.tsx                  # Toast notification system
│   ├── context/
│   │   └── AuthContext.tsx            # Supabase Auth provider
│   ├── lib/supabase/
│   │   ├── client.ts                  # Browser Supabase client
│   │   └── server.ts                  # Server Supabase client
│   └── middleware.ts                  # Auth + route protection
├── supabase/
│   └── schema.sql                     # Full DB schema + seed data
├── .env.local                         # Environment variables
└── README.md
```
