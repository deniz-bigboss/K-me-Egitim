/* ===========================================================
   Küme Eğitim — AI Navigasyon Asistanı
   Statik (backend'siz) çalışan, Türkçe tam cümleleri anlayan
   anahtar kelime + skorlama tabanlı yönlendirme asistanı.
   =========================================================== */
(function () {
  'use strict';

  var TEL = '+905052463218';
  var TEL_TEXT = '0505 246 32 18';
  var WA = 'https://wa.me/905052463218';
  var IG = 'https://www.instagram.com/kume_egitim/';

  /* Türkçe-duyarlı normalizasyon: küçük harf + aksan/İ-ı sadeleştirme +
     noktalama temizliği. Tam cümlelerdeki kelimeleri yakalamayı sağlar. */
  function norm(s) {
    return (s || '')
      .toLocaleLowerCase('tr')
      .replace(/ı/g, 'i').replace(/İ/g, 'i')
      .replace(/ş/g, 's').replace(/ğ/g, 'g')
      .replace(/ü/g, 'u').replace(/ö/g, 'o')
      .replace(/ç/g, 'c').replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* Niyetler — sınıfa özel olanlar önce (skor eşitliğinde öncelikli). */
  var INTENTS = [
    { keys: ['8 sinif', 'sekizinci', 'lgs', '8inci', '8 inci'],
      answer: '<b>8. Sınıf · LGS Hazırlık</b><br>Tüm LGS derslerinde kazanım odaklı konu anlatımı, haftalık denemeler ve birebir etüt sunuyoruz. Detaylı hizmetler için:',
      actions: [['8. Sınıf Programı', 'sinif-8.html']] },
    { keys: ['9 sinif', 'dokuzuncu', '9uncu', '9 uncu'],
      answer: '<b>9. Sınıf · Akademik Gelişim Programı</b><br>Okul derslerine paralel takviye, eksik kapatma ve düzenli etütlerle güçlü temel. Detaylı hizmetler için:',
      actions: [['9. Sınıf Programı', 'sinif-9.html']] },
    { keys: ['10 sinif', 'onuncu', '10uncu'],
      answer: '<b>10. Sınıf · Akademik Gelişim Programı</b><br>Branş bazlı takviye, düzenli ölçme ve alan seçimi rehberliği. Detaylı hizmetler için:',
      actions: [['10. Sınıf Programı', 'sinif-10.html']] },
    { keys: ['11 sinif', 'on birinci', 'onbirinci', '11inci'],
      answer: '<b>11. Sınıf · Akademik Gelişim Programı</b><br>Okul derslerine destek ve YKS\'ye erken hazırlık; alan derslerinde takviye ve deneme. Detaylı hizmetler için:',
      actions: [['11. Sınıf Programı', 'sinif-11.html']] },
    { keys: ['12 sinif', 'on ikinci', 'onikinci', '12inci', 'son sinif'],
      answer: '<b>12. Sınıf · YKS (TYT–AYT) Hazırlık</b><br>Tam kapsamlı YKS hazırlığı: konu anlatımı, yoğun soru çözümü, deneme ve tercih danışmanlığı. Detaylı hizmetler için:',
      actions: [['12. Sınıf Programı', 'sinif-12.html']] },
    { keys: ['mezun', 'tekrar', 'tekrar sinif', 'ek yerlestirme', 'sinava tekrar'],
      answer: '<b>Mezun · YKS (TYT–AYT) Programı</b><br>Yoğunlaştırılmış tam zamanlı program, sürekli deneme, disiplinli etüt ve birebir hedef koçluğu. Detaylı hizmetler için:',
      actions: [['Mezun Programı', 'mezun.html']] },

    { keys: ['kayit', 'kaydol', 'on kayit', 'basvuru', 'kayit ol', 'nasil kayit', 'kayit yaptir'],
      answer: 'Ücretsiz ön kayıt için formu doldurabilir ya da bizi arayabilirsiniz. Tanışma görüşmesi ve seviye tespit sınavı ücretsizdir.',
      actions: [['Ön Kayıt Formu', 'iletisim.html'], ['Hemen Ara', 'tel:' + TEL, 'alt']] },
    { keys: ['ucret', 'fiyat', 'kac para', 'ne kadar', 'taksit', 'odeme', 'maliyet', 'kac tl', 'ders ucreti'],
      answer: 'Ücret ve ödeme seçenekleri programa ve sınıf seviyesine göre değişiyor. En güncel bilgi için sizi arayalım veya bize ulaşın:',
      actions: [['İletişim', 'iletisim.html'], ['WhatsApp', WA, 'alt']] },
    { keys: ['adres', 'konum', 'nerede', 'neresi', 'nasil gelir', 'yol tarifi', 'harita', 'sube', 'lokasyon', 'nerda', 'hangi semt'],
      answer: 'Adresimiz: Atatürk Bulvarı, Bulvar Palas İş Merkezi A Blok Kat 3 No: 141/79, Bakanlıklar / Çankaya / Ankara. Harita ve yol tarifi için:',
      actions: [['Konum & Harita', 'iletisim.html']] },
    { keys: ['telefon', 'numara', 'ara', 'arayabilir', 'ulas', 'iletisim', 'whatsapp', 'mail', 'e posta', 'eposta', 'mesaj'],
      answer: 'Bize şu kanallardan ulaşabilirsiniz:<br>📞 ' + TEL_TEXT + '<br>✉️ info@kumeegitim.com',
      actions: [['Ara', 'tel:' + TEL], ['WhatsApp', WA, 'alt'], ['Instagram', IG, 'alt']] },
    { keys: ['saat', 'calisma saat', 'acik', 'kacta', 'ne zaman acik', 'mesai', 'kacta aciliyor'],
      answer: 'Çalışma saatlerimiz Pazartesi–Cumartesi 09:00–19:00 arasındadır. Daha fazla bilgi için:',
      actions: [['İletişim', 'iletisim.html']] },
    { keys: ['hakkinda', 'kimsiniz', 'kurum', 'tarihce', 'ne zaman kuruldu', 'kuruldu', 'kac yillik', 'deneyim', 'tecrube', 'hakkinizda'],
      answer: '1997\'den bu yana Ankara\'da eğitim veren köklü bir kurumuz. "Başarı tesadüf değil, sistemli çalışmanın sonucudur" anlayışıyla çalışıyoruz.',
      actions: [['Hakkımızda', 'hakkimizda.html']] },
    { keys: ['basari', 'derece', 'sonuc', 'siralama', 'yorum', 'gorus', 'referans', 'kac kisi kazandi'],
      answer: 'Öğrencilerimizin başarıları ve görüşleri için Başarılarımız sayfamıza göz atın:',
      actions: [['Başarılarımız', 'basarilarimiz.html']] },
    { keys: ['sss', 'sik sorulan', 'merak', 'soru sor', 'sorum var'],
      answer: 'Sık sorulan soruların cevaplarını burada bulabilirsiniz:',
      actions: [['Sıkça Sorulan Sorular', 'sss.html']] },

    { keys: ['gizlilik', 'kvkk', 'kisisel veri', 'aydinlatma', 'cerez', 'veri politikasi', 'verilerim'],
      answer: 'Kişisel verilerin korunması, gizlilik ve çerezler hakkında detaylı bilgiyi KVKK Aydınlatma Metni / Gizlilik Politikası sayfamızda bulabilirsiniz:',
      actions: [['Gizlilik Politikası / KVKK', 'gizlilik.html']] },

    /* Genel program sorusu — en sona koyuldu (sınıf-özel olanlar öne geçsin) */
    { keys: ['kurs', 'program', 'ders', 'tyt', 'ayt', 'yks', 'sinif', 'akademik', 'hazirlik', 'destek', 'lise', 'ortaokul', 'hangi dersler'],
      answer: 'Programlarımız sınıf seviyesine göre düzenlidir:<br>• <b>8. sınıf</b> — LGS Hazırlık<br>• <b>9 / 10 / 11. sınıf</b> — Akademik Gelişim Programı<br>• <b>12. sınıf & Mezun</b> — YKS (TYT–AYT) Hazırlık<br>Hangi sınıf için bilgi almak istersiniz?',
      actions: [['Tüm Programlar', 'kurslar.html']] }
  ];

  var GREETING = 'Merhaba! 👋 Ben Küme Eğitim yardımcı asistanıyım. Sınıf programları, kayıt, adres veya iletişim hakkında sorularınızı tam cümleyle yazabilirsiniz. Size nasıl yardımcı olabilirim?';
  var FALLBACK = 'Bunu tam anlayamadım 🤔 Aşağıdaki başlıklardan birini seçebilir ya da doğrudan bize ulaşabilirsiniz:';
  var CHIPS = [
    ['8. Sınıf (LGS)', '8. sınıf'],
    ['9-10-11 (Akademik)', '9. sınıf'],
    ['12 & Mezun (YKS)', '12. sınıf'],
    ['Ön Kayıt', 'kayıt'],
    ['Adres', 'adres'],
    ['İletişim', 'telefon']
  ];

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* En iyi niyeti skorlayarak bul: eşleşen anahtarların uzunluk toplamı. */
  function bestIntent(q) {
    var t = norm(q);
    if (!t) return null;
    var best = null, bestScore = 0;
    for (var i = 0; i < INTENTS.length; i++) {
      var sc = 0;
      for (var k = 0; k < INTENTS[i].keys.length; k++) {
        var key = norm(INTENTS[i].keys[k]);
        if (key && t.indexOf(key) !== -1) sc += key.length;
      }
      if (sc > bestScore) { bestScore = sc; best = INTENTS[i]; }
    }
    return best;
  }

  /* --- Widget DOM --- */
  var launch = el('button', null, '<span class="dot"></span> Yardımcı Asistan');
  launch.id = 'kume-chat-launch';
  launch.setAttribute('aria-label', 'Yardımcı asistanı aç');

  var panel = el('div');
  panel.id = 'kume-chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Küme Eğitim asistanı');
  panel.innerHTML =
    '<div class="kume-chat-header">' +
      '<span class="avatar"><img src="assets/img/LOGO3.png" alt="Küme Eğitim"></span>' +
      '<span><span class="title">Küme Eğitim Asistanı</span><br><span class="status">● çevrim içi</span></span>' +
      '<button class="kume-chat-close" aria-label="Kapat">✕</button>' +
    '</div>' +
    '<div class="kume-chat-body" id="kume-chat-body"></div>' +
    '<div class="kume-chips" id="kume-chips"></div>' +
    '<form class="kume-chat-input" id="kume-chat-form" autocomplete="off">' +
      '<input id="kume-chat-text" type="text" placeholder="Sorunuzu yazın..." aria-label="Mesajınız">' +
      '<button type="submit" aria-label="Gönder">→</button>' +
    '</form>';

  document.body.appendChild(launch);
  document.body.appendChild(panel);

  var body = panel.querySelector('#kume-chat-body');
  var chipsWrap = panel.querySelector('#kume-chips');
  var form = panel.querySelector('#kume-chat-form');
  var input = panel.querySelector('#kume-chat-text');

  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function addMsg(text, who, actions) {
    var m = el('div', 'kume-msg ' + who, text);
    if (actions && actions.length) {
      actions.forEach(function (a) {
        var link = el('a', 'act' + (a[2] === 'alt' ? ' alt' : ''), a[0]);
        link.href = a[1];
        if (a[1].indexOf('http') === 0) { link.target = '_blank'; link.rel = 'noopener'; }
        m.appendChild(link);
      });
    }
    body.appendChild(m);
    scrollDown();
  }

  function botReply(q) {
    var found = bestIntent(q);
    setTimeout(function () {
      if (found) addMsg(found.answer, 'bot', found.actions);
      else addMsg(FALLBACK, 'bot', [['İletişim', 'iletisim.html'], ['WhatsApp', WA, 'alt']]);
    }, 320);
  }

  function renderChips() {
    chipsWrap.innerHTML = '';
    CHIPS.forEach(function (c) {
      var chip = el('button', 'kume-chip', c[0]);
      chip.type = 'button';
      chip.addEventListener('click', function () {
        addMsg(c[0], 'user');
        botReply(c[1]);
      });
      chipsWrap.appendChild(chip);
    });
  }

  var greeted = false;
  function openPanel() {
    panel.classList.add('open');
    launch.style.display = 'none';
    if (!greeted) { addMsg(GREETING, 'bot'); renderChips(); greeted = true; }
    setTimeout(function () { input.focus(); }, 250);
  }
  function closePanel() {
    panel.classList.remove('open');
    launch.style.display = '';
  }

  launch.addEventListener('click', openPanel);
  panel.querySelector('.kume-chat-close').addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) return;
    addMsg(q, 'user');
    input.value = '';
    botReply(q);
  });
})();
