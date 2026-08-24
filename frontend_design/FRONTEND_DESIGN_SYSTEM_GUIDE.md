# 🏗️ FRONTEND DESIGN SYSTEM — ELITE ENGINEERING GUIDE
### From Beginner to FAANG-Grade Production Systems
> **IDE Instruction Manual** · Responsive · Accessible · Bug-Free · Beautiful

---

## 📋 TABLE OF CONTENTS

1. [IDE Configuration & Workflow Rules](#1-ide-configuration--workflow-rules)
2. [Project Architecture](#2-project-architecture)
3. [Design Tokens & Theming System](#3-design-tokens--theming-system)
4. [Typography System](#4-typography-system)
5. [Color System](#5-color-system)
6. [Spacing, Layout & Grid](#6-spacing-layout--grid)
7. [Responsive Design Rules](#7-responsive-design-rules)
8. [Component Design Principles](#8-component-design-principles)
9. [Animation & Motion](#9-animation--motion)
10. [Bug Prevention: Jitter, Timeout & Layout Errors](#10-bug-prevention-jitter-timeout--layout-errors)
11. [Accessibility (A11y)](#11-accessibility-a11y)
12. [Performance Optimization](#12-performance-optimization)
13. [Design Aesthetics — Anti-AI-Slop Rules](#13-design-aesthetics--anti-ai-slop-rules)
14. [System Design Patterns](#14-system-design-patterns)
15. [Production Checklist](#15-production-checklist)

---

## 1. IDE Configuration & Workflow Rules

> **Instruct your IDE**: Apply these rules globally to every file in this project.

### 1.1 — Universal Code Rules (All Files)
```
RULE: Always use semantic HTML5 elements (section, article, nav, main, aside, header, footer).
RULE: Never use <div> when a semantic element exists.
RULE: CSS class names follow BEM or utility-first (Tailwind). No camelCase class names.
RULE: No inline styles except for dynamic CSS custom properties via style attribute.
RULE: All interactive elements must have aria-label or visible text.
RULE: Every image must have a descriptive alt attribute.
RULE: Never use !important unless inside a utility override layer.
RULE: Use CSS custom properties (--variables) for all colors, spacing, and type scales.
RULE: All z-index values must use the z-index scale defined in tokens.
RULE: No magic numbers. Every hardcoded value must be referenced from the token system.
```

### 1.2 — File & Folder Conventions
```
src/
├── design-system/
│   ├── tokens.css          ← All CSS variables (colors, spacing, type, motion)
│   ├── reset.css           ← Modern CSS reset
│   ├── typography.css      ← Font faces, scale, line-heights
│   └── animations.css      ← Keyframes, transition utilities
├── components/
│   ├── [ComponentName]/
│   │   ├── index.tsx       ← Component logic
│   │   ├── styles.module.css
│   │   └── Component.test.tsx
├── layouts/
│   ├── AppShell.tsx
│   └── PageLayout.tsx
├── hooks/
│   ├── useMediaQuery.ts
│   ├── useDebounce.ts
│   └── useResizeObserver.ts
├── utils/
│   ├── cn.ts               ← className utility (clsx + twMerge)
│   └── accessibility.ts
└── pages/ (or app/ for Next.js)
```

### 1.3 — IDE Auto-Format Rules
```json
// .editorconfig
root = true
[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

---

## 2. Project Architecture

### 2.1 — Layered CSS Architecture (ITCSS)
```css
/* Import order matters — never break this cascade */

@import 'design-system/tokens.css';       /* Layer 1: Settings */
@import 'design-system/reset.css';        /* Layer 2: Tools/Reset */
@import 'design-system/typography.css';   /* Layer 3: Base */
@import 'design-system/animations.css';   /* Layer 4: Generic */
/* Component styles are scoped via CSS Modules or Tailwind */
```

### 2.2 — CSS Layers (Modern Standard)
```css
@layer reset, base, tokens, components, utilities, overrides;

@layer reset {
  /* Modern reset goes here */
}

@layer tokens {
  :root {
    /* All design tokens */
  }
}
```

### 2.3 — Modern CSS Reset (Copy Verbatim)
```css
/* design-system/reset.css */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  /* Prevent font-size inflation on mobile */
  -moz-text-size-adjust: none;
  -webkit-text-size-adjust: none;
  text-size-adjust: none;
  /* Smooth scrolling — disable for users who prefer reduced motion */
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

body {
  min-height: 100dvh;
  line-height: var(--leading-normal);
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

/* Remove default list styles when lists have role */
ul[role='list'],
ol[role='list'] {
  list-style: none;
}

/* Focus styles: never remove, only restyle */
:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}
```

---

## 3. Design Tokens & Theming System

> **IDE Rule**: Every visual value MUST come from this token file. No exceptions.

```css
/* design-system/tokens.css */

:root {

  /* ─────────────────────────────────────────
     SPACING SCALE — 4px base unit
  ───────────────────────────────────────── */
  --space-px:  1px;
  --space-0:   0;
  --space-1:   0.25rem;   /* 4px  */
  --space-2:   0.5rem;    /* 8px  */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-8:   2rem;      /* 32px */
  --space-10:  2.5rem;    /* 40px */
  --space-12:  3rem;      /* 48px */
  --space-16:  4rem;      /* 64px */
  --space-20:  5rem;      /* 80px */
  --space-24:  6rem;      /* 96px */
  --space-32:  8rem;      /* 128px */

  /* ─────────────────────────────────────────
     TYPOGRAPHY SCALE — Major Third (1.25)
  ───────────────────────────────────────── */
  --text-xs:   0.64rem;   /* 10px  */
  --text-sm:   0.8rem;    /* 12.8px */
  --text-base: 1rem;      /* 16px  */
  --text-lg:   1.25rem;   /* 20px  */
  --text-xl:   1.563rem;  /* 25px  */
  --text-2xl:  1.953rem;  /* 31px  */
  --text-3xl:  2.441rem;  /* 39px  */
  --text-4xl:  3.052rem;  /* 48px  */
  --text-5xl:  3.815rem;  /* 61px  */
  --text-6xl:  4.768rem;  /* 76px  */

  --font-display: 'Playfair Display', 'DM Serif Display', Georgia, serif;
  --font-body:    'DM Sans', 'Instrument Sans', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-accent:  'Cormorant Garamond', 'Libre Baskerville', serif;

  --font-thin:       100;
  --font-light:      300;
  --font-normal:     400;
  --font-medium:     500;
  --font-semibold:   600;
  --font-bold:       700;
  --font-extrabold:  800;
  --font-black:      900;

  --leading-none:    1;
  --leading-tight:   1.2;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;
  --leading-loose:   2;

  --tracking-tighter: -0.05em;
  --tracking-tight:   -0.025em;
  --tracking-normal:  0em;
  --tracking-wide:    0.025em;
  --tracking-wider:   0.05em;
  --tracking-widest:  0.1em;

  /* ─────────────────────────────────────────
     BORDER RADIUS
  ───────────────────────────────────────── */
  --radius-none:  0;
  --radius-sm:    0.25rem;   /* 4px  */
  --radius-md:    0.5rem;    /* 8px  */
  --radius-lg:    0.75rem;   /* 12px */
  --radius-xl:    1rem;      /* 16px */
  --radius-2xl:   1.5rem;    /* 24px */
  --radius-3xl:   2rem;      /* 32px */
  --radius-full:  9999px;

  /* ─────────────────────────────────────────
     SHADOWS
  ───────────────────────────────────────── */
  --shadow-sm:   0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.1),
                 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.1),
                 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl:   0 20px 25px -5px rgb(0 0 0 / 0.1),
                 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl:  0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  --shadow-glow:  0 0 20px rgb(var(--color-accent-rgb) / 0.35);

  /* ─────────────────────────────────────────
     Z-INDEX SCALE
  ───────────────────────────────────────── */
  --z-base:      0;
  --z-raised:    10;
  --z-dropdown:  100;
  --z-sticky:    200;
  --z-overlay:   300;
  --z-modal:     400;
  --z-popover:   500;
  --z-toast:     600;
  --z-tooltip:   700;
  --z-max:       9999;

  /* ─────────────────────────────────────────
     MOTION / ANIMATION
  ───────────────────────────────────────── */
  --duration-instant:  50ms;
  --duration-fast:     100ms;
  --duration-normal:   200ms;
  --duration-slow:     350ms;
  --duration-slower:   500ms;
  --duration-glacial:  1000ms;

  --ease-linear:      linear;
  --ease-in:          cubic-bezier(0.4, 0, 1, 1);
  --ease-out:         cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out:      cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:      cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-bounce:      cubic-bezier(0.68, -0.55, 0.27, 1.55);
  --ease-smooth:      cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* ─────────────────────────────────────────
     BREAKPOINTS (use in JS/media queries)
  ───────────────────────────────────────── */
  /* xs: 0–479px | sm: 480–767px | md: 768–1023px
     lg: 1024–1279px | xl: 1280–1535px | 2xl: 1536px+ */

  /* ─────────────────────────────────────────
     LAYOUT
  ───────────────────────────────────────── */
  --container-xs:    480px;
  --container-sm:    640px;
  --container-md:    768px;
  --container-lg:    1024px;
  --container-xl:    1280px;
  --container-2xl:   1536px;
  --container-prose: 65ch;

  --header-height:   4rem;   /* 64px */
  --sidebar-width:   16rem;  /* 256px */

}
```

---

## 4. Typography System

### 4.1 — Font Loading (Performance-Safe)
```html
<!-- In <head> — preconnect before preload -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- Use display=swap to prevent FOIT (Flash of Invisible Text) -->
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```

### 4.2 — Fluid Typography (No Media Query Needed)
```css
/* Fluid type: scales smoothly from mobile (320px) to desktop (1440px) */
/* Formula: clamp(MIN, PREFERRED, MAX) */

:root {
  --text-fluid-sm:   clamp(0.8rem,   0.73rem + 0.33vw,  1rem);
  --text-fluid-base: clamp(1rem,     0.9rem  + 0.45vw,  1.25rem);
  --text-fluid-lg:   clamp(1.25rem,  1.1rem  + 0.67vw,  1.563rem);
  --text-fluid-xl:   clamp(1.5rem,   1.25rem + 1.11vw,  2rem);
  --text-fluid-2xl:  clamp(1.75rem,  1.4rem  + 1.56vw,  2.5rem);
  --text-fluid-3xl:  clamp(2rem,     1.5rem  + 2.22vw,  3.5rem);
  --text-fluid-hero: clamp(2.5rem,   1.5rem  + 4.44vw,  5rem);
}

/* Usage */
h1 { font-size: var(--text-fluid-hero); }
h2 { font-size: var(--text-fluid-3xl); }
h3 { font-size: var(--text-fluid-2xl); }
p  { font-size: var(--text-fluid-base); }
```

### 4.3 — Typographic Composition Rules
```css
/* Readable measure — never exceed ~75 characters per line */
.prose {
  max-width: var(--container-prose);
  font-size: var(--text-fluid-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
}

/* Headings: tight tracking, shorter leading */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

/* Display: massive, atmospheric headings */
.display {
  font-size: var(--text-fluid-hero);
  font-weight: var(--font-black);
  letter-spacing: var(--tracking-tighter);
  line-height: 1;
}

/* Labels / overlines */
.label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}
```

---

## 5. Color System

### 5.1 — Semantic Color Tokens (Light + Dark)
```css
/* Light theme (default) */
:root {
  /* Primitives */
  --palette-neutral-50:  #fafafa;
  --palette-neutral-100: #f4f4f5;
  --palette-neutral-200: #e4e4e7;
  --palette-neutral-300: #d1d1d6;
  --palette-neutral-400: #a1a1aa;
  --palette-neutral-500: #71717a;
  --palette-neutral-600: #52525b;
  --palette-neutral-700: #3f3f46;
  --palette-neutral-800: #27272a;
  --palette-neutral-900: #18181b;
  --palette-neutral-950: #09090b;

  /* Semantic aliases — ALWAYS use these in components */
  --color-bg:              var(--palette-neutral-50);
  --color-bg-elevated:     #ffffff;
  --color-bg-subtle:       var(--palette-neutral-100);
  --color-bg-muted:        var(--palette-neutral-200);

  --color-text:            var(--palette-neutral-900);
  --color-text-secondary:  var(--palette-neutral-600);
  --color-text-muted:      var(--palette-neutral-400);
  --color-text-inverse:    #ffffff;

  --color-border:          var(--palette-neutral-200);
  --color-border-strong:   var(--palette-neutral-300);

  /* Accent — customize per project */
  --color-accent:          #2563eb;
  --color-accent-rgb:      37 99 235;
  --color-accent-hover:    #1d4ed8;
  --color-accent-subtle:   #eff6ff;
  --color-accent-text:     #1e40af;

  /* Semantic states */
  --color-success:         #16a34a;
  --color-success-bg:      #f0fdf4;
  --color-warning:         #d97706;
  --color-warning-bg:      #fffbeb;
  --color-error:           #dc2626;
  --color-error-bg:        #fef2f2;
  --color-info:            #0891b2;
  --color-info-bg:         #f0f9ff;

  --color-focus-ring:      var(--color-accent);
}

/* Dark theme */
[data-theme="dark"],
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg:              var(--palette-neutral-950);
    --color-bg-elevated:     var(--palette-neutral-900);
    --color-bg-subtle:       var(--palette-neutral-800);
    --color-bg-muted:        var(--palette-neutral-700);

    --color-text:            var(--palette-neutral-50);
    --color-text-secondary:  var(--palette-neutral-400);
    --color-text-muted:      var(--palette-neutral-600);

    --color-border:          var(--palette-neutral-800);
    --color-border-strong:   var(--palette-neutral-700);

    --color-accent:          #60a5fa;
    --color-accent-rgb:      96 165 250;
    --color-accent-hover:    #93c5fd;
    --color-accent-subtle:   rgba(96, 165, 250, 0.1);
  }
}
```

### 5.2 — Color Usage Rules
```
RULE: Never use raw hex values in components. Always reference semantic tokens.
RULE: Minimum contrast ratio — 4.5:1 for body text, 3:1 for large text (WCAG AA).
RULE: Never rely on color alone to communicate state (add icon or text).
RULE: Accent colors should appear in < 10% of the visual surface area.
```

---

## 6. Spacing, Layout & Grid

### 6.1 — Consistent Spacing Pattern
```css
/* RULE: Use multiples of 4px. Never arbitrary values. */

/* Component internal spacing: sm/md/lg padding variants */
.card--sm { padding: var(--space-3) var(--space-4); }
.card--md { padding: var(--space-5) var(--space-6); }
.card--lg { padding: var(--space-8) var(--space-10); }

/* Section spacing: generous vertical rhythm */
.section {
  padding-block: clamp(var(--space-16), 10vw, var(--space-32));
}
```

### 6.2 — Container System
```css
.container {
  width: 100%;
  max-width: var(--container-xl);
  margin-inline: auto;
  padding-inline: clamp(var(--space-4), 5vw, var(--space-12));
}

.container--narrow  { max-width: var(--container-md); }
.container--wide    { max-width: var(--container-2xl); }
.container--prose   { max-width: var(--container-prose); }
```

### 6.3 — Flexible Grid
```css
/* Auto-responsive grid: no media queries needed */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: var(--space-6);
}

/* Fixed column grids with responsive stacking */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}

/* Stack below tablet */
@media (width < 768px) {
  .grid-2, .grid-3, .grid-4 {
    grid-template-columns: 1fr;
  }
}

/* Named template areas — dashboard layout */
.dashboard-layout {
  display: grid;
  grid-template-areas:
    'sidebar header'
    'sidebar main'
    'sidebar footer';
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: var(--header-height) 1fr auto;
  min-height: 100dvh;
}

@media (width < 1024px) {
  .dashboard-layout {
    grid-template-areas:
      'header'
      'main'
      'footer';
    grid-template-columns: 1fr;
    grid-template-rows: var(--header-height) 1fr auto;
  }
}
```

### 6.4 — Flexbox Utilities
```css
.flex         { display: flex; }
.flex-col     { flex-direction: column; }
.flex-wrap    { flex-wrap: wrap; }
.items-center { align-items: center; }
.items-start  { align-items: flex-start; }
.justify-between { justify-content: space-between; }
.justify-center  { justify-content: center; }
.gap-2  { gap: var(--space-2); }
.gap-4  { gap: var(--space-4); }
.gap-6  { gap: var(--space-6); }
.gap-8  { gap: var(--space-8); }
```

---

## 7. Responsive Design Rules

### 7.1 — Breakpoint Strategy
```css
/* Mobile-first: start small, add complexity upward */

/* 📱 Mobile: default styles (0–767px) */
.component { font-size: var(--text-sm); }

/* 📱 Large Mobile / Tablet Portrait (480px+) */
@media (width >= 480px) { }

/* 💻 Tablet Landscape / Desktop (768px+) */
@media (width >= 768px) {
  .component { font-size: var(--text-base); }
}

/* 🖥 Desktop (1024px+) */
@media (width >= 1024px) { }

/* 🖥 Large Desktop (1280px+) */
@media (width >= 1280px) { }

/* 📺 Ultra-Wide (1536px+) */
@media (width >= 1536px) { }
```

### 7.2 — Device-Specific Fixes
```css
/* Touch targets: minimum 44×44px (Apple HIG), 48×48px (Material) */
button, [role="button"], a, input, select, textarea {
  min-height: 44px;
  min-width: 44px;
}

/* Prevent iOS zoom on input focus */
input, select, textarea {
  font-size: max(16px, var(--text-base));
}

/* Safe area for notched/dynamic island phones */
.app-shell {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Remove hover states on touch devices (prevents sticky :hover) */
@media (hover: none) {
  .button:hover { background: unset; }
}

/* Pointer-aware interactions */
@media (pointer: coarse) {
  /* Enlarge hit areas on touch screens */
  .interactive { padding: var(--space-3); }
}
```

### 7.3 — Viewport Units (Modern)
```css
/* Use dvh/svh/lvh instead of vh to handle mobile browser bars */
.hero         { min-height: 100dvh; }  /* Dynamic viewport height */
.sticky-panel { height: 100svh; }      /* Small viewport height */
.full-page    { min-height: 100lvh; }  /* Large viewport height */
```

---

## 8. Component Design Principles

### 8.1 — Button System
```css
/* Base button — never style raw <button> globally */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border: 1.5px solid transparent;
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  line-height: 1;
  letter-spacing: var(--tracking-wide);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  text-decoration: none;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color     var(--duration-fast) var(--ease-out),
    color            var(--duration-fast) var(--ease-out),
    box-shadow       var(--duration-fast) var(--ease-out),
    transform        var(--duration-fast) var(--ease-spring);

  /* Prevent layout shift on press */
  will-change: transform;
}

.btn:active  { transform: scale(0.97); }
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* Variants */
.btn--primary {
  background: var(--color-accent);
  color: var(--color-text-inverse);
}
.btn--primary:hover {
  background: var(--color-accent-hover);
  box-shadow: var(--shadow-md);
}

.btn--ghost {
  background: transparent;
  border-color: var(--color-border-strong);
  color: var(--color-text);
}
.btn--ghost:hover {
  background: var(--color-bg-subtle);
}

/* Sizes */
.btn--sm { padding: var(--space-2) var(--space-4); font-size: var(--text-xs); }
.btn--lg { padding: var(--space-4) var(--space-8); font-size: var(--text-base); }
.btn--xl { padding: var(--space-5) var(--space-10); font-size: var(--text-lg); }
```

### 8.2 — Card System
```css
.card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition:
    box-shadow  var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out),
    transform   var(--duration-normal) var(--ease-smooth);
}

.card--interactive:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-strong);
  transform: translateY(-2px);
}

/* RULE: translateY(-2px) on hover, not scale() — avoids blurring text */
```

### 8.3 — Form System
```css
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text);
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1.5px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  color: var(--color-text);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow   var(--duration-fast) var(--ease-out);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgb(var(--color-accent-rgb) / 0.2);
}

.form-input:invalid:not(:placeholder-shown) {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgb(var(--color-error) / 0.15);
}

.form-error {
  font-size: var(--text-xs);
  color: var(--color-error);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

---

## 9. Animation & Motion

### 9.1 — Keyframe Library
```css
/* design-system/animations.css */

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* Utility classes */
.animate-fade-in  { animation: fadeIn  var(--duration-normal) var(--ease-out) both; }
.animate-fade-up  { animation: fadeUp  var(--duration-slow)   var(--ease-out) both; }
.animate-scale-in { animation: scaleIn var(--duration-normal) var(--ease-spring) both; }
.animate-spin     { animation: spin    1s linear infinite; }
.animate-pulse    { animation: pulse   2s ease-in-out infinite; }

/* Stagger helper: apply to children via CSS counter */
.stagger > * {
  animation: fadeUp var(--duration-slow) var(--ease-out) both;
}
.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 75ms; }
.stagger > *:nth-child(3) { animation-delay: 150ms; }
.stagger > *:nth-child(4) { animation-delay: 225ms; }
.stagger > *:nth-child(5) { animation-delay: 300ms; }
```

### 9.2 — Scroll-Triggered Animations (Intersection Observer)
```typescript
// hooks/useScrollReveal.ts
import { useEffect, useRef } from 'react';

export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target); // fire once only
          }
        });
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
```

```css
/* Pair with useScrollReveal */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity   var(--duration-slow)   var(--ease-out),
    transform var(--duration-slower) var(--ease-out);
}

.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 10. Bug Prevention: Jitter, Timeout & Layout Errors

> This section is the most critical for production quality. Memorize these patterns.

### 10.1 — JITTER PREVENTION

**Root cause**: layout thrashing, incorrect `will-change`, repaints during animation.

```css
/* ✅ Only animate compositor-friendly properties */
/* SAFE: opacity, transform (translate, scale, rotate) */
/* AVOID: width, height, top, left, margin, padding during animation */

/* ❌ WRONG — causes layout thrash */
.bad { transition: width 0.3s, height 0.3s, top 0.3s; }

/* ✅ CORRECT — compositor only */
.good { transition: transform 0.3s var(--ease-out), opacity 0.3s; }

/* Promote to GPU layer ONLY for actively animated elements */
/* Do NOT add will-change to everything — it consumes GPU memory */
.animating {
  will-change: transform, opacity;
}
/* Remove after animation ends */
.animating.done {
  will-change: auto;
}

/* Prevent text blur on scale/translate animations */
.animated-text {
  transform: translateZ(0);         /* Force GPU layer */
  backface-visibility: hidden;      /* Prevent sub-pixel flickering */
  -webkit-font-smoothing: subpixel-antialiased;
}

/* Prevent CLS (Cumulative Layout Shift) — reserve space for images */
.img-wrapper {
  aspect-ratio: 16 / 9;  /* or 1 / 1, etc */
  overflow: hidden;
}
.img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Prevent scrollbar appearing/disappearing causing jitter */
html {
  overflow-y: scroll; /* Always show scrollbar track */
  /* Or modern equivalent: */
  scrollbar-gutter: stable;
}
```

### 10.2 — LAYOUT SHIFT PREVENTION

```css
/* Reserve space for dynamic content */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-muted) 25%,
    var(--color-bg-subtle) 50%,
    var(--color-bg-muted) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

/* Fixed-height containers for dynamic text */
.stat-value {
  min-height: 1lh; /* Prevents height change when value loads */
}

/* Font loading: prevent layout shift from font swap */
/* Use font-display: optional for LCP fonts */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: optional; /* Best CLS score */
  font-weight: 400;
}
```

### 10.3 — TIMEOUT & ASYNC ERROR PREVENTION

```typescript
// utils/fetchWithTimeout.ts

export async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}

// Retry with exponential backoff
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchWithTimeout<T>(url, options);
    } catch (error) {
      if (attempt === retries) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}
