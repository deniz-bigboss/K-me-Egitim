# Küme Eğitim Kurumları — Web Sitesi

[kumeegitim.com](https://kumeegitim.com) için statik web sitesi.
Saf **HTML + CSS + JavaScript** ile yazılmıştır; **Tailwind CSS (CDN)** ile
biçimlendirilmiştir. Derleme adımı (build step) yoktur — dosyalar olduğu gibi
**GitHub Pages** üzerinde yayınlanır.

## 📁 Sayfa Yapısı

| Dosya | Sayfa |
|---|---|
| `index.html` | Anasayfa (hero, sınıf programları, neden biz, süreç, son haberler) |
| `kurslar.html` | Kurslarımız — sınıf seviyelerine genel bakış |
| `sinif-8.html` | 8. Sınıf · LGS Hazırlık |
| `sinif-9.html` | 9. Sınıf · Akademik Gelişim Programı |
| `sinif-10.html` | 10. Sınıf · Akademik Gelişim Programı |
| `sinif-11.html` | 11. Sınıf · Akademik Gelişim Programı |
| `sinif-12.html` | 12. Sınıf · YKS (TYT–AYT) Hazırlık |
| `mezun.html` | Mezun Grubu · YKS (TYT–AYT) Hazırlık |
| `hakkimizda.html` | Hakkımızda (tanıtım videosu, vizyon-misyon, yönetim, eğitim kadrosu, galeri) |
| `basarilarimiz.html` | Başarılarımız |
| `haberler.html` | Haberler ve duyurular (liste + `?id=` ile detay) |
| `sss.html` | Sık Sorulan Sorular |
| `iletisim.html` | İletişim (bilgiler, ön kayıt formu, harita) |
| `gizlilik.html` | Gizlilik Politikası / KVKK Aydınlatma Metni |
| `admin.html` | Yönetim paneli (arama motorlarına kapalı) |
| `404.html` | Bulunamayan sayfa |

Ortak varlıklar `assets/` altındadır:
- `assets/css/style.css` — özel stiller, animasyonlar, asistan arayüzü
- `assets/js/tw-config.js` — Tailwind teması (siyah-beyaz palet, fontlar)
- `assets/js/main.js` — mobil menü, scroll animasyonları, SSS akordeon, sayaçlar,
  otomatik yıl hesapları
- `assets/js/chatbot.js` — Türkçe yardımcı asistan (kural tabanlı)
- `assets/js/haberler.js` — haber listesi ve detayı
- `assets/js/program.js` — sınıf sayfalarındaki ders programı görseli
- `assets/js/form.js` — ön kayıt formu (WhatsApp / e-posta ile gönderim)
- `assets/js/admin.js` — yönetim paneli
- `assets/img/`, `assets/video/` — görseller ve tanıtım videosu
- `data/haberler.json`, `data/programlar.json` — panelin yönettiği içerik

> CSS/JS bağlantılarında `?v=` sürüm numarası vardır. Bir dosyayı elle
> değiştirdiğinizde tarayıcıların eski sürümü göstermemesi için ilgili
> sayfalardaki `?v=` numarasını bir artırın.

## 🔄 Kendiliğinden güncellenen değerler

Bu değerler elle güncellenmez, tarayıcıda hesaplanır:

- **Akademik yıl** (`data-academic-year`) — her yıl **Şubat** ayında bir sonraki
  yıla geçer (ör. Şubat 2027'de "2027–2028" olur).
- **Tecrübe yılı** (`data-years-since="1997"`, `data-count-year="1997"`) —
  içinde bulunulan yıldan 1997 çıkarılır.
- **Footer yılı** — içinde bulunulan yıl.

## 🚀 GitHub Pages ile Yayınlama

Site `main` dalından otomatik yayınlanır. `main`'e yapılan her push,
1–2 dakika içinde canlıya çıkar.

Ayarlar: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**

### Özel alan adı

- Repoda `CNAME` dosyası vardır; içeriği: `kumeegitim.com`
- DNS `A` kayıtları GitHub Pages IP'lerine bakar:
  `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- **Durum:** Alan adı bağlı, **Enforce HTTPS** etkin.
  `http://kumeegitim.com` ve `http://www.kumeegitim.com` adreslerinin ikisi de
  `https://kumeegitim.com` adresine yönlendirilir.

## 📰 Yönetim Paneli — `https://kumeegitim.com/admin.html`

Panelden **haberler/duyurular** ve **ders programları** yönetilir. Yapılan
değişiklik doğrudan bu depoya kaydedilir; site 1–2 dakika içinde güncellenir.

### Giriş nasıl yapılır?

Panelde şifre yoktur — kimlik doğrulama **GitHub üzerinden** yapılır.
GitHub Pages'te sunucu tarafı kod çalışmadığı için JavaScript'e gömülü bir
şifre gerçek koruma sağlamaz; bu yüzden GitHub'ın kendi yetkilendirmesi
kullanılır.

Bir **fine-grained personal access token** oluşturun:

1. GitHub → Settings → Developer settings
2. Personal access tokens → **Fine-grained tokens** → Generate new token
3. **Repository access:** Only select repositories → `K-me-Egitim`
4. **Permissions → Repository permissions → Contents: Read and write**
5. Oluşan anahtarı panele yapıştırın ("Beni hatırla" ile tarayıcıda saklanır)

Anahtar yalnızca kullanıcının tarayıcısında (`localStorage`) tutulur, depoya
veya başka bir yere gönderilmez. Yetki vermek istediğiniz herkes kendi GitHub
hesabından kendi anahtarını üretmelidir; yetkiyi geri almak için GitHub'dan o
anahtarı iptal etmek yeterlidir.

> `admin.html` arama motorlarına kapalıdır (`noindex` + `robots.txt`).

### Haberler

**Yeni Haber** ile başlık, özet, içerik, tarih ve kategori girilir. Başlık ve
özet zorunludur. Haberler tarihe göre yeniden eskiye sıralanır; anasayfada en
yeni 3 tanesi görünür. Düzenlerken haberin bağlantı adresi (id) korunur.

### Ders Programları

**Ders Programları** sekmesinden 8, 9, 10, 11, 12. sınıf ve mezun grubu için
haftalık ders programı görseli yüklenir. Görsel tarayıcıda otomatik küçültülür
(en fazla 1600 px genişlik, JPEG'e çevrilir) ve `assets/img/program/` altına
yüklenir; kayıt `data/programlar.json` dosyasında tutulur.

Program yüklenmemiş sınıfların sayfasında bu bölüm **hiç görünmez**.
**Kaldır** ile program siteden kaldırılır.
Kabul edilen dosyalar: JPG, PNG. (PDF ise ekran görüntüsü alınmalıdır.)

## 💬 Yardımcı Asistan

`assets/js/chatbot.js` içindeki **kural tabanlı** Türkçe asistandır; harici bir
servise veya API anahtarına ihtiyaç duymaz (statik sitede API anahtarı herkese
açık olacağı için bilinçli tercih edilmiştir).

Türkçe tam cümleleri anlar; metni sadeleştirip (İ/ı, ş, ğ, ü, ö, ç) ağırlıklı
anahtar kelime eşleştirmesi yapar. Yeni bir konu eklemek için `INTENTS`
dizisine kayıt ekleyin:

```js
{ a: 2,                                  // ağırlık: sınıfa özel/kritik konular 3, orta 2, genel 1
  keys: ['ogretmen', 'kadro', 'hoca'],   // sadeleştirilmiş (Türkçe karaktersiz) kökler
  answer: 'Cevap metni (HTML olabilir)',
  actions: [['Buton yazısı', 'sayfa.html']] }
```

> Anahtarlar **kök** olmalıdır: `basvur` yazın, `basvuru` değil — böylece
> "başvurabilirim", "başvurmak" gibi çekimler de eşleşir.

## 📨 İletişim Formu

Form üçüncü taraf bir servis kullanmaz. Doldurulan bilgiler bir mesaja
dönüştürülür ve kullanıcının seçimine göre **WhatsApp** ya da **e-posta**
uygulamasında açılır. Bu nedenle çalışması için herhangi bir kuruluma,
aboneliğe veya API anahtarına gerek yoktur.

## 🛠️ Yerel önizleme

```bash
python3 -m http.server 8000
# tarayıcıda: http://localhost:8000
```

## 🎨 Marka

- Tema: **siyah-beyaz (monokrom)** — `assets/js/tw-config.js`
- Fontlar: başlıklar **Sora**, gövde **Plus Jakarta Sans**
- Favicon: `assets/img/favicon.svg` (üç halkalı "küme" işareti)
