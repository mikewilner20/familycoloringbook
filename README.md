# Family Coloring Book POD monorepo

This repo contains a Next.js app, background workers, and shared libraries for a photo-to-coloring-book print-on-demand service.

## Stack
- Next.js (App Router) + TypeScript
- Prisma + PostgreSQL
- BullMQ + Redis
- AWS S3 presigned uploads
- Stripe Checkout
- pdf-lib for interior PDF generation
- Sharp for placeholder line art conversion

## Quickstart
1. Install dependencies
   ```bash
   pnpm install
   ```
2. Start infrastructure
   ```bash
   docker compose up -d
   ```
3. Set environment variables (see `.env.example`).
4. Run Prisma migrations
   ```bash
   pnpm prisma:migrate
   ```
5. Generate the Prisma client (if not already)
   ```bash
   pnpm prisma:generate
   ```
6. Start the web app
   ```bash
   pnpm dev
   ```
7. Start workers in another terminal
   ```bash
   pnpm worker
   ```

## Scripts
- `pnpm dev` – start Next.js in dev mode.
- `pnpm worker` – run BullMQ workers for line art and PDF compilation.
- `pnpm prisma:migrate` – run Prisma migrations against Postgres.

## Environment
Copy `.env.example` to `.env` and fill in values:
```
DATABASE_URL=postgresql://family:family@localhost:5432/familycoloringbook
REDIS_URL=redis://localhost:6379
S3_BUCKET=your-bucket
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=dev
AWS_SECRET_ACCESS_KEY=dev
STRIPE_SECRET_KEY=sk_test_yourkey
STRIPE_WEBHOOK_SECRET=whsec_mock
APP_URL=http://localhost:3000
MOCK_PRINT_PROVIDER=true
```

## Workflow
1. Create a project from the dashboard.
2. Upload photos. Each upload requests a presigned URL, writes an Asset row, and enqueues a BullMQ job to convert the photo to a high-contrast PNG.
3. After line art is ready, enqueue a PDF compilation job to build the printable interior with pdf-lib and store it in S3.
4. Use Stripe Checkout to simulate payment; a mock print provider returns a shipped state and fake tracking number.

## Background workers
Workers live in `apps/worker` and register BullMQ processors:
- `generateLineArt` – fetch original asset from S3, convert to black/white outline-like PNG with Sharp, upload to S3, and mark the asset ready.
- `compilePdf` – gather line art pages, generate an interior PDF via pdf-lib, store in S3, and update the project record.

## Notes
- Authentication is stubbed: a demo user is created and stored in a cookie automatically.
- The image generation step is intentionally simple and not a production-grade edge detection pipeline.
