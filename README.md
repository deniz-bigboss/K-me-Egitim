# Küme Eğitim Kurumları — Web Sitesi

Kümeeğitim (dershane / eğitim kurumu) için statik web sitesi.
Saf **HTML + CSS + JavaScript** ile yazılmıştır; **Tailwind CSS (CDN)** ile
biçimlendirilmiştir. Çalıştırmak için derleme adımı (build step) gerekmez —
dosyalar olduğu gibi **GitHub Pages** üzerinde yayınlanabilir.

## 📁 Sayfa Yapısı

| Dosya | Sayfa |
|---|---|
| `index.html` | Anasayfa (hero, programlar, neden biz, süreç, görüşler, CTA) |
| `kurslar.html` | Kurslar / Programlar (TYT, AYT, LGS, özel ders, mezun, etüt) |
| `hakkimizda.html` | Hakkımızda (vizyon, misyon, eğitim kadrosu) |
| `basarilarimiz.html` | Başarılarımız (istatistik, dereceler, görüşler) |
| `sss.html` | Sık Sorulan Sorular (akordeon) |
| `iletisim.html` | İletişim (bilgiler, ön kayıt formu, harita) |
| `404.html` | Bulunamayan sayfa |

Ortak varlıklar `assets/` altındadır:
- `assets/css/style.css` — özel stiller/animasyonlar
- `assets/js/tw-config.js` — Tailwind tema (marka renkleri, fontlar)
- `assets/js/main.js` — mobil menü, scroll animasyonları, SSS akordeon, sayaçlar
- `assets/img/` — görseller (favicon mevcut; diğer görseller eklenecek)

## 🚀 GitHub Pages ile Yayınlama

1. GitHub'da repo → **Settings → Pages**.
2. **Build and deployment → Source: Deploy from a branch**.
3. Branch olarak yayınlanacak dalı (ör. `main`) ve klasör olarak `/ (root)` seçin.
4. Kaydedin. Birkaç dakika içinde site şu adreste yayında olur:
   `https://<kullanıcı-adı>.github.io/<repo-adı>/`

> Bu site şu an `claude/dershane-website-github-access-4ruhnv` dalında
> geliştirilmektedir. Yayınlamadan önce `main` dalına birleştirin.

### Özel alan adı (kumeegitim.com) bağlama

1. Repoya `CNAME` adlı bir dosya ekleyin; içeriği yalnızca: `kumeegitim.com`
2. Alan adı sağlayıcısının DNS panelinde:
   - `A` kayıtları → GitHub Pages IP'leri:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www` için `CNAME` → `<kullanıcı-adı>.github.io`
3. Settings → Pages → Custom domain alanına `kumeegitim.com` yazıp
   **Enforce HTTPS** seçeneğini işaretleyin.

> **Durum:** `CNAME` dosyası eklenmiştir; site `https://kumeegitim.com` adresinden yayınlanmaktadır. GitHub Pages ayarlarında Custom domain alanı `kumeegitim.com` olmalı ve **Enforce HTTPS** işaretli olmalıdır.

## 📰 Haberler ve Yönetim Paneli

Site, `data/haberler.json` dosyasındaki haberleri otomatik olarak
**Haberler** sayfasında ve anasayfadaki "Güncel duyurular" bölümünde gösterir.

### Yönetim paneli — `https://kumeegitim.com/admin.html`

Haber eklemek/düzenlemek/silmek için kullanılır. Panel, değişikliği doğrudan
bu depoya commit eder; GitHub Pages 1–2 dakika içinde siteyi yeniler.

**Giriş nasıl yapılır?**

Panelde şifre yoktur — kimlik doğrulama **GitHub üzerinden** yapılır.
Statik hosting'de (GitHub Pages) sunucu tarafı kod çalışmadığı için
JavaScript'e gömülü bir şifre gerçek koruma sağlamaz; bu yüzden
GitHub'ın kendi yetkilendirmesi kullanılır.

Bir **fine-grained personal access token** oluşturun:

1. GitHub → Settings → Developer settings
2. Personal access tokens → **Fine-grained tokens** → Generate new token
3. **Repository access:** Only select repositories → `K-me-Egitim`
4. **Permissions → Repository permissions → Contents: Read and write**
5. Oluşan anahtarı panele yapıştırın

Anahtar yalnızca kullanıcının tarayıcısında (`localStorage`) saklanır,
depoya veya başka bir yere gönderilmez. Yetki vermek istediğiniz her kişi
kendi GitHub hesabından kendi anahtarını üretmelidir; yetkiyi geri almak
için GitHub'dan o anahtarı iptal etmek yeterlidir.

> `admin.html` arama motorlarına kapalıdır (`noindex` + `robots.txt`).

### Ders programları

Panelin **Ders Programları** sekmesinden 9, 10, 11, 12. sınıf ve mezun grubu
için haftalık ders programı görseli yüklenir. Görsel tarayıcıda otomatik
küçültülür (en fazla 1600 px genişlik, JPEG) ve `assets/img/program/` altına
yüklenir; kayıt `data/programlar.json` dosyasında tutulur.

Program yüklenmemiş sınıfların sayfasında bu bölüm hiç görünmez.
Kabul edilen dosyalar: JPG, PNG. (PDF ise ekran görüntüsü alınmalıdır.)

> 8. sınıf da istenirse aynı şekilde eklenebilir; şu an listede yoktur.

## 🛠️ Yerel önizleme

Herhangi bir statik sunucu yeterli:
```bash
python3 -m http.server 8000
# tarayıcıda: http://localhost:8000
```

## ✅ Client'tan Alınacak Bilgiler (Eklenecek)

Sitede `Eklenecek` / `Doğrulanacak` rozetiyle işaretli alanlar gerçek
bilgilerle değiştirilecektir:

- [ ] **Logo** (tercihen SVG veya yüksek çözünürlüklü PNG)
- [ ] **Kurum görselleri** — bina, sınıf, eğitim ortamı fotoğrafları
- [ ] **Telefon numarası** ve **WhatsApp** numarası
- [ ] **E-posta** adresi (varsayılan: info@kumeegitim.com)
- [ ] **Açık adres** + Google Haritalar konumu
- [ ] **Çalışma saatleri**
- [ ] **Sosyal medya** hesapları (Instagram, Facebook vb.)
- [ ] **Kurum tarihçesi** / kuruluş yılı / vizyon-misyon metinleri
- [ ] **İstatistikler** (mezun sayısı, tecrübe yılı, öğretmen sayısı vb.)
- [ ] **Eğitim kadrosu** — öğretmen ad/branş/foto
- [ ] **Başarı/derece bilgileri** — öğrenci adı, üniversite/bölüm, sıralama
- [ ] **Öğrenci/veli görüşleri**
- [ ] **Program ve ücret detayları**
- [ ] **İletişim formu** için Formspree / Web3Forms uç noktası (action URL)
- [ ] **KVKK / Gizlilik metni** (gerekirse)

## 🎨 Marka

- Renkler: lacivert (`brand`) + amber/altın (`accent`) — `assets/js/tw-config.js`
- Fontlar: başlıklar **Sora**, gövde **Plus Jakarta Sans**
