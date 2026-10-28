// Գնի հաշվարկի ՄԻԱԿ բանաձևը։ Օգտագործում են և՛ կայքի հաշվիչը, և՛ ադմինկայի
// «Հաշվել ավտոմատ» կոճակը, որ երկու տեղում գինը միշտ նույնը լինի։
import type { PricingConfig, PlanKey } from "./types";

export type Priced = {
  basePrice: number;
  extraEmployees: number;
  employeeCost: number;
  subtotal: number;
  finalPrice: number;
};

export function computePrice(config: PricingConfig, planKey: PlanKey, employeeCount: number, selected: Iterable<string>): Priced | null {
  const plan = config.plans.find((p) => p.id === planKey);
  if (!plan) return null;
  const sel = new Set(selected);
  const extraEmployees = Math.max(0, employeeCount - plan.includedEmployees);
  const employeeCost = extraEmployees * config.extraEmployeePrice;
  const addonPrice = config.addonPriceByPlan[planKey] ?? 0;
  const addOnsCost = Array.from(sel).reduce((s, id) => s + (config.addons.some((a) => a.id === id) ? addonPrice : 0), 0);
  const subtotal = plan.basePrice + employeeCost + addOnsCost;
  return { basePrice: plan.basePrice, extraEmployees, employeeCost, subtotal, finalPrice: subtotal };
}

