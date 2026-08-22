/* ===========================================================
   Küme Eğitim — Yönetim Paneli
   Kimlik dogrulama GitHub uzerinden yapilir. Token yalnizca
   kullanicinin tarayicisinda (localStorage) tutulur.
   =========================================================== */
(function () {
  'use strict';

  var OWNER  = 'deniz-bigboss';
  var REPO   = 'K-me-Egitim';
  var BRANCH = 'main';
  var YOL    = 'data/haberler.json';
  var API    = 'https://api.github.com';
  var ANAHTAR = 'kume_admin_token';

  var token = null, sha = null, veri = { guncelleme: '', haberler: [] }, duzenlenen = null;

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- UTF-8 uyumlu base64 ---------- */
  function b64enc(str) {
    var bytes = new TextEncoder().encode(str), bin = '';
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin);
  }
  function b64dec(b64) {
    var bin = atob(String(b64).replace(/\s/g, ''));
    var bytes = Uint8Array.from(bin, function (c) { return c.charCodeAt(0); });
    return new TextDecoder().decode(bytes);
  }

  function api(yol, opts) {
    opts = opts || {};
    opts.headers = Object.assign({
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + token,
      'X-GitHub-Api-Version': '2022-11-28'
    }, opts.headers || {});
    return fetch(API + yol, opts);
  }

  function durum(msg, tip) {
    var d = $('durum');
    var renk = tip === 'hata' ? 'bg-red-50 text-red-700 border border-red-200'
             : tip === 'ok'   ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200';
    d.className = 'mb-5 rounded-xl px-4 py-3 text-sm ' + renk;
    d.textContent = msg;
    d.classList.remove('hidden');
    if (tip === 'ok') setTimeout(function () { d.classList.add('hidden'); }, 6000);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ---------- Giris ---------- */
  function girisMesaj(msg, hata) {
    var p = $('giris-mesaj');
    p.textContent = msg;
    p.className = 'text-sm mt-4 ' + (hata ? 'text-red-600' : 'text-green-600');
  }

  function girisYap(t, sessiz) {
    token = t;
    return api('/repos/' + OWNER + '/' + REPO).then(function (r) {
      if (r.status === 401) throw new Error('Anahtar geçersiz veya süresi dolmuş.');
      if (r.status === 404) throw new Error('Bu anahtarın bu depoya erişimi yok.');
      if (!r.ok) throw new Error('GitHub bağlantı hatası (' + r.status + ').');
      return r.json();
    }).then(function (repo) {
      if (!repo.permissions || !repo.permissions.push) {
        throw new Error('Bu anahtarın yazma yetkisi yok (Contents: Read and write gerekli).');
      }
      return api('/user').then(function (r) { return r.ok ? r.json() : { login: 'yönetici' }; });
    }).then(function (u) {
      $('kullanici').textContent = u.login ? '@' + u.login : '';
      $('giris-ekrani').classList.add('hidden');
      $('panel').classList.remove('hidden');
      $('cikis').classList.remove('hidden');
      return haberleriYukle();
    }).catch(function (e) {
      token = null;
      localStorage.removeItem(ANAHTAR);
      if (!sessiz) girisMesaj(e.message, true);
      throw e;
    });
  }

  /* ---------- Veri ---------- */
  function haberleriYukle() {
    return api('/repos/' + OWNER + '/' + REPO + '/contents/' + YOL + '?ref=' + BRANCH)
      .then(function (r) {
        if (r.status === 404) { sha = null; veri = { guncelleme: '', haberler: [] }; return; }
        if (!r.ok) throw new Error('Haberler okunamadı (' + r.status + ').');
        return r.json().then(function (j) {
          sha = j.sha;
          veri = JSON.parse(b64dec(j.content));
          if (!Array.isArray(veri.haberler)) veri.haberler = [];
        });
      })
      .then(listeCiz)
      .catch(function (e) { durum(e.message, 'hata'); });
  }

  function kaydet(mesaj) {
    veri.guncelleme = new Date().toISOString().slice(0, 10);
    veri.haberler.sort(function (a, b) { return String(b.tarih).localeCompare(String(a.tarih)); });
    var govde = {
      message: mesaj,
      content: b64enc(JSON.stringify(veri, null, 2) + '\n'),
      branch: BRANCH
    };
    if (sha) govde.sha = sha;
    durum('Kaydediliyor…');
    return api('/repos/' + OWNER + '/' + REPO + '/contents/' + YOL, {
      method: 'PUT', body: JSON.stringify(govde)
    }).then(function (r) {
      if (r.status === 409) throw new Error('Dosya bu arada değişmiş. Sayfayı yenileyip tekrar deneyin.');
      if (!r.ok) return r.json().then(function (j) { throw new Error(j.message || 'Kaydedilemedi.'); });
      return r.json();
    }).then(function (j) {
      sha = j.content.sha;
      durum('Kaydedildi. Site 1–2 dakika içinde güncellenecek.', 'ok');
      listeCiz();
    }).catch(function (e) { durum(e.message, 'hata'); });
  }

  /* ---------- Liste ---------- */
  function listeCiz() {
    var el = $('liste');
    if (!veri.haberler.length) {
      el.innerHTML = '<div class="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">Henüz haber yok. “Yeni Haber” ile ekleyin.</div>';
      return;
    }
    el.innerHTML = veri.haberler.map(function (h, i) {
      return '<div class="bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap items-center gap-4">' +
        (h.gorsel ? '<img src="' + esc(h.gorsel) + '" alt="" class="w-20 h-16 object-cover rounded-lg shrink-0" />' : '') +
        '<div class="flex-1 min-w-[200px]">' +
          '<div class="flex items-center gap-2 text-xs mb-1">' +
            '<span class="font-bold uppercase text-accent-700 bg-accent-50 border border-accent-100 rounded-full px-2 py-0.5">' + esc(h.kategori || 'Haber') + '</span>' +
            '<span class="text-slate-500">' + esc(h.tarih) + '</span>' +
          '</div>' +
          '<h3 class="font-bold text-brand-900">' + esc(h.baslik) + '</h3>' +
          '<p class="text-sm text-slate-500 line-clamp-1">' + esc(h.ozet) + '</p>' +
        '</div>' +
        '<div class="flex gap-2">' +
          '<button data-duzenle="' + i + '" class="bg-slate-200 hover:bg-slate-300 text-brand-900 font-semibold text-sm px-4 py-2 rounded-full transition">Düzenle</button>' +
          '<button data-sil="' + i + '" class="bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-sm px-4 py-2 rounded-full transition">Sil</button>' +
        '</div></div>';
    }).join('');
  }

  /* ---------- Form ---------- */
  function formAc(idx) {
    duzenlenen = (idx == null ? null : idx);
    var h = duzenlenen == null ? null : veri.haberler[duzenlenen];
    $('form-baslik').textContent = h ? 'Haberi Düzenle' : 'Yeni Haber';
    $('f-id').value       = h ? (h.id || '') : '';
    $('f-baslik').value   = h ? (h.baslik || '') : '';
    $('f-tarih').value    = h ? (h.tarih || '') : new Date().toISOString().slice(0, 10);
    $('f-kategori').value = h ? (h.kategori || 'Duyuru') : 'Duyuru';
    $('f-gorsel').value   = h ? (h.gorsel || '') : '';
    $('f-ozet').value     = h ? (h.ozet || '') : '';
    $('f-icerik').value   = h ? (h.icerik || '') : '';
    $('form-kutu').classList.remove('hidden');
    $('form-kutu').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function formKapat() { $('form-kutu').classList.add('hidden'); duzenlenen = null; }

  function slug(s) {
    return String(s).toLocaleLowerCase('tr')
      .replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g')
      .replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0, 60) || 'haber';
  }

  /* ---------- Olaylar ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var kayitli = localStorage.getItem(ANAHTAR);
    if (kayitli) girisYap(kayitli, true).catch(function () {});

    $('giris-btn').addEventListener('click', function () {
      var t = $('token').value.trim();
      if (!t) return girisMesaj('Lütfen anahtarınızı girin.', true);
      girisMesaj('Kontrol ediliyor…', false);
      girisYap(t, false).then(function () {
        if ($('hatirla').checked) localStorage.setItem(ANAHTAR, t);
      }).catch(function () {});
    });
    $('token').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('giris-btn').click(); });

    $('cikis').addEventListener('click', function () {
      localStorage.removeItem(ANAHTAR); location.reload();
    });

    $('yeni-btn').addEventListener('click', function () { formAc(null); });
    $('iptal-btn').addEventListener('click', formKapat);

    $('kaydet-btn').addEventListener('click', function () {
      var baslik = $('f-baslik').value.trim();
      var ozet   = $('f-ozet').value.trim();
      var tarih  = $('f-tarih').value;
      if (!baslik || !ozet || !tarih) return durum('Başlık, özet ve tarih zorunludur.', 'hata');

      var kayit = {
        id: $('f-id').value.trim() || (slug(baslik) + '-' + tarih.replace(/-/g, '')),
        baslik: baslik, ozet: ozet,
        icerik: $('f-icerik').value.trim() || ozet,
        tarih: tarih,
        kategori: $('f-kategori').value,
        gorsel: $('f-gorsel').value
      };
      if (duzenlenen == null) veri.haberler.push(kayit);
      else veri.haberler[duzenlenen] = kayit;

      formKapat();
      kaydet((duzenlenen == null ? 'Haber ekle: ' : 'Haber güncelle: ') + baslik);
    });

    $('liste').addEventListener('click', function (e) {
      var d = e.target.getAttribute('data-duzenle');
      var s = e.target.getAttribute('data-sil');
      if (d !== null && d !== undefined) return formAc(parseInt(d, 10));
      if (s !== null && s !== undefined) {
        var i = parseInt(s, 10), h = veri.haberler[i];
        if (!confirm('"' + h.baslik + '" silinsin mi? Bu işlem geri alınamaz.')) return;
        veri.haberler.splice(i, 1);
        kaydet('Haber sil: ' + h.baslik);
      }
    });
  });
})();
