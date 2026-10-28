import type {
  SiteContent, TextTree, Module, Benefit, WhyStat, Industry,
  Client, Partner, Story, Proof, Settings,
} from "./types";

// ─────────────────────────────────────────────────────────────
// LuysTech — ամբողջ բովանդակության ֆոլբեք (TS)։
// Սա ցուցադրվում է քանի դեռ Supabase-ը միացված չէ, և նաև՝
// ադմինում խմբագրելի արժեքների սկզբնական («seed») տվյալն է։
// ─────────────────────────────────────────────────────────────

export const DEFAULT_TEXTS: TextTree = {
  am: {
    nav: { about: "Մեր մասին", product: "Business Control", why: "Ինչու BC", industries: "Ոլորտներ", trust: "Վստահություն", contact: "Կապ", cta: "Պահանջել դեմո" },
    hero: {
      badge: "Բիզնեսի ավտոմատացման հարթակ",
      title: "Ավտոմատացրեք Ձեր բիզնես գործընթացները",
      subtitle: "LuysTech-ն օգնում է բիզնեսներին օպտիմալացնել գործառնությունները խելացի ավտոմատացման և Business Control (BC) հարթակի միջոցով։",
      ctaPrimary: "Պահանջել դեմո", ctaSecondary: "Կապվել մեզ հետ",
    },
    about: {
      kicker: "LuysTech-ի մասին", title: "Կառուցում ենք ավտոմատացված ձեռնարկությունը",
      lead: "Մենք ստեղծում ենք ձեռնարկությունների ավտոմատացման լուծումներ, որոնք պարզեցնում են բարդ գործընթացները և արագացնում թվային փոխակերպումը։",
      whoLabel: "Ովքե՞ր ենք մենք", whoText: "LuysTech-ը տեխնոլոգիական ընկերություն է՝ մասնագիտացած բիզնեսի ավտոմատացման և ձեռնարկությունների ծրագրային ապահովման ոլորտում։",
      whatLabel: "Ի՞նչ ենք անում", whatText: "Մենք մշակում ենք Business Control (BC) ERP համակարգը՝ վաճառք, գնումներ, պահեստ, առաքում և արտադրություն մեկ հարթակում, ՀԾ-ի և այլ ծառայությունների ինտեգրացիաներով։",
      missionLabel: "Մեր առաքելությունը", missionText: "Տրամադրել հուսալի գործիքներ, որոնք նվազեցնում են ձեռքով աշխատանքը և վերացնում սխալները։",
      visionLabel: "Մեր տեսլականը", visionText: "Դառնալ տարածաշրջանի բիզնեսների թվային փոխակերպման առաջատար գործընկերը։",
    },
    bc: {
      kicker: "Արտադրանք", title: "Business Control (BC)",
      desc: "Business Control-ը ERP համակարգ է վաճառքի, գնումների, պահեստի, առաքման և արտադրության համար՝ Django backend-ով և React ինտերֆեյսով։ Այն ինտեգրված է ՀԾ (ArmSoft) հաշվապահության, ScanIt-ի և հարկային էլ. հաշվառման հետ՝ ավտոմատացնելով փաստաթղթաշրջանառությունը մեկ միասնական համակարգում։",
    },
    why: { kicker: "Առավելություններ", title: "Ինչու՞ ընտրել Business Control" },
    industries: { kicker: "Ոլորտներ", title: "Ստեղծված յուրաքանչյուր ոլորտի համար" },
    trust: {
      clientsKicker: "Մեր հաճախորդները", clientsTitle: "Մեզ վստահում են",
      partnersKicker: "Ինտեգրացիաներ", partnersTitle: "Արտաքին համակարգերի ինտեգրացիա",
      successKicker: "Դեպքերի ուսումնասիրություն", successTitle: "Հաջողության պատմություններ",
      challenge: "Մարտահրավեր", solution: "Լուծում",
    },
    demo: {
      title: "Փոխակերպեք ձեր բիզնեսը այսօր",
      subtitle: "Բացահայտեք, թե ինչպես Business Control-ը կարող է ավտոմատացնել ձեր աշխատանքային հոսքերը։",
      ctaPrimary: "Պահանջել դեմո", ctaSecondary: "Կապվել մեզ հետ",
    },
    contact: {
      kicker: "Կապ", title: "Խոսենք ձեր բիզնեսի մասին",
      company: "Ընկերության անվանում", person: "Կոնտակտային անձ", phone: "Հեռախոս", email: "Էլ. փոստ", message: "Հաղորդագրություն",
      submit: "Ուղարկել հարցումը", success: "Շնորհակալություն։ Մենք շուտով կկապվենք ձեզ հետ։",
      phoneLabel: "Հեռախոս", emailLabel: "Էլ. փոստ", addressLabel: "Հասցե", hoursLabel: "Աշխատանքային ժամեր", mapText: "Քարտեզ",
    },
    footer: { desc: "Բիզնեսի ավտոմատացման լուծումներ Business Control հարթակի միջոցով։", quickTitle: "Արագ հղումներ", langTitle: "Լեզու", rights: "Բոլոր իրավունքները պաշտպանված են։" },
    common: { visit: "Այցելել կայք", viewStory: "Դիտել պատմությունը", watchVideo: "Դիտել վիդեոն", close: "Փակել", results: "Արդյունքներ" },
  },
  en: {
    nav: { about: "About", product: "Business Control", why: "Why BC", industries: "Industries", trust: "Trust", contact: "Contact", cta: "Request Demo" },
    hero: {
      badge: "Business Automation Platform",
      title: "Automate Your Business Processes",
      subtitle: "LuysTech helps businesses optimize operations through intelligent automation and the Business Control (BC) platform.",
      ctaPrimary: "Request Demo", ctaSecondary: "Contact Us",
    },
    about: {
      kicker: "About LuysTech", title: "Engineering the automated enterprise",
      lead: "We build enterprise automation solutions that simplify complex operations and accelerate digital transformation.",
      whoLabel: "Who we are", whoText: "LuysTech is a technology company specializing in business automation and enterprise software.",
      whatLabel: "What we do", whatText: "We develop the Business Control (BC) ERP — sales, purchasing, storage, delivery and production in one platform, integrated with ArmSoft and other services.",
      missionLabel: "Our mission", missionText: "To deliver reliable tools that reduce manual work and eliminate operational errors.",
      visionLabel: "Our vision", visionText: "To become the leading digital transformation partner for businesses across the region.",
    },
    bc: {
      kicker: "Product", title: "Business Control (BC)",
      desc: "Business Control is an ERP for sales, purchasing, storage, delivery and production, with a Django backend and a React interface. It integrates with the ArmSoft accounting system, ScanIt and tax e-invoicing, automating document flow in one unified system.",
    },
    why: { kicker: "Benefits", title: "Why choose Business Control" },
    industries: { kicker: "Industries", title: "Built for every industry" },
    trust: {
      clientsKicker: "Our Clients", clientsTitle: "Trusted by Leading Businesses",
      partnersKicker: "Integrations", partnersTitle: "External system integrations",
      successKicker: "Case Studies", successTitle: "Success Stories",
      challenge: "Challenge", solution: "Solution",
    },
    demo: {
      title: "Transform Your Business Operations Today",
      subtitle: "Discover how Business Control can automate and optimize your workflows.",
      ctaPrimary: "Request Demo", ctaSecondary: "Contact Us",
    },
    contact: {
      kicker: "Contact", title: "Let's talk about your business",
      company: "Company Name", person: "Contact Person", phone: "Phone Number", email: "Email", message: "Message",
      submit: "Send Request", success: "Thank you! We will get back to you shortly.",
      phoneLabel: "Phone", emailLabel: "Email", addressLabel: "Address", hoursLabel: "Working Hours", mapText: "Map placeholder",
    },
    footer: { desc: "Business automation solutions powered by the Business Control platform.", quickTitle: "Quick Links", langTitle: "Language", rights: "All rights reserved." },
    common: { visit: "Visit website", viewStory: "View story", watchVideo: "Watch video", close: "Close", results: "Results" },
  },
  ru: {
    nav: { about: "О нас", product: "Business Control", why: "Почему BC", industries: "Отрасли", trust: "Доверие", contact: "Контакты", cta: "Запросить демо" },
    hero: {
      badge: "Платформа бизнес-автоматизации",
      title: "Автоматизируйте бизнес-процессы",
      subtitle: "LuysTech помогает компаниям оптимизировать операции с помощью интеллектуальной автоматизации и платформы Business Control (BC).",
      ctaPrimary: "Запросить демо", ctaSecondary: "Связаться с нами",
    },
    about: {
      kicker: "О LuysTech", title: "Создаём автоматизированное предприятие",
      lead: "Мы создаём решения для автоматизации предприятий, которые упрощают сложные процессы и ускоряют цифровую трансформацию.",
      whoLabel: "Кто мы", whoText: "LuysTech — технологическая компания, специализирующаяся на бизнес-автоматизации и корпоративном ПО.",
      whatLabel: "Что мы делаем", whatText: "Мы разрабатываем ERP Business Control (BC) — продажи, закупки, склад, доставку и производство на одной платформе, с интеграцией ArmSoft и других сервисов.",
      missionLabel: "Наша миссия", missionText: "Предоставлять надёжные инструменты, сокращающие ручной труд и устраняющие ошибки.",
      visionLabel: "Наше видение", visionText: "Стать ведущим партнёром по цифровой трансформации для бизнеса в регионе.",
    },
    bc: {
      kicker: "Продукт", title: "Business Control (BC)",
      desc: "Business Control — ERP для продаж, закупок, склада, доставки и производства, с Django-бэкендом и React-интерфейсом. Интегрируется с бухгалтерией ArmSoft, ScanIt и налоговым э-инвойсингом, автоматизируя документооборот в единой системе.",
    },
    why: { kicker: "Преимущества", title: "Почему стоит выбрать Business Control" },
    industries: { kicker: "Отрасли", title: "Создано для каждой отрасли" },
    trust: {
      clientsKicker: "Наши клиенты", clientsTitle: "Нам доверяют",
      partnersKicker: "Интеграции", partnersTitle: "Интеграции с внешними системами",
      successKicker: "Кейсы", successTitle: "Истории успеха",
      challenge: "Задача", solution: "Решение",
    },
    demo: {
      title: "Преобразите бизнес-операции уже сегодня",
      subtitle: "Узнайте, как Business Control автоматизирует и оптимизирует ваши процессы.",
      ctaPrimary: "Запросить демо", ctaSecondary: "Связаться с нами",
    },
    contact: {
      kicker: "Контакты", title: "Поговорим о вашем бизнесе",
      company: "Название компании", person: "Контактное лицо", phone: "Телефон", email: "Эл. почта", message: "Сообщение",
      submit: "Отправить запрос", success: "Спасибо! Мы скоро свяжемся с вами.",
      phoneLabel: "Телефон", emailLabel: "Эл. почта", addressLabel: "Адрес", hoursLabel: "Часы работы", mapText: "Карта",
    },
    footer: { desc: "Решения для автоматизации бизнеса на базе платформы Business Control.", quickTitle: "Быстрые ссылки", langTitle: "Язык", rights: "Все права защищены." },
    common: { visit: "Перейти на сайт", viewStory: "Смотреть историю", watchVideo: "Смотреть видео", close: "Закрыть", results: "Результаты" },
  },
};

