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
    console.log('Mobile menu initialized'); // Debug log
    
    // Remove any existing listeners (prevent duplicates)
    const newButton = mobileMenuButton.cloneNode(true);
    mobileMenuButton.parentNode.replaceChild(newButton, mobileMenuButton);
    
    // Toggle menu on button click
    newButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Mobile menu button clicked'); // Debug log
      navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInsideMenu = navMenu.contains(event.target);
      const isClickOnButton = newButton.contains(event.target);
      
      if (!isClickInsideMenu && !isClickOnButton && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
      }
    });
    
    // Close menu when clicking a nav link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        navMenu.classList.remove('active');
      });
    });
  } else {
    console.log('Mobile menu elements not found', { mobileMenuButton, navMenu }); // Debug log
  }
}

// Initialize when components are loaded
window.addEventListener('componentsLoaded', function() {
  console.log('Components loaded event fired'); // Debug log
  setTimeout(initializeHeaderFunctionality, 100);
});

// Fallback: Also try on DOMContentLoaded in case components load synchronously
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded event fired'); // Debug log
  // Small delay to ensure components have loaded
  setTimeout(initializeHeaderFunctionality, 200);
});

// Additional fallback: Try after window load
window.addEventListener('load', function() {
  console.log('Window load event fired'); // Debug log
  setTimeout(initializeHeaderFunctionality, 300);
});