```

### 10.4 — REACT PERFORMANCE & BUG PATTERNS

```typescript
// ❌ WRONG: Creates new function reference every render → child rerenders
function Parent() {
  return <Child onClick={() => handleClick()} />;
}

// ✅ CORRECT: Stable reference with useCallback
function Parent() {
  const handleClick = useCallback(() => { /* ... */ }, []);
  return <Child onClick={handleClick} />;
}

// ❌ WRONG: useEffect cleanup missing → memory leak
useEffect(() => {
  const interval = setInterval(tick, 1000);
}, []);

// ✅ CORRECT: Always clean up
useEffect(() => {
  const interval = setInterval(tick, 1000);
  return () => clearInterval(interval);
}, []);

// ❌ WRONG: Synchronous expensive computation on every render
function Component({ items }) {
  const sorted = items.sort((a, b) => b.date - a.date); // runs every render!
  return <List items={sorted} />;
}

// ✅ CORRECT: Memoize expensive computations
function Component({ items }) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => b.date - a.date),
    [items]
  );
  return <List items={sorted} />;
}

// ❌ WRONG: key={index} causes wrong animations/state on reorder
items.map((item, i) => <Card key={i} {...item} />)

// ✅ CORRECT: Stable unique key
items.map(item => <Card key={item.id} {...item} />)
```

### 10.5 — SYNTACTICAL ERROR PREVENTION CHECKLIST

```typescript
// TypeScript strict mode — add to tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}

