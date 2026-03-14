# Workflow Management Platform - Design System

## 1. Design Principles

### Core Values
- **Clarity**: Clear visual hierarchy and intuitive interactions
- **Efficiency**: Fast task completion with minimal friction
- **Expressiveness**: Vibrant colors that energize and motivate
- **Consistency**: Predictable patterns across all modules
- **Accessibility**: WCAG 2.1 AA compliance minimum

### Design Philosophy
This design system draws inspiration from modern SaaS platforms like Linear, Notion, and Vercel, combining:
- Clean, minimal layouts with purposeful use of white space
- Bold, expressive color accents for visual interest
- Strong component-based architecture
- Mobile-first responsive design
- Smooth, purposeful animations

---

## 2. Color System

### Primary Palette
Based on the brand color **Orange** as the primary accent.

```css
/* Primary - Orange (Brand) */
--color-primary-50: #fff7ed;
--color-primary-100: #ffedd5;
--color-primary-200: #fed7aa;
--color-primary-300: #fdba74;
--color-primary-400: #fb923c;
--color-primary-500: #ff5623;  /* Main brand color */
--color-primary-600: #ea580c;
--color-primary-700: #c2410c;
--color-primary-800: #9a3412;
--color-primary-900: #7c2d12;
--color-primary-950: #431407;
```

### Secondary Palette
```css
/* Secondary - Yellow */
--color-secondary-50: #fefce8;
--color-secondary-100: #fef9c3;
--color-secondary-200: #fef08a;
--color-secondary-300: #fde047;
--color-secondary-400: #facc15;
--color-secondary-500: #feba31;  /* From color palette */
--color-secondary-600: #ca8a04;
--color-secondary-700: #a16207;
--color-secondary-800: #854d0e;
--color-secondary-900: #713f12;
```

### Success Palette
```css
/* Success - Green */
--color-success-50: #f0fdf4;
--color-success-100: #dcfce7;
--color-success-200: #bbf7d0;
--color-success-300: #86efac;
--color-success-400: #4ade80;
--color-success-500: #019364;  /* From color palette */
--color-success-600: #16a34a;
--color-success-700: #15803d;
--color-success-800: #166534;
--color-success-900: #14532d;

/* Success Light */
--color-success-light-500: #64b477;  /* From color palette */
```

### Danger Palette
```css
/* Danger - Red */
--color-danger-50: #fef2f2;
--color-danger-100: #fee2e2;
--color-danger-200: #fecaca;
--color-danger-300: #fca5a5;
--color-danger-400: #f87171;
--color-danger-500: #f32c2c;  /* From color palette */
--color-danger-600: #dc2626;
--color-danger-700: #be1f1f;  /* From color palette */
--color-danger-800: #991b1b;
--color-danger-900: #7f1d1d;
```

### Info Palette
```css
/* Info - Purple/Violet */
--color-info-50: #faf5ff;
--color-info-100: #f3e8ff;
--color-info-200: #e9d5ff;
--color-info-300: #d8b4fe;
--color-info-400: #c084fc;
--color-info-500: #987dfe;  /* From color palette */
--color-info-600: #9333ea;
--color-info-700: #7e22ce;
--color-info-800: #6b21a8;
--color-info-900: #581c87;

/* Info Accent - Deep Purple */
--color-info-accent-500: #5237e6;  /* From color palette */
```

### Accent Palette
```css
/* Accent - Pink */
--color-accent-50: #fdf2f8;
--color-accent-100: #fce7f3;
--color-accent-200: #fbcfe8;
--color-accent-300: #f9a8d4;
--color-accent-400: #f472b6;
--color-accent-500: #ffbee9;  /* From color palette */
--color-accent-600: #ec4899;
--color-accent-700: #db2777;
--color-accent-800: #be185d;
--color-accent-900: #9f1239;

/* Accent Dark */
--color-accent-dark-500: #e992d7;  /* From color palette */
```

### Neutral Palette
```css
/* Neutral - Grays */
--color-neutral-50: #fafafa;
--color-neutral-100: #f5f5f5;
--color-neutral-150: #ebf0eb;  /* From color palette - light green tint */
--color-neutral-200: #e5e5e5;
--color-neutral-300: #d4d4d4;
--color-neutral-400: #a3a3a3;
--color-neutral-500: #737373;
--color-neutral-600: #525252;
--color-neutral-700: #404040;
--color-neutral-800: #262626;
--color-neutral-900: #171717;
--color-neutral-950: #101010;  /* From color palette - true black */
```

