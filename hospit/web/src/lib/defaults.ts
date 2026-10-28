import { DEFAULT_QUIZ } from "./quiz";
import type {
  SiteContent, TextTree, Feature, Service, Partner, Client, AboutValue,
  TimelineItem, Advantage, ComparisonRow, Faq, Integration, Settings,
} from "./types";

// ─────────────────────────────────────────────────────────────
// HospIT — ամբողջ բովանդակության ֆոլբեք (TS)։
// Ցուցադրվում է, երբ բազան միացված/հասանելի չէ, և նաև՝ ադմինում
// խմբագրելի արժեքների սկզբնական («seed») տվյալն է։
// ─────────────────────────────────────────────────────────────


export const DEFAULT_TEXTS: TextTree = {
  hy: {
    nav: { home: "Գլխավոր", services: "Ծառայություններ", partners: "Գործընկերներ", pricing: "Գնային հաշվարկ", about: "Մեր մասին", whyus: "Ինչու մենք", contact: "Կապ", cta: "Սկսել", login: "Մուտք", account: "Իմ էջը", admin: "Ադմինկա" },
    hero: {
      eyebrow: "Բուժհաստատություններ ավտոմատացման համակարգ",
      title: "Թվայնացրեք ձեր առողջապահական հաստատությունը խելացի ավտոմատացմամբ",
      body: "HospIT-ը թվային առաջադեմ լուծում է, որը նախատեսված է բժշկական գործընթացները ավտոմատացնելու և օպտիմիզացնելու համար՝ բարձրացնելով արդյունավետությունը, ճշգրտությունը և բուժառուների խնամքի որակը։",
      cta1: "Սկսել", cta2: "Ծառայություններ",
      stat1n: "1000+", stat1l: "Օգտատեր", stat2n: "98%", stat2l: "Անխափան աշխատանք", stat3n: "3×", stat3l: "Աճի արդյունավետություն",
    },
    feat: { eyebrow: "Հիմնական հնարավորություններ", title: "Այն ինչ անհրաժեշտ է ձեր բուժհաստատությանը", body: "Ավտոմատացման չորս հիմնասյուն, որոնք փոխակերպում են բուժհաստատության ամենօրյա աշխատանքը։" },
    preview: {
      eyebrow: "Համակարգի ցուցադրություն", title: "Տեսեք HospIT-ը գործընթացի մեջ",
      body: "Ծանոթացեք, թե ինչպես է մեր հարթակը պարզեցնում բարդ գործընթացները բուժհաստատություններում՝ այցի գրանցումից մինչ այցի ավարտ։",
      p1t: "Կենտրոնացված բուժառուների տվյալներ", p1s: "Բոլոր տվյալները մեկ անվտանգ և հասանելի վայրում",
      p2t: "Տվյալներ իրական ժամանակահատվածում", p2s: "Կառավարեք արագ և հարմար մեկ վահանակից",
      p3t: "Պարզ կառավարման գործիքներ", p3s: "Կառավարում առանց բարդ տեխնիկական քայլերի", cta: "Դեմո տարբերակ",
    },
    connected: {
      eyebrow: "Էկոհամակարգ", title: "Կապված բժշկության հետ",
      body: "HospIT-ը հանդիսանում է Ձեր հաստատության կենտրոնական նյարդային համակարգը՝ իրական ժամանակում կապելով բոլոր բաժիններն իրար։",
      chip1t: "Սինխրոնիզացիա", chip1s: "Բոլոր բաժինները կենդանի կապված են",
      chip2t: "Առանց կորուստների", chip2s: "Հարթակի 99.9% մատչելիություն",
      chip3t: "Անխափան սպասարկում", chip3s: "Կրիտիկական իրադարձությունները փոխանցվում են անմիջապես",
      nodePatients: "Բուժառուներ", nodeDoctors: "Բժիշկներ", nodeLabs: "Լաբորատորիա",
      nodePharmacy: "Դեղատուն", nodeRecords: "Գրառումներ", nodeAnalytics: "Վերլուծություն",
    },
    faq: { eyebrow: "Հաճախ տրվող հարցեր", title: "Ձեր հարցերի պատասխանները", body: "Ամենահաճախ տրվող հարցերը HospIT համակարգի մասին։ Չգտա՞ք պատասխանը՝ կապվեք մեզ հետ։" },
    integrations: { eyebrow: "Ինտեգրացիաներ", title: "Միացած ենք Ձեր օգտագործած համակարգերին", body: "HospIT-ը անխափան աշխատում է առաջատար հարթակների հետ։ Սեղմեք որևէ մեկի վրա՝ մանրամասները տեսնելու համար։", learnMore: "Մանրամասն", visit: "Այցելել կայք" },
    whyHome: {
      eyebrow: "Ինչու HospIT", title: "Ստեղծված նրանց համար, ովքեր հոգ են տանում ուրիշների մասին",
      body: "Մենք հասկանում ենք բժշկական գործառնությունների բարդությունը։ HospIT-ը հատուկ ստեղծված է՝ նվազեցնելու խոչընդոտները, որպեսզի Ձեր թիմը կենտրոնանա բուժառուների վրա, ոչ՝ թղթաբանության։",
      cta: "Ավելին",
      item1: "Ստեղծված բժշկական մասնագետների համար", item2: "Մասշտաբային և ճկուն ճարտարապետություն", item3: "Անխափան ինտեգրացիա գոյություն ունեցող համակարգերի հետ",
      item4: "Ժամանակ խնայող ավտոմատ գործընթացներ", item5: "Պահանջներին համապատասխան տվյալների մշակում", item6: "24/7 նվիրված աջակցություն",
    },
    trusted: { eyebrow: "Մեզ վստահում են", title: "Առաջատար բժշկական հաստատությունների ընտրությունը", body: "Բժշկական կազմակերպությունները վստահում են HospIT-ին՝ իրենց ամենօրյա գործընթացները կառավարելու համար։" },
    stats: { s1n: "1000+", s1l: "ակտիվ օգտատեր", s2n: "2M+", s2l: "Կառավարվող բուժառու", s3n: "98%", s3l: "Հաճախորդների պահպանում", s4n: "70%", s4l: "Ծախսերի կրճատում" },
    cta: { title: "Պատրա՞ստ եք ավտոմատացնել Ձեր բուժհաստատությունը", body: "1000-ից ավելի բուժաշխատակիցներ վստահում են HospIT-ին՝ կառավարելու իրենց գործընթացները։", btn1: "Սկսել", btn2: "Ծառայություններ" },
    svcPage: {
      eyebrow: "Մեր առաջարկը", title: "Մեր ծառայությունները",
      body: "HospIT-ն առաջարկում է գործիքների ամբողջական փաթեթ, որը նախատեսված է բուժհաստատությունների գործընթացները ավտոմատացնելու և օպտիմիզացնելու համար։",
      demoEyebrow: "Գործողության մեջ", demoTitle: "Տեսեք, թե ինչպես է աշխատում", demoBody: "Դիտե՛ք HospIT-ի հիմնական գործառույթների կարճ ցուցադրությունները իրական բժշկական միջավայրերում։",
      vid1t: "Հիվանդի ընդունման գործընթաց", vid1s: "Տեսե՛ք, թե ինչպես են նոր բուժառուները գրանցվում վայրկյանների ընթացքում",
      vid2t: "Այցերի պլանավորում և կառավարում", vid2s: "Դիտե՛ք խելացի ամրագրման համակարգ և վերահսկման պրոցեսը",
      vid3t: "Տվյալների վերլուծություն", vid3s: "Ուսումնասիրե՛ք KPI-ի կենդանի հետևումն ու հաշվետվությունները",
      ctaTitle: "Ցանկանու՞մ եք տեսնել ինչպես է աշխատում", ctaBody: "Պատվիրեք անհատական ցուցադրում և բացահայտեք HospIT-ը ձեր աշխատանքային միջավայրում։", ctaBtn: "Ցուցադրություն պահանջել",
    },
    parPage: {
      eyebrow: "Վստահելի համագործակցություն", title: "Մեր գործընկերները",
      body: "Մենք համագործակցում ենք առաջատար կազմակերպությունների հետ՝ մատուցելու հուսալի և մասշտաբային բժշկական լուծումներ։",
      valEyebrow: "Գործընկերության արժեք", valTitle: "Ինչու՞ դառնալ HospIT-ի գործընկեր",
      val1t: "Համատեղ մշակում", val1d: "Ստեղծե՛ք հատուկ ֆունկցիոնալություններ մեր ինժեներական թիմի հետ միասին։", val1e: "🤝",
      val2t: "Եկամուտի բաժնեմաս", val2d: "Եկամուտ ստացեք ինտեգրացիաների միջոցով մեր գործընկերային ծրագրում։", val2e: "📈",
      val3t: "Միջազգային ընդգրկում", val3d: "Զարգացրեք ձեր ծառայությունները HospIT-ի էկոհամակարգում։ Միացեք մեր բժշկական գործընկերների ցանցին։", val3e: "🌍",
    },
    about: {
      eyebrow: "Ովքե՞ր ենք մենք", title: "HospIT-ի մասին",
      body: "HospIT-ը ապագայամետ տեխնոլոգիական ընկերություն է, որը կենտրոնացած է բժշկական համակարգերի ավտոմատացման և նորարարության միջոցով փոխակերպման վրա։ Մեր առաքելությունն է պարզեցնել բարդ գործընթացները և ժամանակակից թվային գործիքներով հզորացնել բժշկական հաստատությունները։",
      missionLabel: "Մեր առաքելությունը", missionTitle: "Բժշկական արդյունավետության բարձրացում խելացի ավտոմատացման միջոցով։",
      missionDesc: "Մենք հավատում ենք, որ յուրաքանչյուր բժշկական մասնագետ արժանի է գործիքների, որոնք աշխատում են նույնքան ջանասիրաբար, ինչ ինքն է։ HospIT-ը վերացնում է օպերատիվ խոչընդոտները, որպեսզի բժշկական անձնակազմն ավելի շատ ժամանակ անցկացնի բուժառուների հետ։",
      visionLabel: "Մեր տեսլականը", visionTitle: "Դառնալ բժշկական տեխնոլոգիաների համաշխարհային ստանդարտ։",
      visionDesc: "Մենք ձգտում ենք դեպի աշխարհ, որտեղ յուրաքանչյուր կլինիկա, բուժհաստատություն և բժշկական կենտրոն՝ անկախ չափից կամ գտնվելու վայրից, ունի մուտք դեպի աշխարհի ամենաբարձրակարգ ոլորտային ծրագրային ապահովում։",
      storyEyebrow: "Մեր պատմությունը", storyTitle: "Հիասթափությունից՝ դեպի նորարարություն",
      storyP1: "HospIT-ը ծնվել է բժշկական կառավարման անարդյունավետությունների անձնական փորձից՝ անվերջ թղթաբանություն, բաժինների միջև հաղորդակցման խնդիրներ, և տվյալներ, որոնք կողպված են անջատ համակարգերում։",
      storyP2: "Մեր հիմնադիրները՝ բժշկական մասնագետների և ծրագրային ինժեներների թիմ, ձեռնամուխ եղան ստեղծելու հարթակ, որն իրենք կցանկանային, որ գոյություն ունենար։ Այսօր HospIT-ն սպասարկում է հարյուրավոր հաստատությունների՝ հստակ առաքելությամբ. տեխնոլոգիա, որը ծառայում է մարդկանց։",
      valEyebrow: "Մեր արժեքները", valTitle: "Հիմնարար արժեքներ",
    },
    whyPage: {
      eyebrow: "Արժեքային առաջարկ", title: "Ինչու՞ ընտրել HospIT-ը",
      body: "Հատուկ նախագծված բժշկական միջավայրերի համար՝ ոչ հարմարեցված, այլ ստեղծված զրոյից այն մարտահրավերների համար, որոնց դուք բախվում եք ամեն օր։",
      cmpEyebrow: "Համեմատություն", cmpTitle: "HospIT vs. Ավանդական համակարգեր", cmpBody: "Տեսե՛ք, թե ինչու ժամանակակից հաստատություններն անցնում են HospIT-ի։",
      cmpFeature: "Հատկություն", cmpHospit: "HospIT", cmpTrad: "Ավանդական",
      ctaTitle: "Համոզվա՞ծ եք։ Եկեք խոսենք։", ctaBody: "Մեր թիմը պատրաստ է ցույց տալ, թե ինչ կարող է HospIT-ն անել Ձեր հաստատության համար։", ctaBtn: "Կապնվե՛ք մեզ հետ",
    },
    contact: {
      eyebrow: "Կապվե՛ք", title: "Կապ մեզ հետ", body: "Հարցե՞ր ունեք կամ ցանկանու՞մ եք տեսնել HospIT-ը գործողության մեջ։ Մեր թիմը կպատասխանի Ձեզ շուտով։",
      emailLbl: "Էլ. փոստ", phoneLbl: "Հեռ.", locationLbl: "Հասցե",
      formTitle: "Ուղարկե՛ք հաղորդագրություն", fName: "Անուն", fNamePh: "Ձեր անունը", fEmail: "Էլ. փոստ", fEmailPh: "you@example.com",
      fSubject: "Թեմա", fSubjectPh: "Ինչի մասին է", fMessage: "Հաղորդագրություն", fMessagePh: "Պատմե՛ք Ձեր հաստատության և կարիքների մասին...",
      fSend: "Ուղարկել", fSending: "Ուղարկվում է…", successTitle: "Հաղորդագրությունն ուղարկված է", successBody: "Մենք կպատասխանենք Ձեզ 24 ժամվա ընթացքում։", successAgain: "Ուղարկել ևս մեկ",
    },
    footer: { tagline: "Խելացի ավտոմատացում ժամանակակից բժշկական հաստատությունների համար։ Օպտիմիզացրե՛ք աշխատանքը, բարձրացրե՛ք խնամքի որակը։", platform: "Հարթակ", company: "Ընկերություն", contactLabel: "Կապ", copy: "© 2026 HospIT։ Բոլոր իրավունքները պաշտպանված են։", privacy: "Գաղտնիության քաղաքականություն", terms: "Ծառայության պայմաններ" },
  },
  en: {
    nav: { home: "Home", services: "Services", partners: "Partners", pricing: "Pricing", about: "About Us", whyus: "Why Us", contact: "Contact", cta: "Get Started", login: "Sign in", account: "My page", admin: "Admin panel" },
    hero: {
      eyebrow: "Healthcare Automation Platform",
      title: "Transform Healthcare Operations with Smart Automation",
      body: "HospIT is an advanced digital solution designed to streamline and automate healthcare workflows — improving efficiency, accuracy, and patient care.",
      cta1: "Get Started", cta2: "See Services",
      stat1n: "500+", stat1l: "Institutions", stat2n: "98%", stat2l: "Uptime SLA", stat3n: "3×", stat3l: "Efficiency Gain",
    },
    feat: { eyebrow: "Core Capabilities", title: "Everything your institution needs", body: "Four pillars of automation that transform daily hospital operations." },
    preview: {
      eyebrow: "Product Preview", title: "See HospIT in Action",
      body: "Explore how our platform simplifies complex hospital workflows into a seamless digital experience — from patient intake to discharge.",
      p1t: "Centralized patient data", p1s: "All data in one secure and accessible place",
      p2t: "Live scheduling", p2s: "Manage quickly and easily from one dashboard",
      p3t: "Simple management tools", p3s: "Management without complex technical steps", cta: "Demo version",
    },
    connected: {
      eyebrow: "Ecosystem", title: "Connected with Healthcare",
      body: "HospIT acts as the central nervous system of your institution — connecting every department in real time.",
      chip1t: "Real-Time Sync", chip1s: "All departments connected live",
      chip2t: "Zero Downtime", chip2s: "99.9% platform availability",
      chip3t: "Instant Alerts", chip3s: "Critical events pushed instantly",
      nodePatients: "Patients", nodeDoctors: "Doctors", nodeLabs: "Labs",
      nodePharmacy: "Pharmacy", nodeRecords: "Records", nodeAnalytics: "Analytics",
    },
    faq: { eyebrow: "FAQ", title: "Answers to your questions", body: "The most common questions about HospIT. Didn't find your answer? Get in touch." },
    integrations: { eyebrow: "Integrations", title: "Connected to the systems you already use", body: "HospIT works seamlessly with leading platforms. Click any of them to see the details.", learnMore: "Learn more", visit: "Visit website" },
    whyHome: {
      eyebrow: "Why HospIT", title: "Built for those who care for others",
      body: "We understand the complexity of healthcare operations. HospIT is purpose-built to reduce friction, so your team can focus on patients — not paperwork.",
      cta: "Learn More",
      item1: "Built for healthcare professionals", item2: "Scalable and flexible architecture", item3: "Seamless system integration",
      item4: "Time-saving automation workflows", item5: "HIPAA-compliant data handling", item6: "24/7 dedicated support",
    },
    trusted: { eyebrow: "Trusted By", title: "The choice of leading medical institutions", body: "Healthcare organizations across the region rely on HospIT to run their daily operations." },
    stats: { s1n: "1000+", s1l: "Active Users", s2n: "2M+", s2l: "Patients Managed", s3n: "98%", s3l: "Client Retention", s4n: "70%", s4l: "Cost Reduction" },
    cta: { title: "Ready to modernize your institution?", body: "Join 500+ healthcare institutions that trust HospIT to run their operations.", btn1: "Get Started", btn2: "View Services" },
    svcPage: {
      eyebrow: "What We Offer", title: "Our Services",
      body: "HospIT offers a complete suite of tools designed to automate and optimize healthcare institution operations.",
      demoEyebrow: "In Action", demoTitle: "See How It Works", demoBody: "Watch short demos of HospIT's core features in real healthcare environments.",
      vid1t: "Patient Onboarding Flow", vid1s: "See how new patients are registered in seconds",
      vid2t: "Scheduling Dashboard", vid2s: "Watch the intelligent booking engine in action",
      vid3t: "Analytics Overview", vid3s: "Explore live KPI tracking and reporting",
      ctaTitle: "Ready to see it live?", ctaBody: "Schedule a personalized demo with our team and explore HospIT in your environment.", ctaBtn: "Request a Demo",
    },
    parPage: {
      eyebrow: "Trusted Collaborations", title: "Our Trusted Partners",
      body: "We collaborate with leading organizations to deliver reliable and scalable healthcare solutions.",
      valEyebrow: "Partnership Value", valTitle: "Why partner with HospIT?",
      val1t: "Co-Development", val1d: "Build tailored features together with our engineering team.", val1e: "🤝",
      val2t: "Revenue Sharing", val2d: "Monetize integrations through our partner program.", val2e: "📈",
      val3t: "Global Reach", val3d: "Access our network of 500+ healthcare institutions worldwide.", val3e: "🌍",
    },
    about: {
      eyebrow: "Who We Are", title: "About HospIT",
      body: "HospIT is a forward-thinking technology company focused on transforming healthcare systems through automation and innovation. Our mission is to simplify complex processes and empower medical institutions with modern digital tools.",
      missionLabel: "Our Mission", missionTitle: "Enhance healthcare efficiency through intelligent automation.",
      missionDesc: "We believe every healthcare professional deserves tools that work as hard as they do. HospIT removes operational friction so medical staff can spend more time with patients.",
      visionLabel: "Our Vision", visionTitle: "Become the global standard for healthcare technology.",
      visionDesc: "We're building toward a world where every clinic, hospital, and care center — regardless of size or location — has access to world-class operational software.",
      storyEyebrow: "Our Story", storyTitle: "From frustration to innovation",
      storyP1: "HospIT was born from firsthand experience with the inefficiencies plaguing healthcare administration — endless paperwork, miscommunication between departments, and data locked in disconnected systems.",
      storyP2: "Our founders, a team of healthcare professionals and software engineers, set out to build the platform they wished had existed. Today, HospIT serves hundreds of institutions across the region, with a clear mission: technology that serves people.",
      valEyebrow: "What We Stand For", valTitle: "Core Values",
    },
    whyPage: {
      eyebrow: "Value Proposition", title: "Why Choose HospIT",
      body: "Designed specifically for healthcare environments — not adapted, built from scratch for the challenges you face every day.",
      cmpEyebrow: "Comparison", cmpTitle: "HospIT vs. Traditional Systems", cmpBody: "See why modern institutions are switching.",
      cmpFeature: "Feature", cmpHospit: "HospIT", cmpTrad: "Traditional",
      ctaTitle: "Convinced? Let's talk.", ctaBody: "Our team is ready to show you exactly what HospIT can do for your institution.", ctaBtn: "Contact Us",
    },
    contact: {
      eyebrow: "Reach Out", title: "Get in Touch", body: "Have questions or want to see HospIT in action? Our team will get back to you shortly.",
      emailLbl: "Email", phoneLbl: "Phone", locationLbl: "Location",
      formTitle: "Send us a message", fName: "Name", fNamePh: "Your name", fEmail: "Email", fEmailPh: "you@example.com",
      fSubject: "Subject", fSubjectPh: "What's this about?", fMessage: "Message", fMessagePh: "Tell us about your institution and needs...",
      fSend: "Send Message", fSending: "Sending…", successTitle: "Message sent!", successBody: "We'll get back to you within 24 hours.", successAgain: "Send another",
    },
    footer: { tagline: "Smart automation for modern healthcare institutions. Streamline workflows, improve care.", platform: "Platform", company: "Company", contactLabel: "Contact", copy: "© 2026 HospIT. All rights reserved.", privacy: "Privacy Policy", terms: "Terms of Service" },
  },
  ru: {
    nav: { home: "Главная", services: "Услуги", partners: "Партнёры", pricing: "Цены", about: "О нас", whyus: "Почему мы", contact: "Контакты", cta: "Начать", login: "Войти", account: "Кабинет", admin: "Админка" },
    hero: {
      eyebrow: "Система автоматизации медицинских учреждений",
      title: "Цифровизируйте ваше медицинское учреждение с умной автоматизацией",
      body: "Умная автоматизация для здравоохранения. HospIT — цифровое решение для автоматизации и оптимизации рабочих процессов медицинских учреждений.",
      cta1: "Начать", cta2: "Услуги",
      stat1n: "500+", stat1l: "Учреждений", stat2n: "98%", stat2l: "Время работы", stat3n: "3×", stat3l: "Эффективность роста",
    },
    feat: { eyebrow: "Ключевые возможности", title: "Всё, что нужно вашему учреждению", body: "Четыре столпа автоматизации, преобразующих ежедневную работу больницы." },
    preview: {
      eyebrow: "Обзор продукта", title: "Посмотрите HospIT в действии",
      body: "Узнайте, как наша платформа упрощает сложные больничные процессы — от поступления пациента до выписки.",
      p1t: "Централизованные данные пациентов", p1s: "Все данные в одном безопасном и доступном месте",
      p2t: "Живое расписание", p2s: "Управляйте быстро и удобно с одного дашборда",
      p3t: "Простые инструменты управления", p3s: "Управление без сложных технических шагов", cta: "Демо-версия",
    },
    connected: {
      eyebrow: "Экосистема", title: "Связь со здравоохранением",
      body: "HospIT выступает центральной нервной системой вашего учреждения — в реальном времени связывая все отделения.",
      chip1t: "Синхронизация", chip1s: "Все отделения подключены в реальном времени",
      chip2t: "Без простоев", chip2s: "Доступность платформы 99,9%",
      chip3t: "Мгновенные оповещения", chip3s: "Критические события передаются немедленно",
      nodePatients: "Пациенты", nodeDoctors: "Врачи", nodeLabs: "Лаборатория",
      nodePharmacy: "Аптека", nodeRecords: "Записи", nodeAnalytics: "Аналитика",
    },
    faq: { eyebrow: "Частые вопросы", title: "Ответы на ваши вопросы", body: "Самые частые вопросы о системе HospIT. Не нашли ответ? Свяжитесь с нами." },
    integrations: { eyebrow: "Интеграции", title: "Подключены к системам, которые вы используете", body: "HospIT бесшовно работает с ведущими платформами. Нажмите на любую, чтобы узнать подробности.", learnMore: "Подробнее", visit: "Перейти на сайт" },
    whyHome: {
      eyebrow: "Почему HospIT", title: "Создано для тех, кто заботится о других",
      body: "Мы понимаем сложность медицинских операций. HospIT разработан специально для устранения операционных барьеров — чтобы ваша команда могла сосредоточиться на пациентах, а не на бумагах.",
      cta: "Подробнее",
      item1: "Создано для медицинских работников", item2: "Масштабируемая и гибкая архитектура", item3: "Бесшовная интеграция с существующими системами",
      item4: "Автоматизация, экономящая время", item5: "Обработка данных по стандарту HIPAA", item6: "Круглосуточная поддержка 24/7",
    },
    trusted: { eyebrow: "Нам доверяют", title: "Выбор ведущих медицинских учреждений", body: "Медицинские организации по всему региону доверяют HospIT управление своими ежедневными процессами." },
    stats: { s1n: "500+", s1l: "Медицинских учреждений", s2n: "2M+", s2l: "Пациентов под управлением", s3n: "98%", s3l: "Удержание клиентов", s4n: "30%", s4l: "Снижение затрат" },
    cta: { title: "Готовы автоматизировать ваше учреждение?", body: "Более 500 медицинских учреждений доверяют HospIT управление своими операциями.", btn1: "Начать", btn2: "Услуги" },
    svcPage: {
      eyebrow: "Что мы предлагаем", title: "Наши услуги",
      body: "HospIT предлагает полный пакет инструментов для автоматизации и оптимизации операций медицинских учреждений.",
      demoEyebrow: "В действии", demoTitle: "Посмотрите, как это работает", demoBody: "Короткие демонстрации ключевых функций HospIT в реальных медицинских условиях.",
      vid1t: "Процесс регистрации пациента", vid1s: "Как новые пациенты регистрируются за секунды",
      vid2t: "Планирование и управление визитами", vid2s: "Умная система управления и контроля процесса записи",
      vid3t: "Обзор аналитики", vid3s: "Отслеживание KPI и отчётность в реальном времени",
      ctaTitle: "Хотите увидеть, как это работает?", ctaBody: "Закажите персональную демонстрацию с нашей командой и откройте для себя HospIT в вашей рабочей среде.", ctaBtn: "Запросить демонстрацию",
    },
    parPage: {
      eyebrow: "Проверенное сотрудничество", title: "Наши надёжные партнёры",
      body: "Мы сотрудничаем с ведущими организациями для предоставления надёжных и масштабируемых решений в области здравоохранения.",
      valEyebrow: "Ценность партнёрства", valTitle: "Почему партнёрство с HospIT?",
      val1t: "Совместная разработка", val1d: "Создавайте индивидуальные функции вместе с нашей инженерной командой.", val1e: "🤝",
      val2t: "Разделение дохода", val2d: "Получайте доход через интеграции в рамках нашей партнёрской программы.", val2e: "📈",
      val3t: "Международный охват", val3d: "Развивайте ваши услуги в экосистеме HospIT. Присоединяйтесь к нашей сети медицинских партнёров.", val3e: "🌍",
    },
    about: {
      eyebrow: "Кто мы", title: "О компании HospIT",
      body: "HospIT — это передовая технологическая компания, сосредоточенная на трансформации систем здравоохранения через автоматизацию и инновации. Наша миссия — упростить сложные процессы и вооружить медицинские учреждения современными цифровыми инструментами.",
      missionLabel: "Наша миссия", missionTitle: "Повышение эффективности здравоохранения через интеллектуальную автоматизацию.",
      missionDesc: "Мы верим, что каждый медицинский работник заслуживает инструментов, которые работают так же усердно, как и он сам. HospIT устраняет операционные барьеры, чтобы медицинский персонал мог больше времени уделять пациентам.",
      visionLabel: "Наше видение", visionTitle: "Стать мировым стандартом медицинских технологий.",
      visionDesc: "Мы строим мир, в котором каждая клиника, больница и медицинский центр — независимо от размера или местоположения — имеет доступ к программному обеспечению мирового класса.",
      storyEyebrow: "Наша история", storyTitle: "От разочарования к инновациям",
      storyP1: "HospIT родился из личного опыта столкновения с неэффективностью больничного администрирования — бесконечные бумаги, недопонимание между отделениями и данные, заблокированные в разрозненных системах.",
      storyP2: "Наши основатели — команда медицинских работников и программных инженеров — поставили перед собой задачу создать платформу, которую они сами хотели бы видеть. Сегодня HospIT обслуживает сотни учреждений по всему региону с чёткой миссией: технологии, служащие людям.",
      valEyebrow: "Наши ценности", valTitle: "Основные ценности",
    },
    whyPage: {
      eyebrow: "Ценностное предложение", title: "Почему HospIT?",
      body: "Разработано специально для медицинской среды — не адаптировано, а создано с нуля для вызовов, с которыми вы сталкиваетесь каждый день.",
      cmpEyebrow: "Сравнение", cmpTitle: "HospIT vs. Традиционные системы", cmpBody: "Узнайте, почему современные учреждения переходят на HospIT.",
      cmpFeature: "Функция", cmpHospit: "HospIT", cmpTrad: "Традиционные",
      ctaTitle: "Убедились? Давайте поговорим.", ctaBody: "Наша команда готова показать вам, что именно HospIT может сделать для вашего учреждения.", ctaBtn: "Связаться с нами",
    },
    contact: {
      eyebrow: "Напишите нам", title: "Свяжитесь с нами", body: "Есть вопросы или хотите увидеть HospIT в действии? Наша команда свяжется с вами в ближайшее время.",
      emailLbl: "Эл. почта", phoneLbl: "Тел.", locationLbl: "Адрес",
      formTitle: "Отправить сообщение", fName: "Имя", fNamePh: "Ваше имя", fEmail: "Эл. почта", fEmailPh: "you@example.com",
      fSubject: "Тема", fSubjectPh: "О чём речь?", fMessage: "Сообщение", fMessagePh: "Расскажите о вашем учреждении и потребностях...",
      fSend: "Отправить", fSending: "Отправка…", successTitle: "Сообщение отправлено!", successBody: "Мы свяжемся с вами в течение 24 часов.", successAgain: "Отправить ещё",
    },
    footer: { tagline: "Умная автоматизация для современных медицинских учреждений. Оптимизируйте рабочие процессы — улучшайте качество помощи.", platform: "Платформа", company: "Компания", contactLabel: "Контакты", copy: "© 2026 HospIT. Все права защищены.", privacy: "Политика конфиденциальности", terms: "Условия использования" },
  },
};

