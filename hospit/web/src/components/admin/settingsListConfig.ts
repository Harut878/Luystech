import { L } from "./bi";
import type { SListField } from "./SettingsListEditor";

const eml = () => ({ hy: "", en: "", ru: "" });

const sortField: SListField = { key: "sort", label: L("Հերթականություն", "Order"), kind: "number" };
const activeField: SListField = { key: "active", label: L("Ակտիվ (ցուցադրվում է կայքում)", "Active (shown on site)"), kind: "bool" };

export const SETTINGS_LISTS = {
  faqs: {
    idPrefix: "faq",
    titleKey: "question",
    title: L("Հաճախ տրվող հարցեր", "FAQ"),
    sub: L("Գլխավոր էջի «Հաճախ տրվող հարցեր» բաժնի հարց-պատասխանները (3 լեզվով)։", "Questions and answers in the home page FAQ section (in 3 languages)."),
    fields: [
      { key: "question", label: L("Հարց", "Question"), kind: "ml", area: true },
      { key: "answer", label: L("Պատասխան", "Answer"), kind: "ml", area: true },
      sortField, activeField,
    ] as SListField[],
    defaults: { question: eml(), answer: eml(), sort: 0, active: true },
  },
  integrations: {
    idPrefix: "int",
    titleKey: "name",
    title: L("Ինտեգրացիաներ", "Integrations"),
    sub: L("Հարթակները, որոնց հետ միացած ենք։ Կայքում սեղմելիս բացվում է նկարագրությունը։", "The platforms we integrate with. Clicking a card on the site expands its description."),
    fields: [
      { key: "name", label: L("Անվանում", "Name"), kind: "text" },
      { key: "logo_url", label: L("Լոգո", "Logo"), kind: "image", folder: "integrations", help: L("Եթե դատարկ է՝ ցուցադրվում են անվան առաջին տառերը։", "If empty, the first letters of the name are shown.") },
      { key: "desc", label: L("Նկարագրություն (բացվածքի տեքստը)", "Description (expanded text)"), kind: "ml", area: true },
      { key: "link", label: L("Հղում (ոչ պարտադիր)", "Link (optional)"), kind: "text", inputType: "url" },
      sortField, activeField,
    ] as SListField[],
    defaults: { name: "", logo_url: null, desc: eml(), link: "", sort: 0, active: true },
  },
} as const;