// Guard all optional chaining
// ❌ item.user.name   → TypeError if user is undefined
// ✅ item.user?.name  → undefined safely

// Nullish coalescing over OR for defaults
// ❌ value || 'default'  → treats 0, '' as falsy
// ✅ value ?? 'default'  → only null/undefined

// Async/await: always catch
// ❌ async function load() { const data = await fetch(url); }
// ✅
async function load() {
  try {
    const data = await fetch(url);
    return data.json();
  } catch (err) {
    console.error('Load failed:', err);
    return null;
  }
}
```

---

## 11. Accessibility (A11y)

> Elite companies ship fully accessible products. This is non-negotiable.

### 11.1 — Semantic Structure
```html
<!-- Every page needs exactly ONE h1 -->
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <header role="banner">
    <nav aria-label="Primary navigation">...</nav>
  </header>
  <main id="main" tabindex="-1">
    <h1>Page Title</h1>
    ...
  </main>
  <footer role="contentinfo">...</footer>
</body>
```

```css
/* Skip link — visible only on keyboard focus */
.skip-link {
  position: absolute;
  left: -9999px;
  top: var(--space-4);
  z-index: var(--z-max);
  padding: var(--space-2) var(--space-4);
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
}
.skip-link:focus {
  left: var(--space-4);
}
```

### 11.2 — ARIA Patterns
```tsx
// Modal with focus trap
function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) modalRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
      onKeyDown={e => e.key === 'Escape' && onClose()}
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose} aria-label="Close dialog">×</button>
    </div>
  );
}