export const DEFAULT_MODULES: Module[] = [
  { id: "sales", key: "sales", icon: "trend", image_url: null, image_url_light: null, video_url: null, sort: 1, active: true,
    title: { am: "Վաճառք", en: "Sales", ru: "Продажи" },
    desc: { am: "Վաճառքի ողջ ցիկլը՝ պատվերից մինչև բեռնագիր, ամրագրում, վերադարձ և վճարումներ։", en: "The full sales cycle — from order to waybill, reservation, return and payments.", ru: "Полный цикл продаж — от заказа до накладной, резервирования, возврата и оплат." },
    long: { am: "Վաճառքի մոդուլը կառավարում է ամբողջ ցիկլը՝ պատվեր → բեռնագիր/ամրագրում → պահեստի ելք։ Ներառում է հաճախորդների և գների կառավարում, ապրանքի ամրագրում, վերադարձներ և վճարումների հաշվառում։ Փաստաթղթերն ավտոմատ համաժամանակեցվում են ՀԾ-ի հետ։", en: "The Sales module manages the whole cycle: order → waybill/reservation → stock out. It covers customers and pricing, reservations, returns and payment tracking, with documents synced automatically to ArmSoft.", ru: "Модуль продаж управляет полным циклом: заказ → накладная/резерв → списание со склада. Клиенты, цены, резервы, возвраты и учёт оплат, с автоматической синхронизацией документов с ArmSoft." } },
  { id: "purchases", key: "purchases", icon: "cart", image_url: null, image_url_light: null, video_url: null, sort: 2, active: true,
    title: { am: "Գնումներ", en: "Purchases", ru: "Закупки" },
    desc: { am: "Գնումների շղթա՝ հայտ → գնահարցում → պատվեր → բեռնագիր → պահեստի մուտք։", en: "The purchasing chain — request → price inquiry → order → waybill → stock in.", ru: "Цепочка закупок — заявка → запрос цен → заказ → накладная → приход." },
    long: { am: "Գնումների մոդուլն ավտոմատացնում է մատակարարման ողջ շղթան՝ գնման հայտից մինչև գնահարցում, պատվեր, բեռնագիր և պահեստի մուտք։ Կառավարեք մատակարարներին, համեմատեք գները և վերահսկեք ստացումները մեկ տեղից։", en: "Automates the full supply chain — from purchase request through price inquiry, order, waybill and stock in. Manage suppliers, compare prices and track receipts from one place.", ru: "Автоматизирует всю цепочку снабжения — от заявки через запрос цен, заказ, накладную и приход. Поставщики, сравнение цен и контроль поступлений в одном месте." } },
  { id: "storage", key: "storage", icon: "box", image_url: null, image_url_light: null, video_url: null, sort: 3, active: true,
    title: { am: "Պահեստ", en: "Storage", ru: "Склад" },
    desc: { am: "Պահեստային հոսքեր՝ մուտք, ելք, ներքին տեղաշարժ և մնացորդների վերահսկում։", en: "Warehouse flows — stock in, stock out, transfers and residual control.", ru: "Складские потоки — приход, расход, перемещения и контроль остатков." },
    long: { am: "Պահեստի մոդուլը հետևում է ապրանքների շարժին բոլոր պահեստներում՝ մուտք, ելք, ներքին տեղաշարժ և փոխանցումներ։ Մնացորդները համաժամանակեցվում են ՀԾ-ի հետ, իսկ ScanIt-ով հնարավոր է շտրիխ-կոդով հաշվառում։", en: "Tracks goods across every warehouse — stock in and out, internal moves and transfers. Residuals stay in sync with ArmSoft, and ScanIt enables barcode-based counting.", ru: "Отслеживает товары по всем складам — приход, расход, внутренние перемещения и переводы. Остатки синхронизированы с ArmSoft, а ScanIt позволяет вести учёт по штрих-кодам." } },
  { id: "delivery", key: "delivery", icon: "truck", image_url: null, image_url_light: null, video_url: null, sort: 4, active: true,
    title: { am: "Առաքում", en: "Delivery", ru: "Доставка" },
    desc: { am: "Առաքման երթուղիներ, վարորդներ և բեռնագրերի հավաքում։", en: "Delivery routes, drivers and waybill grouping.", ru: "Маршруты доставки, водители и группировка накладных." },
    long: { am: "Առաքման մոդուլը բեռնագրերը խմբավորում է երթուղիների մեջ, հատկացնում վարորդներ և ավտոմեքենաներ։ Վարորդներն օգտագործում են բջջային հավելված՝ առաքումների կարգավիճակը իրական ժամանակում թարմացնելու համար։", en: "The Delivery module groups waybills into routes and assigns drivers and vehicles. Drivers use a mobile app to update delivery status in real time.", ru: "Модуль доставки группирует накладные в маршруты и назначает водителей и машины. Водители используют мобильное приложение для обновления статуса в реальном времени." } },
  { id: "production", key: "production", icon: "factory", image_url: null, image_url_light: null, video_url: null, sort: 5, active: true,
    title: { am: "Արտադրություն", en: "Production", ru: "Производство" },
    desc: { am: "Արտադրական պլանավորում, բաղադրատոմսեր (BOM) և աշխատանքի հանձնարարականներ։", en: "Production planning, bills of materials (BOM) and work assignments.", ru: "Планирование производства, спецификации (BOM) и рабочие задания." },
    long: { am: "Արտադրության մոդուլը կառավարում է արտադրական պլանները, բաղադրատոմսերը (BOM) և աշխատանքի հանձնարարականները՝ հումքից մինչև պատրաստի արտադրանք։", en: "The Production module manages production plans, bills of materials (BOM) and work assignments — from raw materials to finished goods.", ru: "Модуль производства управляет планами, спецификациями (BOM) и рабочими заданиями — от сырья до готовой продукции." } },
  { id: "management", key: "management", icon: "gear", image_url: null, image_url_light: null, video_url: null, sort: 6, active: true,
    title: { am: "Կառավարում", en: "Management", ru: "Управление" },
    desc: { am: "Օգտատերեր, իրավասություններ, տեղեկատուներ, կարգավորումներ և աուդիտ։", en: "Users, permissions, reference data, configuration and audit.", ru: "Пользователи, права, справочники, настройки и аудит." },
    long: { am: "Կառավարման մոդուլը տալիս է համակարգի ամբողջական վերահսկողություն՝ օգտատերեր և դերեր, իրավասություններ, տեղեկատուներ (ապրանքներ, միավորներ, գներ), համակարգի կարգավորումներ և փոփոխությունների պատմություն (աուդիտ)։", en: "The Management module gives full system control — users and roles, permissions, reference data (products, units, prices), system configuration and a change-history audit.", ru: "Модуль управления даёт полный контроль — пользователи и роли, права, справочники (товары, единицы, цены), настройки системы и аудит истории изменений." } },
];

