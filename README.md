# StoryBook (Teampara) — From Scratch Setup Guide

This guide helps you create a **fresh GitHub repo** and a **new Next.js project** from zero, then configure and test all major features (Auth, AI generation, Payments, Webhook, Print/PDF, and WhatsApp).

> Note: I cannot directly create repositories inside your GitHub org from this environment. The steps below are exact click-by-click and command-by-command instructions to do it yourself.

---

## 0) Prerequisites (install first)

- Git
- Node.js 20+ (recommended via nvm)
- npm 10+
- VS Code (optional)
- GitHub account with access to `Teampara`
- Vercel account
- Supabase account
- Google Cloud OAuth credentials
- Gemini API key
- Razorpay test account
- Meta WhatsApp Cloud API test setup

### Verify tools

```bash
node -v
npm -v
git --version
```

---

## 1) Create new GitHub repo (Teampara / StoryBook)

1. Open: `https://github.com/organizations/Teampara/repositories/new`
2. Repository name: **`StoryBook`**
3. Visibility: **Private**
4. Check: **Add a README file**
5. Click **Create repository**

After creation, copy repo URL:

- HTTPS: `https://github.com/Teampara/StoryBook.git`

---

## 2) Create fresh local project (Next.js)

Choose a working folder and run:

```bash
mkdir -p ~/projects && cd ~/projects
npx create-next-app@latest StoryBook
```

Choose options:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **Yes**
- App Router: **Yes**
- Import alias: **Yes** (`@/*` default)

Then:

```bash
cd StoryBook
npm run dev
```

Open: `http://localhost:3000`

---

## 3) Connect local project to Teampara GitHub repo

If this is a brand-new local folder:

```bash
git init
git branch -M main
git remote add origin https://github.com/Teampara/StoryBook.git
git add .
git commit -m "Initialize fresh Next.js StoryBook app"
git push -u origin main
```

If a remote already exists, replace it:

```bash
git remote remove origin
git remote add origin https://github.com/Teampara/StoryBook.git
git push -u origin main
```

---

## 4) Configure Next.js subpath (`/storybook`)

Edit `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/storybook",
  assetPrefix: "/storybook",
};

export default nextConfig;
```

Restart dev server and open:

- `http://localhost:3000/storybook`

---

## 5) Vercel deployment setup

1. Login to Vercel
2. **Add New → Project**
3. Import `Teampara/StoryBook`
4. Framework: Next.js (auto)
5. Add environment variables (next section)
6. Deploy

After deploy, verify:
- App loads at `https://<your-domain>/storybook`

---

## 6) Environment variables template

Create `.env.local`:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000/storybook
NEXTAUTH_SECRET=replace_with_long_random_secret
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Gemini
GEMINI_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_TEMPLATE_NAME=storybook_ready
```

Add the same keys in Vercel project settings.

---

## 7) Build features (phase checklist)

Use this exact implementation order so testing is easy.

### Phase A — UI shell
- Landing page (`/storybook`)
- Navbar + Footer
- Hero with **Start Story** button → `/storybook/create`
- Mobile-first styles

### Phase B — Auth (NextAuth + Google)
- Install `next-auth`
- Add route: `src/app/api/auth/[...nextauth]/route.ts`
- Add session provider in layout
- Navbar sign-in / sign-out actions

### Phase C — Database (Supabase)
- Create `stories` table with fields:
  - `id`, `user_id`, `title`, `pages(jsonb)`, `visual_dna`, `seed`, `is_paid`, timestamps

### Phase D — AI generation
- Add route: `src/app/api/generate/route.ts`
- Prompt Gemini as children’s author
- Parse output into 10 pages
- Generate `visualDNA` + random 10-digit seed

### Phase E — Payments (Razorpay)
- Add route: `src/app/api/create-order/route.ts`
- Trigger checkout from create page
- Add webhook route: `src/app/api/webhook/razorpay/route.ts`
- On payment success, set `is_paid = true`

### Phase F — Delivery
- Print page route: `src/app/story/[id]/print/page.tsx`
- Add print CSS page breaks
- Add PDF generator (puppeteer-core + chromium package)
- Upload PDF to Supabase storage

### Phase G — WhatsApp message
- Route: `src/app/api/notify/whatsapp/route.ts`
- Send template message with download link

---

## 8) Testing checklist (run in this order)

### Local quality
```bash
npm install
npm run lint
npm run build
npm run dev
```

### Functional checks
1. Open `/storybook` landing page
2. Verify Sign In with Google
3. Fill `/storybook/create` wizard
4. Generate story (10 pages expected)
5. Run Razorpay test payment
6. Trigger webhook and verify `is_paid` in Supabase
7. Open print page and confirm page breaks
8. Generate PDF and verify upload URL
9. Send WhatsApp test template

---

## 9) Windows + WSL path tips (important)

- WSL path for `D:\Paraspect\...` is `/mnt/d/Paraspect/...`
- Do **not** use `/workspace/...` on your local machine unless that folder really exists there
- Always run `npm` in folder where `package.json` exists:

```bash
pwd
ls -la
find . -maxdepth 3 -name package.json
```

---

## 10) First release flow (recommended)

```bash
git checkout -b setup/fresh-storybook
git add .
git commit -m "Add fresh setup and testing guide for Teampara StoryBook"
git push -u origin setup/fresh-storybook
```

Then open PR to `main` and run full smoke tests on Vercel.

---

If you want, next step I can provide a **single “Day-1 implementation checklist”** with exact file-by-file code stubs so you can build all routes/components quickly in one pass.
