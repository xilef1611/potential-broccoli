# ASKLEPI0S — Privacy-First Crypto E-Commerce

Full-stack e-commerce store with:
- **Next.js 14** frontend + API routes
- **PostgreSQL** database (self-hosted)
- **OxaPay** payment gateway (XMR, BTC, ETH, USDT, USDC)
- **Admin dashboard** with orders, products, analytics, support tickets
- **PDF pack list** printing
- **JWT authentication**
- Cyberpunk aesthetic, fully customizable

## Quick Start
See `DEPLOY.md` for full VPS deployment guide.

## Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── shop/                 # Product catalog
│   │   ├── checkout/             # Checkout page
│   │   ├── payment-success/      # Success page
│   │   ├── payment-failed/       # Failed page
│   │   ├── account/              # Login, register, orders
│   │   ├── support/              # Support tickets
│   │   ├── admin/                # Admin panel
│   │   └── api/                  # All API routes
│   ├── components/
│   │   ├── layout/Navbar.tsx
│   │   ├── shop/ProductCard.tsx
│   │   └── shop/Cart.tsx
│   ├── hooks/useCart.ts
│   └── lib/
│       ├── db.ts                 # PostgreSQL connection
│       ├── auth.ts               # JWT auth helpers
│       └── oxapay.ts             # OxaPay integration
├── scripts/migrate.js            # DB schema setup
└── .env.local.example            # Environment template
```