export const DEFAULT_FEATURES: Feature[] = [
  { id: "f_patient", icon: "patient", sort: 1, active: true,
    title: { hy: "Բուժառուների կառավարում", en: "Smart Patient Management", ru: "Умное управление пациентами" },
    desc: { hy: "Կառավարե՛ք բուժառուների տվյալները կենտրոնացված, իրական ժամանակի համակարգի միջոցով, որը Ձեր թիմն ամեն պահ ինֆորմացված է պահում։", en: "Manage patient data efficiently with a centralized, real-time system that keeps your team always informed.", ru: "Эффективно управляйте данными пациентов с помощью централизованной системы в реальном времени, которая всегда держит вашу команду в курсе." } },
  { id: "f_calendar", icon: "calendar", sort: 2, active: true,
    title: { hy: "Այցերի ամրագրում և կառավարում", en: "Automated Scheduling", ru: "Автоматическое расписание" },
    desc: { hy: "Կրճատե՛ք ձեռքով աշխատանքը խելացի ժամանցի կառավարման շնորհիվ, որն անհնարին է դարձնում կոնֆլիկտները և օպտիմիզացնում անձնակազմի ժամանակը։", en: "Reduce manual work with intelligent appointment handling that eliminates conflicts and optimizes staff time.", ru: "Сократите ручной труд с помощью интеллектуальной системы управления записью, которая устраняет конфликты и оптимизирует время персонала." } },
  { id: "f_chart", icon: "chart", sort: 3, active: true,
    title: { hy: "Վերլուծություն իրական ժամանակում", en: "Real-Time Analytics", ru: "Аналитика в реальном времени" },
    desc: { hy: "Ընդունե՛ք ավելի ճիշտ որոշումներ՝ կենդանի վահանակների, գործողությունների վրա հիմնված տվյալների և մանրամասն կատարողականի հաշվետվությունների շնորհիվ։", en: "Make better decisions with actionable insights, live dashboards, and detailed performance reports.", ru: "Принимайте более взвешенные решения благодаря живым дашбордам, действенным данным и подробным отчётам о производительности." } },
  { id: "f_shield", icon: "shield", sort: 4, active: true,
    title: { hy: "Անվտանգ ենթակառուցվածք", en: "Secure Infrastructure", ru: "Безопасная инфраструктура" },
    desc: { hy: "Ձեր տվյալները պաշտպանված են կորպորատիվ մակարդակի անվտանգությամբ, համապատասխանության չափանիշներով և ծայրից ծայր ծածկագրումով։", en: "Your data is protected with enterprise-grade security, compliance standards, and end-to-end encryption.", ru: "Ваши данные защищены корпоративной безопасностью, стандартами соответствия и сквозным шифрованием." } },
];