### Semantic Color Tokens

#### Background Tokens
```css
--bg-base: #ffffff;
--bg-subtle: var(--color-neutral-50);
--bg-muted: var(--color-neutral-100);
--bg-emphasis: var(--color-neutral-900);
--bg-surface: #ffffff;
--bg-surface-raised: #ffffff;
--bg-surface-overlay: rgba(0, 0, 0, 0.4);
```

#### Surface Tokens (for cards and elevated elements)
```css
--surface-base: #ffffff;
--surface-raised: #ffffff;
--surface-sunken: var(--color-neutral-50);
--surface-border: rgba(0, 0, 0, 0.08);
--surface-border-hover: rgba(0, 0, 0, 0.12);
```

#### Border Tokens
```css
--border-subtle: rgba(0, 0, 0, 0.06);
--border-default: rgba(0, 0, 0, 0.10);
--border-emphasis: rgba(0, 0, 0, 0.15);
--border-strong: rgba(0, 0, 0, 0.20);
--border-brand: var(--color-primary-500);
```

#### Text Tokens
```css
--text-primary: #171717;
--text-secondary: #525252;
--text-tertiary: #737373;
--text-placeholder: #a3a3a3;
--text-disabled: #d4d4d4;
--text-inverse: #ffffff;
--text-brand: var(--color-primary-500);
--text-success: var(--color-success-700);
--text-danger: var(--color-danger-700);
--text-warning: var(--color-secondary-700);
--text-info: var(--color-info-700);
```

### Usage Guidelines

#### KPI Cards
Use vibrant colors from the palette for data visualization:
- Primary metrics: `primary-500` (orange)
- Secondary metrics: `secondary-500` (yellow)
- Success states: `success-500` (green)
- Growth indicators: `info-500` (purple)
- Critical alerts: `danger-500` (red)
- Featured items: `accent-500` (pink)

#### Status Indicators
- **To Do**: `neutral-400`
- **In Progress**: `info-500` (purple)
- **Review**: `secondary-500` (yellow)
- **Completed**: `success-500` (green)
- **Blocked**: `danger-500` (red)
- **Archived**: `neutral-300`

---

## 3. Typography

### Font Family
**Primary**: SF Pro (system font fallback)

```css
--font-sans: 'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', 'Monaco', 'Cascadia Code', 'Consolas', monospace;
```

### Type Scale

#### Display
```css
/* Display - Large hero text */
--text-display-2xl: 4.5rem;    /* 72px */
--text-display-xl: 3.75rem;    /* 60px */
--text-display-lg: 3rem;       /* 48px */
--text-display-md: 2.25rem;    /* 36px */
--text-display-sm: 1.875rem;   /* 30px */
```

#### Headings
```css
--text-h1: 2.25rem;   /* 36px */
--text-h2: 1.875rem;  /* 30px */
--text-h3: 1.5rem;    /* 24px */
--text-h4: 1.25rem;   /* 20px */
--text-h5: 1.125rem;  /* 18px */
--text-h6: 1rem;      /* 16px */
```

#### Body Text
```css
--text-xl: 1.25rem;   /* 20px */
--text-lg: 1.125rem;  /* 18px */
--text-base: 1rem;    /* 16px - default */
--text-sm: 0.875rem;  /* 14px */
--text-xs: 0.75rem;   /* 12px */
--text-2xs: 0.6875rem; /* 11px */
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Heights
```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Typography Pairings

#### Dashboard Headlines
```
Font: SF Pro
Size: 24px (--text-h3)
Weight: 600 (semibold)
Line Height: 1.375 (tight)
Color: --text-primary
```

#### Card Titles
```
Font: SF Pro
Size: 18px (--text-lg)
Weight: 600 (semibold)
Line Height: 1.5 (normal)
Color: --text-primary
```

#### Body Text
```
Font: SF Pro
Size: 16px (--text-base)
Weight: 400 (normal)
Line Height: 1.5 (normal)
Color: --text-secondary
```

#### UI Labels
```
Font: SF Pro
Size: 14px (--text-sm)
Weight: 500 (medium)
Line Height: 1.5 (normal)
Color: --text-secondary
```

