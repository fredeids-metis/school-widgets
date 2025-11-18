# School Widgets - CSS Architecture

## 📐 Overview

This document describes the modular CSS architecture for school widgets. The architecture allows for:

- **Zero CSS duplication** across widgets
- **Easy branding** - create new school themes in minutes
- **Modular components** - reuse modal, accordion, and other UI components
- **Scalability** - add new widgets without duplicating CSS
- **Maintainability** - single source of truth for shared styles

## 🗂️ Directory Structure

```
school-widgets/
├── shared/                          # Shared CSS modules
│   ├── base.css                     # Base variables & resets
│   ├── brand/
│   │   └── bergen-private-gymnas.css  # School-specific branding
│   └── components/
│       ├── modal.css                # Shared modal component
│       └── accordion.css            # Shared accordion component
│
├── widgets/                         # Widget source code
│   ├── programfag-katalog/
│   │   └── src/
│   │       ├── catalog.js          # Widget logic
│   │       └── catalog.css         # Widget-specific CSS only
│   └── programfag-velger/
│       └── src/
│           ├── velger.js           # Widget logic
│           └── velger.css          # Widget-specific CSS only
│
├── docs/                            # Deployed/published files
│   └── widgets/
│       ├── programfag-katalog/v1/
│       │   ├── catalog.js          # Widget logic
│       │   └── styles.css          # Bundled CSS (base + brand + components + widget)
│       └── programfag-velger/v1/
│           ├── velger.js           # Widget logic
│           └── styles.css          # Bundled CSS (base + brand + components + widget)
│
└── scripts/
    └── build-css.js                # CSS bundling script
```

## 🎨 CSS Modules

### 1. Base CSS (`shared/base.css`)

Defines CSS variables and basic resets that all widgets use.

**Contains:**
- CSS custom properties (colors, spacing, typography)
- Global resets (box-sizing, margins)
- Reusable design tokens

**Variables defined:**
```css
--primary-color
--primary-hover
--secondary-color
--font-family
--radius-sm, --radius-md, --radius-lg
--spacing-xs, --spacing-sm, --spacing-md, --spacing-lg
--transition-fast, --transition-normal, --transition-slow
```

### 2. Brand CSS (`shared/brand/{school-id}.css`)

School-specific color overrides and custom styling.

**Example:** `bergen-private-gymnas.css` sets:
```css
:root {
  --primary-color: #1F4739;     /* Dark green */
  --primary-hover: #163529;     /* Darker green */
  --secondary-color: #E8F5A3;   /* Light lime */
}
```

**To add a new school:**
1. Copy an existing brand file
2. Rename to match school ID
3. Adjust color variables
4. Update `scripts/build-css.js` to reference new brand

### 3. Component CSS (`shared/components/`)

Reusable UI components shared across multiple widgets.

**Current components:**
- **modal.css** - Modal dialog, backdrop, close button, content layout
- **accordion.css** - Collapsible sections (used for kompetansemål)

**When to add a component:**
- Used by 2+ widgets
- Self-contained UI pattern
- Has clear reusable styling

### 4. Widget CSS (`widgets/{widget-name}/src/{widget-name}.css`)

Widget-specific styles that are NOT reused.

**Contains:**
- Widget container styles
- Unique layouts and grids
- Widget-specific interactions
- Responsive breakpoints

**Should NOT contain:**
- Duplicate CSS from other widgets
- Hardcoded colors (use CSS variables)
- Modal or accordion styles (use shared components)

## 🔨 Build Process

### Running the Build

```bash
cd /path/to/school-widgets
node scripts/build-css.js
```

### What the Build Does

1. Reads all shared modules (base, brand, components)
2. Reads widget-specific CSS
3. Bundles them in correct order:
   - Base CSS (variables & resets)
   - Brand CSS (school colors)
   - Components (if widget uses them)
   - Widget-specific styles
4. Writes bundled CSS to `docs/widgets/{widget}/v1/styles.css`
5. Adds header comment with build timestamp and manifest

### Build Output

```css
/**
 * programfag-katalog - Bundled CSS
 * Generated: 2025-11-18T11:46:31.972Z
 * School: bergen-private-gymnas
 *
 * Bundle includes:
 * - base.css (variables & resets)
 * - brand CSS (bergen-private-gymnas)
 * - modal.css (shared modal component)
 * - accordion.css (shared accordion component)
 * - programfag-katalog.css (widget-specific styles)
 */

/* ========================================
   BASE STYLES & VARIABLES
   ======================================== */

:root {
  --primary-color: #1F4739;
  /* ... */
}

/* ... rest of bundled CSS ... */
```

## 🆕 Adding a New Widget

### Step 1: Create Widget Files

```bash
mkdir -p widgets/my-new-widget/src
touch widgets/my-new-widget/src/my-new-widget.js
touch widgets/my-new-widget/src/my-new-widget.css
```

### Step 2: Write Widget-Specific CSS

In `my-new-widget.css`, use CSS variables from base.css:

