import type { ModifierOptionId, ProductId, VariantId } from "@mizline/shared";

export interface CartModifier {
  optionId: ModifierOptionId;
  name: string;
  priceModifier: number;
}

export interface CartLine {
  productId: ProductId;
  productName: string;
  variantId?: VariantId;
  variantName?: string;
  modifiers: CartModifier[];
  unitPrice: number;
  quantity: number;
  notes?: string;
}

export interface CartState {
  lines: CartLine[];
}

export function cartStorageKey(storeId: string, tableId: string): string {
  return `mizline-cart:${storeId}:${tableId}`;
}

export function loadCart(storeId: string, tableId: string): CartState {
  if (typeof window === "undefined") {
    return { lines: [] };
  }

  try {
    const raw = localStorage.getItem(cartStorageKey(storeId, tableId));
    if (!raw) return { lines: [] };
    const parsed = JSON.parse(raw) as CartState;
    if (!Array.isArray(parsed.lines)) return { lines: [] };
    return {
      lines: parsed.lines.map((line) => ({
        ...line,
        modifiers: Array.isArray(line.modifiers) ? line.modifiers : [],
      })),
    };
  } catch {
    return { lines: [] };
  }
}

export function saveCart(
  storeId: string,
  tableId: string,
  cart: CartState,
): void {
  localStorage.setItem(cartStorageKey(storeId, tableId), JSON.stringify(cart));
}

export function clearCart(storeId: string, tableId: string): void {
  localStorage.removeItem(cartStorageKey(storeId, tableId));
}

export function cartLineKey(line: CartLine): string {
  const modifierKey = [...line.modifiers.map((m) => m.optionId)].sort().join(",");
  return `${line.productId}:${line.variantId ?? "base"}:${modifierKey}:${line.notes ?? ""}`;
}

export function cartTotals(cart: CartState): {
  itemCount: number;
  subtotal: number;
} {
  const itemCount = cart.lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  return { itemCount, subtotal };
}

export function computeUnitPrice(
  basePrice: number,
  variantPriceModifier = 0,
  modifiers: CartModifier[] = [],
): number {
  const modifierTotal = modifiers.reduce(
    (sum, modifier) => sum + modifier.priceModifier,
    0,
  );
  return basePrice + variantPriceModifier + modifierTotal;
}