#### Helper Text
```
Font: SF Pro
Size: 12px (--text-xs)
Weight: 400 (normal)
Line Height: 1.5 (normal)
Color: --text-tertiary
```

### Responsive Typography

```css
/* Mobile (< 640px) */
--text-h1-mobile: 1.875rem;  /* 30px */
--text-h2-mobile: 1.5rem;    /* 24px */
--text-h3-mobile: 1.25rem;   /* 20px */

/* Tablet (640px - 1024px) */
--text-h1-tablet: 2rem;      /* 32px */
--text-h2-tablet: 1.75rem;   /* 28px */
--text-h3-tablet: 1.375rem;  /* 22px */

/* Desktop (> 1024px) */
/* Use base values */
```

---

## 4. Design Tokens

### Spacing Scale
Following an 8px baseline grid:

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### Border Radius Scale
```css
--radius-none: 0;
--radius-sm: 0.25rem;    /* 4px */
--radius-base: 0.375rem; /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.625rem;   /* 10px - default for cards */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* Pills and circles */
```

### Shadow Scale
```css
/* Shadows for depth and hierarchy */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
             0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
               0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
             0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
             0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-2xl: 0 50px 100px -20px rgba(0, 0, 0, 0.25);

/* Colored shadows for brand elements */
--shadow-primary: 0 10px 15px -3px rgba(255, 86, 35, 0.2), 
                  0 4px 6px -4px rgba(255, 86, 35, 0.1);
--shadow-success: 0 10px 15px -3px rgba(1, 147, 100, 0.2), 
                  0 4px 6px -4px rgba(1, 147, 100, 0.1);
--shadow-danger: 0 10px 15px -3px rgba(243, 44, 44, 0.2), 
                 0 4px 6px -4px rgba(243, 44, 44, 0.1);
```

### Opacity Scale
```css
--opacity-0: 0;
--opacity-5: 0.05;
--opacity-10: 0.1;
--opacity-20: 0.2;
--opacity-30: 0.3;
--opacity-40: 0.4;
--opacity-50: 0.5;
--opacity-60: 0.6;
--opacity-70: 0.7;
--opacity-80: 0.8;
--opacity-90: 0.9;
--opacity-100: 1;
```

### Z-Index Scale
```css
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1100;
--z-fixed: 1200;
--z-modal-backdrop: 1300;
--z-modal: 1400;
--z-popover: 1500;
--z-tooltip: 1600;
--z-notification: 1700;
--z-max: 9999;
```

### Motion & Duration
```css
/* Duration */
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;

/* Easing */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## 5. Layout System

### Breakpoints (Tailwind v4 compatible)
```css
--breakpoint-sm: 640px;    /* Mobile landscape */
--breakpoint-md: 768px;    /* Tablet portrait */
--breakpoint-lg: 1024px;   /* Tablet landscape / Small desktop */
--breakpoint-xl: 1280px;   /* Desktop */
--breakpoint-2xl: 1536px;  /* Large desktop */
```

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1400px;    /* Max content width */
--container-full: 100%;
```

### Grid System
```css
/* 12-column grid */
--grid-columns: 12;
--grid-gap: var(--space-6);          /* 24px */
--grid-gap-sm: var(--space-4);       /* 16px on mobile */
```

### Section Padding
```css
/* Vertical padding for major sections */
--section-padding-sm: var(--space-8);   /* 32px mobile */
--section-padding-md: var(--space-12);  /* 48px tablet */
--section-padding-lg: var(--space-16);  /* 64px desktop */
--section-padding-xl: var(--space-24);  /* 96px large desktop */

/* Horizontal container padding */
--container-padding-sm: var(--space-4);  /* 16px mobile */
--container-padding-md: var(--space-6);  /* 24px tablet */
--container-padding-lg: var(--space-8);  /* 32px desktop */
```

### Layout Patterns

#### Dashboard Layout
```
┌─────────────────────────────────────────┐
│ Topbar (h: 64px)                        │
├──────┬──────────────────────────────────┤
│      │                                  │
│ Side │     Main Content Area            │
│ bar  │     (padding: 24px-32px)         │
│ 240  │                                  │
│ px   │                                  │
│      │                                  │
└──────┴──────────────────────────────────┘
```

