// ============================================
// COMPONENT LOADER - Best Practice Pattern
// ============================================
// Loads reusable HTML components (header, footer) into pages
// Prevents code duplication and makes updates instant

class ComponentLoader {
  constructor() {
    this.componentsPath = this.getComponentsPath();
    this.currentPage = this.detectCurrentPage();
  }

  /**
   * Get the correct path to components based on current page depth
   */
  getComponentsPath() {
    // Use absolute paths from the root
    return '/components/';
  }

  /**
   * Detect which page we're on for active nav highlighting
   */
  detectCurrentPage() {
    const path = window.location.pathname.toLowerCase();
    
    if (path.includes('index.html') || path.endsWith('/') || path.endsWith('/pages')) {
      return 'home';
    } else if (path.includes('/blog')) {
      return 'blog';
    } else if (path.includes('about')) {
      return 'about';
    } else if (path.includes('contact')) {
      return 'contact';
    } else if (path.includes('store')) {
      return 'store';
    } else if (path.includes('resources')) {
      return 'resources';
    }
    
    return null;
  }

  /**
   * Load a component from file and inject into target element
   */
  async loadComponent(componentName, targetId) {
    try {
      const response = await fetch(`${this.componentsPath}${componentName}.html`);
      
      if (!response.ok) {
        throw new Error(`Failed to load ${componentName}: ${response.status}`);
      }
      
      const html = await response.text();
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.innerHTML = html;
        
        // If it's the header, set active nav state
        if (componentName === 'header') {
          this.setActiveNavLink();
        }
        
        return true;
      } else {
        console.warn(`Target element #${targetId} not found for ${componentName}`);
        return false;
      }
      
    } catch (error) {
      console.error(`Error loading component ${componentName}:`, error);
      return false;
    }
  }

  /**
   * Set the active class on the current page's nav link
   */
  setActiveNavLink() {
    if (!this.currentPage) return;
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const pageAttr = link.getAttribute('data-page');
      if (pageAttr === this.currentPage) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Load all components that exist on the page
   */
  async loadAllComponents() {
    const components = [
      { name: 'header', target: 'header-root' },
      { name: 'footer', target: 'footer-root' },
      { name: 'lang/language-switcher', target: 'language-switcher-root' }
    ];

    const loadPromises = components.map(component => {
      // Only load if target exists
      if (document.getElementById(component.target)) {
        return this.loadComponent(component.name, component.target);
      }
      return Promise.resolve(false);
    });

    try {
      await Promise.all(loadPromises);
      
      // Dispatch custom event when all components are loaded
      window.dispatchEvent(new CustomEvent('componentsLoaded'));
      
    } catch (error) {
      console.error('Error loading components:', error);
    }
  }
}

// ============================================
// INITIALIZE COMPONENT LOADER
// ============================================

// Auto-load components when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeComponents);
} else {
  // DOM already loaded
  initializeComponents();
}

function initializeComponents() {
  const loader = new ComponentLoader();
  loader.loadAllComponents();
}

// Export for use in other scripts if needed
window.ComponentLoader = ComponentLoader;
