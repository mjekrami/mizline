import type { MenuCategory, MenuProduct } from "./types";

export function productNeedsPicker(product: MenuProduct): boolean {
  return product.variants.length > 0 || product.modifierGroups.length > 0;
}

export function filterMenu(
  menu: MenuCategory[],
  query: string,
  categoryId: string | null = null,
): MenuCategory[] {
  const normalized = query.trim().toLowerCase();

  return menu
    .filter((category) => !categoryId || category.id === categoryId)
    .map((category) => ({
      ...category,
      products: category.products.filter((product) => {
        if (!normalized) return true;
        const haystack =
          `${product.name} ${product.description ?? ""}`.toLowerCase();
        return haystack.includes(normalized);
      }),
    }))
    .filter((category) => category.products.length > 0);
}

export function buildAvailableProductIds(menu: MenuCategory[]): Set<string> {
  return new Set(
    menu.flatMap((category) => category.products.map((product) => product.id)),
  );
}

export function getProductFromPrice(product: MenuProduct): number {
  if (product.variants.length === 0) return product.price;
  return Math.min(
    ...product.variants.map((variant) => product.price + variant.priceModifier),
  );
}