#### Card Grid
```css
/* Responsive card grid */
.card-grid {
  display: grid;
  gap: var(--space-6);
  
  /* Mobile: 1 column */
  grid-template-columns: 1fr;
  
  /* Tablet: 2 columns */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* Desktop: 3-4 columns */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## 6. Components Library

### Buttons

#### Variants

**Primary Button**
```tsx
// Tailwind classes
className="
  bg-primary-500 text-white
  hover:bg-primary-600
  active:bg-primary-700
  disabled:bg-neutral-200 disabled:text-neutral-400
  px-4 py-2 rounded-lg
  font-medium text-base
  transition-colors duration-150
  shadow-sm hover:shadow
  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
  focus-visible:outline-primary-500
"
```

**Secondary Button**
```tsx
className="
  bg-neutral-100 text-neutral-900
  hover:bg-neutral-200
  active:bg-neutral-300
  disabled:bg-neutral-100 disabled:text-neutral-400
  px-4 py-2 rounded-lg
  font-medium text-base
  transition-colors duration-150
"
```

**Outline Button**
```tsx
className="
  bg-transparent border-2 border-neutral-300 text-neutral-900
  hover:border-neutral-400 hover:bg-neutral-50
  active:border-neutral-500
  disabled:border-neutral-200 disabled:text-neutral-400
  px-4 py-2 rounded-lg
  font-medium text-base
  transition-all duration-150
"
```

**Ghost Button**
```tsx
className="
  bg-transparent text-neutral-700
  hover:bg-neutral-100
  active:bg-neutral-200
  disabled:text-neutral-400
  px-4 py-2 rounded-lg
  font-medium text-base
  transition-colors duration-150
"
```

**Icon Button**
```tsx
className="
  bg-transparent text-neutral-700
  hover:bg-neutral-100
  active:bg-neutral-200
  disabled:text-neutral-400
  p-2 rounded-lg
  transition-colors duration-150
"
```

#### Sizes
```tsx
// Small
className="px-3 py-1.5 text-sm rounded-md"

// Base (default)
className="px-4 py-2 text-base rounded-lg"

// Large
className="px-6 py-3 text-lg rounded-xl"

// Icon sizes
className="p-1.5 text-sm"  // small icon
className="p-2 text-base"  // base icon
className="p-3 text-lg"    // large icon
```

### Inputs

#### Text Input
```tsx
className="
  w-full px-3 py-2
  bg-neutral-50 border border-neutral-200
  rounded-lg
  text-base text-neutral-900
  placeholder:text-neutral-400
  hover:border-neutral-300
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
  disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed
  transition-all duration-150
"
```

#### Textarea
```tsx
className="
  w-full px-3 py-2
  bg-neutral-50 border border-neutral-200
  rounded-lg
  text-base text-neutral-900
  placeholder:text-neutral-400
  hover:border-neutral-300
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
  disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed
  transition-all duration-150
  resize-none
  min-h-[100px]
"
```

### Cards

#### Basic Card
```tsx
className="
  bg-white
  border border-neutral-200
  rounded-lg
  p-6
  shadow-sm
  hover:shadow-md
  transition-shadow duration-250
"
```

#### KPI Card (Colorful)
```tsx
// Container
className="
  relative overflow-hidden
  bg-gradient-to-br from-primary-400 to-primary-600
  rounded-xl
  p-6
  shadow-md hover:shadow-lg
  transition-shadow duration-250
"

// Title
className="text-white/80 text-sm font-medium mb-1"

// Value
className="text-white text-3xl font-bold mb-2"

// Change indicator
className="text-white/90 text-sm font-medium"
```

#### Task Card
```tsx
className="
  bg-white
  border border-neutral-200
  rounded-lg
  p-4
  hover:border-neutral-300 hover:shadow-sm
  transition-all duration-150
  cursor-pointer
"
```

### Navigation

#### Sidebar
```tsx
// Container
className="
  fixed left-0 top-0 bottom-0
  w-60
  bg-white border-r border-neutral-200
  overflow-y-auto
"

// Nav item
className="
  flex items-center gap-3
  px-4 py-2.5
  text-sm font-medium text-neutral-700
  hover:bg-neutral-100
  rounded-lg
  transition-colors duration-150
"

