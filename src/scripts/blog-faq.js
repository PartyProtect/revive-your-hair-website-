// FAQ Accordion Toggle
document.querySelectorAll('.faq-question').forEach(function(btn) {
  btn.onclick = function() {
    this.closest('.faq-item').classList.toggle('active');
  };
});

// Sticky CTA
window.onscroll = function() {
  var cta = document.getElementById('stickyCta');
  if (cta) {
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
    document.getElementById('stickyCta').classList.remove('visible');
  });
}
