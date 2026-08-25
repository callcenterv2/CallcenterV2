/* ============================================================
   SIGIL — deterministic occult seal generator
   Same seed string always produces the exact same sigil.
   Every sigil inherits its colour from CSS (stroke: currentColor).
   ============================================================ */

(function (global) {
  'use strict';

  /* ---------- deterministic randomness ---------- */

  function hash(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- helpers ---------- */

  var C = 50; // centre

  function n(v) { return Math.round(v * 100) / 100; }

  function pt(r, deg) {
    var rad = deg * Math.PI / 180;
    return [n(C + r * Math.cos(rad)), n(C + r * Math.sin(rad))];
  }

  function line(a, b, w, o) {
    return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] +
      '" stroke="currentColor" stroke-width="' + w + '" opacity="' + o + '"/>';
  }

  function circle(r, w, o, dash) {
    return '<circle cx="50" cy="50" r="' + n(r) + '" fill="none" stroke="currentColor" stroke-width="' +
      w + '" opacity="' + o + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
  }

  function dot(p, r, o) {
    return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + n(r) +
      '" fill="currentColor" opacity="' + o + '"/>';
  }

  function ring(p, r, w, o) {
    return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + n(r) +
      '" fill="none" stroke="currentColor" stroke-width="' + w + '" opacity="' + o + '"/>';
  }

  function pick(rand, arr) { return arr[Math.floor(rand() * arr.length)]; }
  function irand(rand, lo, hi) { return lo + Math.floor(rand() * (hi - lo + 1)); }

  /* ---------- the generator ---------- */

  /**
   * makeSigil(seed, options)
   *  seed     — any string (member alias). Same string = same sigil.
   *  options  — { inverted: true }  points the star downward (owner seal)
   *             { plain: true }     no rotating ring class (static contexts)
   */
  function makeSigil(seed, options) {
    options = options || {};
    var rand = rng(hash(String(seed)));
    var g = [];

    /* --- outer seal --- */
    g.push(circle(47, 0.8, 0.85));
    g.push(circle(43.4, 0.4, 0.45));

    /* --- tick ring (this group rotates via CSS: .ring-spin) --- */
    var ticks = pick(rand, [12, 16, 18, 24, 32, 36]);
    var ringParts = [];
    for (var t = 0; t < ticks; t++) {
      var a = (360 / ticks) * t - 90;
      var long = (t % 4 === 0);
      ringParts.push(line(pt(43.4, a), pt(long ? 38.6 : 40.8, a), long ? 0.7 : 0.4, long ? 0.8 : 0.4));
    }
    // a broken arc segment for asymmetry
    var arcStart = irand(rand, 0, 359);
    ringParts.push('<path d="' + arcPath(45.2, arcStart, arcStart + irand(rand, 40, 130)) +
      '" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.9"/>');
    g.push('<g class="ring-spin">' + ringParts.join('') + '</g>');

    /* --- inner circle --- */
    g.push(circle(36, 0.6, 0.7));
    if (rand() > 0.5) g.push(circle(33.2, 0.35, 0.35, '1.5 2.5'));

    /* --- rune marks between the rings --- */
    var runes = irand(rand, 3, 6);
    for (var u = 0; u < runes; u++) {
      var ra = rand() * 360;
      var r1 = 38.4, r2 = 42.4;
      var base = pt(r1, ra);
      var tip = pt(r2, ra);
      g.push(line(base, tip, 0.6, 0.55));
      if (rand() > 0.45) {
        g.push(line(pt(r1 + 1.4, ra - 3.4), pt(r1 + 1.4, ra + 3.4), 0.5, 0.45));
      }
    }

    /* --- the star --- */
    var star = pick(rand, [
      { p: 5, s: 2 }, { p: 5, s: 2 },
      { p: 6, s: 2 }, { p: 7, s: 2 }, { p: 7, s: 3 },
      { p: 8, s: 3 }, { p: 9, s: 2 }, { p: 9, s: 4 }, { p: 11, s: 4 }
    ]);
    var start = options.inverted ? 90 : -90;
    var R = 31;
    var pts = [];
    for (var i = 0; i < star.p; i++) pts.push(pt(R, start + (360 / star.p) * i));

    for (var j = 0; j < star.p; j++) {
      g.push(line(pts[j], pts[(j + star.s) % star.p], 1.1, 0.95));
    }
    for (var v = 0; v < star.p; v++) {
      g.push(dot(pts[v], 1.15, 0.9));
      if (star.p <= 7) g.push(ring(pts[v], 2.6, 0.4, 0.5));
    }

    /* --- core --- */
    var core = pick(rand, ['eye', 'cross', 'void', 'triad']);
    if (core === 'eye') {
      g.push('<path d="M38 50 Q50 40 62 50 Q50 60 38 50 Z" fill="none" stroke="currentColor" stroke-width="0.9" opacity="0.85"/>');
      g.push(dot([50, 50], 2.6, 0.95));
    } else if (core === 'cross') {
      g.push(line([50, 38], [50, 63], 0.9, 0.85));
      g.push(line([41, 56], [59, 56], 0.9, 0.85));
      g.push(ring([50, 50], 3.4, 0.5, 0.5));
    } else if (core === 'triad') {
      g.push(ring([50, 46], 5.2, 0.6, 0.7));
      g.push(ring([46, 53], 5.2, 0.6, 0.7));
      g.push(ring([54, 53], 5.2, 0.6, 0.7));
    } else {
      g.push(circle(7.4, 0.7, 0.8));
      g.push(dot([50, 50], 1.6, 0.9));
    }

    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" ' +
      'aria-hidden="true" focusable="false" stroke-linecap="round">' + g.join('') + '</svg>';
  }

  function arcPath(r, a0, a1) {
    var s = pt(r, a0), e = pt(r, a1);
    var large = (Math.abs(a1 - a0) % 360) > 180 ? 1 : 0;
    return 'M' + s[0] + ' ' + s[1] + ' A' + n(r) + ' ' + n(r) + ' 0 ' + large + ' 1 ' + e[0] + ' ' + e[1];
  }

  global.Sigil = { make: makeSigil };

})(window);
