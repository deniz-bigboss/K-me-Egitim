/* ===========================================================
   Küme Eğitim — Ön kayıt formu
   Sunucu gerekmez: form bilgileri WhatsApp mesajına veya
   e-postaya dönüştürülüp kurumun kanalına iletilir.
   =========================================================== */
(function () {
  'use strict';
  var form = document.getElementById('onkayit-form');
  if (!form) return;

  var TEL = '905052463218';
  var MAIL = 'info@kumeegitim.com';

  function deger(ad) {
    var el = form.querySelector('[name="' + ad + '"]');
    return el ? el.value.trim() : '';
  }

  function gecerli() {
    if (!form.reportValidity()) return false;
    return true;
  }

  function metin() {
    var s = 'Ön Kayıt Talebi\n\n';
    s += 'Ad Soyad: ' + deger('ad_soyad') + '\n';
    s += 'Telefon: ' + deger('telefon') + '\n';
    if (deger('email'))   s += 'E-posta: ' + deger('email') + '\n';
    if (deger('program')) s += 'Program: ' + deger('program') + '\n';
    if (deger('mesaj'))   s += '\nMesaj:\n' + deger('mesaj') + '\n';
    s += '\n(kumeegitim.com ön kayıt formu)';
    return s;
  }

  function bilgi(msg) {
    var k = document.getElementById('form-bilgi');
    if (!k) return;
    k.textContent = msg;
    k.classList.remove('hidden');
  }

  var wa = document.getElementById('gonder-whatsapp');
  var ep = document.getElementById('gonder-eposta');

  if (wa) wa.addEventListener('click', function (e) {
    e.preventDefault();
    if (!gecerli()) return;
    window.open('https://wa.me/' + TEL + '?text=' + encodeURIComponent(metin()), '_blank', 'noopener');
    bilgi('WhatsApp açıldı. Mesajı göndermeniz yeterli — en kısa sürede size dönüş yapacağız.');
  });

  if (ep) ep.addEventListener('click', function (e) {
    e.preventDefault();
    if (!gecerli()) return;
    window.location.href = 'mailto:' + MAIL +
      '?subject=' + encodeURIComponent('Ön Kayıt Talebi — ' + (deger('ad_soyad') || '')) +
      '&body=' + encodeURIComponent(metin());
    bilgi('E-posta uygulamanız açıldı. Mesajı göndermeniz yeterli.');
  });

  form.addEventListener('submit', function (e) { e.preventDefault(); if (wa) wa.click(); });
})();