// Active nav item
className="
  flex items-center gap-3
  px-4 py-2.5
  text-sm font-medium text-primary-600
  bg-primary-50
  rounded-lg
"
```

#### Topbar
```tsx
className="
  sticky top-0 z-sticky
  h-16
  bg-white border-b border-neutral-200
  px-6
  flex items-center justify-between
"
```

#### Breadcrumb
```tsx
// Container
className="flex items-center gap-2 text-sm"

// Item
className="text-neutral-600 hover:text-neutral-900 transition-colors"

// Separator
className="text-neutral-400"

// Active item
className="text-neutral-900 font-medium"
```

### Badges

#### Status Badge
```tsx
// Base
className="
  inline-flex items-center gap-1.5
  px-2.5 py-1
  rounded-full
  text-xs font-medium
  transition-colors duration-150
"

// Todo
className="bg-neutral-100 text-neutral-700"

// In Progress
className="bg-info-100 text-info-700"

// Review
className="bg-secondary-100 text-secondary-700"

// Completed
className="bg-success-100 text-success-700"

// Blocked
className="bg-danger-100 text-danger-700"
```

#### Role Badge
```tsx
// Client
className="bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full text-xs font-medium"

// Manager
className="bg-info-100 text-info-700 px-2.5 py-1 rounded-full text-xs font-medium"

// Collaborator
className="bg-accent-100 text-accent-700 px-2.5 py-1 rounded-full text-xs font-medium"
```

### Tables

#### Data Table
```tsx
// Container
className="w-full overflow-x-auto"

// Table
className="w-full border-collapse"

// Header
className="border-b border-neutral-200 bg-neutral-50"

// Header cell
className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wide"

// Row
className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"

// Cell
className="px-4 py-4 text-sm text-neutral-900"
```

### Feedback Components

#### Toast Notification
```tsx
// Success toast
className="
  flex items-start gap-3
  bg-white border-l-4 border-success-500
  rounded-lg shadow-lg
  p-4
  max-w-md
"

// Error toast
className="
  flex items-start gap-3
  bg-white border-l-4 border-danger-500
  rounded-lg shadow-lg
  p-4
  max-w-md
"
```

#### Alert
```tsx
// Info alert
className="
  bg-info-50 border border-info-200
  rounded-lg
  p-4
  flex items-start gap-3
"

// Success alert
className="
  bg-success-50 border border-success-200
  rounded-lg
  p-4
  flex items-start gap-3
"
```

### User Components

#### Avatar
```tsx
// Base
className="
  relative inline-flex items-center justify-center
  bg-neutral-200 text-neutral-600
  rounded-full
  font-medium
  overflow-hidden
"

// Sizes
className="h-8 w-8 text-sm"   // Small
className="h-10 w-10 text-base" // Base
className="h-12 w-12 text-lg"  // Large
className="h-16 w-16 text-xl"  // XL
```

---

## 7. Interaction States

### State Definitions

#### Default
Base appearance of component

#### Hover
```css
/* Subtle elevation and color shift */
transition: all 150ms ease-out;

/* Buttons */
background-color: [color +1 shade darker];
box-shadow: var(--shadow-sm);

/* Cards */
box-shadow: var(--shadow-md);
border-color: [border +1 shade darker];
```

#### Active/Pressed
```css
/* More pronounced than hover */
background-color: [color +2 shades darker];
box-shadow: var(--shadow-xs);
transform: translateY(1px);
```

#### Focus
```css
/* Visible focus ring for accessibility */
outline: 2px solid var(--color-primary-500);
outline-offset: 2px;
```

#### Disabled
```css
/* Reduced opacity and no interaction */
opacity: 0.5;
cursor: not-allowed;
pointer-events: none;

/* Alternative: Muted colors */
background-color: var(--color-neutral-100);
color: var(--color-neutral-400);
border-color: var(--color-neutral-200);
```

#### Loading
```css
/* Show spinner or skeleton */
cursor: wait;
opacity: 0.7;

/* With spinner */
position: relative;
/* Add animated spinner overlay */
```

#### Error
```css
/* For inputs and forms */
border-color: var(--color-danger-500);
box-shadow: 0 0 0 3px rgba(243, 44, 44, 0.1);

