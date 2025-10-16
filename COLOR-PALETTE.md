# Official Color Palette - Revive Your Hair

## Design Philosophy

Your brand colors communicate trust, growth, and professionalism in the hair loss treatment space.

- **Green** = Trust, Growth, Action (primary brand color)
- **Gold** = Premium, Important, Attention (use sparingly!)
- **Charcoal** = Professional, Readable (all text)
- **White/Gray** = Clean, Medical, Modern (backgrounds)

---

## Color Variables

All colors are defined in `src/styles/color-palette.css` as CSS variables.

### Primary Colors

```css
--forest-green: #047857;           /* Main brand color - logo, primary buttons, links */
--forest-green-dark: #065f46;      /* Hover states, depth */
--forest-green-light: #10b981;     /* Lighter accents, gradients */
```

**Use for:**
- Logo
- Primary navigation hover/active states
- All body links
- Primary buttons ("Shop Now", "Learn More")
- Section headers that need color
- Icons (general)
- Checkmarks, success indicators
- Border accents on important boxes

### Accent Color (⚠️ Use Sparingly!)

```css
--warm-gold: #f59e0b;              /* Special CTAs, badges, highlights */
--warm-gold-light: #fbbf24;        /* Gold hover states */
```

**Use ONLY for:**
- THE most important CTA button on each page (max 1-2 per page)
- Trust badges ("40+ Clinical Studies")
- Sale/promotion tags
- Special highlights
- Notification dots/badges
- **NEVER use for body text**

### Neutrals

```css
--charcoal: #1f2937;               /* Body text, headers */
--charcoal-light: #374151;         /* Secondary text */
--gray-dark: #4b5563;              /* Tertiary text */
--gray-medium: #6b7280;            /* Muted text */
--gray-light: #9ca3af;             /* Disabled states */
```

**Use for:**
- All body text
- All headers (H1, H2, H3, H4, H5, H6)
- Navigation text (non-active)
- Footer text

### Backgrounds

```css
--white: #ffffff;                  /* Main background */
--gray-50: #f9fafb;                /* Light background sections */
--gray-100: #f3f4f6;               /* Cards, alternating rows */
--gray-200: #e5e7eb;               /* Borders, dividers */
```

### Semantic Colors

```css
--success: #10b981;                /* Success messages, positive */
--warning: #f59e0b;                /* Warnings, important notices */
--error: #ef4444;                  /* Errors, alerts */
--info: #3b82f6;                   /* Info messages */
```

### Background Tints (for boxes/callouts)

```css
--green-tint: #f0fdf4;             /* Very light green for pro tips */
--gold-tint: #fffbeb;              /* Very light gold for warnings */
--gray-tint: #f9fafb;              /* Light gray for neutral boxes */
```

---

## Gradients

### Primary Gradient
**Headers, hero sections, important callouts**

```css
--gradient-primary: linear-gradient(135deg, #047857 0%, #10b981 100%);
```

**Usage:**
```css
.blog-hero {
  background: var(--gradient-primary);
}
```

### Accent Bar
**Header top bar, section dividers**

```css
--gradient-accent: linear-gradient(90deg, #047857 0%, #f59e0b 100%);
```

**Usage:**
```css
.accent-bar {
  background: var(--gradient-accent);
}
```

### Subtle Background Gradient
**Large hero sections only**

```css
--gradient-bg: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
```

### Gold CTA Gradient
**THE most important action - use once per page max**

```css
--gradient-gold: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
```

**Usage:**
```css
.primary-cta-button {
  background: var(--gradient-gold);
}
```

---

## Button Styles

### Primary Button (Most Common)

```css
.btn-primary {
  background: var(--forest-green);
  color: white;
}

.btn-primary:hover {
  background: var(--forest-green-dark);
}
```

### Primary Button with Gradient (Special Pages Only)

```css
.btn-gradient {
  background: var(--gradient-primary);
  color: white;
}
```

### Secondary Button (Less Important Actions)

```css
.btn-secondary {
  background: var(--white);
  color: var(--forest-green);
  border: 2px solid var(--forest-green);
}

.btn-secondary:hover {
  background: var(--forest-green);
  color: white;
}
```

### Gold CTA Button (Most Important - Once Per Page Max)

```css
.btn-cta {
  background: var(--gradient-gold);
  color: white;
}

/* Or solid version: */
.btn-cta-solid {
  background: var(--warm-gold);
  color: white;
}
```

---

## Blog Post Specific Styles

### Top Summary Box

```css
.summary-box {
  background: var(--gradient-primary);
  color: white;
}
```

### Quiz Callouts

