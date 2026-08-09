# Tapline

Landing page for Tapline — an NFC "review us on Google" card system sold to local businesses.

Static site. No build step, no dependencies: open `index.html` or serve the folder.

```bash
python3 -m http.server 4173
```

---

## Structure

```
index.html               markup
assets/css/style.css     the whole design system
assets/js/app.js         behaviour (no libraries)
assets/img/logo.svg      brand logo
assets/img/favicon.svg   favicon
```

---

## Design system

Three colours do everything.

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#F2F2F3` | the page |
| `--white` | `#FFFFFF` | every card |
| `--ink` | `#131313` | type, and the one inverted section |
| `--blue` | `#0447FF` | the single accent |

Colour roles are set by measurement, not preference:

- `blue on paper` — **5.85:1** → readable as type
- `white on blue` — **6.27:1** → readable on a blue fill
- `blue on ink` — **2.15:1** → **never** blue on the dark sections

Depth comes from elevation, not outlines. There is no 1px box anywhere; surfaces
are white cards lifted with two-part shadows (a tight contact shadow plus a wide
soft one). No monospace: every label is the body face in small caps.

Type: **Bricolage Grotesque** (display) + **Instrument Sans** (body).

### Motion

Durations live in tokens: press `140ms`, hover `240ms`, UI `300ms`, scroll-reveal
`700ms`. Custom easing curves only — the CSS built-ins are too weak to read as
intentional, and `ease-in` is deliberately absent because it delays the first
frame, the moment the eye is on the element.

Hover states are gated behind `@media (hover:hover) and (pointer:fine)`, since on
touch `:hover` latches after a tap and leaves cards stuck in a lifted state.

`prefers-reduced-motion` reduces rather than removes: loops and movement go,
opacity and colour transitions stay, because those carry meaning (open/closed,
validation) and killing them makes states snap confusingly.

### Accessibility

Verified in-browser, not assumed:

- 0 text/background pairs below WCAG AA
- 0 interactive targets under 44×44px
- no horizontal overflow at 375px
- the scroll-reveal is gated on a `.js` class set inline in `<head>`, so a script
  failure can never leave the page stuck at `opacity: 0`

---

## Before going live

1. **Checkout links.** `assets/js/app.js` opens with a `LINKS` object. Every value
   is empty; until one is filled its button says so out loud instead of silently
   doing nothing. Paste the real Shopify product URLs there.
2. **About photo.** `#about` has a placeholder slot — drop in a real photo, 800×1000.
3. **Instagram handle.** Still `@yourhandle`.
4. **Testimonials.** There are none, on purpose. The proof section says so plainly
   and offers the refund guarantee instead of borrowed screenshots. Replace it with
   real student results when they exist.
5. **Google branding.** The plaque depicts the product, which carries Google's logo.
   Using Google branding in marketing is governed by their brand permissions —
   check those before printing a run or launching ads.

Nothing on the page claims or implies an income figure. The margin calculator is
labelled as arithmetic, not a forecast, and the footer carries the disclaimer.
