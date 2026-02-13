# Unique Organizers

## Overview
E-commerce storefront for Unique Organizers, a premium product retailer based in Nairobi, Kenya. Built with Next.js 16, Prisma ORM with PostgreSQL, Firebase (Firestore for auth/products), and M-Pesa payment integration.

## Recent Changes
- 2026-02-13: Initial Replit setup — configured Next.js for port 5000, set up PostgreSQL database, Prisma with `@prisma/adapter-pg` for Prisma v7 compatibility

## Project Architecture
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: PostgreSQL via Prisma ORM (v7 with `@prisma/adapter-pg`)
- **Auth**: Firebase (Firestore-based user auth with JWT sessions)
- **Payments**: M-Pesa STK Push (Safaricom sandbox)
- **Styling**: Tailwind CSS v4
- **Image Hosting**: Cloudinary

## Project Structure
```
src/
  app/           - Next.js App Router pages and API routes
    admin/       - Admin dashboard, product management
    api/         - API endpoints (auth, checkout, mpesa, products)
    checkout/    - Checkout flow
    dashboard/   - User order dashboard
    login/       - Login page
    product/     - Product detail pages
    register/    - User registration
  components/    - Shared React components (CartDrawer, PaymentForm)
  context/       - React context providers (CartContext)
  lib/           - Shared utilities (auth, prisma, firebase, mpesa)
prisma/
  schema.prisma  - Database schema (Product, Order, OrderItem models)
```

## Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string (auto-provided by Replit)
- Firebase client config: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`
- Firebase admin: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- M-Pesa: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_UPLOAD_PRESET`
- `JWT_SECRET` - JWT signing secret
- `NEXT_PUBLIC_URL` - Public URL for callbacks

## User Preferences
- None documented yet