export const DEFAULT_SERVICES: Service[] = [
  { id: "s_patient", icon: "patient", sort: 1, active: true,
    title: { hy: "Բուժառուների կառավարման համակարգ", en: "Patient Management System", ru: "Система управления пациентами" },
    desc: { hy: "Կենտրոնացված թվային գրառումներ յուրաքանչյուր բուժառուի համար, մատչելի իրական ժամանակում՝ բոլոր բաժիններում լիազորված անձնակազմի կողմից։", en: "Centralized digital records for every patient, accessible in real-time by authorized staff across departments.", ru: "Централизованные цифровые записи для каждого пациента, доступные в режиме реального времени авторизованному персоналу во всех отделениях." },
    bullets: { hy: "Հիվանդի թվային պրոֆիլ\nԲժշկական պատմության հետևում\nԴերի վրա հիմնված մուտք", en: "Digital patient profiles\nMedical history tracking\nRole-based access control", ru: "Цифровые профили пациентов\nОтслеживание истории болезни\nРолевое управление доступом" } },
  { id: "s_calendar", icon: "calendar", sort: 2, active: true,
    title: { hy: "Այցերի պլանավորում և կառավարում", en: "Appointment Scheduling", ru: "Планирование и управление визитами" },
    desc: { hy: "Վերացրե՛ք ձեռքով ամրագրման կոնֆլիկտները՝ խելացի ժամանցի կառավարման շնորհիվ, որն օպտիմիզացնում է ժամային բնօրինակն ամբողջությամբ։", en: "Eliminate manual booking conflicts with an intelligent scheduling engine that optimizes every time slot.", ru: "Устраните конфликты ручного бронирования с помощью интеллектуальной системы записи, оптимизирующей каждый временной слот." },
    bullets: { hy: "Ձգել-թողնել օրատետր\nԱվտոմատ հիշեցումներ\nԲազմաբաժանային համաժամացում", en: "Drag-and-drop calendar\nAutomated reminders\nMulti-department sync", ru: "Календарь с перетаскиванием\nАвтоматические напоминания\nМежотделенческая синхронизация" } },
  { id: "s_chart", icon: "chart", sort: 3, active: true,
    title: { hy: "Հաշվետվություններ և վերլուծություն", en: "Reporting & Analytics", ru: "Отчёты и аналитика" },
    desc: { hy: "Վերափոխե՛ք բուժհաստատության տվյալները գործողությունների վրա հիմնված ախտորոշման, կենդանի վահանակների և ավտոմատ հաշվետվությունների շնորհիվ։", en: "Transform raw hospital data into actionable intelligence with live dashboards and automated reports.", ru: "Превратите необработанные больничные данные в действенную аналитику с живыми дашбордами и автоматическими отчётами." },
    bullets: { hy: "KPI-ի կենդանի վահանակ\nԱնհատական հաշվետվություններ\nԱրտահանելի վերլուծություն", en: "Live KPI dashboards\nCustom report builder\nExportable insights", ru: "Живые дашборды KPI\nКонструктор отчётов\nЭкспортируемые данные" } },
  { id: "s_hub", icon: "hub", sort: 4, active: true,
    title: { hy: "Անվտանգ ինտեգրացիա", en: "Secure System Integration", ru: "Безопасная системная интеграция" },
    desc: { hy: "Կապե՛ք HospIT-ը Ձեր գոյություն ունեցող ենթակառուցվածքի հետ՝ լաբ. համակարգեր, հաշվապահություն, ախտորոշչային պատկերներ և ավելին։", en: "Connect HospIT seamlessly with your existing infrastructure — lab systems, billing, imaging, and more.", ru: "Бесшовно подключите HospIT к вашей существующей инфраструктуре — лабораторные системы, биллинг, визуализация и многое другое." },
    bullets: { hy: "HL7 / FHIR աջակցություն\nREST API մուտք\nԺառանգական համակարգի կամուրջ", en: "HL7 / FHIR support\nREST API access\nLegacy system bridges", ru: "Поддержка HL7 / FHIR\nДоступ через REST API\nМосты к устаревшим системам" } },
];

