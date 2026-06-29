/* ===========================================================
   Küme Eğitim — AI Navigasyon Asistanı
   Statik (backend'siz) çalışan, anahtar kelime tabanlı sohbet
   asistanı. Ziyaretçiyi doğru sayfaya yönlendirir.
   =========================================================== */
(function () {
  'use strict';

  var TEL = '+905052463218';
  var TEL_TEXT = '0505 246 32 18';
  var WA = 'https://wa.me/905052463218';
  var IG = 'https://www.instagram.com/kume_egitim/';

  // Niyet (intent) tanımları — anahtar kelime -> cevap + yönlendirme
  var INTENTS = [
    {
      keys: ['kurs', 'program', 'ders', 'tyt', 'ayt', 'yks', 'lgs', 'mezun', 'sınıf', 'destek', '8. sınıf', '9. sınıf', '10. sınıf', '11. sınıf', '12. sınıf', 'ortaokul', 'lise'],
      answer: 'Programlarımız sınıf seviyesine göre düzenlidir:<br>• <b>8. sınıf</b> — LGS Hazırlık<br>• <b>9 / 10 / 11. sınıf</b> — Ders Desteği<br>• <b>12. sınıf & Mezun</b> — YKS (TYT–AYT) Hazırlık<br>Detaylar için:',
      actions: [['Sınıf Programları', 'kurslar.html']]
    },
    {
      keys: ['kayıt', 'kaydol', 'ön kayıt', 'başvuru', 'nasıl kayıt', 'kayit'],
      answer: 'Ücretsiz ön kayıt için formu doldurabilir ya da bizi arayabilirsiniz. Tanışma görüşmesi ve seviye tespit sınavı ücretsizdir.',
      actions: [['Ön Kayıt Formu', 'iletisim.html'], ['Hemen Ara', 'tel:' + TEL, 'alt']]
    },
    {
      keys: ['fiyat', 'ücret', 'ucret', 'kaç para', 'taksit', 'ödeme', 'odeme', 'maliyet'],
      answer: 'Ücret ve ödeme seçenekleri programa göre değişiyor. En güncel bilgi için sizi arayalım veya bize ulaşın:',
      actions: [['İletişim', 'iletisim.html'], ['WhatsApp', WA, 'alt']]
    },
    {
      keys: ['adres', 'konum', 'nerede', 'nasıl gel', 'yol', 'harita', 'şube', 'lokasyon'],
      answer: 'Adresimiz: Atatürk Bulvarı, Bulvar Palas İş Merkezi A Blok Kat 3 No: 141/79, Bakanlıklar / Çankaya / Ankara. Harita ve yol tarifi için:',
      actions: [['Konum & Harita', 'iletisim.html']]
    },
    {
      keys: ['telefon', 'ara', 'numara', 'iletişim', 'iletisim', 'ulaş', 'whatsapp', 'mail', 'e-posta', 'eposta', 'mesaj'],
      answer: 'Bize şu kanallardan ulaşabilirsiniz:<br>📞 ' + TEL_TEXT + '<br>✉️ info@kumeegitim.com',
      actions: [['Ara', 'tel:' + TEL], ['WhatsApp', WA, 'alt'], ['Instagram', IG, 'alt']]
    },
    {
      keys: ['saat', 'çalışma', 'calisma', 'açık', 'kaçta', 'ne zaman açık'],
      answer: 'Çalışma saatlerimiz Pazartesi–Cumartesi 09:00–19:00 arasındadır. Daha fazla bilgi için:',
      actions: [['İletişim', 'iletisim.html']]
    },
    {
      keys: ['hakkında', 'kim', 'kurum', 'tarihçe', 'ne zaman kuruldu', 'kuruldu', 'deneyim', 'tecrübe'],
      answer: '1997’den bu yana Ankara’da eğitim veren köklü bir kurumuz. "Başarı tesadüf değil, sistemli çalışmanın sonucudur" anlayışıyla çalışıyoruz.',
      actions: [['Hakkımızda', 'hakkimizda.html']]
    },
    {
      keys: ['başarı', 'derece', 'sonuç', 'sıralama', 'yorum', 'görüş', 'referans'],
      answer: 'Öğrencilerimizin başarıları ve görüşleri için Başarılarımız sayfamıza göz atın:',
      actions: [['Başarılarımız', 'basarilarimiz.html']]
    },
    {
      keys: ['soru', 'sss', 'sık sorulan', 'merak', 'bilgi'],
      answer: 'Sık sorulan soruların cevaplarını burada bulabilirsiniz:',
      actions: [['Sıkça Sorulan Sorular', 'sss.html']]
    }
  ];

  var GREETING = 'Merhaba! 👋 Ben Küme Eğitim yardımcı asistanıyım. Kurslar, kayıt, adres veya iletişim hakkında size yol gösterebilirim. Nasıl yardımcı olabilirim?';
  var FALLBACK = 'Bunu tam anlayamadım 🤔 Aşağıdaki başlıklardan birini seçebilir ya da dilerseniz doğrudan bize ulaşabilirsiniz:';
  var CHIPS = [
    ['Kurslarımız', 'kurs'],
    ['Ön Kayıt', 'kayıt'],
    ['Adres & Konum', 'adres'],
    ['İletişim', 'telefon'],
    ['Ücretler', 'ücret'],
    ['S.S.S.', 'sss']
  ];

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  // --- Widget DOM'unu oluştur ---
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
      '<input id="kume-chat-text" type="text" placeholder="Bir şey yazın..." aria-label="Mesajınız">' +
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
    var text = (q || '').toLowerCase();
    var found = null;
    for (var i = 0; i < INTENTS.length; i++) {
      for (var k = 0; k < INTENTS[i].keys.length; k++) {
        if (text.indexOf(INTENTS[i].keys[k]) !== -1) { found = INTENTS[i]; break; }
      }
      if (found) break;
    }
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
