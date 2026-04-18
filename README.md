# Psyda Official Website

Official one-page website for [Psyda](https://psyda.org) — a data analytics company delivering insights through analytics, research, media, and philanthropy.

## Overview

A minimalist single-page scrolling website built with plain HTML, CSS, and JavaScript. No frameworks, no dependencies — just fast, clean, production-ready code.

## Sections

- **Hero** — Auto-transitioning slider (3s) showcasing Analytics, Research, and Media
- **Analytics** — Data preparation, human insights, neural classification, and psychometric models
- **Philanthropy** — Community impact and social responsibility work
- **Media** — Visual identity, podcasts, digital platforms, infographics, and interactive apps
- **Contact** — Email, phone, and location

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- Google Fonts: Cormorant Garamond, DM Sans, Inter
- `IntersectionObserver` for scroll animations and active nav tracking
- CSS Grid for two-column split layouts
- Responsive design (mobile-first breakpoints at 720px and 900px)

## Design

- Color palette: warm beige (`#F7F3EC`, `#EDE8DE`, `#E3DCCE`)
- Typography: Cormorant Garamond for display, DM Sans for UI, Inter for body
- Frosted-glass nav with scroll-triggered transitions
- Hero auto-slider with crossfade transitions
- Fade-up scroll animations on all content sections

## Local Development

```bash
cd "Psyda Website"
python3 -m http.server 3456
# Open http://localhost:3456
```

## Project Structure

```
├── index.html       # Main page
├── style.css        # All styles
├── main.js          # Nav, slider, scroll animations
└── images/          # Brand images and logo
```

## License

© 2026 Psyda.org — All Rights Reserved
