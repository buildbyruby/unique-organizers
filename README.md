# Unique Organizers — E-Commerce Platform

> Premium organizational products e-commerce platform built for Unique Organizers, Nairobi. A full-stack storefront with admin management, real-time order tracking, and WhatsApp-integrated checkout.

---

## What It Does

Unique Organizers is a modern e-commerce platform that lets customers browse, wishlist, and purchase premium home and office organizational products. Orders are processed via WhatsApp for a seamless, human-touch experience familiar to Kenyan consumers.

---

## Problems It Solves

- **No more manual order management** — every WhatsApp order is logged automatically in the admin dashboard
- **Real-time delivery tracking** — customers get a unique tracking link for every order
- **Dual pricing system** — retail and wholesale pricing built in, auto-switching at quantity thresholds
- **No tech barrier for customers** — checkout via WhatsApp means customers do not need accounts or card details
- **Centralized inventory** — admin manages all products, categories, images, and stock in one place
- **Marketing campaigns** — rotating hero adverts with impressions and click tracking

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT (jose) + bcrypt |
| Images | Cloudinary |
| Payments | M-Pesa Daraja API |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Deployment | Vercel |

---

## Key Features

### Storefront
- Product catalog with category and subcategory filtering
- Search across all products
- Retail vs wholesale pricing toggle
- Color and size variant selection
- Wishlist (requires login)
- Cart with localStorage persistence
- WhatsApp checkout with formatted order message
- Order tracking via unique link

### Admin Panel
- Product management (create, edit, delete, stock toggle)
- Order logs with status management
- Delivery tracking with live progress timeline
- Marketing studio — create and manage hero adverts
- Real-time analytics dashboard
- Client feedback and review moderation

### Customer Portal
- Order history with delivery status
- Wishlist management
- Cart management
- Direct WhatsApp support line

---

## Environment Variables

Create a .env.local file with the following:

DATABASE_URL=
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
NEXT_PUBLIC_URL=

---

## Getting Started

Install dependencies:
npm install

Generate Prisma client:
npx prisma generate

Push schema to database:
npx prisma db push

Run development server:
npm run dev

App runs on http://localhost:5000

---

## Project Structure

src/
├── app/
│   ├── admin/          # Admin panel pages and actions
│   ├── api/            # API routes
│   ├── product/        # Product detail pages
│   ├── dashboard/      # Customer portal
│   ├── track/          # Order tracking
│   └── actions.ts      # Core server actions
├── components/         # Reusable UI components
├── context/            # Cart context
└── lib/                # Database and utility helpers

---

## Business Info

Unique Organizers
Sirikiwa Business Centre, Accra Road, Nairobi
+254 794213005

---

Built with love for the Nairobi market