/* Error text */
color: var(--color-danger-700);
font-size: var(--text-sm);
margin-top: var(--space-1);
```

#### Success
```css
/* For inputs and forms */
border-color: var(--color-success-500);
box-shadow: 0 0 0 3px rgba(1, 147, 100, 0.1);

/* Success text */
color: var(--color-success-700);
font-size: var(--text-sm);
margin-top: var(--space-1);
```

---

## 8. Accessibility Rules

### WCAG 2.1 AA Compliance

#### Color Contrast
- **Normal text** (< 18pt): Minimum 4.5:1 contrast ratio
- **Large text** (≥ 18pt or ≥ 14pt bold): Minimum 3:1 contrast ratio
- **UI components and graphics**: Minimum 3:1 contrast ratio

#### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Visible focus indicators required (2px outline with 2px offset)
- Logical tab order following visual layout
- Keyboard shortcuts documented and non-conflicting

#### ARIA Attributes
```tsx
// Buttons
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

// Form inputs
<input aria-describedby="email-error" aria-invalid="true" />

// Loading states
<button aria-busy="true" aria-live="polite">
  Loading...
</button>

// Modals
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Dialog Title</h2>
</div>

// Status messages
<div role="status" aria-live="polite">
  Task created successfully
</div>
```

#### Focus Management
- Trap focus within modals and dialogs
- Return focus to trigger element on close
- Skip links for keyboard navigation
- Avoid focus traps in infinite scrolls

#### Screen Reader Support
- Semantic HTML elements (`<button>`, `<nav>`, `<main>`, etc.)
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for images
- Labels for form inputs
- Live regions for dynamic content

---

## 9. Responsive Design Rules

### Mobile First Approach
Start with mobile layout, progressively enhance for larger screens.

### Breakpoint Strategy

#### Mobile (< 640px)
- Single column layouts
- Full-width cards
- Stacked navigation (hamburger menu)
- Reduced padding and spacing
- Simplified data tables (card view)
- Touch-friendly targets (min 44x44px)

#### Tablet (640px - 1024px)
- 2-column card grids
- Side drawer navigation
- Increased spacing
- Horizontal scrolling for tables

#### Desktop (> 1024px)
- 3-4 column card grids
- Persistent sidebar navigation
- Full data tables
- Hover states active
- Keyboard shortcuts enabled

### Layout Adaptation Patterns

#### Dashboard
```tsx
// Mobile: Stack vertically
<div className="flex flex-col gap-4">
  <KPICard />
  <KPICard />
  <KPICard />
</div>

// Tablet: 2 columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <KPICard />
  <KPICard />
  <KPICard />
</div>

// Desktop: 4 columns
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
  <KPICard />
  <KPICard />
  <KPICard />
  <KPICard />
</div>
```

#### Navigation
```tsx
// Mobile: Hidden sidebar, show on menu click
<div className="lg:hidden">
  <MobileNav />
</div>

// Desktop: Persistent sidebar
<div className="hidden lg:block">
  <Sidebar />
</div>
```

#### Typography
```tsx
// Responsive heading
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Dashboard
</h1>

// Responsive body
<p className="text-sm md:text-base">
  Description text
</p>
```

#### Spacing
```tsx
// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
  Content
</div>

// Responsive gap
<div className="flex gap-2 md:gap-4 lg:gap-6">
  Items
</div>
```

---

## 10. Example UI Patterns

### Dashboard View

#### Manager Dashboard
```tsx
<div className="min-h-screen bg-neutral-50">
  {/* Topbar */}
  <header className="sticky top-0 z-sticky h-16 bg-white border-b border-neutral-200 px-6">
    <div className="flex items-center justify-between h-full">
      <Breadcrumb />
      <UserMenu />
    </div>
  </header>

  {/* Main Layout */}
  <div className="flex">
    {/* Sidebar */}
    <aside className="hidden lg:block w-60 bg-white border-r border-neutral-200">
      <Sidebar />
    </aside>

    {/* Content */}
    <main className="flex-1 p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Dashboard</h1>
        <p className="text-neutral-600">Welcome back! Here's what's happening.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <KPICard 
          title="Active Tasks" 
          value="24" 
          change="+12%" 
          color="primary"
        />
        <KPICard 
          title="Completed" 
          value="156" 
          change="+8%" 
          color="success"
        />
        <KPICard 
          title="Team Members" 
          value="12" 
          change="+2" 
          color="info"
        />
        <KPICard 
          title="Credits Used" 
          value="450" 
          change="-15%" 
          color="secondary"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskList />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
    </main>
  </div>
