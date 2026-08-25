/* ============================================================
   CALL CENTER — runtime
   ============================================================ */

(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  /* ------------------------------------------------------------
     0. YEAR
     ------------------------------------------------------------ */

  function roman(num) {
    var map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
               [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    var out = '';
    for (var i = 0; i < map.length; i++) {
      while (num >= map[i][0]) { out += map[i][1]; num -= map[i][0]; }
    }
    return out;
  }
  $('year').textContent = roman(new Date().getFullYear());

  /* ------------------------------------------------------------
     1. STATIC SIGILS
     ------------------------------------------------------------ */

  $('gateSigil').innerHTML = Sigil.make('CALL CENTER GATE', { inverted: true });
  $('heroSigil').innerHTML = Sigil.make('CALL CENTER');
  $('footSigil').innerHTML = Sigil.make('THE LINE');

  /* ------------------------------------------------------------
     2. REGISTER -> CARDS
     ------------------------------------------------------------ */

  var grid = $('grid');
  var roster = (typeof MEMBERS !== 'undefined' && MEMBERS.length) ? MEMBERS : [];

  function fileNo(i) {
    var s = String(i + 1);
    while (s.length < 3) s = '0' + s;
    return s;
  }

  /* the headline copy counts the register itself, so it can never go stale */
  var WORDS = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT',
               'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN',
               'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY'];

  function word(n) { return WORDS[n] || String(n); }

  $('heroSeats').textContent = word(roster.length);
  $('secNote').textContent =
    word(roster.length).charAt(0) + word(roster.length).slice(1).toLowerCase() +
    ' names entered into the register. Each one answered.';

  roster.forEach(function (m, i) {
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'card' + (m.owner ? ' card--owner' : '');
    card.setAttribute('data-status', m.status || 'SILENT');
    card.setAttribute('data-index', i);
    card.setAttribute('aria-label', m.alias + ', ' + (m.rank || '') + ', ' + (m.status || ''));

    card.innerHTML =
      '<span class="card__no">#' + fileNo(i) + '</span>' +
      '<span class="card__dot"></span>' +
      mark(m, 'card__sigil') +
      '<span class="card__alias">' + esc(m.alias) + '</span>' +
      '<span class="card__rank">' + esc(m.rank || '') + '</span>' +
      '<span class="card__sep"></span>' +
      '<span class="card__status">' + esc(m.status || '') + '</span>';

    sigilFallback(card, m);
    card.addEventListener('click', function () { openMember(i); });
    grid.appendChild(card);
  });

  /**
   * If a member's picture can't be loaded (file missing, typo in the path),
   * quietly swap the generated sigil back in instead of showing a broken image.
   */
  function sigilFallback(scope, m) {
    var img = scope.querySelector('img');
    if (!img) return;
    img.addEventListener('error', function () {
      var host = img.parentNode;
      host.classList.remove('card__sigil--photo', 'ov__sigil--photo');
      host.innerHTML = Sigil.make(m.alias, { inverted: !!m.owner });
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /**
   * The mark on a card / in the overlay: a photo if the member has one
   * (members.js -> img: 'img/whatever.png'), otherwise a generated sigil.
   */
  function mark(m, cls) {
    if (m.img) {
      return '<span class="' + cls + ' ' + cls + '--photo">' +
        '<img src="' + esc(m.img) + '" alt="" loading="lazy">' +
        '</span>';
    }
    return '<span class="' + cls + '">' + Sigil.make(m.alias, { inverted: !!m.owner }) + '</span>';
  }

  /* ------------------------------------------------------------
     3. OVERLAY
     ------------------------------------------------------------ */

  var ov = $('ov');
  var lastFocus = null;

  function openMember(i) {
    var m = roster[i];
    if (!m) return;
    lastFocus = document.activeElement;

    var ovSigil = $('ovSigil');
    ovSigil.classList.toggle('ov__sigil--photo', !!m.img);
    ovSigil.innerHTML = m.img
      ? '<img src="' + esc(m.img) + '" alt="">'
      : Sigil.make(m.alias, { inverted: !!m.owner });
    sigilFallback(ovSigil, m);

    $('ovFile').textContent = 'FILE #' + fileNo(i);
    $('ovAlias').textContent = m.alias;
    $('ovRank').textContent = m.rank || '—';
    $('ovStatus').textContent = m.status || '—';
    $('ovAlias2').textContent = m.alias;
    $('ovRank2').textContent = m.rank || '—';
    $('ovStatus2').textContent = m.status || '—';
    $('ovFile2').textContent = '#' + fileNo(i) + ' / ' + fileNo(roster.length - 1);

    ov.classList.add('is-open');
    document.body.classList.add('locked');
    $('ovClose').focus();
  }

  function closeMember() {
    ov.classList.remove('is-open');
    document.body.classList.remove('locked');
    if (lastFocus) lastFocus.focus();
  }

  $('ovClose').addEventListener('click', closeMember);
  ov.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) closeMember();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && ov.classList.contains('is-open')) closeMember();
  });

  /* ------------------------------------------------------------
     4. REVEAL ON SCROLL
     ------------------------------------------------------------ */

  var targets = document.querySelectorAll('.reveal, .card');

  function revealAll() {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('in'); });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var idx = parseInt(el.getAttribute('data-index') || '0', 10);
        el.style.transitionDelay = (Math.min(idx, 12) * 55) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  } else {
    revealAll();
  }

  /* ------------------------------------------------------------
     5. BACKGROUND FILM + ITS SOUND
     ------------------------------------------------------------ */

  var vid = $('bgvid');
  var sndBtn = $('sndBtn');
  var sndLabel = $('sndLabel');
  var videoBroken = false;

  var TARGET_VOL = 0.5;   // <-- the volume the film runs at

  vid.addEventListener('error', function () {
    videoBroken = true;
    sndBtn.classList.remove('is-on');
    sndLabel.textContent = 'NO SIGNAL';
    sndBtn.title = 'video/background.mp4 is missing';
  });

  // muted autoplay is always permitted — get the film rolling immediately
  vid.volume = 0;
  var boot = vid.play();
  if (boot && boot.catch) boot.catch(function () { /* it starts on ENTER instead */ });

  var fadeToken = 0;

  function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

  function fadeTo(target, ms) {
    if (videoBroken) return;
    var me = ++fadeToken;                 // cancels any fade still running
    var start = vid.volume, t0 = performance.now();
    (function step(now) {
      if (me !== fadeToken) return;
      var k = clamp01((now - t0) / ms);
      vid.volume = clamp01(start + (target - start) * k);
      if (k < 1) requestAnimationFrame(step);
      else if (target === 0) vid.muted = true;   // the picture keeps running
    })(t0);
  }

  function soundOn() {
    if (videoBroken) return;
    vid.volume = 0;
    vid.muted = false;
    var p = vid.play();
    if (p && p.catch) {
      p.catch(function () {
        // browser refused audible playback — fall back to silent, don't lie about it
        vid.muted = true;
        vid.play();
        sndBtn.classList.remove('is-on');
        if (!videoBroken) sndLabel.textContent = 'SILENT';
      });
    }
    sndBtn.classList.add('is-on');
    sndLabel.textContent = 'SOUND 50%';
    fadeTo(TARGET_VOL, 2200);
  }

  function soundOff() {
    sndBtn.classList.remove('is-on');
    sndLabel.textContent = 'SILENT';
    fadeTo(0, 600);
  }

  sndBtn.addEventListener('click', function () {
    if (videoBroken) return;
    if (sndBtn.classList.contains('is-on')) soundOff(); else soundOn();
  });

  /* ------------------------------------------------------------
     6. THE GATE
     ------------------------------------------------------------ */

  var gate = $('gate');
  var site = $('site');
  document.body.classList.add('locked');

  function enter() {
    gate.classList.add('is-open');
    site.classList.add('is-live');
    site.removeAttribute('aria-hidden');
    document.body.classList.remove('locked');
    sndBtn.classList.add('is-shown');
    soundOn();
    window.setTimeout(function () { gate.remove(); }, 1300);
  }

  $('enterBtn').addEventListener('click', enter, { once: true });

  /* ------------------------------------------------------------
     7. CURSOR
     ------------------------------------------------------------ */

  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (fine) {
    var cur = document.querySelector('.cursor');
    var cx = -100, cy = -100, rx = -100, ry = -100, raf = null;

    document.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    });

    function loop() {
      rx += (cx - rx) * 0.28;
      ry += (cy - ry) * 0.28;
      cur.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      raf = (Math.abs(cx - rx) > 0.1 || Math.abs(cy - ry) > 0.1)
        ? requestAnimationFrame(loop) : null;
    }

    document.addEventListener('mouseover', function (e) {
      var hot = e.target.closest && e.target.closest('a,button,.card');
      cur.classList.toggle('is-hot', !!hot);
    });
    document.addEventListener('mousedown', function () { cur.classList.add('is-down'); });
    document.addEventListener('mouseup', function () { cur.classList.remove('is-down'); });
    document.addEventListener('mouseleave', function () { cur.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { cur.style.opacity = '1'; });
  }

})();
