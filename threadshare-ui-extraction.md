# ThreadShare — Figma UI Extraction Document
> **Source:** `https://www.figma.com/board/08LUtQd1lH30vkSQorUJCJ/Fashion---Closet-Management`
> **Role:** Senior Frontend Engineer & UI/UX Specialist
> **Stack:** React (Vite) · Tailwind CSS · Lucide-React · Framer Motion · react-masonry-css

---

## Table of Contents

1. [Design System Tokens](#1-design-system-tokens)
2. [Typography Scale](#2-typography-scale)
3. [Spacing & Layout System](#3-spacing--layout-system)
4. [Component Inventory](#4-component-inventory)
5. [Screen-by-Screen Extraction](#5-screen-by-screen-extraction)
6. [File Structure](#6-file-structure)
7. [tailwind.config.js](#7-tailwindconfigjs)
8. [Component Specs — ItemCard](#8-component-specs--itemcard)
9. [Component Specs — InventoryGrid](#9-component-specs--inventorygrid)
10. [Component Specs — SearchBar](#10-component-specs--searchbar)
11. [Component Specs — FilterPanel](#11-component-specs--filterpanel)
12. [Component Specs — Navigation](#12-component-specs--navigation)
13. [Component Specs — OutfitComposer](#13-component-specs--outfitcomposer)
14. [Component Specs — AdminDashboard](#14-component-specs--admindashboard)
15. [Interactive States](#15-interactive-states)
16. [Responsive Breakpoints](#16-responsive-breakpoints)
17. [Data Models (MySQL-aligned Props)](#17-data-models-mysql-aligned-props)

---

## 1. Design System Tokens

### Color Palette — Material 3 Tonal System

Extracted from the Figma board's overall visual language (warm neutral base with dark primary accents).

```js
// M3 Color Tokens — ThreadShare Atelier Theme
const colors = {

  // --- PRIMARY (Deep Charcoal / Near-Black) ---
  primary:              '#1A1A1A',   // Main brand color — used in logo, headings
  onPrimary:            '#FFFFFF',
  primaryContainer:     '#2E2E2E',
  onPrimaryContainer:   '#F5F0EB',

  // --- SECONDARY (Warm Taupe) ---
  secondary:            '#7C6D62',
  onSecondary:          '#FFFFFF',
  secondaryContainer:   '#EDE0D4',
  onSecondaryContainer: '#2C1E15',

  // --- TERTIARY (Muted Mauve / Badge Color) ---
  tertiary:             '#A67C8A',
  onTertiary:           '#FFFFFF',
  tertiaryContainer:    '#E8C9D4',   // Used for RENT/SALE badge backgrounds
  onTertiaryContainer:  '#3B1220',

  // --- SURFACE TIERS (Tonal Elevation — M3) ---
  surface:              '#FDFAF7',   // Base background — warm off-white
  surface1:             '#F5F0EB',   // Cards, sidebars
  surface2:             '#EDE6DE',   // Elevated panels
  surface3:             '#E4DAD0',   // Modals
  surface4:             '#DDD1C5',   // Highest elevation
  surfaceVariant:       '#EDE0D4',   // Search bar background

  // --- ON-SURFACE ---
  onSurface:            '#1A1A1A',
  onSurfaceVariant:     '#6B5B50',

  // --- OUTLINE ---
  outline:              '#C4B4A8',
  outlineVariant:       '#E0D5CD',

  // --- SEMANTIC ---
  error:                '#B3261E',
  onError:              '#FFFFFF',
  errorContainer:       '#F9DEDC',

  // --- SCRIM / OVERLAY ---
  scrim:                'rgba(0,0,0,0.32)',
  imageOverlay:         'rgba(26,26,26,0.45)',   // Hover overlay on ItemCard
  imageOverlayLight:    'rgba(26,26,26,0.20)',   // Subtle gradient on images

  // --- STATUS BADGE COLORS ---
  badgeRent:            '#E8C9D4',   // tertiaryContainer
  badgeRentText:        '#3B1220',   // onTertiaryContainer
  badgeSale:            '#EDE0D4',   // secondaryContainer
  badgeSaleText:        '#2C1E15',

  // --- FOOTER ---
  footerBg:             '#F0E8DF',   // Slightly darker than surface
  footerText:           '#6B5B50',
  footerHeading:        '#1A1A1A',
};
```

### Extracted Hex Values from Screenshot Analysis

| Token | Hex | Usage |
|---|---|---|
| Brand Black | `#1A1A1A` | Logo, headings, primary text |
| Brand Warm White | `#FDFAF7` | Page background |
| Card Surface | `#F5F0EB` | Card background below image |
| Badge Mauve | `#E8C9D4` | RENT badge fill |
| Badge Text | `#3B1220` | RENT badge label |
| Search BG | `#EDE6DE` | Search input background |
| Muted Label | `#8A7A72` | Brand label (e.g., "SAINT LAURENT") |
| Body Text | `#4A3D36` | Item name text |
| Outline | `#C4B4A8` | Card borders, dividers |
| Footer BG | `#F0E8DF` | Footer section |
| Nav Border | `#E8DDD6` | Horizontal divider under nav |
| Overlay Dark | `rgba(26,26,26,0.5)` | Hover state image dim |
| Button Fill | `#1A1A1A` | "Quick View" CTA button |
| Button Text | `#FFFFFF` | Text on dark buttons |

---

## 2. Typography Scale

Based on Google Inter / Google Sans. M3 Type Scale applied throughout.

```css
/* Typography Tokens */

/* Headline Large — Page Titles */
.type-headline-large {
  font-family: 'Inter', sans-serif;
  font-size: 2.25rem;    /* 36px */
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #1A1A1A;
}

/* Headline Medium — Section Headers */
.type-headline-medium {
  font-size: 1.75rem;    /* 28px */
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.015em;
}

/* Title Large — Card Titles, Collection Names */
.type-title-large {
  font-size: 1.375rem;   /* 22px */
  font-weight: 600;
  line-height: 1.3;
}

/* Title Medium — Item Name on Card */
.type-title-medium {
  font-size: 1rem;       /* 16px */
  font-weight: 500;
  line-height: 1.4;
  color: #1A1A1A;
}

/* Body Medium — Descriptions */
.type-body-medium {
  font-size: 0.875rem;   /* 14px */
  font-weight: 400;
  line-height: 1.5;
  color: #4A3D36;
}

/* Label Small — Brand Name, Status Badges, Metadata */
.type-label-small {
  font-size: 0.6875rem;  /* 11px */
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8A7A72;
}

/* Label Medium — Filter Pills, Nav Links */
.type-label-medium {
  font-size: 0.8125rem;  /* 13px */
  font-weight: 500;
  letter-spacing: 0.02em;
}
```

### Figma Font Usage by Component

| Component | Text Style | Font Size | Weight |
|---|---|---|---|
| Page Title "The Curated Gallery" | Headline Large | ~36px | 600 |
| Subtitle description | Body Large | ~14px | 400 |
| Nav links (Home, My Closet…) | Label Medium | ~14px | 500 |
| Brand label (SAINT LAURENT) | Label Small | ~11px | 600 / uppercase |
| Item name (Oversized Double-Breasted…) | Title Medium | ~16px | 500 |
| Badge text (RENT) | Label Small | ~11px | 600 |
| Search placeholder | Body Medium | ~14px | 400 |
| Filter pill text | Label Medium | ~13px | 500 |
| Quick View button | Label Large | ~14px | 600 |
| Footer heading | Label Large | ~12px | 600 |
| Footer link | Body Small | ~12px | 400 |
| Admin metric value (142, $42.8k) | Display Small | ~48px | 700 |

---

## 3. Spacing & Layout System

Extracted from Figma pixel measurements.

### Base Grid

```
Base unit: 8px
Grid columns: 12 (desktop), 8 (tablet), 4 (mobile)
Page max-width: 1280px
Page horizontal padding: 32px (desktop), 24px (tablet), 16px (mobile)
```

### Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `space-0` | 0px | — |
| `space-1` | 4px | Micro gaps |
| `space-2` | 8px | Icon margins, badge padding |
| `space-3` | 12px | Badge internal padding-x |
| `space-4` | 16px | Card gap (masonry gutter) |
| `space-6` | 24px | Search bar padding-x, container margin |
| `space-8` | 32px | Page horizontal padding, section gap |
| `space-12` | 48px | Section vertical spacing |
| `space-16` | 64px | Nav height, large section gaps |

### Key Measured Dimensions (from Figma)

| Element | Width | Height | Notes |
|---|---|---|---|
| Top Navigation | 1280px | 64px | Full bleed |
| Logo text area | 137px | 32px | "ThreadShare" |
| Nav links container | 363px | 29px | 4 links with 32px gaps |
| Search bar | 384px | 47px | Right-aligned |
| Search bar (Discovery) | 848px | 76px | Centered, large |
| Masonry item card | 286px | variable | 4-col desktop |
| Masonry gap | 24px | 24px | Between columns & rows |
| Badge (RENT) | ~53px | 20px | top-left overlay |
| Save (heart) button | 40px | 40px | top-right overlay |
| Quick View button | 145px | 44px | Hover reveal, centered |
| Filter pill height | 32px / 42px | — | Small / Large variant |
| Sidebar width | 256px | 100vh | Left nav |
| Admin metric card | 288px | 216–220px | 3-col grid |
| Modal container | 1024px | 763px | Centered modal |
| Modal left panel | 461px | 700px | Product image |
| Modal right panel | 563px | 763px | Product details |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-sm` | 4px | Micro elements |
| `rounded-md` | 8px | Small badges, tags |
| `rounded-lg` | 12px | Filter pills |
| `rounded-xl` | 16px | Metric cards |
| `rounded-2xl` | 20px | Search bar (small) |
| `rounded-3xl` | 24px | **ItemCard (primary)**, modals |
| `rounded-full` | 9999px | Pill buttons, avatar |

---

## 4. Component Inventory

All reusable components identified from the 6 screens:

| # | Component | Screen(s) | Priority |
|---|---|---|---|
| 1 | `TopNav` | All | High |
| 2 | `SideNav` | My Closet, Filter, Admin | High |
| 3 | `SearchBar` | Home Feed, Discovery | High |
| 4 | `ItemCard` | Home Feed | **Critical** |
| 5 | `InventoryGrid` | Home Feed | **Critical** |
| 6 | `StatusBadge` | Home Feed, Admin | High |
| 7 | `SaveButton` | Home Feed | Medium |
| 8 | `QuickViewButton` | Home Feed (hover) | Medium |
| 9 | `FilterPill` | My Closet, Discovery, Filter | High |
| 10 | `CollectionCard` | My Closet | High |
| 11 | `OutfitComposerCanvas` | Create Outfit | High |
| 12 | `CategoryItem` | Discovery | Medium |
| 13 | `FeaturedCollectionCard` | Discovery | Medium |
| 14 | `RecentSearchItem` | Discovery | Low |
| 15 | `SuggestedBrandTag` | Discovery | Low |
| 16 | `QuickViewModal` | Item Quick View | High |
| 17 | `FilterPanel` | Filter & Sort | High |
| 18 | `PriceRangeSlider` | Filter & Sort | Medium |
| 19 | `AvailabilityToggle` | Filter & Sort | Medium |
| 20 | `AdminMetricCard` | Admin Dashboard | Medium |
| 21 | `InventoryTable` | Admin Dashboard | Medium |
| 22 | `TransactionItem` | Admin Dashboard | Low |
| 23 | `RevenueInsightCard` | Admin Dashboard | Low |
| 24 | `Footer` | Home Feed | Low |
| 25 | `UserProfileCard` | My Closet sidebar | Low |

---

## 5. Screen-by-Screen Extraction

### Screen 1: Home Feed (Masonry) — `1280×1656px`

**Purpose:** Primary marketplace gallery — curated P2P fashion rental/sale listings.

#### Layout Structure
```
┌─────────────────────────────────────────────┐
│ TopNav (64px tall, full-width)              │
│  └ Logo | Links | Icons (notif, avatar)     │
├─────────────────────────────────────────────┤
│ Header Section (32px padding)               │
│  ├ Page Title: "The Curated Gallery"        │
│  └ SearchBar (384px wide, right-aligned)    │
├─────────────────────────────────────────────┤
│ Masonry Grid (4 columns, 24px gap)          │
│  ┌─Col1──┐ ┌─Col2──┐ ┌─Col3──┐ ┌─Col4──┐  │
│  │ Card  │ │ Card  │ │ Card  │ │ Card  │  │
│  │(tall) │ │(tall) │ │(tall) │ │(tall) │  │
│  │       │ │       │ │       │ │       │  │
│  │ Card  │ │ Card  │ │ Card  │ │ Card  │  │
│  │(short)│ │(short)│ │(short)│ │(short)│  │
│  └───────┘ └───────┘ └───────┘ └───────┘  │
├─────────────────────────────────────────────┤
│ Footer (365px tall)                         │
│  ├ Logo + tagline                           │
│  └ Links: Collections | Experience | Atelier│
└─────────────────────────────────────────────┘
```

#### ItemCard Data from Figma

| # | Brand | Item Name | Badge | Image Aspect |
|---|---|---|---|---|
| 1 | Saint Laurent | Oversized Double-Breasted Wool Coat | RENT | ~3:4 portrait |
| 2 | Jacquemus | La Robe Saudade Silk Dress | RENT | ~3:4 portrait |
| 3 | Balmain | Double-Breasted Grain de Poudre Blazer | — | ~3:5 tall |
| 4 | Celine | Small 16 Bag in Satinated Calfskin | RENT | ~1:1 square |
| 5 | Alexander McQueen | Tiered Tulle Evening Gown | — | ~3:4 portrait |
| 6 | Burberry | The Waterloo Heritage Trench Coat | RENT | ~3:4 portrait |
| 7 | Prada | Point-Collar Silk Shirt | — | ~3:4 portrait |
| 8 | Manolo Blahnik | Hangisi Jewel Buckle Pumps | RENT | ~4:3 landscape |

#### Navigation Links
- **Left:** ThreadShare (logo) | Home | My Closet | Create Outfit | Inbox
- **Right:** Bell icon (notifications, 16×20px) | Avatar icon (20×20px)

#### Footer Columns
- **Col 1 (left):** Logo + tagline text
- **Collections:** The Winter Edit | Evening Gala | Archival Pieces
- **Experience:** How it Works | Lender Safety | Style Concierge
- **Atelier:** Settings | Support Center | Privacy
- **Bottom bar:** © 2024 THREADSHARE ATELIER | Instagram | Pinterest

---

### Screen 2: My Closet — Outfit Collections — `1280×1573px`

**Purpose:** Personal wardrobe manager with curated outfit collection cards.

#### Layout Structure
```
┌──────────┬───────────────────────────────────┐
│ SideNav  │ Header (search + title)           │
│ (256px)  ├───────────────────────────────────┤
│          │ Filter Pills Row                  │
│  Nav:    ├───────────────────────────────────┤
│  Home    │ Masonry Grid (2 columns, 504px ea)│
│  Closet  │  ┌─────────────┐ ┌─────────────┐ │
│  Outfit  │  │ Collection  │ │ Collection  │ │
│  Inbox   │  │ Card 1      │ │ Card 3      │ │
│          │  │ (tall)      │ │             │ │
│ ─────    │  ├─────────────┤ ├─────────────┤ │
│ User     │  │ Collection  │ │ Collection  │ │
│ Profile  │  │ Card 2      │ │ Card 4      │ │
│ Settings │  │             │ │             │ │
│ Logout   │  └─────────────┘ └─────────────┘ │
└──────────┴───────────────────────────────────┘
              FAB Button (64px) — bottom-right
```

#### SideNav Spec
- Width: `256px`, full height
- Logo: "The Atelier" — 28px heading
- Nav links: 4 items, each 44px tall, 208px wide
  - Each link: icon (18×18px) + label text, 44px left padding
- User profile card at bottom:
  - Avatar: 40×40px circle
  - Name: 16px medium
  - Email: 15px regular
  - "List an Item" button: 176px wide, 31px tall, full-width
- Settings + Logout links: 36px tall each

#### Filter Pills (Closet)
All 32px tall, pill-shaped (`rounded-full`), outlined style:
1. All Pieces (135px wide)
2. Outerwear (130px wide)
3. Evening Wear (150px wide)
4. Accessories (132px wide)
5. Ready to Rent (152px wide)

#### Collection Cards Data

| Card | Title | Description | Image Layout |
|---|---|---|---|
| 1 | The Winter Collection | "Curated minimalist staples for the modern professional." | 1 hero (280px) + 2 stacked accessories (140px ea) |
| 2 | Milan Runway Edit | "Bold colors and structured silhouettes from the Spring '24 debut." | 1 hero tall + 2 stacked |
| 3 | The Essential Archive | "Timeless pieces that define the core of a sustainable wardrobe." | 1 hero + 2 stacked |
| 4 | Parisian Nightfall | "Sophisticated evening looks that transition from dinner to gala." | 1 hero + 2 stacked |

#### Collection Card Anatomy
```
┌────────────────────────────────────────┐  ← 456px wide, rounded-3xl
│ ┌──────────────────┐ ┌────────────┐   │
│ │  Hero Image      │ │  Accessory │   │  ← Image container, 12px inner margin
│ │  (280×400px)     │ │  (140×194) │   │
│ │                  │ ├────────────┤   │
│ │                  │ │  Accessory │   │
│ │                  │ │  (140×194) │   │
│ └──────────────────┘ └────────────┘   │
├────────────────────────────────────────┤
│ Collection Title (Heading 3, 32px)     │  ← 8px left padding
│ Description (Body Medium, 20px line)   │
│ ── count text ──── [View All →]        │  ← 16px footer
└────────────────────────────────────────┘
```

---

### Screen 3: Discovery & Search — `1280×1024px`

**Purpose:** Global search and discovery of marketplace items by category, brand, occasion.

#### Layout
- Full-width top nav (1280px)
- Centered content area: 896px, 192px left margin

#### Large Search Bar Spec
- Width: 848px, Height: 76px
- Border-radius: `rounded-3xl` (24px)
- Left icon: Search icon (24px), left padding 40px
- Placeholder: "Search designers, styles, or occasions..."
- Font: 20px, medium weight

#### Filter Chips (42px tall, pill-shaped)
Each chip has label + dropdown caret icon (7×4px):
1. Size — 84px
2. Brand — 97px
3. Occasion — 122px
4. Price Range — 128px
5. Available Now — 147px

#### Trending Categories Grid
3 items, each 142×142px square with label below:
- Vintage (59px label)
- Designer (70px label)
- Wedding Guest (116px label)

#### Featured Collection Banner
- Size: 467×256px
- Dark overlay with text
- Labels: "Editor's Pick" (label small) + "The Sustainable Minimalist" (Heading 3)

#### Recent Searches Section (right column, 325px)
- "Saved" header + "Clear all" button
- 4 search items: each has clock icon + label + ✕ button
- Suggested Brands pills: Saint Laurent | Jacquemus | Celine | Burberry

---

### Screen 4: Item Quick View (Modal) — `1280×1024px`

**Purpose:** Overlay modal for item detail without leaving current page.

#### Modal Spec
- Container: 1024×763px, centered, 24px rounded corners
- Left backdrop: page content dimmed behind

#### Left Panel (Image) — 461×700px
- Full-bleed image, 24px radius top-left/bottom-left
- Signature badge (top-left): pill shape, 154×24px
  - Content: "Signature Piece" label

#### Right Panel (Details) — 563×763px
- 48px padding all sides

**Detail Blocks (top to bottom):**

```
Breadcrumb:  "Outerwear • Winter Collection"  [Label Small, 15px tall]
Item Title:  "The Midnight Cashmere Trench"   [Heading 2, 90px block]
Brand:       "SAINT LAURENT ATELIER"           [Label Small uppercase]
─────────────────────────────────────────
Size:        "Medium (IT 48)"                  [2 columns, 217px ea]
Rental Rate: "$XX / day"                       [right column]
─────────────────────────────────────────
Description: Crafted from high-grade Mongolian cashmere with silk-satin
             lining. Features classic double-breasted silhouette…
             [Body Medium, 104px text block]
─────────────────────────────────────────
Owner Info:  [48px avatar] + Name + Rating
             [Share button — 40px icon button]
─────────────────────────────────────────
CTA Row:     [Rent Now ─────────────────]  60px tall, full-width, dark
             [♡ Save to Wishlist]          35px tall, outlined
```

---

### Screen 5: Filter & Sort Panel — `1280×1024px`

**Purpose:** Slide-in panel from right for filtering the discovery/search results.

#### Panel Spec
- Width: 576px (right side), full height 1024px
- Enters from right, overlays background (dimmed)
- Border-radius: top-left + bottom-left only → 24px

#### Filter Header (136px)
- "Filters" label (small) + "The Curator" heading (28px)
- Close ✕ button (48×48px, top right)

#### Filter Sections

**1. Sort By** (98px section)
- Dropdown pill: "Relevance" + caret icon
- Width: 496px, Height: 58px

**2. Size** (128px section)
- 7 pill buttons, 2 rows
- Row 1: XS (76px) | S (68px) | M (59px) | L (61px) | XL (58px) | XXL (66px)
- Row 2: One Size (75px)
- Active state: dark filled (`#1A1A1A` bg, white text) — shown on "L"

**3. Brand** (132px section)
- 6 checkbox options in 2 columns:
  - ☐ Jacquemus | ☑ Balmain
  - ☐ Alexander McQueen | ☑ Chloé
  - ☐ Celine | ☐ Prada
- Checkbox: 20×20px, rounded-sm

**4. Occasion** (128px section)
- 4 pill buttons:
  - Wedding Guest (136px) | Business Formal (163px) | Evening Gala (143px)
  - Casual Chic (164px)

**5. Price Range Slider** (48px section)
- Label: "Price Range" + "$XX – $XX" right-aligned
- Track: 496px wide, 4px tall, `#C4B4A8`
- Active range: highlighted segment `#1A1A1A`
- Two thumb handles: 24×24px circles

**6. Availability Toggle** (32px section)
- "Available Now" label (left) + iOS-style toggle (56×32px, right)

#### Action Bar (117px, pinned bottom)
- "Reset" button: 160px wide, 52px tall, outlined
- "Show Results" button: 320px wide, 52px tall, dark filled

---

### Screen 6: Atelier Admin Dashboard — `1280×1828px`

**Purpose:** Backend management for inventory, finances, and transactions.

#### Layout
- Top nav: 1280×84px (wider than consumer nav)
- Left sidebar: 256px
- Content: 1024px

#### Admin SideNav Links (4 items)
1. Dashboard
2. Inventory
3. Orders
4. Analytics
5. Messages (5 total with divider)
- Bottom: "Add New Item" CTA button (208px wide, 52px tall)

#### Quick Overview Section (320px tall)
3 metric cards, each 288px wide:

| Card | Icon | Metric | Value | Trend |
|---|---|---|---|---|
| Total Listings | wardrobe icon | Active items | **142** | "↑ +12 this month" |
| Revenue | $ icon | Monthly revenue | **$42.8k** | "↑ Revenue" |
| Active Collections | collection icon | Live sets | **28** | "Fall Collection 2024" |

Each card anatomy:
```
┌──────────────────────────────────┐  ← 288×216px, rounded-2xl
│ ┌──────┐                 Label   │
│ │ Icon │                (small)  │  ← Icon: 48×48px surface bg
│ └──────┘                         │
│                                  │
│  142                             │  ← Display font, ~48px, bold
│                                  │
│  ↑ +12 this month                │  ← Label small with arrow
└──────────────────────────────────┘
```

#### Inventory Management Table (928×458px)

**Column Headers:**
| Column | Width | Label |
|---|---|---|
| Item | 345px | "Item Name" |
| Status | 172px | "Status" |
| Price | 153px | "Daily Rate" |
| Total Earned | 142px | "Total Earned" |
| Actions | 116px | "…" |

**Table Rows (3 items shown):**

| Item | Status Badge | Price | Earned |
|---|---|---|---|
| Midnight Cashmere Trench (Saint Laurent) | "Active" (green-ish) | $XX/day | $X,XXX |
| Milan Runway Gown | "In Transit" (amber) | $X/day | $XXX |
| Silk Evening Blazer | "Available" | $X/day | $XXX |

Row height: ~128–130px
Each row has: 56×80px thumbnail image + item name + brand label

#### Financial Tracking Section

**Transactions List (603×292px):**
3 transaction items, each 96–97px tall:
- Icon (48×48px circle) + Name + Date
- Amount right-aligned + status dot

**Revenue Insights Card (277×584px):**
```
┌─────────────────────────────┐
│ Revenue Insights (H2)       │
├─────────────────────────────┤
│ QUARTERLY GROWTH  [label]   │
│                             │
│ High Growth Period          │  ← Large display text
│                             │
│ "Inventory turnover has     │
│  increased by 14% this      │
│  month, driven by the       │
│  Wedding Season collection." │
├─────────────────────────────┤
│ Metric label     $XX,XXX    │
│ ──────────────────────────  │
│   [Generate Report]         │
└─────────────────────────────┘
```

---

## 6. File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Badge.jsx              # StatusBadge (RENT / SALE)
│   │   ├── Button.jsx             # M3 filled, outlined, text variants
│   │   ├── Checkbox.jsx           # M3 checkbox with animation
│   │   ├── Toggle.jsx             # iOS-style availability toggle
│   │   ├── Slider.jsx             # Price range dual-thumb slider
│   │   └── Avatar.jsx             # User avatar with fallback
│   │
│   ├── cards/
│   │   ├── ItemCard.jsx           # ★ Core masonry card
│   │   ├── CollectionCard.jsx     # My Closet collection grid card
│   │   ├── AdminMetricCard.jsx    # Dashboard KPI card
│   │   └── CategoryItem.jsx      # Discovery trend circle
│   │
│   ├── layout/
│   │   ├── TopNav.jsx             # Consumer top navigation
│   │   ├── AdminTopNav.jsx        # Admin top navigation
│   │   ├── SideNav.jsx            # Consumer sidebar
│   │   ├── AdminSideNav.jsx       # Admin sidebar
│   │   └── Footer.jsx             # Site footer
│   │
│   ├── grids/
│   │   ├── InventoryGrid.jsx      # ★ Masonry wrapper
│   │   └── CollectionGrid.jsx     # 2-col collection grid
│   │
│   ├── search/
│   │   ├── SearchBar.jsx          # Reusable search input
│   │   └── FilterPill.jsx         # Single filter chip/pill
│   │
│   ├── filters/
│   │   ├── FilterPanel.jsx        # Slide-in filter sidebar
│   │   ├── PriceSlider.jsx        # Dual-thumb price range
│   │   └── SizeGrid.jsx           # Size selection pills
│   │
│   ├── modals/
│   │   ├── QuickViewModal.jsx     # Item detail overlay
│   │   └── ModalBackdrop.jsx     # Scrim with close handler
│   │
│   ├── outfit/
│   │   └── OutfitComposer.jsx    # Drag-and-drop canvas
│   │
│   └── admin/
│       ├── InventoryTable.jsx    # Admin item table
│       ├── TransactionItem.jsx   # Single transaction row
│       └── RevenueCard.jsx       # Revenue insights
│
├── hooks/
│   ├── useMasonry.js             # Column calculation logic
│   ├── useFilter.js              # Filter state management
│   ├── useOutfitComposer.js      # DnD and z-index logic
│   └── useModal.js               # Modal open/close state
│
├── styles/
│   ├── globals.css               # CSS custom properties (M3 tokens)
│   └── animations.css            # Framer Motion presets
│
├── lib/
│   ├── constants.js              # M3 color tokens, spacing scale
│   └── utils.js                  # cn() classname helper
│
├── tailwind.config.js            # Custom M3 theme
└── vite.config.js
```

---

## 7. tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // ─── M3 Color Palette ───────────────────────────────────
      colors: {
        primary: {
          DEFAULT:   '#1A1A1A',
          container: '#2E2E2E',
          on:        '#FFFFFF',
          'on-container': '#F5F0EB',
        },
        secondary: {
          DEFAULT:   '#7C6D62',
          container: '#EDE0D4',
          on:        '#FFFFFF',
          'on-container': '#2C1E15',
        },
        tertiary: {
          DEFAULT:   '#A67C8A',
          container: '#E8C9D4',
          on:        '#FFFFFF',
          'on-container': '#3B1220',
        },
        surface: {
          DEFAULT: '#FDFAF7',
          1:       '#F5F0EB',
          2:       '#EDE6DE',
          3:       '#E4DAD0',
          4:       '#DDD1C5',
          variant: '#EDE0D4',
        },
        'on-surface': {
          DEFAULT: '#1A1A1A',
          variant: '#6B5B50',
        },
        outline: {
          DEFAULT: '#C4B4A8',
          variant: '#E0D5CD',
        },
        error: {
          DEFAULT:   '#B3261E',
          container: '#F9DEDC',
        },
        footer: '#F0E8DF',
        scrim: 'rgba(0,0,0,0.32)',
      },

      // ─── M3 Typography ─────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-sm':     ['2.25rem',  { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'headline-lg':    ['2rem',     { lineHeight: '1.2',  letterSpacing: '-0.02em' }],
        'headline-md':    ['1.75rem',  { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        'headline-sm':    ['1.5rem',   { lineHeight: '1.3' }],
        'title-lg':       ['1.375rem', { lineHeight: '1.3', fontWeight: '600' }],
        'title-md':       ['1rem',     { lineHeight: '1.4', fontWeight: '500' }],
        'title-sm':       ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body-lg':        ['1rem',     { lineHeight: '1.5' }],
        'body-md':        ['0.875rem', { lineHeight: '1.5' }],
        'body-sm':        ['0.75rem',  { lineHeight: '1.5' }],
        'label-lg':       ['0.875rem', { lineHeight: '1.25', letterSpacing: '0.006em', fontWeight: '500' }],
        'label-md':       ['0.8125rem',{ lineHeight: '1.25', letterSpacing: '0.02em',  fontWeight: '500' }],
        'label-sm':       ['0.6875rem',{ lineHeight: '1.3',  letterSpacing: '0.06em',  fontWeight: '600' }],
      },

      // ─── Spacing (8px base grid) ─────────────────────────
      spacing: {
        '4.5': '1.125rem',  // 18px
        '13':  '3.25rem',   // 52px
        '18':  '4.5rem',    // 72px
        '22':  '5.5rem',    // 88px
        '26':  '6.5rem',    // 104px
        '30':  '7.5rem',    // 120px
      },

      // ─── Border Radius (M3 Shapes) ───────────────────────
      borderRadius: {
        'xs':   '4px',
        'sm':   '8px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '20px',
        '2xl':  '24px',   // Card primary radius
        '3xl':  '28px',   // Button pill
        '4xl':  '32px',
      },

      // ─── Box Shadow (M3 Tonal Elevation) ─────────────────
      boxShadow: {
        'elevation-1': '0px 1px 2px rgba(0,0,0,0.08)',
        'elevation-2': '0px 2px 6px rgba(0,0,0,0.10)',
        'elevation-3': '0px 4px 12px rgba(0,0,0,0.12)',
        'elevation-4': '0px 8px 24px rgba(0,0,0,0.14)',
        'modal':       '0px 16px 48px rgba(0,0,0,0.18)',
      },

      // ─── Animation ────────────────────────────────────────
      transitionTimingFunction: {
        'm3-standard':    'cubic-bezier(0.2, 0, 0, 1)',
        'm3-decelerate':  'cubic-bezier(0, 0, 0, 1)',
        'm3-accelerate':  'cubic-bezier(0.3, 0, 1, 1)',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to:   { transform: 'scale(1)',    opacity: '1' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 300ms cubic-bezier(0,0,0,1)',
        'fade-in':        'fade-in 200ms ease',
        'scale-in':       'scale-in 300ms cubic-bezier(0.2,0,0,1)',
      },

      // ─── Max Width ────────────────────────────────────────
      maxWidth: {
        'page':  '1280px',
        'modal': '1024px',
        'panel': '576px',
        'sidebar': '256px',
      },
    },
  },
  plugins: [],
};
```

---

## 8. Component Specs — ItemCard

### Visual Anatomy

```
┌─────────────────────────────────────────────┐  ← 286px wide (desktop col)
│ ┌─────────────────────────────────────────┐ │  ← rounded-2xl (24px)
│ │                                         │ │
│ │  [RENT]          [♡ Save]               │ │  ← overlay badges (z-10)
│ │  badge           icon-btn               │ │
│ │  top-left        top-right              │ │
│ │                                         │ │
│ │  <Image>                                │ │  ← variable height, fills width
│ │  (aspect dictated by source image)      │ │
│ │                                         │ │
│ │  ┌───────────────────────────────────┐  │ │  ← hover reveal (opacity transition)
│ │  │  [Quick View →]                   │  │ │
│ │  └───────────────────────────────────┘  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│  SAINT LAURENT              [label-small]   │  ← 8px left padding
│  Oversized Double-Breasted  [title-medium]  │
│  Wool Coat                                  │
└─────────────────────────────────────────────┘
```

### Props Interface

```typescript
interface ItemCardProps {
  item_name:     string;          // "Oversized Double-Breasted Wool Coat"
  brand:         string;          // "SAINT LAURENT"
  price_per_day: number;          // 85 (USD)
  status:        'rent' | 'sale' | 'sold' | 'unavailable';
  image_url:     string;          // Cloudinary URL
  image_aspect?: number;          // height / width ratio (optional, for skeleton)
  item_id:       string | number; // MySQL primary key
  is_saved?:     boolean;         // Wishlist state
  onSave?:       () => void;
  onQuickView?:  () => void;
}
```

### Tailwind Classes Reference

```jsx
// Card container
"group relative rounded-2xl overflow-hidden bg-surface-1 cursor-pointer
 transition-all duration-300 ease-m3-standard
 hover:shadow-elevation-3"

// Image wrapper
"relative w-full overflow-hidden rounded-2xl"

// Image element
"w-full h-auto object-cover block
 transition-transform duration-400 ease-m3-standard
 group-hover:scale-[1.03]"

// Image overlay (hover dim)
"absolute inset-0 bg-primary/0 rounded-2xl
 transition-colors duration-300
 group-hover:bg-primary/40"

// RENT badge
"absolute top-3 left-3 z-10
 px-3 py-1 rounded-full
 bg-tertiary-container text-on-tertiary-container
 text-label-sm tracking-widest"

// Save button
"absolute top-3 right-3 z-10
 w-10 h-10 rounded-full
 bg-surface/80 backdrop-blur-sm
 flex items-center justify-center
 hover:bg-surface active:scale-95
 transition-all duration-200"

// Quick View button (hover reveal)
"absolute bottom-6 left-1/2 -translate-x-1/2 z-10
 px-6 py-2.5 rounded-3xl
 bg-primary text-on-primary text-label-lg
 opacity-0 translate-y-2
 group-hover:opacity-100 group-hover:translate-y-0
 transition-all duration-300 ease-m3-decelerate
 whitespace-nowrap"

// Info block
"pt-3 pb-1 px-2"

// Brand label
"text-label-sm text-on-surface-variant uppercase tracking-widest mb-1"

// Item name
"text-title-md text-on-surface leading-snug"
```

### Framer Motion Variants

```js
export const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0, 0, 1] } },
};

export const overlayVariants = {
  rest:  { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.25 } },
};

export const quickViewVariants = {
  rest:  { opacity: 0, y: 8 },
  hover: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0, 0, 0, 1] } },
};

export const imageVariants = {
  rest:  { scale: 1 },
  hover: { scale: 1.04, transition: { duration: 0.5, ease: [0.2, 0, 0, 1] } },
};
```

---

## 9. Component Specs — InventoryGrid

### Masonry Configuration

```jsx
// react-masonry-css breakpoints
const breakpointColumns = {
  default: 4,   // 1280px+ desktop — 4 columns × 286px + 3 × 24px gaps
  1280:    4,
  1024:    3,   // Tablet landscape
  768:     2,   // Tablet portrait / mobile landscape
  640:     2,
  480:     1,   // Mobile portrait
};

// Gap: 16px (Figma shows 24px; use 16px as M3-standard)
const masonryGap = "16px";
```

### Stagger Animation (Framer Motion)

```js
export const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
};
```

### Column Width Math (Desktop)

```
Page width:       1280px
Horizontal pad:   32px × 2 = 64px
Available width:  1280 - 64 = 1216px
Gaps:             3 × 24px  = 72px  (between 4 columns)
Column width:     (1216 - 72) / 4 = 286px ✓  (matches Figma exactly)
```

---

## 10. Component Specs — SearchBar

### Two Variants

**Small (Home Feed) — 384×47px**
```
┌────────────────────────────────────────────────┐  ← rounded-3xl, bg-surface-2
│  🔍  Search the collection...           [≡]    │
│  24px icon | 288px input area    | filter icon │
│  left pad: 24px                  | right: 18px │
└────────────────────────────────────────────────┘
```

**Large (Discovery) — 848×76px**
```
┌──────────────────────────────────────────────────────────┐  ← rounded-3xl
│   🔍   Search designers, styles, or occasions...         │
│   40px  | centered text, 20px font                       │
└──────────────────────────────────────────────────────────┘
```

### Props
```typescript
interface SearchBarProps {
  placeholder: string;
  variant:     'small' | 'large';
  value:       string;
  onChange:    (v: string) => void;
  onFilter?:   () => void;   // Opens FilterPanel
}
```

---

## 11. Component Specs — FilterPanel

### Slide-in Panel

```typescript
interface FilterState {
  sortBy:        'relevance' | 'price_asc' | 'price_desc' | 'newest';
  sizes:         string[];           // ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']
  brands:        string[];
  occasions:     string[];
  priceRange:    [number, number];   // [min, max]
  availableOnly: boolean;
}
```

### Entry Animation (Framer Motion)
```js
const panelVariants = {
  hidden:  { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1,  transition: { duration: 0.3, ease: [0, 0, 0, 1] } },
  exit:    { x: '100%', opacity: 0, transition: { duration: 0.25, ease: [0.3, 0, 1, 1] } },
};
```

---

## 12. Component Specs — Navigation

### TopNav (Consumer)

```
Height: 64px
Padding: 0 32px
Background: surface (#FDFAF7), border-bottom: 1px solid outline-variant

Left cluster (547px total):
  - Logo "ThreadShare" — 137px, font 20px bold
  - Nav links — 363px, gap ~32px
    - Home (47px)
    - My Closet (76px)
    - Create Outfit (101px)
    - Inbox (43px)

Right cluster:
  - Notification bell icon: 16×20px
  - Gap: 40px
  - Avatar/user icon: 20×20px
```

### SideNav (Consumer, 256px)

```
position: fixed left-0, full height
background: surface-1 (#F5F0EB)
border-right: 1px solid outline-variant

Sections:
  1. Logo block (top 24px, 208px wide): "The Atelier" h1 + "12 items" subtitle
  2. Nav links (92px–300px): 4 links × 44px, 24px left icon margin
  3. User profile (bottom area):
      - Profile card: 208px × 111px surface bg
        - Avatar (40×40) + Name (16px) + Email (15px)
        - "List an Item" btn: full width, 31px
      - Settings link (36px)
      - Logout link (36px)
```

---

## 13. Component Specs — OutfitComposer

### Canvas Spec
- Background: `surface-1` (`#F5F0EB`) with dot-grid overlay
- Dot-grid: 1px dots, 24px spacing, color `outline-variant` (`#E0D5CD`)
- Canvas area fills remaining viewport after sidebar

### Dot Grid CSS
```css
.outfit-canvas {
  background-color: #F5F0EB;
  background-image: radial-gradient(circle, #C4B4A8 1px, transparent 1px);
  background-size: 24px 24px;
}
```

### DnD Hook Interface
```typescript
interface UseOutfitComposer {
  items:          PlacedItem[];
  addItem:        (item: InventoryItem) => void;
  removeItem:     (id: string) => void;
  moveItem:       (id: string, x: number, y: number) => void;
  bringToFront:   (id: string) => void;
  sendToBack:     (id: string) => void;
  maxZIndex:      number;
}

interface PlacedItem {
  id:         string;
  item_id:    string;
  image_url:  string;
  x:          number;
  y:          number;
  width:      number;
  zIndex:     number;
  rotation:   number;
}
```

---

## 14. Component Specs — AdminDashboard

### AdminMetricCard

```typescript
interface AdminMetricCardProps {
  label:     string;     // "Total Listings"
  value:     string;     // "142" or "$42.8k"
  trend?:    string;     // "↑ +12 this month"
  trendType?: 'up' | 'down' | 'neutral';
  icon:      LucideIcon;
}
```

### InventoryTable

```typescript
interface InventoryItem {
  item_id:       string;
  item_name:     string;
  brand:         string;
  thumbnail_url: string;
  status:        'active' | 'in_transit' | 'available' | 'archived';
  price_per_day: number;
  total_earned:  number;
}
```

Status badge colors:
- `active` → `bg-green-100 text-green-800`
- `in_transit` → `bg-amber-100 text-amber-800`
- `available` → `bg-surface-2 text-on-surface-variant`
- `archived` → `bg-outline/30 text-on-surface-variant`

---

## 15. Interactive States

### Button States

| State | Primary (Filled) | Outlined | Text |
|---|---|---|---|
| Default | `bg-primary text-on-primary` | `border border-outline text-primary` | `text-primary` |
| Hover | `bg-primary/90` | `bg-primary/8` | `bg-primary/8` |
| Active | `bg-primary/80 scale-[0.98]` | `bg-primary/12` | `bg-primary/12` |
| Focused | `ring-2 ring-primary/40 ring-offset-1` | same | same |
| Disabled | `bg-on-surface/12 text-on-surface/38 cursor-not-allowed` | `border-on-surface/12 text-on-surface/38` | `text-on-surface/38` |

### ItemCard States

| State | Behavior |
|---|---|
| Default | Image + badge + info visible |
| Hover | Image scales 1.04×, overlay dims, Quick View + Save revealed |
| Active | scale(0.99) on card |
| Saved | Heart icon fills (solid), color → `tertiary` |
| Loading | Skeleton shimmer matching card shape |

### Filter Pill States

| State | Tailwind |
|---|---|
| Default | `border border-outline text-on-surface bg-transparent` |
| Selected | `bg-secondary-container text-on-secondary-container border-secondary-container` |
| Hover | `bg-on-surface/8` |
| Active | `bg-on-surface/12` |

### Save Button States

```jsx
// Default
"bg-surface/70 backdrop-blur-sm text-on-surface"
// Hover
"bg-surface text-on-surface"
// Saved (active)
"bg-tertiary-container text-tertiary"
// Animation: heart icon scale bounce on toggle
```

---

## 16. Responsive Breakpoints

### Grid Columns

| Breakpoint | Screen Width | Masonry Columns | Column Width |
|---|---|---|---|
| `xs` | < 480px | 1 | ~100% |
| `sm` | 480–767px | 2 | ~calc(50% - 8px) |
| `md` | 768–1023px | 2 | ~calc(50% - 8px) |
| `lg` | 1024–1279px | 3 | ~calc(33% - 11px) |
| `xl` | 1280px+ | 4 | 286px |
| `2xl` | 1536px+ | 5 | ~280px |

### Navigation Breakpoints

| Breakpoint | Behavior |
|---|---|
| < 768px | SideNav hidden, TopNav collapses to hamburger |
| 768–1024px | SideNav becomes icon-only (56px) |
| 1024px+ | Full SideNav (256px) + TopNav |

### Search Bar

| Breakpoint | Width | Behavior |
|---|---|---|
| Mobile | 100% (with px-4) | Below page title, full width |
| Tablet | 60% | Right-aligned |
| Desktop | 384px | Right-aligned in header |

### Filter Panel

| Breakpoint | Behavior |
|---|---|
| Mobile | Modal Bottom Sheet (slides up from bottom, full width) |
| Tablet+ | Side Panel (576px, slides from right) |

---

## 17. Data Models (MySQL-aligned Props)

### items table → ItemCard props

```sql
-- MySQL table structure mapping to React props
CREATE TABLE items (
  item_id        INT PRIMARY KEY AUTO_INCREMENT,
  item_name      VARCHAR(255) NOT NULL,      -- → item_name prop
  brand          VARCHAR(100) NOT NULL,      -- → brand prop
  price_per_day  DECIMAL(8,2),              -- → price_per_day prop
  status         ENUM('rent','sale','sold','unavailable') DEFAULT 'rent', -- → status prop
  image_url      TEXT NOT NULL,              -- → image_url prop
  image_aspect   DECIMAL(4,3),              -- → image_aspect prop (height/width)
  description    TEXT,
  size           VARCHAR(20),
  occasion       VARCHAR(100),
  owner_id       INT,
  created_at     TIMESTAMP DEFAULT NOW()
);
```

### collections table → CollectionCard props

```sql
CREATE TABLE collections (
  collection_id  INT PRIMARY KEY AUTO_INCREMENT,
  title          VARCHAR(255) NOT NULL,     -- "The Winter Collection"
  description    TEXT,                      -- Card subtitle text
  item_count     INT DEFAULT 0,
  hero_image_url TEXT,
  owner_id       INT,
  created_at     TIMESTAMP DEFAULT NOW()
);
```

### users table → UserProfileCard props

```sql
CREATE TABLE users (
  user_id        INT PRIMARY KEY AUTO_INCREMENT,
  display_name   VARCHAR(100),
  email          VARCHAR(255),
  avatar_url     TEXT,
  member_tier    ENUM('standard','elite','atelier') DEFAULT 'standard',
  rating         DECIMAL(3,2),
  created_at     TIMESTAMP DEFAULT NOW()
);
```

### transactions table → TransactionItem props

```sql
CREATE TABLE transactions (
  transaction_id INT PRIMARY KEY AUTO_INCREMENT,
  item_id        INT,
  renter_id      INT,
  lender_id      INT,
  amount         DECIMAL(8,2),
  status         ENUM('pending','active','completed','cancelled'),
  start_date     DATE,
  end_date       DATE,
  created_at     TIMESTAMP DEFAULT NOW()
);
```

---

## Appendix: Quick Reference Cheatsheet

### Core Measurement Summary

```
Nav height:            64px
Sidebar width:         256px
Page max-width:        1280px
Page horizontal pad:   32px
Section gap:           24px (masonry) / 32px (sections)
Card border-radius:    24px (rounded-2xl)
Button border-radius:  28px (rounded-3xl) / pill
Badge border-radius:   full (rounded-full)
Badge size:            ~53×20px
Save button:           40×40px
Quick View button:     145×44px
Filter pill height:    32px (small) / 42px (large)
Admin metric card:     288×216px
Modal width:           1024px
Filter panel width:    576px
```

### Icon Sizes

| Context | Size |
|---|---|
| Nav icons (bell, avatar) | 16–20px |
| Sidebar nav icons | 18–22px |
| Search icon | 18px (small) / 24px (large) |
| Card action icons (save, share) | 14–16px |
| Admin badge icons | 20px in 48×48px container |
| Filter caret | 7×4px |

### Package Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.0.0",
    "react-masonry-css": "^1.0.16",
    "lucide-react": "^0.400.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

*Document generated from Figma Board: Fashion & Closet Management (ThreadShare)*
*File key: `08LUtQd1lH30vkSQorUJCJ` | Extracted: April 2026*
