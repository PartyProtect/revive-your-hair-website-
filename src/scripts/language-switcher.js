// ============================================
// LANGUAGE SWITCHER INITIALIZATION
// ============================================
// This script initializes the language switcher dropdown
// Uses polling to handle async component loading

function initLanguageSwitcher() {
  const toggle = document.getElementById('langToggle');
  const dropdown = document.getElementById('langDropdown');
  const currentFlag = document.getElementById('currentFlag');
  const currentLang = document.getElementById('currentLang');
  const enLink = document.getElementById('lang-en');
  const nlLink = document.getElementById('lang-nl');
  const deLink = document.getElementById('lang-de');
  
  // If elements don't exist yet, exit and let polling retry
  if (!toggle || !dropdown || !currentFlag || !currentLang || !enLink || !nlLink || !deLink) {
    return false;
  }
  
  // Check if already initialized
  if (toggle.hasAttribute('data-initialized')) {
    return true;
  }
  
  const path = window.location.pathname;
  
  // Detect current language
  const isNL = path.startsWith('/nl');
  const isDE = path.startsWith('/de');
  
  // Update display based on current language
  if (isNL) {
    currentFlag.textContent = '\u{1F1F3}\u{1F1F1}'; // 🇳🇱 Dutch flag
    currentLang.textContent = 'NL';
  } else if (isDE) {
    currentFlag.textContent = '\u{1F1E9}\u{1F1EA}'; // 🇩🇪 German flag
    currentLang.textContent = 'DE';
  } else {
    currentFlag.textContent = '\u{1F1EC}\u{1F1E7}'; // 🇬🇧 British flag
    currentLang.textContent = 'EN';
  }
  
  // Smart URL mapping - automatically convert between languages
  let enPath, nlPath, dePath;
  
  if (isNL) {
    // Currently on Dutch - convert to English and German
    nlPath = path;
    enPath = path
      .replace(/^\/nl/, '') // Remove /nl prefix
      .replace(/\/over-ons/, '/about')
      .replace(/\/winkel/, '/store')
      .replace(/\/contact/, '/contact')
      .replace(/\/quiz/, '/quiz')
      .replace(/\/blog/, '/blog')
      || '/'; // If empty after removing /nl, it's the homepage
    
    dePath = '/de' + enPath
      .replace(/\/about/, '/uber-uns')
      .replace(/\/store/, '/shop')
      .replace(/\/contact/, '/kontakt')
      .replace(/\/quiz/, '/quiz')
      .replace(/\/blog/, '/blog');
    if (enPath === '/') dePath = '/de/';
  } else if (isDE) {
    // Currently on German - convert to English and Dutch
    dePath = path;
    enPath = path
      .replace(/^\/de/, '') // Remove /de prefix
      .replace(/\/uber-uns/, '/about')
      .replace(/\/shop/, '/store')
      .replace(/\/kontakt/, '/contact')
      .replace(/\/quiz/, '/quiz')
      .replace(/\/blog/, '/blog')
      || '/'; // If empty after removing /de, it's the homepage
    
    if (enPath === '/' || enPath === '') {
      nlPath = '/nl/';
    } else {
      nlPath = '/nl' + enPath
        .replace(/\/about/, '/over-ons')
        .replace(/\/store/, '/winkel')
        .replace(/\/contact/, '/contact')
        .replace(/\/quiz/, '/quiz')
        .replace(/\/blog/, '/blog');
    }
  } else {
    // Currently on English - convert to Dutch and German
    enPath = path;
    if (path === '/' || path === '') {
      nlPath = '/nl/';
      dePath = '/de/';
    } else {
      nlPath = '/nl' + path
        .replace(/\/about/, '/over-ons')
        .replace(/\/store/, '/winkel')
        .replace(/\/contact/, '/contact')
        .replace(/\/quiz/, '/quiz')
        .replace(/\/blog/, '/blog');
      
      dePath = '/de' + path
        .replace(/\/about/, '/uber-uns')
        .replace(/\/store/, '/shop')
        .replace(/\/contact/, '/kontakt')
        .replace(/\/quiz/, '/quiz')
        .replace(/\/blog/, '/blog');
    }
  }
  
  // Set proper hrefs for language options
  enLink.href = enPath;
  nlLink.href = nlPath;
  deLink.href = dePath;
  
  // Save language preference when user clicks a language option
  const STORAGE_KEY = 'lang_preference';
  
  enLink.addEventListener('click', function() {
    try { localStorage.setItem(STORAGE_KEY, 'en'); } catch(e) {}
  });
  nlLink.addEventListener('click', function() {
    try { localStorage.setItem(STORAGE_KEY, 'nl'); } catch(e) {}
  });
  deLink.addEventListener('click', function() {
    try { localStorage.setItem(STORAGE_KEY, 'de'); } catch(e) {}
  });
  
  // Toggle dropdown on button click
  toggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    const switcher = toggle.closest('.language-switcher');
    switcher.classList.toggle('open');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    const switcher = toggle.closest('.language-switcher');
    if (switcher && !toggle.contains(e.target) && !dropdown.contains(e.target)) {
      switcher.classList.remove('open');
    }
  });
  
  // Mark as initialized
  toggle.setAttribute('data-initialized', 'true');
  
  console.log('Language switcher initialized successfully', {
    currentLang: isNL ? 'nl' : (isDE ? 'de' : 'en'),
    enPath,
    nlPath,
    dePath
  });
  
  return true;
}

// Polling approach - keeps trying until elements are found
// This handles the case where component-loader fires before this script loads
function pollForLanguageSwitcher(attempts) {
  if (attempts <= 0) {
    console.warn('Language switcher: gave up after max attempts');
    return;
  }
  
  if (!initLanguageSwitcher()) {
    // Elements not ready yet, try again
    setTimeout(function() {
      pollForLanguageSwitcher(attempts - 1);
    }, 100);
  }
}

// Listen for componentsLoaded event (in case we loaded before it fired)
window.addEventListener('componentsLoaded', function() {
  initLanguageSwitcher();
});

// Start polling immediately - this handles the case where componentsLoaded already fired
pollForLanguageSwitcher(30); // Try for up to 3 seconds (30 * 100ms)