export const DEFAULT_PARTNERS: Partner[] = Array.from({ length: 8 }, (_, i) => ({
  id: `partner${i}`, name: `Partner ${i + 1}`, logo_url: `/uploads/partner-logo-${i}.png`, sort: i + 1, active: true,
}));

// Բժշկական կազմակերպություններ, որ օգտվում են HospIT-ից («Մեզ վստահում են»)։
// Սրանք օրինակ-լոգոներ են — owner-ը ադմինից կփոխարինի իրական հաստատություններով։
export const DEFAULT_CLIENTS: Client[] = Array.from({ length: 6 }, (_, i) => ({
  id: `client${i}`, name: `Medical Center ${i + 1}`, logo_url: `/uploads/partner-logo-${i}.png`, sort: i + 1, active: true,
}));

export const DEFAULT_VALUES: AboutValue[] = [
  { id: "v_innovation", emoji: "⚡", sort: 1, active: true, title: { hy: "Նորարարություն", en: "Innovation", ru: "Инновации" }, desc: { hy: "Մղում ենք բժշկական ծրագրային ապահովման սահմանները դեպի ավելի լայն հնարավորություններ։", en: "Pushing the boundaries of what healthcare software can achieve.", ru: "Расширяем границы возможного в медицинском программном обеспечении." } },
  { id: "v_trust", emoji: "🛡️", sort: 2, active: true, title: { hy: "Վստահություն", en: "Trust", ru: "Доверие" }, desc: { hy: "Մեր ամեն որոշում հիմնված է հուսալիության և թափանցիկության վրա։", en: "Every decision we make is built on reliability and transparency.", ru: "Каждое наше решение строится на надёжности и прозрачности." } },
  { id: "v_precision", emoji: "🎯", sort: 3, active: true, title: { hy: "Ճշգրտություն", en: "Precision", ru: "Точность" }, desc: { hy: "Բժշկության մեջ մանրամասները կարևոր են։ Մեր հարթակն արտացոլում է այդ ուշադրությունը։", en: "Details matter in healthcare. Our platform reflects that care.", ru: "В медицине детали имеют значение. Наша платформа отражает эту заботу." } },
  { id: "v_growth", emoji: "🌱", sort: 4, active: true, title: { hy: "Աճ", en: "Growth", ru: "Рост" }, desc: { hy: "Մենք աճում ենք մեր գործընկերների հետ՝ հարմարվելով նրանց փոփոխվող կարիքներին։", en: "We grow alongside our partners, adapting to their evolving needs.", ru: "Мы растём вместе с нашими партнёрами, адаптируясь к их меняющимся потребностям." } },
  { id: "v_partnership", emoji: "🤝", sort: 5, active: true, title: { hy: "Գործընկերություն", en: "Partnership", ru: "Партнёрство" }, desc: { hy: "Մենք յուրաքանչյուր հաճախորդի դիտարկում ենք որպես երկարաժամկետ համագործակից, ոչ՝ սոսկ հաճախորդ։", en: "We see every client as a long-term collaborator, not a customer.", ru: "Мы рассматриваем каждого клиента как долгосрочного партнёра, а не просто заказчика." } },
];