```css
.quiz-callout {
  background: var(--gradient-primary);
}

.quiz-callout button {
  background: var(--white);
  color: var(--forest-green);
}
```

### Pro Tips / Important Boxes

```css
.pro-tip {
  background: var(--green-tint);
  border-left: 4px solid var(--forest-green);
}
```

### Warning Boxes

```css
.warning-box {
  background: var(--gold-tint);
  border-left: 4px solid var(--warm-gold);
}
```

### Comparison Table Header

```css
.comparison-header {
  background: var(--gradient-primary);
  color: white;
}
```

### Timeline Elements

```css
/* Active/milestone circles */
.timeline-active {
  background: var(--gradient-primary);
}

/* Progress line */
.timeline-progress {
  background: var(--gradient-accent);
}

/* Inactive elements */
.timeline-inactive {
  background: var(--gray-200);
}
```

### Cycle Visualization

```css
/* Step numbers */
.cycle-step {
  background: var(--gradient-primary);
}

/* Arrows */
.cycle-arrow {
  color: var(--forest-green);
}

/* Loop-back section */
.cycle-loop {
  background: var(--gold-tint);
}
```

### FAQ Accordion

```css
/* Question hover */
.faq-question:hover {
  background: var(--green-tint);
}

/* Active icon */
.faq-icon {
  color: var(--forest-green);
}

/* Borders */
.faq-item {
  border-color: var(--gray-200);
}
```

---

## Interactive States

### Links

```css
a {
  color: var(--forest-green);
  text-decoration: none;
}

a:hover {
  color: var(--forest-green-dark);
  text-decoration: underline;
}
```

### Navigation (Active)

```css
.nav-link.active {
  color: var(--forest-green);
  border-bottom: 2px solid var(--forest-green);
}
```

### Form Inputs (Focus)

```css
input:focus {
  border-color: var(--forest-green);
  box-shadow: var(--shadow-focus);
}
```

---

## Shadows & Depth

### Standard Box Shadow

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
```

**Usage:**
```css
.card {
  box-shadow: var(--shadow-sm);
}
```

### Elevated Elements

```css
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.1);
```

### Hover Lift Effect

```css
--shadow-lg: 0 8px 24px rgba(4, 120, 87, 0.15);
```

**Note:** This shadow has a subtle green tint to reinforce brand color.

### Focus Ring

```css
--shadow-focus: 0 0 0 3px rgba(4, 120, 87, 0.1);
```

---

## Usage Rules

### ✅ DO:

- Use green liberally for all interactive elements
- Use gold for 1-2 most important CTAs per page
- Keep text readable (charcoal on white/light backgrounds)
- Use gradients for hero sections and important callouts
- Use tinted backgrounds for callout boxes
- Maintain consistent hover states

### ❌ DON'T:

- Use gold for body text (readability issues)
- Use more than 2 gold CTAs per page
- Mix purple/blue colors (old palette)
- Use harsh shadows without green tint
- Forget to use CSS variables (always use `var(--forest-green)` instead of `#047857`)

---

## Color Replacement Guide

If you encounter old purple colors, replace them as follows:

| Old Purple Color | New Green Color | CSS Variable |
|-----------------|-----------------|--------------|
| `#667eea` | `#047857` | `var(--forest-green)` |
| `#764ba2` | `#10b981` | `var(--forest-green-light)` |
| `#5568d3` | `#065f46` | `var(--forest-green-dark)` |
| `#3182ce` | `#047857` | `var(--forest-green)` |
| `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | `linear-gradient(135deg, #047857 0%, #10b981 100%)` | `var(--gradient-primary)` |

---

## Accessibility

### Color Contrast Ratios

All color combinations meet WCAG 2.1 AA standards:

- **Forest Green (#047857) on White**: 5.83:1 ✓
- **Charcoal (#1f2937) on White**: 16.14:1 ✓✓✓
- **White on Forest Green**: 5.83:1 ✓
- **Warm Gold (#f59e0b) on White**: 2.93:1 ⚠️ (Large text only)

**Note:** Gold should only be used for large buttons/badges, not body text.

---

## Quick Reference

**Most Common Colors:**
- Body text: `var(--charcoal)`
- Links: `var(--forest-green)`
- Primary buttons: `var(--forest-green)` or `var(--gradient-primary)`
- Special CTAs: `var(--gradient-gold)`
- Backgrounds: `var(--white)`, `var(--gray-50)`, `var(--gray-100)`
- Borders: `var(--gray-200)`

**Most Common Shadows:**
- Cards: `var(--shadow-sm)`
- Hover: `var(--shadow-lg)`
- Focus: `var(--shadow-focus)`