// Loading state
<button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Saving…' : 'Save'}
</button>

// Toggle button
<button
  aria-pressed={isActive}
  onClick={() => setIsActive(!isActive)}
>
  Dark mode
</button>

// Expandable section
<button
  aria-expanded={isOpen}
  aria-controls="panel-id"
>
  Show details
</button>
<div id="panel-id" hidden={!isOpen}>...</div>
```

---

## 12. Performance Optimization

### 12.1 — Image Optimization
```html
<!-- Modern responsive images -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img
    src="image.jpg"
    alt="Description"
    width="800"
    height="600"
    loading="lazy"
    decoding="async"
  >
</picture>

<!-- Hero/LCP images: eager + high priority -->
<img
  src="hero.webp"
  alt="Hero"
  fetchpriority="high"
  loading="eager"
>
```

### 12.2 — CSS Performance
```css
/* Content visibility: defer off-screen rendering */
.article-card {
  content-visibility: auto;
  contain-intrinsic-size: 0 300px; /* Estimated height */
}

/* Contain layout for complex components */
.widget {
  contain: layout style;
}
```

### 12.3 — Bundle & Code Splitting
```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));
const DataTable  = lazy(() => import('./DataTable'));

function Dashboard() {
  return (
    <Suspense fallback={<div className="skeleton" style={{height: '400px'}} />}>
      <HeavyChart />
    </Suspense>
  );
}