export const DEFAULT_TIMELINE: TimelineItem[] = [
  { id: "tl2020", year: "2020", sort: 1, active: true, title: { hy: "Հիմնադրվել է Երևանում, Հայաստան", en: "Founded in Yerevan, Armenia", ru: "Основана в Ереване, Армения" }, desc: { hy: "Բժշկական տեխնոլոգիայի նոր գլխի սկիզբ։", en: "The beginning of a new chapter in healthcare technology.", ru: "Начало новой главы в медицинских технологиях." } },
  { id: "tl2021", year: "2021", sort: 2, active: true, title: { hy: "Առաջին 100+ բուժաշխատակիցները ընդունել են", en: "First 50 institutions onboarded", ru: "Первые 50 учреждений подключены" }, desc: { hy: "Վաղ ընդունողները ապացուցեցին հարթակի իրական արժեքը։", en: "Early adopters proved the platform's real-world value.", ru: "Ранние пользователи доказали реальную ценность платформы." } },
  { id: "tl2023", year: "2023", sort: 3, active: true, title: { hy: "Ընդլայնվել է 5 երկրներում", en: "Expanded to 5 countries", ru: "Расширение на 5 стран" }, desc: { hy: "HospIT-ն անցնում է սահմաններ՝ ծառայելով տարածաշրջանի հաստատություններին։", en: "HospIT crosses borders, serving institutions across the region.", ru: "HospIT пересекает границы, обслуживая учреждения по всему региону." } },
  { id: "tl2026", year: "2026", sort: 4, active: true, title: { hy: "1000+ բուժաշխատակից, 1M+ բուժառու", en: "500+ institutions, 2M+ patients", ru: "500+ учреждений, 2M+ пациентов" }, desc: { hy: "Հարթակ, որին վստահում են մասշտաբային բժշկական ոլորտում։", en: "A platform trusted at scale across the healthcare sector.", ru: "Платформа, которой доверяют в масштабах всей отрасли." } },
];

