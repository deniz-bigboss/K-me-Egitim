/* ===========================================================
   Küme Eğitim — Ders programı gösterimi
   data/programlar.json okunur; ilgili sınıfın programı varsa
   sayfaya basılır, yoksa bölüm gizli kalır.
   =========================================================== */
(function () {
  'use strict';
  var kap = document.getElementById('ders-programi');
  if (!kap) return;

  var anahtar = kap.getAttribute('data-sinif');
  var bolum = kap.closest('section');
  var AYLAR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
               'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

  function tarihYaz(iso) {
    var p = (iso || '').split('-');
    if (p.length !== 3) return '';
    return parseInt(p[2],10) + ' ' + AYLAR[parseInt(p[1],10)-1] + ' ' + p[0];
  }

  fetch('data/programlar.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (d) {
      var p = (d.programlar || {})[anahtar];
      if (!p || !p.gorsel) { if (bolum) bolum.remove(); return; }
      var tarih = p.guncelleme ? '<p class="text-sm text-slate-500 mt-4 text-center">Son güncelleme: ' +
                  tarihYaz(p.guncelleme) + '</p>' : '';
      kap.innerHTML =
        '<a href="' + p.gorsel + '" target="_blank" rel="noopener" ' +
        'class="block rounded-2xl overflow-hidden shadow-card border border-slate-200 bg-white" ' +
        'title="Büyütmek için tıklayın">' +
        '<img src="' + p.gorsel + '" alt="Ders programı" loading="lazy" class="w-full h-auto" />' +
        '</a>' + tarih +
        '<p class="text-xs text-slate-400 mt-1 text-center">Büyütmek için görsele tıklayın</p>';
    })
    .catch(function () { if (bolum) bolum.remove(); });
})();
