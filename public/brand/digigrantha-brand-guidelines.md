# DigiGrantha Brand Guidelines

*Version 1. Built around the D-with-bookmark mark. Use this together with the asset files in digigrantha-brand-kit.zip.*

## 1. The idea behind the brand

**The name.** Digi means digital. Grantha is the Sanskrit word for a book or manuscript. DigiGrantha is a digital book: things written, designed and built with care.

**The mark.** A letter D whose inner space is a bookmark. A book held inside a letter. It sits on a mustard sticker badge, the same sticker style your website already uses.

**Tagline.** Where ideas become digital. (Your site currently says "Where idea become Digital", which has a grammar slip. Use the line above.)

**Personality.** Plain-spoken, honest, hands-on, a little playful. We show receipts, not adjectives. We are a small studio and say so.

## 2. The logo

| Part | What it is |
|---|---|
| Mark | The D with the bookmark on the mustard badge |
| Wordmark | "Digi" in upright type, "Grantha" in italic, then a mustard dot |
| Logo (lockup) | Mark and wordmark together. This is the main logo |

### Which file to use

| Situation | File |
|---|---|
| Website header, proposals, invoices, slides (light background) | digigrantha-logo.svg |
| Dark or teal background, website footer | digigrantha-logo-on-dark.svg |
| Stamps, embossing, one-colour print | digigrantha-logo-mono-ink.svg or digigrantha-logo-mono-cream.svg |
| Icon only, 24 px and larger | digigrantha-mark.svg |
| Favicon, browser tab, anything under 24 px | favicon.svg and favicon-32.png |
| iPhone home screen | apple-touch-icon-180.png |
| WhatsApp, LinkedIn, Instagram profile picture | social-avatar-400.png |

### Clear space and minimum size

- Keep one **x** of empty space on every side of the logo. x is the width of the bookmark, which is one quarter of the badge.
- Never show the full logo below 120 px wide on screen or 30 mm in print.
- Below 24 px, switch to the favicon mark. It drops the outline and shadow so it stays readable.

### Do not

- Stretch, rotate, outline, or add effects to the logo.
- Change the colours, or put the mustard badge on a mustard background.
- Move the bookmark, or swap it for another symbol.
- Put the full-colour logo on a busy photo. Use a one-colour version on a plain panel instead.
- Retype the wordmark in another font. The letters are drawn as shapes, so always use the files.

## 3. Colour

| Name | Hex | Used for | Share of a page |
|---|---|---|---|
| Cream | #FBF5E6 | Page background | about 55% |
| Teal | #0F5C52 | Brand colour, the D, headers, dark sections | about 25% |
| Ink | #1A1A1A | Text and outlines | about 10% |
| Mustard | #F2B33D | Accent, buttons, the badge | about 7% |
| Mint | #BFE3D6 | Soft panels and highlights | about 3% |

**Check these hex values against your website.** I took teal from your site's theme colour and estimated the others from a screenshot. If your site's CSS uses slightly different values, send them to me and I will rebuild every file to match.

### Which colour pairs are readable

| Pair (text on background) | Contrast | Use |
|---|---|---|
| Ink on cream | 16.0 | All body text |
| Cream on ink | 16.0 | Text on dark panels |
| Ink on mustard | 9.4 | Button labels |
| Cream on teal | 7.2 | Text on teal sections |
| Teal on cream | 7.2 | Headlines |
| Teal on mint | 5.7 | Labels on mint panels |
| Mustard on teal | 4.2 | Large text and icons only |
| Mustard on cream | 1.7 | Never use for text. Fills only |

A contrast of 4.5 or more is needed for normal text. Mustard on teal passes only for large text, so do not use it for small body copy.

## 4. Typography

| Role | Font | Notes |
|---|---|---|
| Headlines and wordmark | Fraunces, semibold 600, italic for emphasis | The wordmark is drawn from this font |
| Body text | IBM Plex Sans, 400 and 500 | Comfortable for long reading |
| Labels, tags, numbers | IBM Plex Mono, 400 | Small uppercase labels |

All three are free on Google Fonts. If your website already uses a different serif for headlines, tell me and I will redraw the wordmark to match it, so the site and logo agree.

**Scale (desktop):** headline 56 px, section title 36 px, subtitle 24 px, body 17 px, label 13 px. On phones, reduce headlines to 36 px.

## 5. The sticker style

This is the look that makes the site feel handmade. Keep it consistent.

- **3 px ink outline** on badges, buttons and cards.
- **5 px hard shadow** in ink, offset down and right. No blur.
- **18 px rounded corners** on badges and cards, fully round on small pills.
- **Tilt** badges by 2 to 3 degrees, at most one or two per screen.
- No gradients, no glow, no soft drop shadows.
- Icons: 2.5 px line, rounded ends, ink colour.

## 6. Setting it up on your website

Place the files in your site's public folder and add this inside the head tag:

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
<meta name="theme-color" content="#0F5C52">
```

Then replace the current logo in the header and footer with digigrantha-logo.svg and digigrantha-logo-on-dark.svg. Set the header logo height to about 40 px.

**Email signature:** use digigrantha-logo-1200.png displayed at 240 px wide. **Proposals and invoices:** place digigrantha-logo.svg at the top, about 48 mm wide.

## 7. Voice

| We say | We avoid |
|---|---|
| Here is exactly what you get, and what you do not | World-class, cutting-edge, end-to-end solutions |
| We are a small studio | We are a leading agency |
| We shipped X. Here it is. | We have extensive experience |
| No, that is not a fit. Here is who is better | Yes to everything |

**One rule above all: only real numbers.** If a number cannot be checked, do not print it. The honest line is a stronger selling point than a big one that someone can disprove.

## 8. Before you use it everywhere

1. Search IP India's trademark database, and your domain and social handles, for "DigiGrantha" to make sure the name and the D mark are free to use.
2. Replace the logo, favicon and social avatars on the website, LinkedIn, Instagram and WhatsApp Business.
3. Fix the tagline wording on the site.
4. Keep the original SVG files safe. Every other version, including the PNGs, comes from them.