export const DEFAULT_ADVANTAGES: Advantage[] = [
  { id: "a_auto", emoji: "⚡", stat: "70%", sort: 1, active: true, title: { hy: "Ավտոմատացում առաջին հերթին", en: "Automation-First", ru: "Автоматизация прежде всего" }, desc: { hy: "HospIT-ի յուրաքանչյուր գործընթաց նախագծված է ձեռքով քայլերը կրճատելու համար։ Ընդունելությունից մինչև արձակում՝ ավտոմատացումն ստանձնում է կրկնվողը, որպեսզի Ձեր թիմը կենտրոնանա բժշկական խնամքի վրա։", en: "Every workflow in HospIT is designed to reduce manual steps. From check-in to discharge, automation handles the repetitive so your team can focus on care.", ru: "Каждый рабочий процесс в HospIT разработан для сокращения ручных шагов. От регистрации до выписки — автоматизация берёт на себя рутину, чтобы ваша команда могла сосредоточиться на уходе." }, stat_label: { hy: "Ադմինիստրատիվ ժամանակի կրճատում", en: "Reduction in admin time", ru: "Сокращение административного времени" } },
  { id: "a_time", emoji: "⏱️", stat: "3hrs", sort: 2, active: true, title: { hy: "Ժամանակի խնայում", en: "Time-Saving", ru: "Экономия времени" }, desc: { hy: "Հաստատությունները HospIT ընդունելուց հետո անձնակազմի անդամի հաշվով խնայում են օրական 3+ ժամ, որն ուղղակիորեն վերադառնում է բուժառուներին։", en: "Average institutions save 3+ hours per staff member per day after adopting HospIT — time that goes directly back to patients.", ru: "В среднем учреждения экономят 3+ часа на сотрудника в день после внедрения HospIT — время, которое возвращается непосредственно к пациентам." }, stat_label: { hy: "Խնայված ժամ անձնակազմի անդամի համար", en: "Saved per staff daily", ru: "Экономии на сотрудника в день" } },
  { id: "a_accuracy", emoji: "🎯", stat: "99.8%", sort: 3, active: true, title: { hy: "Ճշգրտություն և համապատասխանություն", en: "Accuracy & Compliance", ru: "Точность и соответствие" }, desc: { hy: "Ներկառուցված վավերացման կանոններն ու աուդիտի հետքերն ապահովում են, որ Ձեր տվյալները միշտ ճշգրիտ, հետևելի և տեղական բժշկական ստանդարտներին համապատասխան են։", en: "Built-in validation rules and audit trails ensure your data is always accurate, traceable, and compliant with local healthcare standards.", ru: "Встроенные правила валидации и журналы аудита гарантируют, что ваши данные всегда точны, отслеживаемы и соответствуют местным медицинским стандартам." }, stat_label: { hy: "Տվյալների ճշգրտության մակարդակ", en: "Data accuracy rate", ru: "Точность данных" } },
  { id: "a_scale", emoji: "📐", stat: "10→1000", sort: 4, active: true, title: { hy: "Մասշտաբային ճարտարապետություն", en: "Scalable by Design", ru: "Масштабируемость по замыслу" }, desc: { hy: "Անկախ 10-անկողնի կլինիկա լինելուց, թե 1000-անկողնի բուժհաստատություն՝ HospIT-ը անխափան մեծանում է՝ բավարարելու Ձեր գործողության բարդությունը։", en: "Whether you're a 10-bed clinic or a 1,000-bed hospital, HospIT scales seamlessly to meet your operational complexity.", ru: "Независимо от того, клиника вы на 10 коек или больница на 1000, HospIT масштабируется без усилий для вашей операционной сложности." }, stat_label: { hy: "Մահճակալ, նույն հարթակ", en: "Beds, same platform", ru: "Коек, одна платформа" } },
];

export const DEFAULT_COMPARISONS: ComparisonRow[] = [
  { id: "cmp1", sort: 1, active: true, feature: { hy: "Հիվանդի գրառումներ", en: "Patient Records", ru: "Записи пациентов" } },
  { id: "cmp2", sort: 2, active: true, feature: { hy: "Ավտոմատ ժամանացույց", en: "Automated Scheduling", ru: "Авт. расписание" } },
  { id: "cmp3", sort: 3, active: true, feature: { hy: "Ռեալ ժամ. վերլուծություն", en: "Real-Time Analytics", ru: "Аналитика реал. времени" } },
  { id: "cmp4", sort: 4, active: true, feature: { hy: "Ինտեգրացիաներ", en: "System Integrations", ru: "Интеграции систем" } },
  { id: "cmp5", sort: 5, active: true, feature: { hy: "Բջջային մուտք", en: "Mobile Access", ru: "Мобильный доступ" } },
  { id: "cmp6", sort: 6, active: true, feature: { hy: "24/7 Աջակցություն", en: "24/7 Support", ru: "Поддержка 24/7" } },
  { id: "cmp7", sort: 7, active: true, feature: { hy: "HIPAA Համապատասխանություն", en: "HIPAA Compliance", ru: "Соответствие HIPAA" } },
  { id: "cmp8", sort: 8, active: true, feature: { hy: "Անհատական գործընթացներ", en: "Custom Workflows", ru: "Индив. процессы" } },
];

export const DEFAULT_FAQS: Faq[] = [
  { id: "faq_start", sort: 1, active: true,
    question: { hy: "Որքա՞ն ժամանակ է պահանջվում համակարգը ներդնելու համար", en: "How long does implementation take?", ru: "Сколько времени занимает внедрение?" },
    answer: { hy: "Ներդրման ժամկետը կախված է հաստատության չափից։ Փոքր կլինիկաների համար՝ սովորաբար 1–2 շաբաթ, միջին բուժկենտրոնների համար՝ 2–4 շաբաթ, խոշոր հիվանդանոցների համար՝ 1–2 ամիս։ Ներդրումն ու անձնակազմի ուսուցումն անվճար են։", en: "Implementation time depends on the size of your institution. Small clinics typically take 1–2 weeks, mid-size centers 2–4 weeks, and large hospitals 1–2 months. Implementation and staff training are free.", ru: "Сроки внедрения зависят от размера учреждения. Малые клиники — обычно 1–2 недели, средние центры — 2–4 недели, крупные больницы — 1–2 месяца. Внедрение и обучение персонала бесплатны." } },
  { id: "faq_data", sort: 2, active: true,
    question: { hy: "Ինչպե՞ս են պաշտպանված բուժառուների տվյալները", en: "How is patient data protected?", ru: "Как защищены данные пациентов?" },
    answer: { hy: "Բոլոր տվյալները պահվում են ծածկագրված տեսքով (ծայրից ծայր ծածկագրում), մուտքը՝ դերի վրա հիմնված։ Համակարգը համապատասխանում է բժշկական տվյալների պաշտպանության ստանդարտներին, վարվում է աուդիտի ամբողջական մատյան՝ ով, երբ և ինչ է դիտել կամ փոփոխել։", en: "All data is stored encrypted (end-to-end encryption) with role-based access control. The system complies with medical data protection standards and keeps a full audit trail of who viewed or changed what and when.", ru: "Все данные хранятся в зашифрованном виде (сквозное шифрование), доступ — на основе ролей. Система соответствует стандартам защиты медицинских данных и ведёт полный журнал аудита." } },
  { id: "faq_migrate", sort: 3, active: true,
    question: { hy: "Կարո՞ղ ենք տեղափոխել մեր առկա տվյալները", en: "Can we migrate our existing data?", ru: "Можно ли перенести наши данные?" },
    answer: { hy: "Այո։ Մենք իրականացնում ենք տվյալների տեղափոխում ձեր առկա համակարգից կամ Excel/թղթային գրառումներից։ Տեղափոխումն իրականացվում է մեր մասնագետների կողմից՝ առանց աշխատանքի ընդհատման։", en: "Yes. We migrate data from your existing system or from Excel/paper records. Migration is handled by our specialists without interrupting your daily operations.", ru: "Да. Мы переносим данные из вашей текущей системы или из Excel/бумажных записей. Перенос выполняют наши специалисты без остановки работы." } },
  { id: "faq_support", sort: 4, active: true,
    question: { hy: "Ի՞նչ աջակցություն եք տրամադրում ներդրումից հետո", en: "What support do you provide after implementation?", ru: "Какую поддержку вы оказываете после внедрения?" },
    answer: { hy: "Տրամադրում ենք 24/7 տեխնիկական աջակցություն՝ հեռախոսով, էլ. փոստով և համակարգի ներսից։ Ներառված են նաև շարունակական թարմացումները և նոր հնարավորությունները՝ առանց լրացուցիչ վճարի։", en: "We provide 24/7 technical support by phone, email and in-app. Continuous updates and new features are included at no extra cost.", ru: "Мы предоставляем круглосуточную поддержку по телефону, эл. почте и внутри системы. Постоянные обновления и новые функции включены без доплат." } },
  { id: "faq_price", sort: 5, active: true,
    question: { hy: "Ինչպե՞ս է ձևավորվում արժեքը", en: "How is the price calculated?", ru: "Как формируется цена?" },
    answer: { hy: "Արժեքը կախված է ընտրված փաթեթից, օգտատերերի քանակից և լրացուցիչ մոդուլներից։ Ճշգրիտ հաշվարկը կարող եք տեսնել «Գնային հաշվարկ» բաժնում՝ ընտրելով ձեր պարամետրերը։", en: "The price depends on the selected plan, number of users and additional modules. You can see the exact calculation in the “Pricing” section by choosing your parameters.", ru: "Цена зависит от выбранного пакета, количества пользователей и дополнительных модулей. Точный расчёт доступен в разделе «Цены»." } },
  { id: "faq_mobile", sort: 6, active: true,
    question: { hy: "Աշխատու՞մ է համակարգը հեռախոսից", en: "Does the system work on mobile?", ru: "Работает ли система на телефоне?" },
    answer: { hy: "Այո։ HospIT-ը հասանելի է ցանկացած սարքից՝ համակարգիչ, պլանշետ և սմարթֆոն։ Բժիշկներն ու անձնակազմը կարող են աշխատել ցանկացած վայրից՝ անվտանգ մուտքի պայմաններում։", en: "Yes. HospIT is accessible from any device — desktop, tablet and smartphone. Doctors and staff can work from anywhere with secure access.", ru: "Да. HospIT доступен с любого устройства — компьютера, планшета и смартфона. Врачи и персонал могут работать откуда угодно с безопасным доступом." } },
];

