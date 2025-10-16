# Component Architecture Documentation

## Overview

This website uses a JavaScript-based component system to manage the global header and footer. Instead of duplicating header/footer HTML across all 16 pages, we use a centralized component loader that injects these elements dynamically.

## Why Components?

**Before (Manual Duplication):**
- Header HTML manually copied to all 16 pages
- Changing the navigation meant editing 16 files
- High risk of inconsistency and human error

**After (Component System):**
- Header HTML exists in ONE file (`/src/components/header.html`)
- Changing navigation = edit 1 file, updates everywhere
- Zero duplication, guaranteed consistency

## Architecture

### File Structure

```
src/
├── components/
│   ├── header.html          # Global header component
│   └── footer.html          # Global footer component
├── scripts/
│   ├── component-loader.js  # Core component loading system
│   └── main.js             # Header interactivity (mobile menu)
└── pages/
    ├── index.html          # Uses components
    ├── about.html          # Uses components
    └── ...                 # All pages use components
```

### How It Works

1. **Component Files** (`/src/components/`)
   - Standalone HTML fragments (no `<html>`, `<head>`, or `<body>` tags)
   - Just the pure component markup
   - Example: `header.html` contains only `<header>...</header>`

2. **Component Loader** (`component-loader.js`)
   - JavaScript class that fetches components via `fetch()` API
   - Automatically detects correct path based on page location
   - Injects HTML into placeholder `<div>` elements
   - Dispatches custom event when components are loaded

3. **Page Integration**
   - Each page includes: `<script src="../scripts/component-loader.js"></script>`
   - Placeholders: `<div id="header-root"></div>` and `<div id="footer-root"></div>`
   - Components load automatically when page loads

## The Component Loader Class

### Key Features

```javascript
class ComponentLoader {
  // Automatically detects correct path based on page depth
  getComponentsPath() {
    // /pages/ → '../components/'
    // /blog/ → '../../components/'
    // /legal/ → '../../components/'
  }

  // Fetches component HTML and injects into target element
  async loadComponent(name, targetId) {
    // fetch() → innerHTML injection
  }

  // Sets active navigation link based on current page
  setActiveNavLink() {
    // Adds 'active' class to matching nav link
  }

  // Loads all components in parallel
  async loadAllComponents() {
    // Promise.all([header, footer])
    // Dispatches 'componentsLoaded' event
  }
}
```

### Path Detection Logic

The loader automatically calculates the correct relative path:

| Page Location | Path to Components |
|--------------|-------------------|
| `/src/pages/index.html` | `../components/` |
| `/src/pages/blog/index.html` | `../../components/` |
| `/src/pages/legal/privacy-policy.html` | `../../components/` |

This means **you never have to think about paths** when adding new pages.

## Adding Components to a New Page

### Step 1: Include the Script

Add to your `<head>` section:

```html
<head>
  <!-- Your other head content -->
  <script src="../scripts/component-loader.js"></script>
</head>
```

**Important:** Adjust the path based on directory depth:
- Root `/pages/`: `../scripts/component-loader.js`
- `/blog/` or `/legal/`: `../../scripts/component-loader.js`

### Step 2: Add Placeholders

Add these `<div>` elements where you want components to appear:

```html
<body>
  <!-- Header placeholder -->
  <div id="header-root"></div>

  <!-- Your page content -->
  <main>
    <!-- ... -->
  </main>

  <!-- Footer placeholder (before closing </body>) -->
  <div id="footer-root"></div>
</body>
```

### Step 3: That's It!

The component loader will:
- ✅ Automatically detect the correct component path
- ✅ Fetch `header.html` and inject it into `#header-root`
- ✅ Fetch `footer.html` and inject it into `#footer-root`
- ✅ Highlight the active navigation link based on the page
- ✅ Dispatch `componentsLoaded` event for other scripts

## Event System

The component loader dispatches a custom event when components finish loading:

```javascript
// Other scripts can wait for components to be ready
window.addEventListener('componentsLoaded', () => {
  console.log('Header and footer are now in the DOM');
  // Initialize functionality that depends on header/footer
});
```

**Example:** `main.js` uses this to initialize mobile menu functionality:

```javascript
window.addEventListener('componentsLoaded', () => {
  initializeHeaderFunctionality();
});
```

## Active Navigation Highlighting

The component loader automatically adds the `active` class to the correct navigation link based on the current page.

**How it works:**

1. Navigation links in `header.html` have `data-page` attributes:
   ```html
   <a href="/src/pages/index.html" data-page="home">Home</a>
   <a href="/src/pages/blog/index.html" data-page="blog">Blog</a>
   ```

2. The loader detects the current page from the URL pathname
3. Adds `active` class to the matching link

**Result:** The current page is highlighted in the navigation automatically.

## Editing Components

### To Change the Header:

1. Edit `/src/components/header.html`
2. Save the file
3. Refresh any page → header updates everywhere

### To Change the Footer:

1. Edit `/src/components/footer.html`
2. Save the file
3. Refresh any page → footer updates everywhere

**No need to touch individual page files!**

## Directory Structure & Paths

### Current Site Structure:

