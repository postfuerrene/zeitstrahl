/**
 * IBZ Zeitstrahl — Standalone Build
 * - IntersectionObserver: aktive Station / Epoche hervorheben
 * - Lightbox für Stationsfotos
 * - Smooth Scroll von der Epochen-Navigation
 */
(function () {
  'use strict';

  function init(root) {
    var stations = root.querySelectorAll('[data-station]');
    var navButtons = root.querySelectorAll('[data-nav]');

    /* ---------- Aktive Station per Scroll ---------- */
    if (stations.length && 'IntersectionObserver' in window) {
      var ratios = new Map();

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        var best = null, bestRatio = 0;
        ratios.forEach(function (ratio, el) {
          if (ratio > bestRatio) { bestRatio = ratio; best = el; }
        });

        stations.forEach(function (el) {
          el.classList.toggle('is-active', el === best);
        });

        if (best) {
          var epochId = best.getAttribute('data-epoch');
          navButtons.forEach(function (btn) {
            btn.classList.toggle('is-on', btn.getAttribute('data-target') === epochId);
          });
        }
      }, {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '-12% 0px -42% 0px'
      });

      stations.forEach(function (el) { io.observe(el); });
    }

    /* ---------- Smooth Scroll: Epochen-Navigation ---------- */
    navButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = root.querySelector('#' + btn.getAttribute('data-target'));
        if (!target) return;
        var top = target.getBoundingClientRect().top + window.pageYOffset - 72;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });

    /* ---------- Lightbox ---------- */
    var lightbox = root.querySelector('[data-lightbox]');
    if (!lightbox) return;

    var lbImg = lightbox.querySelector('[data-lb-img]');
    var lbFrame = lightbox.querySelector('[data-lb-frame]');
    var lbCap = lightbox.querySelector('[data-lb-cap]');
    var lbSrc = lightbox.querySelector('[data-lb-src]');
    var lbClose = lightbox.querySelector('[data-lb-close]');
    var lastFocused = null;

    function openLightbox(trigger) {
      var full = trigger.getAttribute('data-full') || '';
      var caption = trigger.getAttribute('data-caption') || '';
      var source = trigger.getAttribute('data-source') || '';

      if (full) {
        lbImg.src = full;
        lbImg.alt = caption;
        lbImg.hidden = false;
        lbFrame.classList.add('has-img');
      } else {
        lbImg.removeAttribute('src');
        lbImg.hidden = true;
        lbFrame.classList.remove('has-img');
      }

      lbCap.textContent = caption;
      lbSrc.textContent = source;

      lastFocused = trigger;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    root.querySelectorAll('[data-photo]').forEach(function (btn) {
      btn.addEventListener('click', function () { openLightbox(btn); });
    });

    lbClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    lightbox.querySelector('.lb-inner').addEventListener('click', function (e) {
      e.stopPropagation();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }

  function ready() {
    document.querySelectorAll('[data-ibz-zeitstrahl]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();
