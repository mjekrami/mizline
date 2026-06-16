import type {
  AdminCatalog,
  AdminCategory,
  AdminModifierGroup,
  AdminModifierOption,
  AdminProduct,
  AdminTable,
  AdminVariant,
} from "@mizline/shared";
import { clientApiFetch } from "./fetch";

export function fetchAdminCatalog(): Promise<AdminCatalog> {
  return clientApiFetch("/api/admin/catalog");
}

export function fetchAdminTables(): Promise<AdminTable[]> {
  return clientApiFetch("/api/admin/tables");
}

export function createCategory(name: string): Promise<AdminCategory> {
  return clientApiFetch("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function updateCategory(
  categoryId: string,
  data: { name?: string; sortOrder?: number },
): Promise<AdminCategory> {
  return clientApiFetch(`/api/admin/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteCategory(categoryId: string): Promise<void> {
  return clientApiFetch(`/api/admin/categories/${categoryId}`, {
    method: "DELETE",
  });
}

export function createProduct(data: {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  available?: boolean;
}): Promise<AdminProduct> {
  return clientApiFetch("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProduct(
  productId: string,
  data: {
    categoryId?: string;
    name?: string;
    description?: string | null;
    price?: number;
    image?: string | null;
    available?: boolean;
  },
): Promise<AdminProduct> {
  return clientApiFetch(`/api/admin/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteProduct(productId: string): Promise<void> {
  return clientApiFetch(`/api/admin/products/${productId}`, {
    method: "DELETE",
  });
}

export function createVariant(
  productId: string,
  data: { name: string; priceModifier: number },
): Promise<AdminVariant> {
  return clientApiFetch(`/api/admin/products/${productId}/variants`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateVariant(
  productId: string,
  variantId: string,
  data: { name?: string; priceModifier?: number },
): Promise<AdminVariant> {
  return clientApiFetch(
    `/api/admin/products/${productId}/variants/${variantId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export function deleteVariant(
  productId: string,
  variantId: string,
): Promise<void> {
  return clientApiFetch(
    `/api/admin/products/${productId}/variants/${variantId}`,
    { method: "DELETE" },
  );
}

export function setProductModifierGroups(
  productId: string,
  groupIds: string[],
): Promise<AdminProduct> {
  return clientApiFetch(`/api/admin/products/${productId}/modifier-groups`, {
    method: "PUT",
    body: JSON.stringify({ groupIds }),
  });
}

export function createModifierGroup(data: {
  name: string;
  minSelect?: number;
  maxSelect?: number;
}): Promise<AdminModifierGroup> {
  return clientApiFetch("/api/admin/modifier-groups", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateModifierGroup(
  groupId: string,
  data: {
    name?: string;
    minSelect?: number;
    maxSelect?: number;
    sortOrder?: number;
  },
): Promise<AdminModifierGroup> {
  return clientApiFetch(`/api/admin/modifier-groups/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteModifierGroup(groupId: string): Promise<void> {
  return clientApiFetch(`/api/admin/modifier-groups/${groupId}`, {
    method: "DELETE",
  });
}

export function createModifierOption(
  groupId: string,
  data: {
    name: string;
    priceModifier: number;
    available?: boolean;
  },
): Promise<AdminModifierOption> {
  return clientApiFetch(`/api/admin/modifier-groups/${groupId}/options`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateModifierOption(
  groupId: string,
  optionId: string,
  data: {
    name?: string;
    priceModifier?: number;
    available?: boolean;
  },
): Promise<AdminModifierOption> {
  return clientApiFetch(
    `/api/admin/modifier-groups/${groupId}/options/${optionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export function deleteModifierOption(
  groupId: string,
  optionId: string,
): Promise<void> {
  return clientApiFetch(
    `/api/admin/modifier-groups/${groupId}/options/${optionId}`,
    { method: "DELETE" },
  );
}

export function createTable(data: {
  name: string;
  qrCode: string;
}): Promise<AdminTable> {
  return clientApiFetch("/api/admin/tables", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTable(
  tableId: string,
  data: { name?: string; active?: boolean },
): Promise<AdminTable> {
  return clientApiFetch(`/api/admin/tables/${tableId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function parsePriceToCents(value: string): number | null {
  const normalized = value.trim().replace(/^\$/, "");
  if (!normalized) return null;

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) return null;

  return Math.round(amount * 100);
}

export function formatCentsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function slugifyQrCode(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
