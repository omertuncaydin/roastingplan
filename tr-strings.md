*Last updated: 2026-06-29 (Turkey time)*

# CoffeeNutz Guide - Turkish mirror (tr-strings)

EN is the source of truth; the app is designed in English. This file holds the Turkish equivalent of every user-facing string. A TR/EN toggle is now live in the app (at login and on the Account page); it reads from a `DICT.tr` map inside `roast-guide.html` that currently covers the chrome (login, nav, sub-tabs, section headings, roast home). This mirror is the full reference; expand `DICT.tr` from here each step so more surfaces flip. The CVA assessment lexicon (Fragrance, Floral, defect names, the 9-point internals) intentionally stays English, as it is taught. Brand names (CoffeeNutz, CoffeeNutz Guide) stay untranslated. No em dashes.

## Contents
- [Website launch banner](#website-launch-banner)
- [Login](#login)
- [Navigation](#navigation)
- [Roast](#roast)
- [Cup](#cup)
- [Grade](#grade)
- [Value Assessment](#value-assessment)
- [Account](#account)
- [Plans](#plans)

## Website launch banner
- CoffeeNutz Guide is live... → "CoffeeNutz Guide yayında. Kavurmadan tadıma, planlamadan değerlendirmeye, kahvenizin tüm yolculuğunu tek yerden yönetin. Tüm öğrencilerimiz davetli."
- Former students access line (login page) → see Login section ("Eski bir öğrenciyseniz, hesabınız için info@coffeenutz.net adresine e-posta gönderin.")

## Login
- Sign in to load your recipes. → "Reçetelerinizi yüklemek için giriş yapın."
- Email → "E-posta"
- Password → "Şifre"
- Log in → "Giriş yap"
- Copied! (after tapping the email to copy) → "Kopyalandı!"
- If you are a former student, copy this address and email us for your account: info@coffeenutz.net → "Eski bir öğrenciyseniz, bu adresi kopyalayıp hesabınız için bize e-posta gönderin: info@coffeenutz.net"

## Navigation
- Roast → "Kavurma"
- Cup → "Tadım"
- Grade → "Sınıflandırma"
- Value (Value Assessment) → "Değerlendirme"
- Sub-tabs: Guide → "Rehber"; Recipes → "Reçeteler"; History → "Geçmiş"; Rules → "Kurallar"
- Section subtitles:
  - Roast: "first crack to drop, guided" → "ilk çıtırtıdan boşaltmaya, rehberli"
  - Cup: "sensory · CVA descriptive + affective" → "duyusal · CVA tanımlayıcı + duyuşsal"
  - Grade: "green physical · CVA defect grading" → "fiziksel (yeşil) · CVA kusur sınıflandırması"
  - Value Assessment: "Fit + Distinctiveness · the identity card" → "Uyum + Ayırt Edicilik · kimlik kartı"

## Roast
- Coffee (active) → "Kahve (aktif)"
- Machine → "Makine"
- FC time → "FC zamanı"
- Drop at → "Boşaltma"
- Agtron → "Agtron"
- Open the guide → "Rehberi aç"
- START → "BAŞLA"
- CINNAMON → "TARÇIN"
- FIRST CRACK (A0) → "İLK ÇITIRTI (A0)"
- DROP / FINISH → "BOŞALT / BİTİR"
- New roast → "Yeni kavurma"
- Gauge center now shows the COUNTDOWN to the next milestone (prediction), not the elapsed clock; elapsed moved to the small line below. Labels:
  - to cinnamon → "tarçına kalan"; cinnamon now → "tarçın şimdi"
  - to first crack → "ilk çıtırtıya kalan"; crack now → "çıtırtı şimdi"
  - to drop · {stage} → "boşaltmaya kalan · {stage}"; drop now · {stage} → "boşalt şimdi · {stage}"
  - since start → "başlangıçtan beri"; since first crack → "ilk çıtırtıdan beri"
- Tap START when the roast begins. → "Kavurma başladığında BAŞLA'ya dokun."
- Roast finished and learned. → "Kavurma bitti ve öğrenildi."
- Power notation from the recipe, shown while roasting (e.g. -P2 stays as-is in the header; spoken out at cinnamon):
  - drop power {n} steps → "gücü {n} kademe düşür"; raise power {n} steps → "gücü {n} kademe artır" (step singular = "kademe", same word)
  - At cinnamon, {action}. → "Tarçında, {action}." e.g. "Tarçında, gücü 2 kademe düşür." (shown before cinnamon)
  - Now: {action}. → "Şimdi: {action}." (shown at the start of cinnamon, when the CINNAMON button is pressed)
- Cooling timer (opens when DROP is pressed; target 25°C; warns past 5 min):
  - Cooling → "Soğutma"; Cool to 25°C. → "25°C'ye soğut."; Reached 25°C → "25°C'ye ulaştı"
  - Cooled to 25°C in {t}. → "{t} içinde 25°C'ye soğudu."
  - Over-5-min warning → "5 dakika geçti. Çekirdek sıcaklığını kontrol et. 25°C'ye ulaşmadıysa soğutma tablası ve fan hava akışını kontrol et."
- Test speed buttons (30×/60×) now locked behind a 🔒/🔓 toggle so they aren't pressed by accident mid-roast (icons, no translation)
- Cup this coffee → "Bu kahveyi tadımla"
- Deep Calibration Learning → "Derin Kalibrasyon Öğrenmesi"
- Deep Calibration modal (now DICT-wired so it flips with the TR toggle): title "Derin Kalibrasyon"; Soft/Hard Mapping "Yumuşak/Sert Harita"; Batch (g) "Parti (g)"; Flame/Power "Alev/Güç"; Fan "Fan"; Drum "Tambur"; Stage "Kademe"; Temp "Sıcaklık"; Record sample "Numuneyi kaydet"; Undo "Geri al"; Cup starred samples "Yıldızlı numuneleri tadımla"; Finish & save "Bitir ve kaydet"; Start fresh "Sıfırdan başla"; Close "Kapat"; Saved maps "Kayıtlı haritalar"; Start/Running "Başlat/Çalışıyor"; Load "Yükle". Stage codes CHG/READ/YLW/A0.../2ND/DROP kept English. Starred samples flow to Build Cupping Session. Saves locally (Supabase persistence still pending).
- Temp curve module (optional, probe-free bean temp logged at a fixed interval; live on roast screen, hideable, hardcoded EN for now, DICT wiring pending. ROR removed 2026-06-29):
  - Show temp curve → "Sıcaklık eğrisini göster"; Hide temp curve → "Sıcaklık eğrisini gizle"
  - Charge temperature (°C, beans in): → "Şarj sıcaklığı (°C, çekirdekler girince):" (asked once when the curve is first turned on; becomes the t=0 point)
  - every 30s → "her 30sn"; every 60s → "her 60sn"
  - Charge temps by batch size (roast setup screen): "Batch size" → "Parti boyutu"; "Charge temps" → "Şarj sıcaklıkları"; "Add size" → "Boyut ekle"; "- set charge temps -" → "- şarj sıcaklığı gir -"; editor header "Charge temp per batch size for" → "Parti boyutuna göre şarj sıcaklığı:", "The Temp wheel opens here when you Start." → "Başlat'a bastığında Sıcaklık tekerleği buradan açılır." Per-machine table stored in localStorage `gCharge`, seeded with Bullet 500g=190°C and HSR15 1000/2500/5000/7500g = 140/150/160/165°C. Batch-size selector on the setup screen picks the size; Start pre-fills the CHG Temp wheel from the machine+size row (exact match, else nearest size). Editable via the "Charge temps" panel.
  - Temp entry is a custom scroll-wheel drum (30-260°C, no keyboard) that auto-jumps to the predicted next temp (one interval ahead of the recent rate); Log → "Kaydet". Layout A: curve on top with CIN/A0/DROP stage marks, wheel docked below.
  - Curve shows stage marks: CIN / A0 / DROP dashed lines at the times they happen (labels kept short/EN)
  - Capture mode (roast with the calibration wheels, gauge stays cockpit): the wheel now walks every stage one at a time like Deep Calibration (CHG→YLW→CIN→A0→A1→B0→B1→C0→C1→C2→DROP), no phase-skipping. Single primary button reads "Start" ("Başlat", green pulse) at idle and flips to "Record" ("Kaydet") once the roast is running. Start records CHG and begins the clock. Each Record logs the selected stage's temp point and walks the wheel one step; CIN/A0/DROP also drive the gauge phases. "+ temp" ("+ sıcaklık") logs a reading without moving the wheel; Undo pops the last point and steps the wheel back. Big FIRST CRACK / Undo-last-mark buttons removed from the live screen (big button survives only as "New roast" at the end). Hint line: "Başlat CHG'yi kaydeder. Sonra her kademeyi sırayla Kaydet; + sıcaklık kademeler arası okuma ekler."
  - first reading at 30s → "ilk ölçüm 30. sn"; next reading in {n}s → "sonraki ölçüm {n}sn"; log bean °C now → "şimdi çekirdek °C gir"
  - Chart series: Bean °C → "Çekirdek °C"

## History
- Table columns: Date → "Tarih"; Batch → "Parti"; Coffee → "Kahve"; Target Agtron → "Hedef Agtron" (Actual Agtron column removed from the table 2026-06-30; Batch column added)
- Actual Agtron (slider section below each row, with the editable number on the right) → "Gerçek Agtron"
- Batch code #N (increments per date per machine) → "#N" (kept as-is)
- Heuristics (label/popup) → "Sezgiler"; Log (label/popup, under Coffee) → "Kayıt"
- Log popup fields: Machine → "Makine"; Drop gain (renamed from "Drop stage" 2026-06-30, the crack stage at drop) → "Boşaltma kazanımı"; Dev time → "Gelişim süresi"; First crack temp → "İlk çıtırtı sıcaklığı"; End temp → "Bitiş sıcaklığı"
- Actual AG entry now read-only in the table column; editable input + slider sit in the row below (label "Actual AG")
- Correction suggestion (EN, generated; now a numbered 2-point list, no ↳ prefix): "1. Ran {n} pts dark/light ({a} vs {t}) so the first crack gain likely passed/fell short of {stage}. Stay at/Make sure you reach {stage} next time. 2. Or if you are not confident in your recipe, drop nearer {prev/next}, about {s}s earlier/later, to reach {t} and record the updated recipe." (CVA/heuristic copy stays English)

## Cup
- cupping score → "tadım puanı"
- Cup sub-modes: Combined → "Birleşik"; Descriptive → "Tanımlayıcı"; Affective → "Duyuşsal"
- Date → "Tarih"; Purpose → "Amaç"
- Sample # / coffee → "Numune # / kahve"
- Roast level (Agtron) → "Kavurma derecesi (Agtron)"
- Notes (per cupping section, end of each) → "Notlar"
- + New coffee to assess (select option) → "+ Değerlendirilecek yeni kahve"
- Score reveal/secure button: Reveal → "Göster"; Hide → "Gizle"; Keep secured → "Gizli kalsın"
- Cupping Session (attribute-paged multi-coffee scoring, term is "session" not "flight"): Build Cupping Session → "Tadım Seansı Oluştur"; Cupping Session → "Tadım Seansı"; Add a coffee to the table → "Masaya kahve ekle"; Save session → "Seansı kaydet"; Back to single coffee → "Tek kahveye dön"
- Purpose placeholder (EN-only for now) → e.g. for our Italian cafe customer
- Sections: Fragrance → "Koku (kuru)"; Aroma → "Aroma"; Flavor → "Tat"; Aftertaste → "Bitiş tadı"; Acidity → "Asidite"; Sweetness → "Tatlılık"; Mouthfeel → "Ağız hissi"; Overall → "Genel"
- intensity / Low / High → "yoğunluk" / "Düşük" / "Yüksek"
- 1 extremely low → "1 çok düşük"; 5 neither → "5 ne yüksek ne düşük"; 9 extremely high → "9 çok yüksek"
- Main tastes of flavor & aftertaste (up to 2) → "Tat ve bitiş tadının ana tatları (en fazla 2)"
- Uniformity & defects → "Tekdüzelik ve kusurlar"
- Non-uniform cups → "Tekdüze olmayan fincanlar"
- Defective cups → "Kusurlu fincanlar"
- Defect type → "Kusur türü"
- Roast level → "Kavurma derecesi"
- Save cupping → "Tadımı kaydet"
- Lite banner / enroll prompt → "Lite erişim. Dilediğinizce puanlayın ve keşfedin. Tadımınızı kaydetmek, sınıfınıza kaydolduğunuzda açılır."

## Grade
- Green color → "Yeşil renk"
- Moisture % → "Nem %"
- Water activity (Aw) → "Su aktivitesi (Aw)"
- Category 1 defects → "Kategori 1 kusurları"
- Category 2 defects → "Kategori 2 kusurları"
- Specialty grade → "Spesiyalite sınıfı"
- Below specialty → "Spesiyalite altı"
- Save grading → "Sınıflandırmayı kaydet"
- Extrinsic (information value) → "Dışsal (bilgi değeri)"
- Origin → "Menşe"; Variety → "Çeşit"; Process → "İşleme"; Certifications → "Sertifikalar"
- Aw note → "Su aktivitesi serbest nemi ölçer ve küf riski ile raf ömrünü nem oranından daha iyi öngörür. SCA yeşil standardı zaten Aw'nin 0.70'in altında olmasını ister, ancak CVA Fiziksel formu bunu kaydetmenizi henüz istemiyor."

## Value Assessment
- Fit → "Uyum"
- Distinctiveness → "Ayırt Edicilik"
- The distinctive attribute → "Ayırt edici özellik"
- Prompt → "Tek cümleyle: bu kahvenin başka bir kahvenin yapamayacağı şey nedir? Puan değil, asıl değeri belirleyen budur."
- Identity card → "Kimlik kartı"
- Pillars: Physical (green) → "Fiziksel (yeşil)"; Roast → "Kavurma"; Descriptive → "Tanımlayıcı"; Affective → "Duyuşsal"; Extrinsic → "Dışsal"
- Bonus round button → "★ Bonus tur · Kahvelerinizi gerçekten tanıyor musunuz? Tek bir kavurmadan A0 / A1 / B1 / C numuneleri alıp tadın ve fincanın nasıl değiştiğini görün. Oyuna girin. Çok yakında."

## Account
- Your membership → "Üyeliğiniz"
- Email → "E-posta"; Member since → "Üyelik tarihi"; Plan → "Plan"
- Refresh app (button, cache-busting reload) → "Uygulamayı yenile"
- Change password → "Şifre değiştir"
- New password → "Yeni şifre"; Confirm new password → "Yeni şifreyi onayla"; Update password → "Şifreyi güncelle"
- Log out → "Çıkış yap"
- Member access → "Üye erişimi"
- Learner email → "Öğrenci e-postası"
- Save plan → "Planı kaydet"
- Provisioned members → "Tanımlı üyeler"

## Plans
- Roaster Plan → "Kavurucu Planı"
- Roaster & Cupper Plan → "Kavurucu ve Tadımcı Planı"
- Admin → "Yönetici"
- Lite (no plan) → "Lite (plansız)"

## Stage guide popup (ⓘ next to Stage wheels, Roast capture + Deep Calibration)
- Stage guide → "Kademe rehberi"
- Intro → "Prob tamburu okur, çekirdeği değil. A0'dan itibaren her kademe, çekirdeğin sesle anlattıklarıyla tanımlanır."
- A0 → "Gerçek anlamda ilk çatlama. Art arda çatlamanın başlangıcı değil, ilk tek çıtlama."
- A1 → "Çatlamalar sıklaşır: saniyede bir ikiden sürekli bir çıtırtıya, yaklaşık beş ve üzerine çıkar."
- B0 → "Çatlama şiddeti ve çatlama hızı zirveye doğru tırmanır."
- B1 → "Çatlama şiddetinin ve hızının zirvesi."
- C0 → "Azalma: çatlamalar son çatlamalara doğru seyrekleşir."
- C1 → "İlk çatlamanın kesin son çatlaması."
- C2 → "İlk ve ikinci çatlama arasının orta noktası (MP). Kendi sesi yoktur; C1 sonrası sessizlikte yer alır. Eğitim referansıdır, yalnız sert haritada."
- 2ND → "İkinci çatlama başlar. Yalnız sert haritada."
