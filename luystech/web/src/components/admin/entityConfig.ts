import type { Field } from "./EntityEditor";

const eml = () => ({ am: "", en: "", ru: "" });

export type EntityCfg = {
  table: string; title: string; sub: string; titleKey: string;
  fields: Field[]; defaults: Record<string, any>;
};

export const ENTITY: Record<string, EntityCfg> = {
  modules: {
    table: "modules", title: "Business Control մոդուլներ", titleKey: "title",
    sub: "Գլխավոր էջի «Business Control» բաժնի քարտերը (Վաճառք, Պահեստ և այլն)։",
    fields: [
      { key: "icon", label: "Պատկերակ", kind: "icon" },
      { key: "image_url", label: "Ֆոնի նկար՝ ՄՈՒԳ (dark) ռեժիմի համար", kind: "image", folder: "modules", help: "Ցուցադրվում է մուգ ռեժիմում։ Եթե դատարկ է՝ գունային ֆոն։" },
      { key: "image_url_light", label: "Ֆոնի նկար՝ ԲԱՑ (light) ռեժիմի համար", kind: "image", folder: "modules", help: "Ցուցադրվում է բաց ռեժիմում։ Եթե դատարկ է՝ օգտագործվում է մուգ ռեժիմի նկարը (կամ գունային ֆոն)։" },
      { key: "title", label: "Վերնագիր", kind: "ml" },
      { key: "desc", label: "Կարճ նկարագրություն (քարտի վրա)", kind: "ml", area: true },
      { key: "long", label: "Մանրամասն նկարագրություն (բացվող պատուհանում)", kind: "ml", area: true, help: "Ցուցադրվում է, երբ այցելուն սեղմում է մոդուլի վրա։ Դատարկ թողնելու դեպքում՝ կարճ նկարագրությունը։" },
      { key: "video_url", label: "Վիդեոյի հղում", kind: "text", inputType: "url", help: "YouTube / Vimeo հղում կամ ուղիղ .mp4 ֆայլ։ Ցուցադրվում է բացվող պատուհանում։" },
      { key: "sort", label: "Հերթականություն", kind: "number" },
      { key: "active", label: "Ակտիվ (ցուցադրվում է կայքում)", kind: "bool" },
    ],
    defaults: { icon: "box", image_url: null, image_url_light: null, title: eml(), desc: eml(), long: eml(), video_url: null, sort: 0, active: true },
  },
  benefits: {
    table: "benefits", title: "Առավելություններ", titleKey: "title",
    sub: "«Ինչու՞ ընտրել Business Control» բաժնի առավելությունների քարտերը։",
    fields: [
      { key: "icon", label: "Պատկերակ", kind: "icon" },
      { key: "title", label: "Վերնագիր", kind: "ml" },
      { key: "desc", label: "Նկարագրություն", kind: "ml", area: true },
      { key: "sort", label: "Հերթականություն", kind: "number" },
      { key: "active", label: "Ակտիվ", kind: "bool" },
    ],
    defaults: { icon: "gear", title: eml(), desc: eml(), sort: 0, active: true },
  },
  stats: {
    table: "why_stats", title: "Վիճակագրություն (Ինչու BC)", titleKey: "label",
    sub: "«Ինչու BC» բաժնի մեծ թվերը (60%, 40%, 99.9%)։",
    fields: [
      { key: "target", label: "Թիվ", kind: "number", step: 0.1 },
      { key: "suffix", label: "Վերջածանց (%, +, K+ …)", kind: "text" },
      { key: "decimals", label: "Տասնորդական նշաններ", kind: "number" },
      { key: "label", label: "Ենթագիր", kind: "ml" },
      { key: "sort", label: "Հերթականություն", kind: "number" },
    ],
    defaults: { target: 0, suffix: "%", decimals: 0, label: eml(), sort: 0 },
  },
  industries: {
    table: "industries", title: "Ոլորտներ", titleKey: "name",
    sub: "«Ստեղծված յուրաքանչյուր ոլորտի համար» բաժնի քարտերը։",
    fields: [
      { key: "icon", label: "Պատկերակ", kind: "icon" },
      { key: "name", label: "Անվանում", kind: "ml" },
      { key: "desc", label: "Նկարագրություն", kind: "ml", area: true },
      { key: "sort", label: "Հերթականություն", kind: "number" },
      { key: "active", label: "Ակտիվ", kind: "bool" },
    ],
    defaults: { icon: "store", name: eml(), desc: eml(), sort: 0, active: true },
  },
  clients: {
    table: "clients", title: "Հաճախորդներ", titleKey: "name",
    sub: "«Մեզ վստահում են» բաժնի հաճախորդների լոգոները։",
    fields: [
      { key: "name", label: "Անվանում", kind: "text" },
      { key: "logo_url", label: "Լոգո", kind: "image", folder: "clients", help: "Եթե դատարկ է՝ ցուցադրվում է անվանումը տեքստով։" },
      { key: "logo_mode", label: "Ո՞ր ռեժիմի համար է այս լոգոն", kind: "select", options: [["both", "Երկուսի համար էլ (մուգ ու բաց)"], ["dark", "Միայն մուգ (dark mode)"], ["light", "Միայն բաց (light mode)"]], help: "Օր.՝ սպիտակ լոգոն լավ է մուգ ֆոնի վրա → ընտրիր «Միայն մուգ»։ Բաց ռեժիմի համար ավելացրու նույն հաճախորդի մուգ տարբերակը առանձին՝ «Միայն բաց»-ով։" },
      { key: "url", label: "Հղում (հաճախորդի կայք)", kind: "text", inputType: "url", help: "Եթե լրացված է՝ լոգոյին սեղմելիս բացվում է այս հասցեն (նոր էջում)։ Դատարկ՝ լոգոն սեղմելի չէ։" },
      { key: "sort", label: "Հերթականություն", kind: "number" },
      { key: "active", label: "Ակտիվ", kind: "bool" },
    ],
    defaults: { name: "", logo_url: null, logo_mode: "both", url: "", sort: 0, active: true },
  },
  partners: {
    table: "partners", title: "Գործընկերներ", titleKey: "name",
    sub: "«Մեր գործընկերները» բաժնի քարտերը։",
    fields: [
      { key: "name", label: "Անվանում", kind: "text" },
      { key: "logo_url", label: "Լոգո", kind: "image", folder: "partners" },
      { key: "logo_mode", label: "Ո՞ր ռեժիմի համար է այս լոգոն", kind: "select", options: [["both", "Երկուսի համար էլ (մուգ ու բաց)"], ["dark", "Միայն մուգ (dark mode)"], ["light", "Միայն բաց (light mode)"]], help: "Օր.՝ սև տեքստով լոգոն չի երևա մուգ ֆոնի վրա → ընտրիր «Միայն բաց», իսկ սպիտակ տարբերակը ավելացրու առանձին՝ «Միայն մուգ»-ով։" },
      { key: "desc", label: "Կարճ նկարագրություն (քարտի վրա)", kind: "ml", area: true },
      { key: "long", label: "Մանրամասն նկարագրություն (բացվող պատուհանում)", kind: "ml", area: true, help: "Սեղմելիս բացվում է փոփ-ափ՝ այս մանրամասն տեքստով։ Եթե դատարկ է՝ ցուցադրվում է կարճ նկարագրությունը։" },
      { key: "sort", label: "Հերթականություն", kind: "number" },
      { key: "active", label: "Ակտիվ", kind: "bool" },
    ],
    defaults: { name: "", logo_url: null, logo_mode: "both", desc: eml(), long: eml(), link: "#", sort: 0, active: true },
  },
  proof: {
    table: "proof", title: "Թվեր (սոց. ապացույց)", titleKey: "label",
    sub: "«Վստահություն» բաժնի թվային ցուցանիշները (120+, 50K+ …)։",
    fields: [
      { key: "target", label: "Թիվ", kind: "number", step: 1 },
      { key: "suffix", label: "Վերջածանց (+, K+ …)", kind: "text" },
      { key: "label", label: "Ենթագիր", kind: "ml" },
      { key: "sort", label: "Հերթականություն", kind: "number" },
    ],
    defaults: { target: 0, suffix: "+", label: eml(), sort: 0 },
  },
};