export const DEFAULT_BENEFITS: Benefit[] = [
  { id: "automation", icon: "gear", sort: 1, active: true,
    title: { am: "Գործընթացների ավտոմատացում", en: "Process Automation", ru: "Автоматизация процессов" },
    desc: { am: "Վերացրեք կրկնվող ձեռքով աշխատանքը։", en: "Eliminate repetitive manual work.", ru: "Устраните повторяющийся ручной труд." } },
  { id: "control", icon: "hub", sort: 2, active: true,
    title: { am: "Կենտրոնացված վերահսկողություն", en: "Centralized Control", ru: "Централизованный контроль" },
    desc: { am: "Կառավարեք ողջ բիզնեսը մեկ հարթակից։", en: "Run your entire business from one platform.", ru: "Управляйте всем бизнесом с одной платформы." } },
  { id: "reporting", icon: "chart", sort: 3, active: true,
    title: { am: "Իրական ժամանակի հաշվետվություն", en: "Real-Time Reporting", ru: "Отчётность в реальном времени" },
    desc: { am: "Ստացեք վերլուծություն ակնթարթորեն։", en: "Get analytics and insights instantly.", ru: "Получайте аналитику мгновенно." } },
  { id: "error", icon: "shield", sort: 4, active: true,
    title: { am: "Մարդկային սխալների նվազեցում", en: "Reduced Human Error", ru: "Меньше ошибок" },
    desc: { am: "Ավտոմատացումը նվազեցնում է սխալները։", en: "Automation minimizes costly mistakes.", ru: "Автоматизация снижает дорогостоящие ошибки." } },
  { id: "productivity", icon: "bolt", sort: 5, active: true,
    title: { am: "Արտադրողականության աճ", en: "Increased Productivity", ru: "Рост продуктивности" },
    desc: { am: "Թիմերն անում են ավելին՝ ավելի քիչ ժամանակում։", en: "Teams do more in less time.", ru: "Команды делают больше за меньшее время." } },
  { id: "scalable", icon: "box", sort: 6, active: true,
    title: { am: "Մասշտաբվող ճարտարապետություն", en: "Scalable Architecture", ru: "Масштабируемая архитектура" },
    desc: { am: "Աճում է ձեր բիզնեսի հետ միասին։", en: "Grows seamlessly with your business.", ru: "Растёт вместе с вашим бизнесом." } },
];