```
src/
├── components/
│   ├── header.html
│   └── footer.html
├── scripts/
│   ├── component-loader.js
│   └── main.js
├── styles/
│   ├── main.css
│   ├── components.css
│   └── ...
└── pages/
    ├── index.html              (root level)
    ├── about.html
    ├── contact.html
    ├── quiz.html
    ├── store.html
    ├── blog/
    │   ├── index.html          (blog level)
    │   └── hair-loss-guide.html
    └── legal/
        ├── privacy-policy.html (legal level)
        ├── terms-of-service.html
        ├── disclaimer.html
        ├── cookie-policy.html
        └── affiliate-disclosure.html
```

### Path Reference Table:

| From Page | To component-loader.js | To components/ |
|-----------|----------------------|----------------|
| `/pages/index.html` | `../scripts/component-loader.js` | `../components/` |
| `/pages/blog/index.html` | `../../scripts/component-loader.js` | `../../components/` |
| `/pages/legal/privacy-policy.html` | `../../scripts/component-loader.js` | `../../components/` |

## Troubleshooting

### Components Not Loading

**Symptom:** Blank space where header/footer should be

**Possible causes:**

1. **Wrong script path**
   - Check: Is `component-loader.js` path correct for your directory depth?
   - Fix: Adjust `../` depth in script src

2. **Missing placeholder divs**
   - Check: Do you have `<div id="header-root"></div>` and `<div id="footer-root"></div>`?
   - Fix: Add the placeholder divs

3. **Console errors**
   - Check: Open browser DevTools → Console tab
   - Look for: 404 errors or fetch failures
   - Fix: Correct the file paths

### Active Navigation Not Highlighting

**Symptom:** No navigation link has the `active` class

**Possible causes:**

1. **Missing `data-page` attributes**
   - Check: Navigation links in `header.html` need `data-page` attributes
   - Fix: Add `data-page="home"`, `data-page="blog"`, etc.

2. **Page detection logic**
   - Check: `detectCurrentPage()` method in component-loader.js
   - Fix: Add your page path to the detection logic

### Mobile Menu Not Working

**Symptom:** Mobile menu button doesn't toggle menu

**Possible causes:**

1. **main.js not waiting for components**
   - Check: `main.js` should listen for `componentsLoaded` event
   - Fix: Wrap initialization in event listener

2. **Script load order**
   - Check: `component-loader.js` loads before `main.js`
   - Fix: Ensure correct script order in HTML

## Browser Compatibility

**Requirements:**
- Modern browsers with ES6+ support
- `fetch()` API support (all modern browsers)
- `async/await` support

**Supported:**
- ✅ Chrome 55+
- ✅ Firefox 52+
- ✅ Safari 11+
- ✅ Edge 15+

**Not supported:**
- ❌ Internet Explorer (no `fetch()` or `async/await` without polyfills)

## Performance Considerations

### Load Time

**Impact:** Minimal
- Component files are small (~5-10KB each)
- Two parallel `fetch()` requests (header + footer)
- Total overhead: ~10-30ms on fast connections

### Caching

**Browser caching applies:**
- After first load, components are cached
- Subsequent page views load from cache
- Only re-fetched when files change

### Alternative: Server-Side Includes

For production, consider:
- Server-side includes (SSI)
- Static site generators (11ty, Hugo)
- Build-time component injection

**This JavaScript approach works great for:**
- ✅ Development
- ✅ Simple static hosting
- ✅ Sites without build processes

## Migration History

**Original Architecture:**
- 16 pages with duplicated header HTML
- Manual updates required for each page
- Inconsistency risk

**Migration Process:**
1. Created `/src/components/` directory
2. Extracted header HTML into `header.html`
3. Created footer HTML in `footer.html`
4. Implemented `component-loader.js`
5. Updated all 16 pages with placeholders
6. Tested across all directory depths

**Result:**
- ✅ 100% of pages migrated (16/16)
- ✅ Zero duplication
- ✅ Single source of truth for header/footer
- ✅ Easy maintenance going forward

## Future Enhancements

### Potential Improvements:

1. **Build-time generation**
   - Pre-render components at build time
   - Eliminates client-side fetch overhead
   - Better for SEO and performance

2. **Component caching**
   - localStorage caching of components
   - Reduces network requests
   - Faster subsequent loads

3. **More components**
   - Blog post card component
   - Legal page template component
   - Quiz step components

4. **Template engine**
   - Handlebars/Mustache for dynamic content
   - Variables and conditionals
   - More powerful component system

## Best Practices

### DO ✅

- Keep components small and focused
- Use semantic HTML in components
- Test changes across multiple pages
- Check console for errors during development
- Use the `componentsLoaded` event for dependent scripts

### DON'T ❌

- Don't put `<html>`, `<head>`, or `<body>` tags in components
- Don't hardcode absolute paths in components
- Don't modify components without testing
- Don't forget to add placeholders on new pages
- Don't nest component-loader.js calls

## Questions?

If you run into issues:

1. **Check the browser console** (F12 → Console tab)
2. **Verify file paths** are correct for directory depth
3. **Confirm placeholders exist** (`#header-root` and `#footer-root`)
4. **Test in a fresh browser tab** to rule out caching issues

## Summary

**The component system provides:**
- ✅ Single source of truth for header/footer
- ✅ Automatic path detection
- ✅ Active navigation highlighting
- ✅ Event-driven architecture
- ✅ Easy maintenance
- ✅ Zero duplication

**All you need to remember:**
1. Include `component-loader.js` script in `<head>`
2. Add `<div id="header-root"></div>` for header
3. Add `<div id="footer-root"></div>` for footer
4. Done! Components load automatically.
