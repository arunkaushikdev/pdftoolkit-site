// PdfToolKit site. Small and dependency-free.
// 1) header shadow, 2) pointer glow on the tool cards, 3) the "where does your file go" lane starts when seen,
// 4) the hero demo: drag the file onto a tool and watch the "data sent" meter stay at 0 B.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.addEventListener('pointermove', function (e) {
    var el = e.target.closest && e.target.closest('.cell');
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  var flow = document.getElementById('flow');
  if (flow) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { flow.classList.add('in'); io.disconnect(); } });
      }, { threshold: 0.35 });
      io.observe(flow);
    } else {
      flow.classList.add('in');
    }
  }

  // ---------------- hero demo ----------------
  var stage = document.getElementById('stage');
  if (!stage) return;
  var file = document.getElementById('file');
  var meta = document.getElementById('fileMeta');
  var say = document.getElementById('say');
  var hint = document.getElementById('hint');
  var line = document.getElementById('meterLine');
  var val = document.getElementById('meterVal');
  var zones = {};
  stage.querySelectorAll('[data-drop]').forEach(function (z) { zones[z.getAttribute('data-drop')] = z; });

  var busy = false, timer = null;

  function sentence(html) { say.innerHTML = html; }
  function sweep() {
    line.classList.remove('go'); void line.getBoundingClientRect(); line.classList.add('go');
    val.classList.remove('flash'); void val.offsetWidth; val.classList.add('flash');
  }
  function reset(delay) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      Object.keys(zones).forEach(function (k) { zones[k].classList.remove('run', 'done', 'hot', 'nope'); });
      meta.textContent = '4.2 MB, 12 pages';
      hint.classList.remove('off');
      busy = false;
    }, delay);
  }

  var actions = {
    shrink: function () {
      zones.shrink.classList.add('run');
      meta.textContent = 'Shrinking…';
      setTimeout(function () {
        zones.shrink.classList.add('done');
        meta.textContent = '1.6 MB, 12 pages';
        sentence('Shrunk from 4.2 MB to <em>1.6 MB</em> on this phone. Data sent: <em>0 B</em>.');
        sweep();
      }, reduce ? 0 : 900);
    },
    split: function () {
      zones.split.classList.add('done');
      meta.textContent = '2 files, 6 pages each';
      sentence('Split into two files on this phone. Data sent: <em>0 B</em>.');
      sweep();
    },
    merge: function () {
      zones.merge.classList.add('done');
      meta.textContent = '1 file, 14 pages';
      sentence('Merged with Invoice.pdf on this phone. Data sent: <em>0 B</em>.');
      sweep();
    },
    cloud: function () {
      zones.cloud.classList.remove('hot');
      zones.cloud.classList.remove('nope'); void zones.cloud.offsetWidth; zones.cloud.classList.add('nope');
      sentence('There is no upload feature, so there is nothing to connect to. Data sent: <em>0 B</em>.');
      sweep();
    }
  };

  function run(name) {
    if (busy || !actions[name]) return;
    busy = true;
    hint.classList.add('off');
    actions[name]();
    reset(name === 'shrink' ? 3400 : 2800);
  }

  // clicking or tapping a tool runs it too (and makes the demo work with a keyboard)
  ['shrink', 'split', 'merge'].forEach(function (k) { zones[k].addEventListener('click', function () { run(k); }); });
  file.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run('shrink'); }
  });

  // dragging
  var start = null;
  function overZone(x, y) {
    var found = null;
    Object.keys(zones).forEach(function (k) {
      var r = zones[k].getBoundingClientRect();
      var hit = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      zones[k].classList.toggle('hot', hit && !busy);
      if (hit) found = k;
    });
    return found;
  }
  file.addEventListener('pointerdown', function (e) {
    if (busy) return;
    start = { x: e.clientX, y: e.clientY };
    file.setPointerCapture(e.pointerId);
    file.classList.add('drag');
    hint.classList.add('off');
  });
  file.addEventListener('pointermove', function (e) {
    if (!start) return;
    var dx = e.clientX - start.x, dy = e.clientY - start.y;
    file.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + Math.max(-8, Math.min(8, dx / 24)) + 'deg) scale(1.04)';
    overZone(e.clientX, e.clientY);
  });
  function drop(e) {
    if (!start) return;
    var where = overZone(e.clientX, e.clientY);
    start = null;
    file.classList.remove('drag');
    file.style.transform = '';
    Object.keys(zones).forEach(function (k) { zones[k].classList.remove('hot'); });
    if (where) run(where); else hint.classList.remove('off');
  }
  file.addEventListener('pointerup', drop);
  file.addEventListener('pointercancel', drop);
})();