export const DEFAULT_WHYSTATS: WhyStat[] = [
  { id: "ops", target: 60, suffix: "%", decimals: 0, sort: 1, label: { am: "Ավելի արագ գործառնություններ", en: "Faster Operations", ru: "Быстрее операции" } },
  { id: "cost", target: 40, suffix: "%", decimals: 0, sort: 2, label: { am: "Ծախսերի կրճատում", en: "Cost Reduction", ru: "Снижение затрат" } },
  { id: "accuracy", target: 99.9, suffix: "%", decimals: 1, sort: 3, label: { am: "Տվյալների ճշգրտություն", en: "Data Accuracy", ru: "Точность данных" } },
];

export const DEFAULT_INDUSTRIES: Industry[] = [
  { id: "retail", icon: "store", sort: 1, active: true,
    name: { am: "Մանրածախ", en: "Retail", ru: "Розница" },
    desc: { am: "Վաճառքի կետ, պաշարներ և հաճախորդների վերլուծություն։", en: "Point of sale, inventory, and customer insight.", ru: "Касса, запасы и аналитика клиентов." } },
  { id: "wholesale", icon: "box", sort: 2, active: true,
    name: { am: "Մեծածախ", en: "Wholesale", ru: "Опт" },
    desc: { am: "Մեծածավալ պատվերներ և B2B գործընթացներ։", en: "Bulk orders, pricing tiers, and B2B flows.", ru: "Оптовые заказы и B2B-процессы." } },
  { id: "manufacturing", icon: "factory", sort: 3, active: true,
    name: { am: "Արտադրություն", en: "Manufacturing", ru: "Производство" },
    desc: { am: "Արտադրության պլանավորում և ռեսուրսների վերահսկում։", en: "Production planning and resource control.", ru: "Планирование производства и ресурсов." } },
  { id: "logistics", icon: "truck", sort: 4, active: true,
    name: { am: "Լոգիստիկա", en: "Logistics", ru: "Логистика" },
    desc: { am: "Երթուղիներ, ավտոպարկ և առաքման համակարգում։", en: "Routing, fleet, and delivery coordination.", ru: "Маршруты, автопарк и координация доставки." } },
  { id: "distribution", icon: "hub", sort: 5, active: true,
    name: { am: "Դիստրիբյուցիա", en: "Distribution", ru: "Дистрибуция" },
    desc: { am: "Բազմապահեստ պաշարներ և կատարում։", en: "Multi-warehouse stock and fulfillment.", ru: "Запасы и отгрузка с нескольких складов." } },
  { id: "service", icon: "people", sort: 6, active: true,
    name: { am: "Ծառայություններ", en: "Service Businesses", ru: "Сфера услуг" },
    desc: { am: "Ժամանակացույց, վճարումներ և հաճախորդների կառավարում։", en: "Scheduling, billing, and client management.", ru: "Расписание, биллинг и работа с клиентами." } },
];

