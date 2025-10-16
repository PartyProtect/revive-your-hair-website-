// ============================================
// PAGE LOADING STATE
// ============================================
// Prevents flash of unstyled content (FOUC)

// Mark body as loaded when everything is ready
window.addEventListener('load', function() {
  document.body.classList.add('loaded');
});

// Also add 'loaded' class when DOM is ready (faster)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => document.body.classList.add('loaded'), 50);
  });
} else {
  document.body.classList.add('loaded');
}

// ============================================
// GLOBAL HEADER FUNCTIONALITY
// ============================================
// Note: This waits for components to load before initializing

function initializeHeaderFunctionality() {
  // Mobile Menu Toggle
  const mobileMenuButton = document.getElementById('mobileMenuButton');
  const navMenu = document.getElementById('navMenu');

  if (mobileMenuButton && navMenu) {
    // Toggle menu on button click
    mobileMenuButton.addEventListener('click', function() {
      navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInsideMenu = navMenu.contains(event.target);
      const isClickOnButton = mobileMenuButton.contains(event.target);
      
      if (!isClickInsideMenu && !isClickOnButton && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
      }
    });
  }
}

// Initialize when components are loaded
window.addEventListener('componentsLoaded', function() {
  initializeHeaderFunctionality();
});

// Fallback: Also try on DOMContentLoaded in case components load synchronously
document.addEventListener('DOMContentLoaded', function() {
  // Small delay to ensure components have loaded
  setTimeout(initializeHeaderFunctionality, 100);
});