export const DEFAULT_INTEGRATIONS: Integration[] = [
  { id: "int_hs", name: "ՀԾ (Hashvapah)", logo_url: null, link: "", sort: 1, active: true,
    desc: { hy: "Ինտեգրում ՀԾ հաշվապահական համակարգի հետ՝ ֆինանսական գործառնությունների ավտոմատ համաժամացման համար։ Վճարումները, հաշիվ-ապրանքագրերը և ֆինանսական հաշվետվությունները փոխանցվում են ավտոմատ՝ առանց կրկնակի մուտքագրման։", en: "Integration with the HS accounting system for automatic synchronization of financial operations. Payments, invoices and financial reports are transferred automatically without double entry.", ru: "Интеграция с бухгалтерской системой ՀԾ для автоматической синхронизации финансовых операций. Платежи, счета и отчёты передаются автоматически." } },
  { id: "int_1c", name: "1C", logo_url: null, link: "", sort: 2, active: true,
    desc: { hy: "1C համակարգի հետ երկկողմանի ինտեգրում՝ հաշվապահական և պահեստային տվյալների համաժամացման համար։ Ապահովում է ֆինանսական տվյալների միասնականությունը երկու համակարգերում։", en: "Two-way integration with 1C for synchronizing accounting and inventory data, keeping financial records consistent across both systems.", ru: "Двусторонняя интеграция с 1С для синхронизации бухгалтерских и складских данных, обеспечивая единство финансовой информации." } },
  { id: "int_lis", name: "LIS", logo_url: null, link: "", sort: 3, active: true,
    desc: { hy: "Լաբորատոր տեղեկատվական համակարգի (LIS) ինտեգրում։ Լաբորատոր հետազոտությունների պատվերներն ուղարկվում են ուղիղ լաբորատորիա, իսկ արդյունքներն ավտոմատ կցվում են բուժառուի քարտին՝ առանց ձեռքով մուտքագրման։", en: "Laboratory Information System (LIS) integration. Test orders are sent directly to the lab and results are automatically attached to the patient record without manual entry.", ru: "Интеграция с лабораторной информационной системой (LIS). Заказы отправляются напрямую в лабораторию, а результаты автоматически прикрепляются к карте пациента." } },
  { id: "int_pacs", name: "PACS", logo_url: null, link: "", sort: 4, active: true,
    desc: { hy: "PACS ինտեգրում՝ բժշկական պատկերների (ռենտգեն, ՄՌՏ, ՀՇ, ուլտրաձայն) պահպանման և դիտման համար։ Բժիշկը կարող է դիտել պատկերները ուղիղ բուժառուի քարտից՝ առանց այլ ծրագիր բացելու։", en: "PACS integration for storing and viewing medical images (X-ray, MRI, CT, ultrasound). Physicians can view images directly from the patient record without opening another application.", ru: "Интеграция PACS для хранения и просмотра медицинских изображений (рентген, МРТ, КТ, УЗИ). Врач видит снимки прямо из карты пациента." } },
  { id: "int_booking", name: "Առցանց գրանցում", logo_url: null, link: "", sort: 5, active: true,
    desc: { hy: "Առցանց գրանցման համակարգի ինտեգրում՝ բուժառուները կարող են ինքնուրույն ամրագրել այց կայքից կամ հեռախոսից։ Ամրագրումներն ավտոմատ հայտնվում են բժշկի օրացույցում՝ առանց օպերատորի միջամտության։", en: "Online booking integration — patients can book appointments themselves from the website or phone. Bookings appear automatically in the doctor's calendar without operator involvement.", ru: "Интеграция онлайн-записи — пациенты записываются сами с сайта или телефона. Записи автоматически появляются в календаре врача." } },
  { id: "int_bi", name: "BI / Analytics", logo_url: null, link: "", sort: 6, active: true,
    desc: { hy: "BI և վերլուծական հարթակների ինտեգրում՝ խորացված հաշվետվությունների և կանխատեսումների համար։ Հնարավորություն է տալիս ստեղծել անհատական վահանակներ և վերլուծել հաստատության կատարողականը իրական ժամանակում։", en: "Integration with BI and analytics platforms for advanced reporting and forecasting. Enables custom dashboards and real-time analysis of institutional performance.", ru: "Интеграция с BI и аналитическими платформами для расширенной отчётности и прогнозов. Позволяет создавать индивидуальные дашборды и анализировать показатели в реальном времени." } },
];

