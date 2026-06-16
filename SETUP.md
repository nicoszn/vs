# Invex — Landing Page Setup Guide

## What’s been built

- **`/`** — Full landing page: Hero with slot-machine jackpot counter, confetti bursts, ambient orbs, live crypto ticker bar, features section, live winners feed, final CTA
- **`/demo`** — Interactive demo dashboard: portfolio value tracker, multi-chain asset breakdown, live countdown game cards

-----

## File Placement

Copy each file into your existing Next.js project:

```
src/
  app/
    layout.tsx          → replace your existing layout
    page.tsx            → replace your existing page
    globals.css         → replace your existing globals.css
    demo/
      page.tsx          → new file
  components/
    landing/
      HeroSection.tsx
      ConfettiExplosion.tsx
      TickerBar.tsx
      FeaturesStrip.tsx
      WinnersFeed.tsx
      CTASection.tsx
```

-----

## Install required packages

```bash
npm install motion
```

That’s the only external dep. Everything else (confetti, animations, slot machine) is built from scratch using CSS keyframes and React state — **zero heavy bundles**.

If you want to add the `canvas-confetti` library later for more dramatic confetti effects:

```bash
npm install canvas-confetti
npm install -D @types/canvas-confetti
```

Then swap `ConfettiExplosion.tsx` for the canvas version.

-----

## Add Clash Display font (required for display headings)

In your `src/app/layout.tsx`, the Google Fonts loader already pulls `DM_Mono` and `Inter`. For **Clash Display**, it’s served by Fontshare (not Google Fonts). Add this `<link>` inside your `<head>` in `layout.tsx`:

```tsx
import type { Metadata } from "next";
import { DM_Mono, Inter } from "next/font/google";
import "./globals.css";

// Add this inside the <html> head in layout.tsx:
// <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet" />
```

**Option A — inline in layout.tsx (recommended for Next.js):**

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable}`}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Option B — self-host (production recommended):**

1. Download from <https://www.fontshare.com/fonts/clash-display>
1. Place `.woff2` files in `public/fonts/`
1. Use `@font-face` in `globals.css` (the stub is already in there)

-----

## Tailwind v4 note

The `globals.css` uses the Tailwind v4 CSS-first config (`@theme {}` block). Your `postcss.config.mjs` should be:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

If you’re still on v3, you’ll need to replace the `@theme {}` block with a `tailwind.config.js` extending the same tokens. Run the official v4 migration: `npx @tailwindcss/upgrade`.

-----

## Animation assets (optional upgrades)

To add Lottie animations (richer win sequences, spinning coins):

```bash
npm install @lottiefiles/react-lottie-player
```

Free crypto/gaming Lottie files: <https://lottiefiles.com/search?q=crypto>

To add GSAP for scroll-trigger effects on Features section:

```bash
npm install gsap
```

-----

## Structure overview

|Component          |What it does                                                                                    |
|-------------------|------------------------------------------------------------------------------------------------|
|`HeroSection`      |Full-screen hero with slot-machine jackpot, confetti, particle field, ambient orbs, crypto pills|
|`ConfettiExplosion`|Custom pure-CSS confetti burst (no external lib)                                                |
|`TickerBar`        |Infinite scrolling marquee of live crypto prices                                                |
|`FeaturesStrip`    |3-column scroll-reveal feature cards with hover accent borders                                  |
|`WinnersFeed`      |Auto-rotating live payout feed with slide-in animation                                          |
|`CTASection`       |Animated gradient-border CTA card                                                               |
|`demo/page.tsx`    |Full demo dashboard with portfolio breakdown + live game cards                                  |