</div>
```

### Task Management View

#### Task List
```tsx
<div className="bg-white rounded-lg border border-neutral-200 p-6">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-semibold text-neutral-900">Tasks</h2>
    <div className="flex items-center gap-3">
      <FilterButton />
      <SortButton />
      <CreateButton />
    </div>
  </div>

  {/* Task Cards */}
  <div className="space-y-3">
    <TaskCard
      title="Design new landing page"
      status="in-progress"
      assignee="John Doe"
      dueDate="Mar 15, 2026"
      priority="high"
    />
    <TaskCard
      title="Review marketing materials"
      status="review"
      assignee="Jane Smith"
      dueDate="Mar 14, 2026"
      priority="medium"
    />
    <TaskCard
      title="Update documentation"
      status="todo"
      assignee="Mike Johnson"
      dueDate="Mar 18, 2026"
      priority="low"
    />
  </div>
</div>
```

#### Task Card Component
```tsx
<div className="group bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer">
  <div className="flex items-start justify-between mb-3">
    <h3 className="font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">
      {title}
    </h3>
    <StatusBadge status={status} />
  </div>
  
  <p className="text-sm text-neutral-600 mb-4">
    {description}
  </p>

  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Avatar size="sm" name={assignee} />
      <span className="text-sm text-neutral-700">{assignee}</span>
    </div>
    <div className="flex items-center gap-3 text-xs text-neutral-500">
      <span className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        {dueDate}
      </span>
      <PriorityBadge priority={priority} />
    </div>
  </div>