export const DEFAULT_SETTINGS: Settings = {
  accent_hue: 212,
  default_theme: "light",
  default_lang: "en",
  section_spacing: "comfortable",
  email: "dr.hospit@progress.am",
  phone: "+374 91 15 39 98",
  address: { hy: "Հայաստան, Երևան, Այգեձոր 1-ին նրբ. 2/1", en: "Armenia, Yerevan, Aygedzor 1st ln 2/1", ru: "Армения, Ереван, 1-й пер. Айгедзор 2/1" },
  map_query: "Yerevan Aygedzor 1st lane 2/1 Armenia",
  instagram: "https://www.instagram.com/dr_hospit/",
  facebook: "https://www.facebook.com/profile.php?id=61587726771550",
  linkedin: "#",
  demo_url: "",
  privacy: {
    hy: "HospIT-ը հարգում է Ձեր գաղտնիությունը։\n\n1. Ի՞նչ տվյալներ ենք հավաքում\nԿապի ձևի միջոցով Դուք տրամադրում եք անուն, էլ. փոստ, հեռախոսահամար և հաղորդագրության բովանդակություն։\n\n2. Ինչու՞ ենք դրանք օգտագործում\nԲացառապես Ձեր հարցմանը պատասխանելու և ծառայությունների վերաբերյալ տեղեկատվություն տրամադրելու համար։\n\n3. Տվյալների պաշտպանություն\nՏվյալները պահվում են պաշտպանված սերվերներում և հասանելի են միայն լիազորված աշխատակիցներին։\n\n4. Երրորդ կողմեր\nՄենք չենք վաճառում և չենք փոխանցում Ձեր անձնական տվյալները երրորդ անձանց։\n\n5. Ձեր իրավունքները\nԴուք կարող եք ցանկացած պահի պահանջել Ձեր տվյալների ջնջումը՝ գրելով մեզ։\n\nՀարցերի դեպքում կապվեք՝ dr.hospit@progress.am",
    en: "HospIT respects your privacy.\n\n1. What we collect\nThrough the contact form you provide your name, email, phone number and message.\n\n2. Why we use it\nSolely to respond to your request and provide information about our services.\n\n3. Data protection\nData is stored on secured servers and accessible only to authorized staff.\n\n4. Third parties\nWe never sell or share your personal data with third parties.\n\n5. Your rights\nYou may request deletion of your data at any time by contacting us.\n\nQuestions? Contact us: dr.hospit@progress.am",
    ru: "HospIT уважает вашу конфиденциальность.\n\n1. Какие данные мы собираем\nЧерез форму связи вы предоставляете имя, эл. почту, телефон и текст сообщения.\n\n2. Зачем мы их используем\nИсключительно для ответа на ваш запрос и предоставления информации об услугах.\n\n3. Защита данных\nДанные хранятся на защищённых серверах и доступны только уполномоченным сотрудникам.\n\n4. Третьи лица\nМы не продаём и не передаём ваши персональные данные третьим лицам.\n\n5. Ваши права\nВы можете в любой момент запросить удаление ваших данных, написав нам.\n\nВопросы? Свяжитесь с нами: dr.hospit@progress.am",
  },
  comparison: {
    "systems": [
      {
        "id": "hospit",
        "name": {
          "hy": "HospIT",
          "en": "HospIT",
          "ru": "HospIT"
        },
        "highlight": true,
        "active": true,
        "sort": 1
      },
      {
        "id": "trad",
        "name": {
          "hy": "Ավանդական",
          "en": "Traditional",
          "ru": "Традиционные"
        },
        "highlight": false,
        "active": true,
        "sort": 2
      }
    ],
    "rows": [
      {
        "id": "cmp1",
        "feature": {
          "hy": "Հիվանդի գրառումներ",
          "en": "Patient Records",
          "ru": "Записи пациентов"
        },
        "values": {
          "hospit": "yes",
          "trad": "no"
        },
        "active": true,
        "sort": 1
      },
      {
        "id": "cmp2",
        "feature": {
          "hy": "Ավտոմատ ժամանացույց",
          "en": "Automated Scheduling",
          "ru": "Авт. расписание"
        },
        "values": {
          "hospit": "yes",
          "trad": "no"
        },
        "active": true,
        "sort": 2
      },
      {
        "id": "cmp3",
        "feature": {
          "hy": "Ռեալ ժամ. վերլուծություն",
          "en": "Real-Time Analytics",
          "ru": "Аналитика реал. времени"
        },
        "values": {
          "hospit": "yes",
          "trad": "no"
        },
        "active": true,
        "sort": 3
      },
      {
        "id": "cmp4",
        "feature": {
          "hy": "Ինտեգրացիաներ",
          "en": "System Integrations",
          "ru": "Интеграции систем"
        },
        "values": {
          "hospit": "yes",
          "trad": "no"
        },
        "active": true,
        "sort": 4
      },
      {
        "id": "cmp5",
        "feature": {
          "hy": "Բջջային մուտք",
          "en": "Mobile Access",
          "ru": "Мобильный доступ"
        },
        "values": {
          "hospit": "yes",
          "trad": "no"
        },
        "active": true,
        "sort": 5
      },
      {
        "id": "cmp6",
        "feature": {
          "hy": "24/7 Աջակցություն",
          "en": "24/7 Support",
          "ru": "Поддержка 24/7"
        },
        "values": {
          "hospit": "yes",
          "trad": "no"
        },
        "active": true,
        "sort": 6
      },
      {
        "id": "cmp7",
        "feature": {
          "hy": "HIPAA Համապատասխանություն",
          "en": "HIPAA Compliance",
          "ru": "Соответствие HIPAA"
        },
        "values": {
          "hospit": "yes",
          "trad": "no"
        },
        "active": true,
        "sort": 7
      },
      {
        "id": "cmp8",
        "feature": {
          "hy": "Անհատական գործընթացներ",
          "en": "Custom Workflows",
          "ru": "Индив. процессы"
        },
        "values": {
          "hospit": "yes",
          "trad": "no"
        },
        "active": true,
        "sort": 8
      }
    ]
  },
  logo_url: "/uploads/logo-wordmark.png",
  hero_image_url: "/uploads/logo-mark.png",
  preview_image_url: "/uploads/preview-cards.png",
  partners_bg_url: "/uploads/partners-bg.png",
  pricing: {
    labels: {
      eyebrow: "ԳՆԱՅԻՆ ՀԱՇՎԱՐԿ", title: "Ընտրեք Ձեր իդեալական լուծումը",
      monthlyFrom: "Ամսական սկսած", includedPrefix: "Մինչև", includedSuffix: "օգտատեր ներառված",
      choosePlan: "Ընտրել փաթեթը", back: "Վերադառնալ", basePackagePrefix: "Բազային փաթեթ՝",
      employeeCount: "Աշխատակիցների քանակ", includedChip: "Ներառված՝ մինչև", extraChip: "լրացուցիչ",
      summaryTitle: "Գնային ամփոփում", basePackage: "Բազային փաթեթ", extraUsers: "Լրացուցիչ օգտատերեր",
      subtotal: "Ենթագումար", total: "Ընդհանուր",
      orderNow: "Պատվիրել հիմա", addonsTitle: "Լրացուցիչ մոդուլներ",
      smartTitle: "Խելամիտ առաջարկ", smartSub: "Ավելի ձեռնտու ընտրություն", smartWhy: "Ինչու՞ է ձեռնտու",
      currentPrice: "Ընթացիկ գին", newPrice: "Նոր գին", saveText: "Խնայեք", noExtraFees: "Առանց լրացուցիչ վճարների",
      switchTo: "Անցնել", backTo: "Վերադառնալ",
      formTitle: "Լրացրեք տվյալները", formPlan: "Փաթեթ՝", fFirstName: "Անուն", fLastName: "Ազգանուն",
      fPhone: "Հեռախոսահամար", fEmail: "Էլ․ հասցե", fCompany: "Կազմակերպություն",
      formNote: "Սեղմելով «Ուղարկել»՝ Ձեր տվյալները, փաթեթի PDF-ը և սքրինշոթը ավտոմատ կուղարկվեն մեր թիմին։ Մեր մասնագետները կկապվեն Ձեզ հետ շուտով։",
      submit: "Ուղարկել", submitting: "Մշակվում է...", orCall: "կամ զանգահարել՝",
      required: "Պարտադիր դաշտ", badFormat: "Սխալ ձևաչափ",
      successMsg: "Շնորհակալություն! Ձեր հայտը հաջողությամբ ուղարկվեց։ Մեր մասնագետները կկապվեն Ձեզ հետ շուտով։",
    },
    extraEmployeePrice: 1800,
    addonPriceByPlan: { basic: 50000, clinic: 75000, hospital: 100000 },
    features: [
      { label: "Ամբուլատոր բլոկ", items: ["Քարտադարան", "Հերթագրումներ"] },
      { label: "Ստացիոնար բլոկ", items: ["Քարտադարան", "Քարտերի պատմություն", "Հիվանդասենյակների կառավարում", "Ծառայությունների պատմություն", "Հայտեր"] },
      { label: "Ֆինանսներ", items: ["Վճարումների պատմություն"] },
      { label: "Կատարումներ", items: ["Աշխատանքների կառավարում"] },
    ],
    guarantees: ["Անվճար ներդրում և ուսուցում", "24/7 տեխնիկական աջակցություն", "Շարունակական թարմացումներ", "Խնդիրների հավաքագրում", "Ընթացիկ թարմացումներ"],
    serverNote: "* Սերվերների շահագործման և պահպանման ծախսերը հաշվարկվում են առանձին",
    plans: [
      { id: "basic", name: "Փոքր բուժհաստատություններ", shortLabel: "Ստարտ լուծում", description: "Իդեալական է փոքր կլինիկաների համար՝ արագ մեկնարկի և բազային գործիքների համար", basePrice: 150000, includedEmployees: 50, sliderMax: 200 },
      { id: "clinic", name: "Միջին բուժհաստատություններ", shortLabel: "Կլինիկայի լուծում", description: "Նախատեսված է փոքր և միջին չափի բուժկենտրոնների համար՝ արագ և արդյունավետ կառավարման համար", basePrice: 350000, includedEmployees: 250, sliderMax: 500 },
      { id: "hospital", name: "Մեծ բուժհաստատություններ", shortLabel: "Հիվանդանոցի լուծում", description: "Մշակված է խոշոր հիվանդանոցների համար՝ բարդ աշխատանքային հոսքերով և անսահմանափակ հնարավորություններով", basePrice: 750000, includedEmployees: 400, sliderMax: 1000 },
    ],
    addons: [
      { id: "online-booking", label: "Առցանց գրանցման համակարգի ինտեգրում" },
      { id: "lis", label: "LIS — լաբորատոր համակարգի ինտեգրում" },
      { id: "pacs", label: "PACS ինտեգրում" },
      { id: "bi", label: "BI և վերլուծության ինտեգրում" },
      { id: "hs1c", label: "ՀԾ և 1C համակարգերի ինտեգրում" },
    ],
  },
  faqs: DEFAULT_FAQS,
  integrations: DEFAULT_INTEGRATIONS,
  quiz: DEFAULT_QUIZ,
};

export const DEFAULT_CONTENT: SiteContent = {
  texts: DEFAULT_TEXTS,
  features: DEFAULT_FEATURES,
  services: DEFAULT_SERVICES,
  partners: DEFAULT_PARTNERS,
  clients: DEFAULT_CLIENTS,
  values: DEFAULT_VALUES,
  timeline: DEFAULT_TIMELINE,
  advantages: DEFAULT_ADVANTAGES,
  comparisons: DEFAULT_COMPARISONS,
  faqs: DEFAULT_FAQS,
  integrations: DEFAULT_INTEGRATIONS,
  settings: DEFAULT_SETTINGS,
};
