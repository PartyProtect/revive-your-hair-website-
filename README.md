# Revive Your Hair Website

A professional, hand-coded website for hair loss information and treatment guidance. Built with vanilla HTML, CSS, and JavaScript—no frameworks, no bloat, full control.

## 🎯 Project Overview

This website provides evidence-based information on male pattern baldness treatment, including:
- Comprehensive hair loss blog with 18+ FAQs
- Interactive quiz for personalized treatment recommendations
- About page with credibility/mission
- Contact page for inquiries

**Why Hand-Coded?**
After working with WordPress + Elementor, this project represents a shift to complete control over:
- Performance optimization
- Clean, semantic code
- No unnecessary dependencies
- Faster load times
- Better SEO

## 📁 Project Structure

```
revive-your-hair-website/
├── src/
│   ├── pages/               # HTML pages
│   │   ├── index.html       # Homepage
│   │   ├── hair-loss-blog.html  # Main blog article (18 comprehensive FAQs)
│   │   ├── quiz.html        # Treatment quiz
│   │   ├── about.html       # About page
│   │   └── contact.html     # Contact page
│   ├── styles/              # CSS files
│   │   ├── main.css         # Global styles & variables
│   │   ├── components.css   # Reusable components (buttons, cards, etc.)
│   │   └── utilities.css    # Utility classes
│   ├── scripts/             # JavaScript files
│   │   ├── main.js          # Navigation, smooth scroll, global functionality
│   │   ├── quiz.js          # Quiz logic and scoring
│   │   └── analytics.js     # Google Analytics integration
│   ├── images/              # Image assets (optimized WebP + JPEG fallbacks)
│   └── fonts/               # Custom fonts (if any)
├── public/
│   ├── robots.txt           # Search engine crawling instructions
│   └── sitemap.xml          # XML sitemap for SEO
├── package.json             # Project metadata and scripts
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local development server (optional but recommended)
- Text editor (VS Code recommended)

### Local Development

**Option 1: VS Code Live Server** (Recommended)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html` → "Open with Live Server"
3. Site opens at `http://127.0.0.1:5500`

**Option 2: Python Simple Server**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then visit `http://localhost:8000`

**Option 3: Node.js http-server**
```bash
npx http-server -p 8000
```

### File Linking
All pages link to styles/scripts relatively:
```html
<link rel="stylesheet" href="../styles/main.css">
<script src="../scripts/main.js"></script>
```

## 📝 Development Guidelines

### HTML
- Semantic HTML5 elements (`<article>`, `<section>`, `<nav>`, etc.)
- Accessible markup (ARIA labels where needed)
- Meta tags for SEO (description, keywords, OG tags)
- Structured data (Schema.org) for rich snippets

### CSS
- Mobile-first responsive design
- CSS custom properties (variables) for theming
- BEM methodology for class naming (optional but recommended)
- No preprocessors—vanilla CSS only

### JavaScript
- Vanilla JS—no jQuery or frameworks
- ES6+ syntax
- Commented code for clarity
- Event delegation for performance

### Performance Best Practices
- Images: WebP format with JPEG fallback, lazy loading
- CSS: Inline critical CSS, defer non-critical
- JS: Async/defer loading, minimize DOM manipulation
- Fonts: System fonts preferred, or subset custom fonts

## 🔧 Available Scripts

*(Add these to package.json as needed)*

```json
{
  "scripts": {
    "dev": "Start local development server",
    "build": "Minify CSS/JS for production",
    "deploy": "Deploy to hosting"
  }
}
```

## 📊 SEO & Analytics

- **robots.txt**: Configured to allow all search engines
- **sitemap.xml**: Lists all pages with priority/update frequency
- **Google Analytics**: Integrated via `analytics.js` (add your tracking ID)
- **Meta tags**: Each page has unique title, description, OG tags

## 🌐 Deployment

### Hosting Options
- **Netlify**: Drag & drop the `src/` folder (free tier available)
- **Vercel**: Connect GitHub repo for auto-deployment
- **GitHub Pages**: Push to repo, enable Pages in settings
- **Traditional hosting**: Upload via FTP to your web host

### Pre-Deployment Checklist
- [ ] Replace placeholder URLs in `sitemap.xml` with actual domain
- [ ] Add Google Analytics tracking ID in `analytics.js`
- [ ] Optimize all images (compress, convert to WebP)
- [ ] Test all links and forms
- [ ] Validate HTML/CSS
- [ ] Test on mobile devices
- [ ] Check page load speed (Google PageSpeed Insights)

## 📄 Content Updates

### Adding New Blog Posts
1. Create new HTML file in `src/pages/`
2. Follow `hair-loss-blog.html` structure
3. Add to `sitemap.xml`
4. Link from homepage/navigation

### Updating FAQs
- Edit `hair-loss-blog.html`
- FAQ accordion structure is in place
- Add new `<div class="faq-item">` blocks

## 🤝 Contributing

This is a personal project, but if you'd like to suggest improvements:
1. Document the suggestion
2. Test thoroughly
3. Maintain coding standards

## 📞 Support & Contact

For questions or issues:
- Check existing code comments
- Review this README
- Contact via website contact form (once live)

## 📜 License

© 2025 Revive Your Hair. All rights reserved.

## 🎉 Acknowledgments

Built from scratch to escape WordPress bloat and gain complete control over every aspect of the website. A return to fundamentals: clean HTML, purposeful CSS, efficient JavaScript.

---

**Version**: 1.0.0  
**Last Updated**: October 15, 2025  
**Status**: In Development
