# Blue Gems and Jewels — Website

A luxury, animated marketing site for **Blue Gems and Jewels**, a Mumbai-based fine
jewellery manufacturer serving independent retailers across India since 1996.
Built as a static multi-page site — no build step, no dependencies, no backend.

## Running it

Just open `index.html` in a browser. Every page links relatively (`css/`, `js/`,
`assets/`), so the whole folder can also be dropped onto any static host
(GitHub Pages, Netlify, S3, etc.) as-is.

## Structure

```
index.html            Home
about.html             Our story, timeline, founders, core values
manufacturing.html     The 9-stage manufacturing process
craftsmanship.html     Design philosophy, diamond setting, gold expertise
workforce.html         Karigars, production/quality teams, machinery
certifications.html    BIS Hallmark, GJEPC, Bharat Diamond Bourse
events.html             IIJS, Couture, GJS, JAS and other trade platforms
products.html          Rings, earrings, pendants, necklaces, bracelets, men's jewellery
contact.html            Locations, factory visit, enquiry form

css/style.css          Shared design system (colors, type, components, animation)
js/main.js              Shared nav/footer injection, scroll-reveal, counters, form demo
assets/logo.jpg         Brand logo used in the header
```

Every page pulls the same `css/style.css` and `js/main.js`, and `main.js` injects
the nav bar and footer into `<div id="site-nav">` / `<div id="site-footer">` so
navigation and branding stay consistent without duplicating markup per page.

## Design

- **Palette** — white, cream, and a soft light-blue base, with a light
  gold/yellow accent used sparingly (eyebrows, buttons, dividers, icons).
- **Type** — Playfair Display (headings) + Jost (body/UI).
- **Motion** — IntersectionObserver-driven scroll reveals, a parallax hero
  background, animated stat counters, and a step-timeline for the
  manufacturing process. All CSS/JS, no external animation libraries.

## Content source

Copy throughout the site is adapted from the brand's internal PDFs (company
overview, manufacturing capabilities, design craftsmanship, workforce &
machinery, certifications & affiliations, and past events) — condensed into
short, scannable sections rather than long-form paragraphs.
