# Multi-Language Website Structure Guide

## 📋 Overview

This guide explains how to structure your website for easy expansion to multiple languages using a template-based approach.

## 🎯 Goals

- ✅ Support unlimited languages (EN, NL, DE, FR, ES, etc.)
- ✅ Maintain one template per page (no duplication)
- ✅ Easy to add new content
- ✅ SEO-friendly with proper hreflang tags
- ✅ Localized URLs (e.g., `/nl/over-ons` instead of `/nl/about`)

## 📁 Recommended Structure

### Option A: Build Script Approach (Simpler)

```
src/
├── templates/           # Master templates (edit these)
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   └── blog/
│       └── index.html
│
├── i18n/               # Translation files (JSON)
│   ├── en.json
│   ├── nl.json
│   ├── de.json         (future)
│   └── fr.json         (future)
│
├── en/                 # Generated English pages
│   ├── index.html
│   ├── about.html
│   └── contact.html
│
├── nl/                 # Generated Dutch pages
│   ├── index.html
│   ├── over-ons.html
│   └── contact.html
│
└── components/         # Shared components
    ├── header.html
    └── footer.html
```

### Workflow:

1. **Edit template:** `src/templates/about.html`
2. **Add translations:** Update `src/i18n/en.json` and `src/i18n/nl.json`
3. **Run build:** `node build-i18n.js`
4. **Output:** Generates `src/en/about.html` + `src/nl/over-ons.html`

---

## 📝 Template Example

**File: `src/templates/about.html`**

```html
<!DOCTYPE html>
<html lang="{{lang}}">
<head>
  <meta charset="UTF-8">
  <title>{{t.about.title}} | Revive Your Hair</title>
  <meta name="description" content="{{t.about.description}}">
  
  <!-- SEO - auto-generated hreflang tags -->
  
  <link rel="stylesheet" href="../../styles/main.css">
</head>
<body>
  <div id="header-root"></div>
  
  <main>
    <section class="hero">
      <h1>{{t.about.hero.title}}</h1>
      <p>{{t.about.hero.subtitle}}</p>
    </section>
    
    <section>
      <h2>{{t.about.mission.title}}</h2>
      <p>{{t.about.mission.text}}</p>
    </section>
  </main>
  
  <div id="footer-root"></div>
</body>
</html>
```

---

## 🌍 Translation Files

**File: `src/i18n/en.json`**

```json
{
  "lang": "en",
  "about": {
    "title": "About Us - Evidence-Based Hair Loss Information",
    "description": "Learn about our mission to provide evidence-based information...",
    "hero": {
      "title": "We started this because finding honest information about hair loss shouldn't be this hard.",
      "subtitle": "Evidence-based research made accessible."
    },
    "mission": {
      "title": "Our Mission",
      "text": "We read the studies and turn them into something you can understand..."
    }
  }
}
```

**File: `src/i18n/nl.json`**

```json
{
  "lang": "nl",
  "about": {
    "title": "Over Ons - Evidence-Based Informatie Over Haaruitval",
    "description": "Leer meer over onze missie om evidence-based informatie te bieden...",
    "hero": {
      "title": "We zijn dit begonnen omdat het vinden van eerlijke informatie over haaruitval niet zo moeilijk zou moeten zijn.",
      "subtitle": "Evidence-based onderzoek toegankelijk gemaakt."
    },
    "mission": {
      "title": "Onze Missie",
      "text": "Wij lezen de studies en zetten ze om in iets dat je kunt begrijpen..."
    }
  }
}
```

---

## 🔧 Build Configuration

**Update `netlify.toml`:**

```toml
[build]
  command = "node build-i18n.js && node build-seo-content.js && node check-sitemap.js"
  publish = "src"
```

Now every time you push to GitHub, Netlify will:
1. Generate all language versions from templates
2. Copy SEO files
3. Validate sitemap
4. Deploy everything

---

## 🚀 Migration Plan

### Phase 1: Setup (1-2 hours)
1. ✅ Create `src/templates/` folder
2. ✅ Create `src/i18n/` folder with `en.json` and `nl.json`
3. ✅ Move current `about.html` to `templates/about.html`
4. ✅ Extract text into translation JSON files
5. ✅ Test build script: `node build-i18n.js`

### Phase 2: Convert Existing Pages (2-3 hours)
1. Convert `index.html` to template
2. Convert `contact.html` to template
3. Convert blog pages to templates
4. Test all generated pages

### Phase 3: Add New Languages (30 min per language)
1. Create `src/i18n/de.json` (German)
2. Translate all keys
3. Add to `config.languages` array
4. Run build → German site generated automatically!

---

## 🎨 Benefits

### Current Approach (Separate HTML files):
- ❌ Change header? Update 10+ files
- ❌ Add new section? Copy/paste to all languages
- ❌ Add German? Create 10+ new files manually
- ❌ Fix typo in layout? Find/replace everywhere

### Template Approach:
- ✅ Change header? Edit 1 template, rebuild
- ✅ Add new section? Add to 1 template + translation keys
- ✅ Add German? Create 1 JSON file, rebuild
- ✅ Fix layout? Edit template once

---

## 📊 Comparison

| Task | Current | Template-Based |
|------|---------|----------------|
| Add new language | Create 10+ HTML files | Create 1 JSON file |
| Update layout | Edit all HTML files | Edit 1 template |
| Add new page | Create N files (N = languages) | Create 1 template + N translations |
| Maintain consistency | Manual checking | Automatic |
| Time to add German | 4-6 hours | 30 minutes |
| Time to add French | 4-6 hours | 30 minutes |

---

## 🎯 Recommendation

**If you plan to add 3+ languages:** Switch to template approach NOW.

**If staying with 2 languages only:** Current structure is fine.

**Best of both worlds:** Start with build script approach (I provided), then migrate to 11ty later if needed.

---

## 📚 Next Steps

1. Review the `build-i18n.js` script I created
2. Decide: stick with current structure or migrate to templates
3. If migrating, I can help you:
   - Convert your first page to a template
   - Extract translations to JSON
   - Set up the build process
   - Update netlify.toml

Let me know which direction you want to go! 🚀