export const DEFAULT_CLIENTS: Client[] = [
  { id: "c360shin", name: "360 Շինբազա", logo_url: null, logo_mode: "both", url: "", sort: 1, active: true },
  { id: "carpaniv", name: "Արպանիվ", logo_url: null, logo_mode: "both", url: "", sort: 2, active: true },
  { id: "cgepotaniq", name: "Գեպոտանիք", logo_url: null, logo_mode: "both", url: "", sort: 3, active: true },
  { id: "chska", name: "Հսկա", logo_url: null, logo_mode: "both", url: "", sort: 4, active: true },
  { id: "ccomplexbar", name: "Կոմպլեքս-Բար", logo_url: null, logo_mode: "both", url: "", sort: 5, active: true },
];

export const DEFAULT_PARTNERS: Partner[] = [
  { id: "p_armsoft", name: "ՀԾ (ArmSoft)", logo_url: null, logo_mode: "both", link: "#", sort: 1, active: true,
    desc: { am: "Հաշվապահական ծրագիր՝ մնացորդների, փաստաթղթերի և վճարումների համաժամանակեցում։", en: "Accounting system — syncs residuals, documents and payments.", ru: "Бухгалтерская система — синхронизация остатков, документов и оплат." },
    long: { am: "", en: "", ru: "" } },
  { id: "p_scanit", name: "ScanIt", logo_url: null, logo_mode: "both", link: "#", sort: 2, active: true,
    desc: { am: "Շտրիխ-կոդով հաշվառում՝ պահեստի մուտք/ելք և գույքագրում։", en: "Barcode scanning — stock in/out and inventory counts.", ru: "Сканирование штрих-кодов — приход/расход и инвентаризация." },
    long: { am: "", en: "", ru: "" } },
  { id: "p_einvoice", name: "E-invoicing", logo_url: null, logo_mode: "both", link: "#", sort: 3, active: true,
    desc: { am: "Հարկային էլեկտրոնային հաշիվ-ապրանքագրերի ավտոմատ ուղարկում։", en: "Automatic submission of tax e-invoices.", ru: "Автоматическая отправка налоговых э-счетов." },
    long: { am: "", en: "", ru: "" } },
];

