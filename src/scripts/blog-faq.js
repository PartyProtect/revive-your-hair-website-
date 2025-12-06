// FAQ Accordion Toggle
document.querySelectorAll('.faq-question').forEach(function(btn) {
  btn.onclick = function() {
    this.closest('.faq-item').classList.toggle('active');
  };
});

// Sticky CTA with persistent dismissal
(function() {
  var ctaDismissed = sessionStorage.getItem('stickyCta_dismissed') === 'true';
  
  window.onscroll = function() {
    var cta = document.getElementById('stickyCta');
    if (cta && !ctaDismissed) {
      if (window.scrollY > 600) {
        cta.classList.add('visible');
      } else {
        cta.classList.remove('visible');
      }
    }
  };

  var closeBtn = document.getElementById('closeStickyCta');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      var cta = document.getElementById('stickyCta');
      if (cta) {
        cta.classList.remove('visible');
        ctaDismissed = true;
        sessionStorage.setItem('stickyCta_dismissed', 'true');
      }
    });
  }
})();