// Preload on hover/focus for perceived performance
function NavLink({ href, children }) {
  const handleMouseEnter = () => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  };
  return <a href={href} onMouseEnter={handleMouseEnter}>{children}</a>;
}
```

---

## 13. Design Aesthetics — Anti-AI-Slop Rules

> The difference between mediocre and elite frontend is intentional design thinking.

### 13.1 — What Makes AI Slop (NEVER DO THIS)
```
❌ Purple gradient on white/black background as default
❌ Inter/Roboto/Arial as the only font
❌ Equal weight on ALL design elements (no visual hierarchy)
❌ Blue for every accent color by default
❌ Cards with identical padding, radius, shadow everywhere
❌ "Feature X | Feature Y | Feature Z" in 3-column layouts for everything
❌ Hero section: Big text left, illustration right — always
❌ Hamburger + logo + CTA in every navbar
❌ Drop shadows on shadows (double layering artifacts)
❌ Generic stock icons with no personality
❌ "Responsive" = just stacking everything vertically on mobile
```

### 13.2 — What Elite Design Looks Like (DO THIS)
```
✅ Clear aesthetic direction committed to from the start
✅ Typography that serves as decoration, not just function
✅ Intentional asymmetry and unexpected layouts
✅ Generous, editorial whitespace with deliberate density contrast
✅ Color hierarchy: one dominant, one accent, used sparingly
✅ Micro-details: hover states, cursor changes, subtle textures
✅ Visual rhythm: not every card the same size
✅ Expressive moment: one area that makes someone stop and look
✅ Restraint: doing LESS in more areas, MORE in one focus area
✅ Breakpoint design: mobile and desktop feel DESIGNED, not just reflowed
```

### 13.3 — Aesthetic Palette Reference (Pick One Per Project)

| Aesthetic | Fonts | Palette | Feel |
|-----------|-------|---------|------|
| **Editorial Luxury** | Cormorant + DM Sans | Cream, charcoal, gold | Magazine, fashion |
| **Industrial Minimal** | Space Mono + Helvetica Neue | White, black, red | Agency, tech |
| **Organic Warm** | Lora + Source Sans | Sand, terracotta, sage | Health, lifestyle |
| **Digital Precision** | IBM Plex + Sora | Near-black, electric blue | Data, SaaS |
| **Brutalist Bold** | Bebas Neue + Grotesk | Primary colors, no grey | Art, music |
| **Soft Modern** | Nunito + Manrope | Lavender, slate, white | Consumer, social |
| **Scientific Dark** | JetBrains + Inter | Dark grey, cyan, amber | Dev tools, CLI |

---

## 14. System Design Patterns

### 14.1 — Component API Design
```typescript
// Compound Components — for complex, related UI
const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};

