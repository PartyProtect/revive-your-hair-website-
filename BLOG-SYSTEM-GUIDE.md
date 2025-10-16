# Blog System - Quick Reference Guide

## How It Works (Updated!)

Your blog now uses a **smart extraction system**. Each blog post contains its own metadata in the `<head>` section, and the blog index automatically reads and displays this information.

**No more duplicating data!** The title, excerpt, intro text, read time, category, and date are all stored once in the blog post itself.

## Files Modified

1. **`src/scripts/blog-posts.js`** - Now just contains a list of slugs + extraction logic
2. **`src/pages/blog/index.html`** - Automatically fetches and renders posts
3. **`src/pages/blog/hair-loss-guide.html`** - Updated with metadata tags

## How to Add a New Blog Post

### Step 1: Create Your Blog Post HTML File

Create a new HTML file in `src/pages/blog/` (e.g., `microneedling-guide.html`)

### Step 2: Add Metadata Tags to the `<head>` Section

Add these custom meta tags right after your standard meta tags:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Post Title</title>
  <meta name="description" content="...">
  
  <!-- Blog Post Metadata - ADD THESE! -->
  <meta name="blog:title" content="Microneedling for Hair Loss: Complete Protocol">
  <meta name="blog:excerpt" content="A detailed guide on using microneedling to boost hair growth, including device selection, technique, and frequency.">
  <meta name="blog:date" content="2025-02-01">
  <meta name="blog:readTime" content="20 min read">
  <meta name="blog:category" content="Treatment Guide">
  <meta name="blog:intro" content="Microneedling creates controlled micro-injuries in the scalp, triggering stem cell activation and growth factor release. When combined with minoxidil, studies show 4x better hair regrowth compared to minoxidil alone. The procedure is performed weekly using 1.5mm needles.">
  
  <!-- Rest of your head content -->
```

### Step 3: Add the Slug to blog-posts.js

Open `src/scripts/blog-posts.js` and add your slug to the array:

```javascript
const blogPostSlugs = [
  'hair-loss-guide',
  'microneedling-guide'  // ADD YOUR NEW SLUG HERE
];
```

### Step 4: That's It!

The blog index will automatically:
- ✅ Fetch your post's metadata
- ✅ Display the title, excerpt, and intro
- ✅ Format the date beautifully
- ✅ Add the category badge
- ✅ Show the reading time
- ✅ Sort by date (newest first)

## Required Meta Tags

| Tag | Description | Example |
|-----|-------------|---------|
| `blog:title` | Post title for the card | "Finasteride: Complete Guide" |
| `blog:excerpt` | 2-3 sentence description | "Learn about mechanisms, side effects, and dosing..." |
| `blog:date` | Publication date (YYYY-MM-DD) | "2025-01-15" |
| `blog:readTime` | Reading time estimate | "30 min read" |
| `blog:category` | Post category | "Treatment Guide" |
| `blog:intro` | **(Optional)** Intro paragraph shown in green box | "Finasteride blocks DHT conversion..." |

## The blog:intro Tag - Special Feature! 🌟

The `blog:intro` tag is what displays that **green explanation box** on the blog cards! This is pulled directly from your blog post, so you write it once and it appears in two places:

1. **On the blog index card** - As a green info box
2. **In the actual blog post** - At the top below the title

**Example from hair-loss-guide.html:**
```html
<meta name="blog:intro" content="Male pattern hair loss is caused by DHT hormone sensitivity, poor blood flow, and inflammation around hair follicles. The most effective treatment is combination therapy using finasteride (blocks DHT), minoxidil (improves blood flow), microneedling (activates stem cells), and ketoconazole shampoo (reduces inflammation). Clinical studies show combination therapy is significantly more effective than single treatments, with most patients seeing results within 3-6 months and maximum effects at 12 months.">
```

This becomes the green gradient box you saw in the screenshot!

## Available Categories & Emojis

- `Comprehensive Guide` → 📚
- `Treatment Guide` → 💊
- `Advanced Protocol` → 🔬
- `Research Update` → 🧪
- `Clinical Study` → 📊
- `Protocol Optimization` → ⚡
- `Side Effects` → ⚠️
- `FAQ` → ❓

## Full Example: Adding a New Post

**1. Create `finasteride-guide.html` with metadata:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Finasteride for Hair Loss: Evidence-Based Guide</title>
  
  <!-- Blog Post Metadata -->
  <meta name="blog:title" content="Finasteride: The Complete Evidence-Based Guide">
  <meta name="blog:excerpt" content="Deep dive into finasteride - mechanism of action, clinical trial data, side effect analysis, dosing strategies, and how to maximize effectiveness while minimizing risks.">
  <meta name="blog:date" content="2025-02-10">
  <meta name="blog:readTime" content="30 min read">
  <meta name="blog:category" content="Treatment Guide">
  <meta name="blog:intro" content="Finasteride is a 5-alpha reductase inhibitor that blocks the conversion of testosterone to DHT, the hormone responsible for shrinking hair follicles in male pattern baldness. Clinical studies show 83% of men maintain or improve hair counts after 2 years. The standard dose is 1mg daily, though research suggests 0.5mg may be equally effective with fewer side effects.">
  
  <!-- Stylesheets -->
  <link rel="stylesheet" href="../../styles/color-palette.css">
  ...
</head>
<body>
  <!-- Your blog post content -->
</body>
</html>
```

**2. Add to blog-posts.js:**

```javascript
const blogPostSlugs = [
  'hair-loss-guide',
  'finasteride-guide'  // NEW!
];
```

**3. Done!** Refresh the blog index and see your new post appear with:
- Title
- Excerpt  
- Date (formatted as "February 10, 2025")
- Read time
- Category badge
- Green intro box (if you included blog:intro)

## Benefits of This System

✅ **Single source of truth** - Metadata lives in the blog post itself
✅ **No duplication** - Write the intro once, displays everywhere
✅ **Automatic updates** - Edit meta tags to update the card
✅ **Easy maintenance** - Just add slugs, everything else is automatic
✅ **Future-proof** - Can add more meta tags later (author, tags, etc.)

## Troubleshooting

**Q: My new post isn't showing up**
- Check that you added the slug to `blog-posts.js`
- Verify all required meta tags are present
- Check browser console for errors
- Make sure the file is named correctly (slug + .html)

**Q: The intro box isn't showing**
- The `blog:intro` tag is optional
- If missing, the card shows without the green box
- Make sure the content attribute has text

**Q: Date format looks wrong**
- Use YYYY-MM-DD format: `2025-02-15`
- JavaScript will auto-format it to "February 15, 2025"

## Next Steps

Your blog system is now fully automated! As you create new posts:
1. Add the meta tags
2. Add the slug  
3. That's it!

The system handles everything else automatically. 🎉
