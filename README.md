# Prodily — Reward & Recognition (Next.js app)

A full working recreation of the Prodily prototype, built with Next.js 16 (App Router), React, TypeScript and Tailwind CSS v4.

## What's included

**Employee app** (`/employee`) — mobile-frame simulation with real routes:
- `/employee` — home (points hero, streak check-in, stats, recent activity)
- `/employee/rewards` — marketplace with category filters
- `/employee/rewards/[id]` — reward detail + redeem
- `/employee/challenges` — team challenges with progress bars
- `/employee/feed` — kudos feed with likeable posts
- `/employee/profile` — badges + reward history

**Admin dashboard** (`/admin`) — desktop sidebar layout with real routes:
- `/admin` — analytics overview
- `/admin/budget` — org → department budget tree
- `/admin/rules` — reward rules with live toggle switches
- `/admin/approvals` — approval queue (approve/reject, updates live)
- `/admin/fraud` — fraud review (clear/block, updates live)

All interactive actions (check-in, redeem, approve/reject, toggle rules, like a post) show a toast notification, and check-in triggers a confetti celebration.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — it redirects to `/employee`. Use the switch in the top bar to jump to `/admin`.

## Notes

- Colors, type scale, and layout tokens are ported 1:1 from the original prototype's CSS custom properties into `src/app/globals.css` and Tailwind's `@theme`.
- Fonts (Bricolage Grotesque + Plus Jakarta Sans) load from Google Fonts at runtime via `<link>` tags in `src/app/layout.tsx`.
- All mock data lives in `src/lib/data.ts` — edit it to reflect real employees, rewards, rules, etc.
- State is client-side only (no backend/database yet) — refreshing resets approvals/rules/likes to their initial mock values.