// Usage
<Accordion.Root type="single" collapsible>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Section 1</Accordion.Trigger>
    <Accordion.Content>Content here</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

### 14.2 — Design Token Propagation
```typescript
// Generate CSS variables from a JS config (style-dictionary pattern)
const tokens = {
  color: {
    accent: { value: '#2563eb', type: 'color' },
    text:   { value: '#18181b', type: 'color' },
  },
  spacing: {
    4: { value: '1rem', type: 'spacing' },
  }
};
// Transform to: --color-accent: #2563eb; via build step
```

### 14.3 — Theming Architecture
```typescript
// ThemeProvider.tsx
const themes = {
  light: { '--color-bg': '#fafafa', '--color-text': '#18181b' },
  dark:  { '--color-bg': '#09090b', '--color-text': '#fafafa' },
} as const;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    const vars = themes[theme];
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

## 15. Production Checklist

> Run this before every deploy. Elite = zero compromises.

### ✅ Responsive & Visual
- [ ] Tested on: 320px, 375px, 430px (mobile), 768px (tablet), 1280px, 1920px
- [ ] No horizontal scroll at any breakpoint
- [ ] Touch targets ≥ 44px × 44px
- [ ] Dark mode tested (if supported)
- [ ] Fonts loaded with `display=swap` or `display=optional`
- [ ] All images have `width` + `height` (prevents CLS)
- [ ] Hero/LCP image uses `fetchpriority="high"`

### ✅ Performance
- [ ] Lighthouse score: Performance ≥ 90, A11y ≥ 95, Best Practices = 100
- [ ] No render-blocking resources
- [ ] Images in WebP/AVIF format
- [ ] JS bundle < 200kb gzipped (main thread)
- [ ] No unused CSS (PurgeCSS or Tailwind content paths configured)

### ✅ Accessibility
- [ ] All images have meaningful `alt` text
- [ ] Logical heading hierarchy (h1 → h2 → h3)
- [ ] Color contrast ≥ 4.5:1 (body), ≥ 3:1 (large text)
- [ ] Full keyboard navigation functional
- [ ] Skip link present and working
- [ ] Screen reader tested (VoiceOver / NVDA)
- [ ] No content relies on color alone

### ✅ Bug Prevention
- [ ] No `console.error` or `console.warn` in production
- [ ] All API calls have timeout + error handling
- [ ] No `useEffect` without cleanup functions
- [ ] All async operations have loading + error states
- [ ] TypeScript `strict: true` with 0 errors
- [ ] No `any` types without justification comment
- [ ] `key` props are stable IDs, not array indices

### ✅ Design Quality
- [ ] Consistent spacing using token scale only
- [ ] No hardcoded color values in components
- [ ] Animation respects `prefers-reduced-motion`
- [ ] Hover/focus/active states on ALL interactive elements
- [ ] No layout jitter during state transitions
- [ ] Scrollbar gutter stabilized (`scrollbar-gutter: stable`)

---

*Version 1.0 · Elite Frontend Engineering Reference · Production-Grade*
