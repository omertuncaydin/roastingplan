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
- Cup this coffee → "Bu kahveyi tadımla"
- Deep Calibration Learning → "Derin Kalibrasyon Öğrenmesi"
- Temp curve module (optional, probe-free bean temp + ROR logged at a fixed interval; live on roast screen, hideable, hardcoded EN for now, DICT wiring pending):
  - Show temp curve → "Sıcaklık eğrisini göster"; Hide temp curve → "Sıcaklık eğrisini gizle"
  - every 30s → "her 30sn"; every 60s → "her 60sn"
  - bean °C (input placeholder) → "çekirdek °C"; Log → "Kaydet"
  - first reading at 30s → "ilk ölçüm 30. sn"; next reading in {n}s → "sonraki ölçüm {n}sn"; log bean °C now → "şimdi çekirdek °C gir"
  - Chart series: Bean °C → "Çekirdek °C"; ROR °C/min → "ROR °C/dk" (ROR = yükselme hızı; term kept as ROR)

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