export const DEFAULT_STORIES: Story[] = [
  { id: "s1", name: "360 Շինբազա", logo_url: null, sort: 1, active: true,
    industry: { am: "Շինանյութ", en: "Building materials", ru: "Стройматериалы" },
    challenge: { am: "Դանդաղ, ձեռքով պատվերների մշակում խանութներում։", en: "Slow, manual order processing across stores.", ru: "Медленная ручная обработка заказов в магазинах." },
    solution: { am: "Ներդրվեցին BC Վաճառք և Պահեստ մոդուլները։", en: "Deployed BC Sales and Warehouse modules.", ru: "Внедрены модули BC Продажи и Склад." },
    metrics: [
      { target: 50, suffix: "%", decimals: 0, label: { am: "Ավելի արագ պատվերների մշակում", en: "Faster order processing", ru: "Быстрее обработка заказов" } },
      { target: 30, suffix: "%", decimals: 0, label: { am: "Վաճառքի ավելի մեծ տեսանելիություն", en: "More sales visibility", ru: "Больше прозрачности продаж" } },
    ] },
  { id: "s2", name: "Արպանիվ", logo_url: null, sort: 2, active: true,
    industry: { am: "Դիստրիբյուցիա", en: "Distribution", ru: "Дистрибуция" },
    challenge: { am: "Հաճախակի պաշարի սպառում և ավելցուկ։", en: "Frequent stockouts and excess inventory.", ru: "Частые дефициты и избыток запасов." },
    solution: { am: "Կենտրոնացված պաշարներ BC Պահեստով։", en: "Centralized inventory with BC Warehouse.", ru: "Централизованные запасы с BC Склад." },
    metrics: [
      { target: 35, suffix: "%", decimals: 0, label: { am: "Պաշարների օպտիմալացում", en: "Inventory optimization", ru: "Оптимизация запасов" } },
      { target: 25, suffix: "%", decimals: 0, label: { am: "Ավելի քիչ պակասորդ", en: "Fewer stockouts", ru: "Меньше дефицита" } },
    ] },
  { id: "s3", name: "Կոմպլեքս-Բար", logo_url: null, sort: 3, active: true,
    industry: { am: "Մեծածախ", en: "Wholesale", ru: "Опт" },
    challenge: { am: "Ձեռքով տվյալների մուտքագրում և դանդաղ գույքագրում։", en: "Heavy manual data entry and slow inventory counts.", ru: "Ручной ввод данных и медленная инвентаризация." },
    solution: { am: "Վաճառքի և պահեստի ավտոմատացում BC-ով՝ ScanIt շտրիխ-կոդով հաշվառմամբ։", en: "Automated sales and storage with BC and ScanIt barcode scanning.", ru: "Автоматизация продаж и склада с BC и сканированием штрих-кодов ScanIt." },
    metrics: [
      { target: 40, suffix: "%", decimals: 0, label: { am: "Ավելի քիչ ձեռքով աշխատանք", en: "Less manual work", ru: "Меньше ручного труда" } },
      { target: 99.9, suffix: "%", decimals: 1, label: { am: "Տվյալների ճշգրտություն", en: "Data accuracy", ru: "Точность данных" } },
    ] },
];

