# Functional Components Backup
# Created: October 18, 2025
# 
# This folder contains all functional files (no simple HTML pages, no markdown docs)
# 
# Contents:
# 
# ROOT LEVEL:
# - netlify.toml              # Netlify configuration (redirects, headers, CSP)
# - package.json              # NPM dependencies (@netlify/blobs, axios)
# - build-seo-content.js      # Build script for Reddit feed pre-rendering
# 
# NETLIFY FUNCTIONS (netlify/functions/):
# - dashboard-auth.js         # Server-side admin authentication
# - reddit-proxy.js           # Reddit API proxy with rate limiting
# - tracking.js               # Custom analytics API with Netlify Blobs storage
# 
# JAVASCRIPT (src/scripts/):
# - analytics.js              # Google Analytics 4 + Custom analytics integration
# - blog-posts.js             # Blog post metadata fetching
# - component-loader.js       # Dynamic component loading system
# - i18n.js                   # Internationalization/translation system
# - main.js                   # Main site functionality
# - quiz.js                   # Hair loss quiz logic
# - reddit-feed.js            # Reddit feed rendering
# - tracking.js               # Client-side tracking (pageviews, events, sessions)
# 
# COMPONENTS (src/components/):
# - cookie-consent.html       # GDPR cookie consent banner
# - footer.html               # Site footer
# - header.html               # Site header with navigation
# - lang/language-switcher.html  # Language selection component
# 
# STYLES (src/styles/):
# - color-palette.css         # Brand colors and theme variables
# - components.css            # Component-specific styles
# - main.css                  # Global styles
# - utilities.css             # Utility classes
# 
# SEO FILES (src/ and public/):
# - robots.txt                # Search engine crawler instructions
# - sitemap.xml               # Site structure for search engines
# 
# SECURITY FEATURES:
# - Server-side password validation (dashboard-auth.js)
# - API key protection for analytics (tracking.js)
# - Rate limiting on Reddit proxy (10 req/min)
# - Persistent storage with Netlify Blobs
# - GDPR compliance (90-day data retention)
# - Tightened CSP (no unsafe-inline for scripts)
# - Comprehensive bot detection
# 
# ENVIRONMENT VARIABLES REQUIRED:
# - ADMIN_PASSWORD_HASH       # SHA-256 hash of admin password
# - ANALYTICS_API_KEY         # 32-char random key for analytics API
# 
# To restore these files, copy them back to their original locations