</div>
```

### Client View

#### Client Dashboard
```tsx
<div className="min-h-screen bg-neutral-50">
  <header className="bg-white border-b border-neutral-200 px-6 py-4">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900">My Projects</h1>
    </div>
  </header>

  <main className="max-w-7xl mx-auto p-6">
    {/* Credits Overview */}
    <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 mb-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1">Available Credits</p>
          <p className="text-4xl font-bold">2,450</p>
        </div>
        <button className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors">
          Purchase More
        </button>
      </div>
    </div>

    {/* Active Projects */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard />
      <ProjectCard />
      <ProjectCard />
    </div>
  </main>
</div>
```

### Collaborator View

#### Assigned Tasks
```tsx
<div className="min-h-screen bg-neutral-50">
  <header className="bg-white border-b border-neutral-200 px-6 py-4">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900">My Tasks</h1>
      <p className="text-neutral-600 mt-1">8 tasks assigned to you</p>
    </div>
  </header>

  <main className="max-w-7xl mx-auto p-6">
    {/* Quick Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <StatCard title="To Do" value="3" color="neutral" />
      <StatCard title="In Progress" value="4" color="info" />
      <StatCard title="Completed Today" value="1" color="success" />
    </div>

    {/* Task Kanban */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <TaskColumn title="To Do" count={3} />
      <TaskColumn title="In Progress" count={4} />
      <TaskColumn title="Review" count={1} />
    </div>
  </main>
</div>
```

---

## Component Architecture Suggestions

### File Structure
```
src/
├── app/
│   ├── components/
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   │   ├── KPICard.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── StatsPanel.tsx
│   │   ├── tasks/           # Task management components
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskKanban.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── navigation/      # Navigation components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── MobileNav.tsx
│   │   └── shared/          # Shared components
│   │       ├── Avatar.tsx
│   │       ├── RoleBadge.tsx
│   │       └── UserMenu.tsx
│   ├── layouts/
│   │   ├── DashboardLayout.tsx
│   │   └── AuthLayout.tsx
│   └── pages/
│       ├── Dashboard.tsx
│       ├── Tasks.tsx
│       └── Reports.tsx
├── styles/
│   ├── theme.css
│   └── tailwind.css
└── lib/
    └── utils.ts
```

### Example Component: KPI Card
```tsx
import { ArrowUp, ArrowDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  color?: 'primary' | 'success' | 'info' | 'secondary' | 'danger';
}

export function KPICard({ 
  title, 
  value, 
  change, 
  trend = 'up',
  color = 'primary' 
}: KPICardProps) {
  const colorClasses = {
    primary: 'from-primary-400 to-primary-600',
    success: 'from-success-400 to-success-600',
    info: 'from-info-400 to-info-600',
    secondary: 'from-secondary-400 to-secondary-600',
    danger: 'from-danger-400 to-danger-600',
  };

  return (
    <div className={`
      relative overflow-hidden
      bg-gradient-to-br ${colorClasses[color]}
      rounded-xl
      p-6
      shadow-md hover:shadow-lg
      transition-shadow duration-250
    `}>
      <p className="text-white/80 text-sm font-medium mb-1">
        {title}
      </p>
      <p className="text-white text-3xl font-bold mb-2">
        {value}
      </p>
      {change && (
        <div className="flex items-center gap-1 text-white/90 text-sm font-medium">
          {trend === 'up' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
```

---

## Tailwind Configuration Reference

### Custom Colors in theme.css
```css
@theme inline {
  /* Primary - Orange */
  --color-primary-50: #fff7ed;
  --color-primary-100: #ffedd5;
  --color-primary-500: #ff5623;
  --color-primary-600: #ea580c;
  --color-primary-700: #c2410c;

  /* Success - Green */
  --color-success-500: #019364;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;

  /* Danger - Red */
  --color-danger-500: #f32c2c;
  --color-danger-600: #dc2626;
  --color-danger-700: #be1f1f;

  /* Info - Purple */
  --color-info-500: #987dfe;
  --color-info-600: #9333ea;
  --color-info-accent-500: #5237e6;

  /* Secondary - Yellow */
  --color-secondary-500: #feba31;
  
  /* Accent - Pink */
  --color-accent-500: #ffbee9;
  --color-accent-dark-500: #e992d7;
  
  /* Neutral */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-150: #ebf0eb;
  --color-neutral-900: #171717;
  --color-neutral-950: #101010;
}
```

### Usage in Components
```tsx
// Using color tokens
className="bg-primary-500 text-white"
className="bg-success-500 text-success-700"
className="border-danger-500"

// Using custom spacing
className="p-6 gap-4 space-y-8"

// Using custom radius
className="rounded-lg"  // 10px
className="rounded-xl"  // 12px
className="rounded-full" // pills

// Using custom shadows
className="shadow-sm hover:shadow-md"
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Set up color tokens in theme.css
- [ ] Configure typography system
- [ ] Implement spacing and layout tokens
- [ ] Add custom radius and shadow values

### Phase 2: Base Components
- [ ] Button variants (primary, secondary, outline, ghost)
- [ ] Input components (text, textarea, select)
- [ ] Card components
- [ ] Badge components

### Phase 3: Navigation
- [ ] Sidebar component
- [ ] Topbar component
- [ ] Breadcrumb component
- [ ] Mobile navigation

### Phase 4: Dashboard Components
- [ ] KPI cards
- [ ] Stats panels
- [ ] Activity feed
- [ ] Charts containers

### Phase 5: Task Management
- [ ] Task card
- [ ] Task list
- [ ] Kanban board
- [ ] Status badges

### Phase 6: Feedback & Overlays
- [ ] Toast notifications (using sonner)
- [ ] Alerts
- [ ] Modals/Dialogs
- [ ] Popovers

### Phase 7: Data Display
- [ ] Data tables
- [ ] Sortable tables
- [ ] Pagination
- [ ] Filters

### Phase 8: User Components
- [ ] Avatar
- [ ] User menu
- [ ] Role badges
- [ ] Profile cards

---

## Resources & Tools

### Design Tokens
- Use CSS custom properties for all tokens
- Implement in theme.css for Tailwind v4
- Support light/dark modes

### Icons
- **Primary**: Lucide React (`lucide-react`)
- Consistent 24px icon size for UI
- 16px for inline/small contexts
- 32px for featured elements

### Animation
- Use `motion` package (formerly Framer Motion)
- Keep animations subtle and fast (150-250ms)
- Use for micro-interactions only

### Component Library
- Base on shadcn/ui + Radix UI primitives
- Customize styling to match design system
- Maintain accessibility features

---

## Version History

**v1.0.0** - March 12, 2026
- Initial design system documentation
- Color palette based on brand guidelines
- Typography system with SF Pro
- Comprehensive component library
- Accessibility guidelines
- Responsive design patterns
