/* ===========================================================
   Küme Eğitim Kurumları — site etkileşimleri
   =========================================================== */
(function () {
  'use strict';

  /* --- Mobil menü aç/kapat --- */
  const menuBtn = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      const open = mobileMenu.classList.toggle('hidden') === false;
      menuBtn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('overflow-hidden', open);
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --- Kaydırınca başlık gölgesi --- */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = function () {
      if (window.scrollY > 10) header.classList.add('shadow-soft');
      else header.classList.remove('shadow-soft');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Aktif menü bağlantısını işaretle --- */
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-link').forEach(function (link) {
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* --- Footer yıl --- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* --- Otomatik "kaç yıllık" hesabı (kuruluş yılından) ---
     Her yıl tarayıcıda kendiliğinden güncellenir. */
  document.querySelectorAll('[data-years-since]').forEach(function (el) {
    var since = parseInt(el.getAttribute('data-years-since'), 10);
    if (since) el.textContent = new Date().getFullYear() - since;
  });

  /* --- Scroll reveal --- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* --- İstatistik sayaç animasyonu --- */
  const counters = document.querySelectorAll('[data-count], [data-count-year]');
  if ('IntersectionObserver' in window && counters.length) {
    const animate = function (el) {
      const sinceYear = parseInt(el.getAttribute('data-count-year'), 10);
      const target = sinceYear
        ? (new Date().getFullYear() - sinceYear)
        : parseFloat(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      const dur = 1400;
      const start = performance.now();
      const step = function (now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.floor(eased * target);
        el.textContent = val.toLocaleString('tr-TR') + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('tr-TR') + suffix;
      };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* --- SSS akordeon --- */
  document.querySelectorAll('.faq-item .faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.faq-item');
      item.classList.toggle('open');
      const expanded = item.classList.contains('open');
      btn.setAttribute('aria-expanded', String(expanded));
    });
  });
})();
