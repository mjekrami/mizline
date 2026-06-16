import {
  Coffee,
  CupSoda,
  IceCreamCone,
  Salad,
  Sandwich,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICON_RULES: { pattern: RegExp; icon: LucideIcon }[] = [
  { pattern: /coffee|espresso|latte|cappuccino|brew/i, icon: Coffee },
  { pattern: /ice.?cream|gelato|frozen/i, icon: IceCreamCone },
  { pattern: /sandwich|panini|bagel|toast/i, icon: Sandwich },
  { pattern: /salad|bowl/i, icon: Salad },
  { pattern: /drink|beverage|tea|juice|smoothie|soda/i, icon: CupSoda },
];

export function getCategoryIcon(name: string): LucideIcon {
  const match = CATEGORY_ICON_RULES.find(({ pattern }) => pattern.test(name));
  return match?.icon ?? UtensilsCrossed;
}
