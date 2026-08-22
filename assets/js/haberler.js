/* ===========================================================
   Küme Eğitim — Haber/Duyuru gösterimi
   data/haberler.json dosyasını okur, sayfalara basar.
   =========================================================== */
(function () {
  'use strict';

  var AYLAR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
               'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

  function tarihYaz(iso) {
    var p = (iso || '').split('-');
    if (p.length !== 3) return iso || '';
    return parseInt(p[2], 10) + ' ' + AYLAR[parseInt(p[1], 10) - 1] + ' ' + p[0];
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function kart(h) {
    var gorsel = h.gorsel
      ? '<div class="aspect-[4/3] overflow-hidden">' +
        '<img src="' + esc(h.gorsel) + '" alt="' + esc(h.baslik) + '" loading="lazy" ' +
        'class="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></div>'
      : '';
    return '<a href="haberler.html?id=' + encodeURIComponent(h.id) + '" ' +
      'class="reveal is-visible group bg-white rounded-2xl overflow-hidden shadow-card border border-slate-100 hover:-translate-y-1 transition block">' +
      gorsel +
      '<div class="p-6">' +
        '<div class="flex items-center gap-3 mb-3 text-xs">' +
          '<span class="font-bold uppercase tracking-wide text-accent-600 bg-accent-50 border border-accent-100 rounded-full px-3 py-1">' + esc(h.kategori || 'Haber') + '</span>' +
          '<time class="text-slate-500" datetime="' + esc(h.tarih) + '">' + esc(tarihYaz(h.tarih)) + '</time>' +
        '</div>' +
        '<h3 class="font-display font-bold text-lg text-brand-900 mb-2">' + esc(h.baslik) + '</h3>' +
        '<p class="text-slate-600 text-sm">' + esc(h.ozet) + '</p>' +
        '<span class="inline-flex items-center gap-1.5 text-brand-700 font-semibold text-sm mt-4 group-hover:gap-2.5 transition-all">Devamını oku ' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg></span>' +
      '</div></a>';
  }

  function detay(h) {
    var gorsel = h.gorsel
      ? '<div class="rounded-2xl overflow-hidden shadow-card mb-8 aspect-[16/9]">' +
        '<img src="' + esc(h.gorsel) + '" alt="' + esc(h.baslik) + '" class="w-full h-full object-cover" /></div>'
      : '';
    var paragraflar = String(h.icerik || h.ozet || '').split(/\n+/)
      .filter(function (p) { return p.trim(); })
      .map(function (p) { return '<p class="mb-4">' + esc(p.trim()) + '</p>'; })
      .join('');
    return '<article class="max-w-3xl mx-auto">' +
      '<a href="haberler.html" class="inline-flex items-center gap-1.5 text-brand-700 font-semibold text-sm mb-6 hover:gap-2.5 transition-all">' +
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>' +
        'Tüm haberler</a>' +
      '<div class="flex items-center gap-3 mb-4 text-xs">' +
        '<span class="font-bold uppercase tracking-wide text-accent-600 bg-accent-50 border border-accent-100 rounded-full px-3 py-1">' + esc(h.kategori || 'Haber') + '</span>' +
        '<time class="text-slate-500" datetime="' + esc(h.tarih) + '">' + esc(tarihYaz(h.tarih)) + '</time>' +
      '</div>' +
      '<h1 class="font-display font-extrabold text-3xl md:text-4xl text-brand-900 mb-6">' + esc(h.baslik) + '</h1>' +
      gorsel +
      '<div class="text-slate-600 leading-relaxed">' + paragraflar + '</div>' +
      '</article>';
  }

  function sirala(liste) {
    return liste.slice().sort(function (a, b) {
      return String(b.tarih || '').localeCompare(String(a.tarih || ''));
    });
  }

  function yukle(cb) {
    fetch('data/haberler.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('yok'); return r.json(); })
      .then(function (d) { cb(sirala(d.haberler || [])); })
      .catch(function () { cb(null); });
  }

  var liste = document.getElementById('haber-listesi');
  var son   = document.getElementById('son-haberler');
  if (!liste && !son) return;

  yukle(function (hs) {
    if (!hs) {
      if (liste) liste.innerHTML = '<p class="text-slate-500 text-center col-span-full">Haberler şu anda yüklenemedi.</p>';
      if (son) son.closest('section').style.display = 'none';
      return;
    }

    if (liste) {
      var id = new URLSearchParams(location.search).get('id');
      if (id) {
        var h = hs.filter(function (x) { return x.id === id; })[0];
        liste.className = 'px-0';
        liste.innerHTML = h ? detay(h)
          : '<p class="text-center text-slate-500">Haber bulunamadı. <a href="haberler.html" class="text-brand-700 underline">Tüm haberler</a></p>';
        var b = document.getElementById('haber-basligi');
        if (b && h) b.textContent = h.baslik;
      } else if (hs.length) {
        liste.innerHTML = hs.map(kart).join('');
      } else {
        liste.innerHTML = '<p class="text-slate-500 text-center col-span-full">Henüz haber eklenmemiş.</p>';
      }
    }

    if (son) {
      if (!hs.length) { son.closest('section').style.display = 'none'; return; }
      son.innerHTML = hs.slice(0, 3).map(kart).join('');
    }
  });
})();
