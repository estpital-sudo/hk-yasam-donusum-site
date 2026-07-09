# HK Mikro Site

Bu klasör, HK için statik ve taşınabilir çok dilli mikro site dosyalarını içerir. Site varsayılan olarak `/hk/` altında yayınlanacak şekilde ayarlanmıştır.

## Lokal çalıştırma

```powershell
cd outputs/hk-site
python -m http.server 8080
```

Ardından `http://localhost:8080/tr/` adresini açın.

## Yayınlama

`outputs/hk-site` klasörünün içeriğini sunucuda `/hk/` dizinine yükleyin. Örnek dil URL'leri:

- `/hk/tr/`
- `/hk/en/`
- `/hk/de/`
- `/hk/ar/`

## Alan adına taşıma

`config.js` içinde:

- `BASE_PATH`: `/hk/` yerine `/` yapılabilir.
- `SITE_ORIGIN`: yeni canlı alan adıyla güncellenir.

Statik SEO canonical ve hreflang etiketleri sayfa içinde üretildiği için kök alana geçişte sayfalar yeniden üretilmeli veya `/hk/` yolları topluca güncellenmelidir.

## Logo değiştirme

Geçici logo dosyası:

`assets/img/logo/hk-logo-placeholder.svg`

Gerçek logo aynı dosya adıyla değiştirilebilir veya HTML şablonlarında yeni dosya yoluna alınabilir.

## Görselleri ekleme

`assets-manifest.json` her görsel slotu için ihtiyaç, önerilen kaynak, hedef dosya yolu ve alt metni içerir. Gerçek görseller eklendiğinde ilgili sayfalardaki placeholder SVG yolları WebP/JPG dosyalarıyla değiştirilebilir.

## WhatsApp ve telefon

`config.js` içinde:

```js
WHATSAPP_NUMBER: "905xxxxxxxxx",
PHONE_NUMBER: "+90..."
```

WhatsApp numarası boşsa butonlar iletişim sayfasına yönlenir.

## Lead endpoint

`config.js` içinde `LEAD_ENDPOINT` boş bırakılırsa quiz lead objesi `localStorage` içine kaydedilir ve console'a yazılır. CRM veya webhook hazır olduğunda endpoint URL'si bu alana eklenebilir.

## GTM / Meta Pixel

`config.js` içinde `GTM_ID` ve `META_PIXEL_ID` alanları doldurulduğunda `tracking.js` eventleri dataLayer ve Meta Pixel ile gönderir.

Hazır custom eventler: `hk_page_view`, `hk_quiz_start`, `hk_goal_selected`, `hk_duration_selected`, `hk_bmi_entered`, `hk_activity_selected`, `hk_join_timing_selected`, `hk_form_start`, `hk_lead_submit`, `hk_whatsapp_click`, `hk_call_click`, `hk_gallery_view`, `hk_room_view`, `hk_program_view`, `hk_video_play_click`.

## Dil metinleri

Dil içerikleri `data/tr.json`, `data/en.json`, `data/de.json`, `data/ar.json` içinde arşivlenmiştir. Quiz arayüzü runtime için `assets/js/i18n.js` içinden okunur.

## Video embedleri

`data/videos.json` içindeki `embed_id` alanlarına YouTube video ID'leri girildiğinde video kartları tıklanınca iframe'i lazy-load eder.
