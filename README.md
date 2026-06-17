# Unique Organizers

> Premium organizational products e-commerce platform built for Unique Organizers, a real business in Nairobi. A full-stack storefront with an admin panel, real-time order tracking, and WhatsApp-integrated checkout.

This is one of two projects I've built that's currently in active use by a real business. Unique Organizers lets customers browse, wishlist, and purchase home and office organizational products, with orders processed through WhatsApp rather than a traditional card checkout, which matches how Kenyan consumers are used to shopping online.

## What it does

- **Storefront.** Product catalog with category filtering, search, retail vs wholesale pricing that switches automatically at quantity thresholds, color and size variants, and a wishlist for logged-in customers.
- **WhatsApp checkout.** No accounts or card details required. The cart generates a formatted WhatsApp message so the customer completes their order the way they're already used to.
- **Order tracking.** Every order gets a unique tracking link so customers can follow delivery progress without contacting the business directly.
- **Admin panel.** Full product management (create, edit, delete, stock toggling), order logs with status updates, a live delivery tracking timeline, a marketing studio for rotating hero adverts with click and impression tracking, and review moderation.
- **Customer portal.** Order history, wishlist, and cart management, plus a direct WhatsApp support line.

## Problems it solves

- Manual order tracking through WhatsApp chat history is replaced with every order logged automatically in the admin dashboard.
- Customers get a real delivery tracking experience instead of repeatedly messaging to ask "where is my order."
- Retail and wholesale customers are served from the same storefront, with pricing switching automatically rather than needing two separate systems.
- Inventory, products, and marketing are all managed from one admin panel instead of scattered across tools.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server actions handle checkout, admin actions, and registration without a separate API layer |
| Database | PostgreSQL via Prisma ORM | A relational schema fit this better than a document store, since orders, products, and customers all reference each other |
| Auth | JWT (jose) + bcrypt | Custom auth so business logic around customer accounts and admin access could be controlled precisely |
| Images | Cloudinary | Handles product image hosting and optimization without storing files on the server |
| Payments | M-Pesa Daraja API | The real payment method customers in Kenya actually use |
| Styling | Tailwind CSS v4 | |
| Animation | Framer Motion | |
| Deployment | Vercel | |

## Project structure

```
src/
├── app/
│   ├── admin/          # Admin panel pages and server actions
│   ├── api/            # API routes
│   ├── product/        # Product detail pages, checkout, WhatsApp action
│   ├── dashboard/       # Customer portal
│   ├── track/          # Order tracking
│   └── actions.ts      # Core server actions
├── components/         # Reusable UI components
├── context/             # Cart context
└── lib/                 # Database and utility helpers
```

## Getting started

```bash
git clone https://github.com/<your-username>/unique-organizers.git
cd unique-organizers
npm install
npx prisma generate
npx prisma db push
npm run dev
```

App runs on [http://localhost:5000](http://localhost:5000).

### Required environment variables

```
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
```

## What I'd improve next

- **Automated testing.** This project handles real orders and real M-Pesa payments for a live business, so adding tests around checkout and payment flows would reduce risk as it grows.
- **Image upload validation.** Add file size and type checks on the Cloudinary upload flow in the admin panel.
- **Customer notifications.** Send an automated message when order status changes, instead of relying on customers checking the tracking link themselves.

## Business info

Unique Organizers
Sirikiwa Business Centre, Accra Road, Nairobi
+254 794213005

---

Built by Ruby Kituli
