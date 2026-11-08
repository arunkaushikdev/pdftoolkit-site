// Tiny scroll-reveal: adds `.in` to `.reveal` elements as they enter the viewport.
// No dependencies; falls back to showing everything if IntersectionObserver is unavailable.
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  items.forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i * 60, 240) + 'ms';
    io.observe(el);
  });
})();