```css
/**
 * My New Widget - Widget-specific styling
 *
 * This file contains ONLY widget-specific styles.
 * Shared styles (base, brand, modal, accordion) are included via build script.
 */

.my-widget-container {
  max-width: 1200px;
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--radius-lg);
  font-family: var(--font-family);
}

.my-widget-button {
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.my-widget-button:hover {
  background: var(--primary-hover);
}
```

### Step 3: Update Build Script

Edit `scripts/build-css.js`:

```javascript
// Add to main() function:
buildWidget('my-new-widget', true, false);  // uses modal, no accordion
```

Parameters:
- Widget name
- Uses modal? (true/false)
- Uses accordion? (true/false)

### Step 4: Build and Deploy

```bash
node scripts/build-css.js
```

This creates `docs/widgets/my-new-widget/v1/styles.css` with all needed styles bundled.

## 🏫 Adding a New School Brand

### Step 1: Create Brand File

```bash
cp shared/brand/bergen-private-gymnas.css shared/brand/new-school.css
```

### Step 2: Customize Colors

Edit `new-school.css`:

```css
:root {
  --primary-color: #FF5733;      /* Your school's primary color */
  --primary-hover: #CC4529;      /* Darker variant for hover */
  --secondary-color: #FFC300;    /* Accent color */
}
```

### Step 3: Update Build Script

Edit `scripts/build-css.js`:

```javascript
// Change at top of file:
const SCHOOL_ID = 'new-school';  // or make it configurable
```

### Step 4: Rebuild

```bash
SCHOOL_ID=new-school node scripts/build-css.js
```

Or update the script to accept school ID as argument.

## 📊 Benefits

### Before Modular Architecture

```
programfag-katalog/styles.css:   595 lines (includes modal + accordion)
programfag-velger/styles.css:   1215 lines (includes modal + accordion)
TOTAL:                          1810 lines
DUPLICATION:                    ~370 lines (modal + accordion duplicated)
```

### After Modular Architecture

```
Shared Modules:
  base.css:               71 lines
  bergen-private-gymnas:  42 lines
  modal.css:             295 lines
  accordion.css:         137 lines

Widget-Specific CSS:
  catalog.css:           221 lines
  velger.css:            840 lines

Bundled Output:
  katalog bundle:        558 lines
  velger bundle:        1398 lines

TOTAL (shared + widgets):  1606 lines
NO DUPLICATION:           Modals and accordions defined once
```

### Scalability Example

**Adding a 3rd widget:**

**Before:**
- Copy 370 lines of modal + accordion CSS again
- Total: 1810 + 600 (new widget) = 2410 lines
- Duplication: 740 lines

**After:**
- Write only widget-specific CSS (~300 lines)
- Reuse shared components
- Total: 1606 + 300 = 1906 lines
- Duplication: 0 lines

**Savings: 504 lines (21% reduction)**

## 🔍 Troubleshooting

### Modal styles not working

1. Check widget uses modal in build script: `buildWidget('my-widget', true, false)`
2. Rebuild CSS: `node scripts/build-css.js`
3. Verify bundled CSS includes modal section

### Colors not applying

1. Check brand CSS is loaded in build
2. Verify widget CSS uses CSS variables (e.g., `var(--primary-color)`)
3. Don't use hardcoded colors in widget CSS

### Fonts look different

Ensure modal uses font-family override:

```css
.programfag-modal,
.programfag-modal * {
  font-family: var(--font-family) !important;
}
```

## 📝 Best Practices

### DO ✅

- Use CSS variables from base.css
- Keep widget CSS minimal and specific
- Extract reusable components to shared/components/
- Run build script after CSS changes
- Use semantic variable names

### DON'T ❌

- Hardcode colors in widget CSS
- Duplicate component CSS across widgets
- Skip the build step
- Modify bundled files in docs/ directly
- Override --primary-color in widget CSS (use brand CSS)

## 🚀 Deployment

### Local Development

```bash
# Start local server for testing
cd school-widgets
python3 -m http.server 8000

# Open test page
open http://localhost:8000/test-modular-css.html
```

### Production Deployment

1. Run build: `node scripts/build-css.js`
2. Commit changes to `docs/` directory
3. Push to GitHub
4. Files available via CDN:
   - `https://fredeids-metis.github.io/school-widgets/widgets/{widget}/v1/styles.css`
   - `https://fredeids-metis.github.io/school-widgets/widgets/{widget}/v1/{widget}.js`

## 🎯 Future Enhancements

1. **CSS Minification** - Reduce bundle size in production
2. **Multi-school Support** - Build multiple brand bundles
3. **Component Library** - Add buttons, forms, cards as shared components
4. **Theme Variants** - Light/dark mode support
5. **Build Automation** - GitHub Actions to rebuild on commit
6. **Source Maps** - Map bundled CSS back to source files

---

**Last Updated:** 2025-11-18
**Maintained By:** Fredrik (@fredeids-metis)
