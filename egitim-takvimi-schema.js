// CoffeeNutz egitim-takvimi-schema.js  v2026-09-03a
// Sync-free Course + CourseInstance JSON-LD for https://www.coffeenutz.net/pages/sca-egitim-takvimi
//
// Replaces the hand-maintained block from sca-egitim-takvimi-schema.html (2026-05-28).
// Same entity structure Google was given in May (ItemList of 7 Courses, each with
// provider, credential, courseCode, hasCourseInstance[]), but the instances now come from the
// public-trainings feed (the Trainings sheet), and prices from Shopify's own product JSON,
// so nothing on this page is ever typed by hand again.
//
// Include from theme.liquid, guarded by the page handle:
//   {% if page.handle == 'sca-egitim-takvimi' %}
//     <script src="https://guide.coffeenutz.net/egitim-takvimi-schema.js" defer></script>
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
      description: "Coffee Quality Institute'tan SCA'ya devredilen Q Grader sertifikasyon programı. 6 gün, 8 pratik sınav + 1 yazılı sınav. Başarıyla tamamlayan adaylar 3 yıllık geçerli Q Grader lisansı kazanır.",
      credential: "SCA Q Grader Lisansı (3 yıl geçerli)",
      enUrl: SITE + "/pages/q-grader-english",
    },
    "SCA Barista F+I": {
      handle: "sca-barista-foundation-intermediate", code: "SCA-BARISTA-FI",
      name: "SCA Barista Foundation + Intermediate",
      description: "SCA Coffee Skills programının barista kolunda 3 günlük Foundation + Intermediate seviyesi: espresso ekstraksiyonu, süt teknikleri, makine kalibrasyonu ve servis akışı.",
      credential: "SCA Coffee Skills Barista Foundation + Intermediate Digital Certificate",
    },
    "SCA Barista Pro": {
      handle: "barista-professional", code: "SCA-BARISTA-PRO",
      name: "SCA Barista Professional",
      description: "SCA Coffee Skills Barista Professional 3 günlük blok. Foundation + Intermediate'i tamamlamış öğrenciler için ileri seviye espresso, süt ve servis pratiği.",
      credential: "SCA Coffee Skills Barista Professional Digital Certificate",
      prereq: "SCA Coffee Skills Barista Foundation + Intermediate",
    },
    "SCA Sensory F+I": {
      handle: "sca-sensory-skills-foundation-intermediate", code: "SCA-SENSORY-FI",
      name: "SCA Sensory Skills Foundation + Intermediate",
      description: "3 günlük SCA Sensory Skills Foundation + Intermediate. Tat ve koku algısının kalibrasyonu, SCA cupping form pratiği, duyusal sınama metodolojisi.",
      credential: "SCA Coffee Skills Sensory Foundation + Intermediate Digital Certificate",
    },
    "SCA Sensory Pro": {
      handle: "sca-sensory-skills-professional", code: "SCA-SENSORY-PRO",
      name: "SCA Sensory Skills Professional",
      description: "3 günlük SCA Sensory Skills Professional, F+I haftasının ardından. Yedi günlük tam Sensory bloğunu tek seyahatte tamamlayanlar için.",
      credential: "SCA Coffee Skills Sensory Professional Digital Certificate",
      prereq: "SCA Coffee Skills Sensory Foundation + Intermediate",
    },
    "SCA Roasting F+I": {
      handle: "roasting-foundation-intermediate", code: "SCA-ROASTING-FI",
      name: "SCA Coffee Roasting Foundation + Intermediate",
      description: "4 günlük SCA Coffee Roasting Foundation + Intermediate. Yeşil çekirdek değerlendirmesi, kavurma profili tasarımı, kavurma hatalarının teşhisi.",
      credential: "SCA Coffee Skills Roasting Foundation + Intermediate Digital Certificate",
    },
    "SCA Roasting Pro": {
      handle: "roasting-professional", code: "SCA-ROASTING-PRO",
      name: "SCA Coffee Roasting Professional",
      description: "3 günlük SCA Coffee Roasting Professional, F+I bloğunun ardından. İleri profil tasarımı, tekrarlanabilirlik ve üretim kavurması pratiği.",
      credential: "SCA Coffee Skills Roasting Professional Digital Certificate",
      prereq: "SCA Coffee Skills Roasting Foundation + Intermediate",
    },
  };
  const ORDER = ["Q Grader Sertifikasyon", "SCA Barista F+I", "SCA Barista Pro", "SCA Sensory F+I", "SCA Sensory Pro", "SCA Roasting F+I", "SCA Roasting Pro"];

  const PROVIDER = { "@type": "Organization", "name": "CoffeeNutz", "url": SITE, "sameAs": ["https://www.instagram.com/coffeenutznet"] };
  const LOCATION = { "@type": "Place", "name": "CoffeeNutz İzmir Eğitim Laboratuvarı", "address": { "@type": "PostalAddress", "addressLocality": "İzmir", "addressCountry": "TR" } };
  const INSTRUCTOR = { "@type": "Person", "name": "Ömer Aydın", "jobTitle": "SCA Authorised Trainer (AST) ve Türkçe Q Instructor", "url": SITE + "/pages/about-omer" };

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
  const prices = {};
  await Promise.all(ORDER.map(async (k) => { prices[k] = await priceOf(COURSES[k].handle); }));

  const langCode = (l) => (String(l).toLowerCase().startsWith("en") ? "en" : "tr");
  const items = ORDER.map((key, i) => {
    const c = COURSES[key];
    const productUrl = SITE + "/products/" + c.handle;
    const course = {
      "@type": "Course",
      "@id": productUrl,
      "name": c.name,
      "description": c.description,
      "provider": PROVIDER,
      "educationalCredentialAwarded": c.credential,
      "courseCode": c.code,
    };
    if (c.prereq) course.coursePrerequisites = c.prereq;
    const inst = trainings
      .filter((x) => x.name === key && x.start && x.end)
      .sort((a, b) => a.start.localeCompare(b.start))
      .map((x) => {
        const lang = langCode(x.lang);
        const url = (x.url && /^https:\/\//.test(x.url)) ? x.url : ((lang === "en" && c.enUrl) ? c.enUrl : productUrl);
        const offer = { "@type": "Offer", "priceCurrency": "TRY", "availability": "https://schema.org/InStock", "url": url };
        if (prices[key]) offer.price = prices[key];
        return {
          "@type": "CourseInstance",
          "courseMode": "InPerson",
          "startDate": x.start,
          "endDate": x.end,
          "inLanguage": lang,
          "location": LOCATION,
          "instructor": INSTRUCTOR,
          "offers": offer,
        };
      });
    if (inst.length) course.hasCourseInstance = inst;
    return { "@type": "ListItem", "position": i + 1, "item": course };
  });

  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "SCA Eğitim Takvimi, CoffeeNutz İzmir",
    "description": "CoffeeNutz İzmir SCA Barista, Sensory Skills, Coffee Roasting ve SCA Q Grader eğitim takvimi. Canlı takvim: yeni sınıflar açıldıkça burada görünür.",
    "url": PAGE,
    "itemListOrder": "https://schema.org/ItemListOrderAscending",
    "numberOfItems": items.length,
    "itemListElement": items,
  };

  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.id = "cn-egitim-takvimi-schema";
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);
  window.__cnSchema = ld; // for tests and for a quick console check
})();
