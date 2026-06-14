import type {
  AdminCatalog,
  AdminCategory,
  AdminProduct,
  AdminTable,
} from "@mizline/shared";

async function adminClientFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function fetchAdminCatalog(): Promise<AdminCatalog> {
  return adminClientFetch("/api/admin/catalog");
}

export function fetchAdminTables(): Promise<AdminTable[]> {
  return adminClientFetch("/api/admin/tables");
}

export function createCategory(name: string): Promise<AdminCategory> {
  return adminClientFetch("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function updateCategory(
  categoryId: string,
  data: { name?: string; sortOrder?: number },
): Promise<AdminCategory> {
  return adminClientFetch(`/api/admin/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteCategory(categoryId: string): Promise<void> {
  return adminClientFetch(`/api/admin/categories/${categoryId}`, {
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
  return adminClientFetch("/api/admin/products", {
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
  return adminClientFetch(`/api/admin/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteProduct(productId: string): Promise<void> {
  return adminClientFetch(`/api/admin/products/${productId}`, {
    method: "DELETE",
  });
}

export function createTable(data: {
  name: string;
  qrCode: string;
}): Promise<AdminTable> {
  return adminClientFetch("/api/admin/tables", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTable(
  tableId: string,
  data: { name?: string; active?: boolean },
): Promise<AdminTable> {
  return adminClientFetch(`/api/admin/tables/${tableId}`, {
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

export function slugifyQrCode(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
