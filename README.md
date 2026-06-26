# itz_Secret Project — Portfolio

Full Stack Developer portfolio. Monochrome theme, WebGL background and motion.

**Stack:** Vite · Three.js (GLSL shader background) · GSAP (ScrollTrigger).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

## Features

- **WebGL background** — animated monochrome light pools (GLSL shader) reacting to the pointer.
- **Motion** — GSAP loader, hero reveal, scroll reveals, animated counters, magnetic buttons, 3D card tilt.
- **Animated nav** — a white pill slides between sections as you scroll.
- **i18n** — auto-detects the device language (Español / English / Français / العربية). Arabic switches to RTL. Manual switch in the nav, persisted in `localStorage`.
- **Dynamic age** — birthday 17 July; the age updates itself every year (no manual edits).
- **Fully responsive** — phone, tablet, laptop, iOS/Android. Mobile menu, touch-safe interactions, `svh` units.
- **SEO** — meta tags, Open Graph, Twitter cards, JSON-LD (`ProfessionalService`), `robots.txt`, `sitemap.xml`, hreflang.

## Security

- 100% **static site** — no backend, no database, **no SQL** → SQL injection is impossible.
- All dynamic text is set via `textContent` (never `innerHTML`) and there is no user input → no XSS surface.
- **Content-Security-Policy** restricts scripts to our own origin (blocks injected/3rd-party scripts).
- Server headers for deploy in `public/_headers` (Netlify/Cloudflare) and `vercel.json` (Vercel):
  HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- `npm audit --omit=dev` → **0 vulnerabilities** in shipped code (the only audit notes are build-time dev tools, never sent to the browser).

## Structure

```
portfolio/
├── index.html        # markup, content, SEO & security meta
├── vercel.json       # security headers (Vercel)
├── public/
│   ├── logo.png      # your logo (transparent), favicon
│   ├── _headers      # security headers (Netlify/Cloudflare)
│   ├── robots.txt
│   └── sitemap.xml
└── src/
    ├── style.css     # monochrome design system
    ├── three-bg.js   # WebGL shader background
    ├── i18n.js       # languages (es/en/fr/ar) + detection
    └── main.js       # GSAP animations & interactions
```

## Customise

- Text → `src/i18n.js` (per language). Email is `itzsecretproject@gmail.com`.
- Colors → `:root` in `src/style.css`.
- Set your real domain in `index.html` (`canonical`, OG/Twitter URLs), `robots.txt`, `sitemap.xml`.

Respects `prefers-reduced-motion`.