export const DEFAULT_PROOF: Proof[] = [
  { id: "businesses", target: 120, suffix: "+", sort: 1, label: { am: "Բիզնեսներ օգտագործում են BC", en: "Businesses using BC", ru: "Компаний используют BC" } },
  { id: "processes", target: 50, suffix: "K+", sort: 2, label: { am: "Ավտոմատացված գործընթացներ օրական", en: "Automated processes daily", ru: "Автоматизированных процессов в день" } },
  { id: "years", target: 8, suffix: "+", sort: 3, label: { am: "Տարիների փորձ", en: "Years of experience", ru: "Лет опыта" } },
  { id: "users", target: 3000, suffix: "+", sort: 4, label: { am: "Ակտիվ օգտատերեր", en: "Active users", ru: "Активных пользователей" } },
];

export const DEFAULT_SETTINGS: Settings = {
  phone: "+374 10 000 000",
  email: "info@luystech.am",
  address: { am: "Երևան, Հայաստան", en: "Yerevan, Armenia", ru: "Ереван, Армения" },
  hours: { am: "Երկ–Ուրբ, 09:00–18:00", en: "Mon–Fri, 09:00–18:00", ru: "Пн–Пт, 09:00–18:00" },
  socials: [
    { platform: "linkedin", url: "#" },
    { platform: "facebook", url: "#" },
    { platform: "instagram", url: "#" },
  ],
  map_embed: "",
  default_lang: "am", default_theme: "dark",
  accent_yellow: true,
  heading_weight: 500, body_weight: 400,
  promo_video: { am: "", en: "", ru: "" },
  sections: { about: true, bc: true, benefits: true, stats: true, industries: true, clients: true, partners: true, stories: true, proof: true, demo: true },
};

export const DEFAULT_CONTENT: SiteContent = {
  texts: DEFAULT_TEXTS,
  modules: DEFAULT_MODULES,
  benefits: DEFAULT_BENEFITS,
  whyStats: DEFAULT_WHYSTATS,
  industries: DEFAULT_INDUSTRIES,
  clients: DEFAULT_CLIENTS,
  partners: DEFAULT_PARTNERS,
  stories: DEFAULT_STORIES,
  proof: DEFAULT_PROOF,
  settings: DEFAULT_SETTINGS,
};
