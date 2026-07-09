# HK Mikro Site

Bu klasÃ¶r, HK iÃ§in statik ve taÅŸÄ±nabilir Ã§ok dilli mikro site dosyalarÄ±nÄ± iÃ§erir. Site varsayÄ±lan olarak `/hk/` altÄ±nda yayÄ±nlanacak ÅŸekilde ayarlanmÄ±ÅŸtÄ±r.

## Lokal Ã§alÄ±ÅŸtÄ±rma

```powershell
cd outputs/hk-site
python -m http.server 8080
```

ArdÄ±ndan `http://localhost:8080/tr/` adresini aÃ§Ä±n.

## YayÄ±nlama

`outputs/hk-site` klasÃ¶rÃ¼nÃ¼n iÃ§eriÄŸini sunucuda `/hk/` dizinine yÃ¼kleyin. Ã–rnek dil URL'leri:

- `/hk/tr/`
- `/hk/en/`
- `/hk/de/`
- `/hk/ar/`

## Alan adÄ±na taÅŸÄ±ma

`config.js` iÃ§inde:

- `BASE_PATH`: `/hk/` yerine `/` yapÄ±labilir.
- `SITE_ORIGIN`: yeni canlÄ± alan adÄ±yla gÃ¼ncellenir.

Statik SEO canonical ve hreflang etiketleri sayfa iÃ§inde Ã¼retildiÄŸi iÃ§in kÃ¶k alana geÃ§iÅŸte sayfalar yeniden Ã¼retilmeli veya `/hk/` yollarÄ± topluca gÃ¼ncellenmelidir.

## Logo deÄŸiÅŸtirme

GeÃ§ici logo dosyasÄ±:

`assets/img/logo/hk-logo-placeholder.svg`

GerÃ§ek logo aynÄ± dosya adÄ±yla deÄŸiÅŸtirilebilir veya HTML ÅŸablonlarÄ±nda yeni dosya yoluna alÄ±nabilir.

## GÃ¶rselleri ekleme

`assets-manifest.json` her gÃ¶rsel slotu iÃ§in ihtiyaÃ§, Ã¶nerilen kaynak, hedef dosya yolu ve alt metni iÃ§erir. GerÃ§ek gÃ¶rseller eklendiÄŸinde ilgili sayfalardaki placeholder SVG yollarÄ± WebP/JPG dosyalarÄ±yla deÄŸiÅŸtirilebilir.

## WhatsApp ve telefon

`config.js` iÃ§inde:

```js
WHATSAPP_NUMBER: "905xxxxxxxxx",
PHONE_NUMBER: "+90..."
```

WhatsApp numarasÄ± boÅŸsa butonlar iletiÅŸim sayfasÄ±na yÃ¶nlenir.

## Lead endpoint

`config.js` iÃ§inde `LEAD_ENDPOINT` boÅŸ bÄ±rakÄ±lÄ±rsa quiz lead objesi `localStorage` iÃ§ine kaydedilir ve console'a yazÄ±lÄ±r. CRM veya webhook hazÄ±r olduÄŸunda endpoint URL'si bu alana eklenebilir.

## GTM / Meta Pixel

`config.js` iÃ§inde `GTM_ID` ve `META_PIXEL_ID` alanlarÄ± doldurulduÄŸunda `tracking.js` eventleri dataLayer ve Meta Pixel ile gÃ¶nderir.

HazÄ±r custom eventler: `hk_page_view`, `hk_quiz_start`, `hk_goal_selected`, `hk_duration_selected`, `hk_bmi_entered`, `hk_activity_selected`, `hk_join_timing_selected`, `hk_form_start`, `hk_lead_submit`, `hk_whatsapp_click`, `hk_call_click`, `hk_gallery_view`, `hk_room_view`, `hk_program_view`, `hk_video_play_click`.

## Dil metinleri

Dil iÃ§erikleri `data/tr.json`, `data/en.json`, `data/de.json`, `data/ar.json` iÃ§inde arÅŸivlenmiÅŸtir. Quiz arayÃ¼zÃ¼ runtime iÃ§in `assets/js/i18n.js` iÃ§inden okunur.

## Video embedleri

`data/videos.json` iÃ§indeki `embed_id` alanlarÄ±na YouTube video ID'leri girildiÄŸinde video kartlarÄ± tÄ±klanÄ±nca iframe'i lazy-load eder.

## Visual revision

Preview tasariminda RAL 6020 hissine yakin koyu dogal yesil palet, modern sans-serif tipografi, daha dengeli hero oranlari, premium kart yuzeyleri, kontrollu HK sarisi CTA vurgusu ve mobil kirilimlar icin tasma onleyici responsive iyilestirmeler uygulanmistir.
## Logo kullanımı

Gerçek logo yüklemek için `assets/img/logo/hk-logo.png` dosyasını bu klasöre ekleyin. Aynı isimle yüklendiğinde header otomatik gerçek logoyu kullanır; dosya yoksa `assets/img/logo/hk-logo-placeholder.svg` yedeğine düşer.
