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
  const header = document.getElementById('header');
  const mobileMenuButton = document.getElementById('mobileMenuButton');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuButton && mobileMenu) {
    console.log('Mobile menu initialized'); // Debug log
    
    // Remove any existing listeners (prevent duplicates)
    const newButton = mobileMenuButton.cloneNode(true);
    mobileMenuButton.parentNode.replaceChild(newButton, mobileMenuButton);
    
    // Toggle menu on button click
    newButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Mobile menu button clicked'); // Debug log
      newButton.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      
      // Add scrolled class when menu is open for solid background
      if (header) {
        if (mobileMenu.classList.contains('active')) {
          header.classList.add('scrolled');
        } else if (window.scrollY <= 50) {
          header.classList.remove('scrolled');
        }
      }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInsideMenu = mobileMenu.contains(event.target);
      const isClickOnButton = newButton.contains(event.target);
      
      if (!isClickInsideMenu && !isClickOnButton && mobileMenu.classList.contains('active')) {
        newButton.classList.remove('active');
        mobileMenu.classList.remove('active');
        if (header && window.scrollY <= 50) {
          header.classList.remove('scrolled');
        }
      }
    });
    
    // Close menu when clicking a nav link
    const mobileNavLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', function() {
        newButton.classList.remove('active');
        mobileMenu.classList.remove('active');
        if (header && window.scrollY <= 50) {
          header.classList.remove('scrolled');
        }
      });
    });
  } else {
    console.log('Mobile menu elements not found', { mobileMenuButton, mobileMenu }); // Debug log
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

// ============================================
// STICKY HEADER SCROLL EFFECT
// ============================================

function initializeStickyHeader() {
  const header = document.getElementById('header') || document.querySelector('.header');
  const mobileMenu = document.getElementById('mobileMenu');
  let scrollThreshold = 50; // Pixels to scroll before adding "scrolled" class

  if (!header) return;

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add/remove "scrolled" class based on scroll position
    // But keep it if mobile menu is open
    if (scrollTop > scrollThreshold || (mobileMenu && mobileMenu.classList.contains('active'))) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true }); // passive: true for better scroll performance
}

// Initialize sticky header on DOM load and after components are loaded
document.addEventListener('DOMContentLoaded', initializeStickyHeader);
window.addEventListener('load', initializeStickyHeader);
// Also initialize after components load (header is loaded asynchronously)
window.addEventListener('componentsLoaded', initializeStickyHeader);

// ============================================
// QUIZ MAINTENANCE POPUP
// ============================================
// Temporary popup for quiz links while updating

function initializeQuizPopup() {
  // Detect current language from URL
  const path = window.location.pathname;
  let currentLang = 'en';
  if (path.startsWith('/de')) {
    currentLang = 'de';
  } else if (path.startsWith('/nl')) {
    currentLang = 'nl';
  }
  
  // Translation texts
  const translations = {
    en: {
      title: "Sorry! We're updating the quiz right now!",
      message: "We're making improvements to give you the best experience. Please check back soon!",
      button: "Got it"
    },
    nl: {
      title: "Sorry! We werken nu aan de quiz!",
      message: "We brengen verbeteringen aan om je de beste ervaring te geven. Kom snel terug!",
      button: "Begrepen"
    },
    de: {
      title: "Entschuldigung! Wir aktualisieren gerade das Quiz!",
      message: "Wir nehmen Verbesserungen vor, um Ihnen das beste Erlebnis zu bieten. Schauen Sie bald wieder vorbei!",
      button: "Verstanden"
    }
  };
  
  const t = translations[currentLang];
  
  // Create modal HTML
  const modalHTML = `
    <div id="quiz-maintenance-modal" class="maintenance-modal" style="display: none;">
      <div class="maintenance-modal-overlay"></div>
      <div class="maintenance-modal-content">
        <div class="maintenance-modal-icon">🔧</div>
        <h3>${t.title}</h3>
        <p>${t.message}</p>
        <button id="close-maintenance-modal" class="maintenance-modal-btn">${t.button}</button>
      </div>
    </div>
  `;

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .maintenance-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .maintenance-modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
    }

    .maintenance-modal-content {
      position: relative;
      background: white;
      border-radius: 16px;
      padding: 40px 32px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: modalSlideIn 0.3s ease-out;
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .maintenance-modal-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .maintenance-modal-content h3 {
      margin: 0 0 12px 0;
      font-size: 1.5em;
      color: #1f2937;
    }

    .maintenance-modal-content p {
      margin: 0 0 24px 0;
      color: #6b7280;
      line-height: 1.6;
    }

    .maintenance-modal-btn {
      background: #047857;
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-size: 1em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .maintenance-modal-btn:hover {
      background: #059669;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3);
    }
  `;
  document.head.appendChild(style);

  // Get modal elements
  const modal = document.getElementById('quiz-maintenance-modal');
  const closeBtn = document.getElementById('close-maintenance-modal');
  const overlay = modal.querySelector('.maintenance-modal-overlay');

  // Function to show modal
  function showModal(e) {
    e.preventDefault();
    modal.style.display = 'flex';
  }

  // Function to hide modal
  function hideModal() {
    modal.style.display = 'none';
  }

  // Close modal on button click
  closeBtn.addEventListener('click', hideModal);

  // Close modal on overlay click
  overlay.addEventListener('click', hideModal);

  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      hideModal();
    }
  });

  // Intercept all quiz links
  function interceptQuizLinks() {
    const quizLinks = document.querySelectorAll('a[href*="quiz"], a[href="#quiz"], .cta-button[href*="quiz"]');
    quizLinks.forEach(link => {
      link.addEventListener('click', showModal);
    });
  }

  // Run on page load
  interceptQuizLinks();

  // Re-run after components load (for header/footer links)
  window.addEventListener('componentsLoaded', function() {
    setTimeout(interceptQuizLinks, 100);
  });
}

// Initialize quiz popup
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeQuizPopup);
} else {
  initializeQuizPopup();
}


// ============================================
// LANGUAGE SWITCHER DROPDOWN
// ============================================

// Close language switcher when clicking outside
document.addEventListener('click', function(event) {
  const langSwitcher = document.querySelector('.language-switcher');
  if (langSwitcher && !langSwitcher.contains(event.target)) {
    langSwitcher.classList.remove('open');
  }
});
