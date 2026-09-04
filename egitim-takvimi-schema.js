// CoffeeNutz egitim-takvimi-schema.js  v2026-09-04a
// Sync-free Course + CourseInstance JSON-LD for coffeenutz.net. Two modes, decided by the URL:
//   /pages/sca-egitim-takvimi      -> ItemList of all 7 SCA courses with their live cohorts
//   /products/<course handle>      -> that single Course with its live cohorts
// Anything else (coffee products, other pages) -> does nothing.
//
// Instances come from the public-trainings feed (the Trainings sheet), prices from Shopify's
// own product JSON, so no date or price on the site is ever typed by hand again.
// Replaces: the May-2026 ItemList block and the per-product Course blocks in theme.liquid.
//
// Include from theme.liquid:
//   {% if page.handle == 'sca-egitim-takvimi' or template.name == 'product' %}
//     <script src="https://guide.coffeenutz.net/egitim-takvimi-schema.js" charset="utf-8" defer></script>
//   {% endif %}
(async function () {
  const FEED = "https://efjvfggwnhqkunjvoyjb.supabase.co/functions/v1/public-trainings";
  const SITE = "https://www.coffeenutz.net";
  const PAGE = SITE + "/pages/sca-egitim-takvimi";

  // Evergreen course facts. Change only when a course is added or renamed.
  // Keys = the exact training names used in the Trainings sheet / public feed.
  const COURSES = {
    "Q Grader Sertifikasyon": {
      handle: "q-grader", code: "SCA-Q-GRADER",
      name: "SCA Q Grader Sertifikasyon Programı",
      trName: "SCA Q Grader Sertifikasyon Programı",
      description: "Coffee Quality Institute'tan SCA'ya devredilen Q Grader sertifikasyon programı. 6 gün, 8 pratik sınav + 1 yazılı sınav. Başarıyla tamamlayan adaylar 3 yıllık geçerli Q Grader lisansı kazanır.",
      credential: "SCA Q Grader Lisansı (3 yıl geçerli)",
      enUrl: SITE + "/pages/q-grader-english",
    },
    "SCA Barista F+I": {
      handle: "sca-barista-foundation-intermediate", code: "SCA-BARISTA-FI",
      name: "SCA Barista Foundation + Intermediate",
      trName: "Barista Eğitimi (SCA Barista Skills: Foundation + Intermediate)",
      description: "SCA Coffee Skills programının barista kolunda 3 günlük Foundation + Intermediate seviyesi: espresso ekstraksiyonu, süt teknikleri, makine kalibrasyonu ve servis akışı.",
      credential: "SCA Coffee Skills Barista Foundation + Intermediate Digital Certificate",
    },
    "SCA Barista Pro": {
      handle: "barista-professional", code: "SCA-BARISTA-PRO",
      name: "SCA Barista Professional",
      trName: "Barista Eğitimi (SCA Barista Skills: Professional)",
      description: "SCA Coffee Skills Barista Professional 3 günlük blok. Foundation + Intermediate'i tamamlamış öğrenciler için ileri seviye espresso, süt ve servis pratiği.",
      credential: "SCA Coffee Skills Barista Professional Digital Certificate",
      prereq: "SCA Coffee Skills Barista Foundation + Intermediate",
    },
    "SCA Sensory F+I": {
      handle: "sca-sensory-skills-foundation-intermediate", code: "SCA-SENSORY-FI",
      name: "SCA Sensory Skills Foundation + Intermediate",
      trName: "Duyusal Analiz Eğitimi (SCA Sensory Skills: Foundation + Intermediate)",
      description: "3 günlük SCA Sensory Skills Foundation + Intermediate. Tat ve koku algısının kalibrasyonu, SCA cupping form pratiği, duyusal sınama metodolojisi.",
      credential: "SCA Coffee Skills Sensory Foundation + Intermediate Digital Certificate",
    },
    "SCA Sensory Pro": {
      handle: "sca-sensory-skills-professional", code: "SCA-SENSORY-PRO",
      name: "SCA Sensory Skills Professional",
      trName: "Duyusal Analiz Eğitimi (SCA Sensory Skills: Professional)",
      description: "3 günlük SCA Sensory Skills Professional, F+I haftasının ardından. Yedi günlük tam Sensory bloğunu tek seyahatte tamamlayanlar için.",
      credential: "SCA Coffee Skills Sensory Professional Digital Certificate",
      prereq: "SCA Coffee Skills Sensory Foundation + Intermediate",
    },
    "SCA Roasting F+I": {
      handle: "roasting-foundation-intermediate", code: "SCA-ROASTING-FI",
      name: "SCA Coffee Roasting Foundation + Intermediate",
      trName: "Kahve Kavurma Eğitimi (SCA Roasting: Foundation + Intermediate)",
      description: "İzmir'de SCA sertifikalı kahve kavurma eğitimi. 4 günlük uygulamalı SCA Roasting Foundation + Intermediate programı: yeşil çekirdek değerlendirmesi, kavurma profili tasarımı, kavurma hatalarının teşhisi.",
      credential: "SCA Coffee Skills Roasting Foundation + Intermediate Digital Certificate",
    },
    "SCA Roasting Pro": {
      handle: "roasting-professional", code: "SCA-ROASTING-PRO",
      name: "SCA Coffee Roasting Professional",
      trName: "Kahve Kavurma Eğitimi (SCA Roasting: Professional)",
      description: "3 günlük SCA Coffee Roasting Professional, F+I bloğunun ardından. İleri profil tasarımı, tekrarlanabilirlik ve üretim kavurması pratiği.",
      credential: "SCA Coffee Skills Roasting Professional Digital Certificate",
      prereq: "SCA Coffee Skills Roasting Foundation + Intermediate",
    },
  };
  const ORDER = ["Q Grader Sertifikasyon", "SCA Barista F+I", "SCA Barista Pro", "SCA Sensory F+I", "SCA Sensory Pro", "SCA Roasting F+I", "SCA Roasting Pro"];

  const PROVIDER = { "@type": "Organization", "name": "CoffeeNutz", "url": SITE, "sameAs": ["https://www.instagram.com/coffeenutznet"] };
  const LOCATION = { "@type": "Place", "name": "CoffeeNutz İzmir Atölye", "address": { "@type": "PostalAddress", "streetAddress": "Barbaros Mah. 333 Sk. No: 11", "addressLocality": "İzmir", "addressCountry": "TR" } };
  const INSTRUCTOR = { "@type": "Person", "name": "Ömer Aydın", "jobTitle": "SCA Authorised Trainer (AST) ve Türkçe Q Instructor", "url": SITE + "/pages/about-omer" };

  // ---- which page are we on? (tolerates /en/ style locale prefixes) ----
  const path = location.pathname;
  const isCalendar = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?pages\/sca-egitim-takvimi\/?$/i.test(path);
  const pm = path.match(/^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?products\/([a-z0-9-]+)/i);
  const productKey = pm ? ORDER.find((k) => COURSES[k].handle === pm[1].toLowerCase()) : null;
  if (!isCalendar && !productKey) return;

  let trainings = [];
  try {
    const r = await fetch(FEED, { cache: "no-store" });
    if (!r.ok) return;
    trainings = (await r.json()).trainings || [];
  } catch (_) { return; } // no feed, no schema: never inject a stale one

  // Price from Shopify's public product JSON (same origin on coffeenutz.net). Missing = omit price.
  async function priceOf(handle) {
    try {
      const r = await fetch("/products/" + handle + ".js", { cache: "no-store" });
      if (!r.ok) return null;
      const p = await r.json();
      return typeof p.price === "number" ? String(Math.round(p.price / 100)) : null;
    } catch (_) { return null; }
  }

  const TR_M = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  const EN_M = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const langCode = (l) => (String(l).toLowerCase().startsWith("en") ? "en" : "tr");
  function range(s, e, lang) {
    const a = new Date(s + "T00:00:00Z"), b = new Date(e + "T00:00:00Z");
    if (isNaN(a) || isNaN(b)) return s + " / " + e;
    const M = lang === "en" ? EN_M : TR_M;
    const y = b.getUTCFullYear();
    if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()}-${b.getUTCDate()} ${M[a.getUTCMonth()]} ${y}`;
    return `${a.getUTCDate()} ${M[a.getUTCMonth()]}-${b.getUTCDate()} ${M[b.getUTCMonth()]} ${y}`;
  }
  function instance(x, c, price) {
    const lang = langCode(x.lang);
    const days = Math.round((Date.parse(x.end) - Date.parse(x.start)) / 86400000) + 1;
    const productUrl = SITE + "/products/" + c.handle;
    const url = (x.url && /^https:\/\//.test(x.url)) ? x.url : ((lang === "en" && c.enUrl) ? c.enUrl : productUrl);
    const offer = { "@type": "Offer", "category": "Paid", "priceCurrency": "TRY", "availability": "https://schema.org/InStock", "url": url };
    if (price) offer.price = price;
    const ci = {
      "@type": "CourseInstance",
      "name": `${x.name} (${lang === "en" ? "English" : "Türkçe"}), ${range(x.start, x.end, lang)}`,
      "courseMode": "Onsite",
      "startDate": x.start,
      "endDate": x.end,
      "inLanguage": lang,
      "location": LOCATION,
      "instructor": INSTRUCTOR,
      "offers": offer,
    };
    if (days > 0 && days < 30) ci.courseWorkload = `P${days}D`;
    return ci;
  }
  function course(key, price, opts) {
    const c = COURSES[key];
    const productUrl = SITE + "/products/" + c.handle;
    const out = {
      "@type": "Course",
      "@id": productUrl,
      "name": opts && opts.tr ? c.trName : c.name,
      "description": c.description,
      "url": productUrl,
      "provider": PROVIDER,
      "educationalCredentialAwarded": c.credential,
      "courseCode": c.code,
    };
    if (c.prereq) out.coursePrerequisites = c.prereq;
    const inst = trainings
      .filter((x) => x.name === key && x.start && x.end)
      .sort((a, b) => a.start.localeCompare(b.start))
      .map((x) => instance(x, c, price));
    if (inst.length) out.hasCourseInstance = inst;
    const offer = { "@type": "Offer", "category": "Paid", "priceCurrency": "TRY", "availability": "https://schema.org/InStock", "url": productUrl };
    if (price) offer.price = price;
    out.offers = offer;
    return out;
  }

  let ld;
  if (productKey) {
    const price = await priceOf(COURSES[productKey].handle);
    ld = Object.assign({ "@context": "https://schema.org" }, course(productKey, price, { tr: true }));
  } else {
    const prices = {};
    await Promise.all(ORDER.map(async (k) => { prices[k] = await priceOf(COURSES[k].handle); }));
    ld = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "SCA Eğitim Takvimi, CoffeeNutz İzmir",
      "description": "CoffeeNutz İzmir SCA Barista, Sensory Skills, Coffee Roasting ve SCA Q Grader eğitim takvimi. Canlı takvim: yeni sınıflar açıldıkça burada görünür.",
      "url": PAGE,
      "itemListOrder": "https://schema.org/ItemListOrderAscending",
      "numberOfItems": ORDER.length,
      "itemListElement": ORDER.map((k, i) => ({ "@type": "ListItem", "position": i + 1, "item": course(k, prices[k]) })),
    };
  }

  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.id = "cn-egitim-takvimi-schema";
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);
  window.__cnSchema = ld; // for tests and for a quick console check
})();
