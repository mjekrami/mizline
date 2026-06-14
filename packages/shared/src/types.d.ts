import type { OrderStatus } from "./colors";
export type TenantId = string;
export type StoreId = string;
export type TableId = string;
export type OrderId = string;
export type ProductId = string;
export type VariantId = string;
export interface Tenant {
    id: TenantId;
    name: string;
}
export interface Store {
    id: StoreId;
    tenantId: TenantId;
    name: string;
    address?: string | null;
    timezone: string;
}
export interface MenuVariant {
    id: VariantId;
    name: string;
    priceModifier: number;
}
export interface MenuProduct {
    id: ProductId;
    name: string;
    description?: string | null;
    price: number;
    image?: string | null;
    available: boolean;
    variants: MenuVariant[];
}
export interface MenuCategory {
    id: string;
    name: string;
    sortOrder: number;
    products: MenuProduct[];
}
export interface CreateOrderItemRequest {
    productId: ProductId;
    variantId?: VariantId;
    quantity: number;
    notes?: string;
}
export interface CreateOrderRequest {
    items: CreateOrderItemRequest[];
}
export interface OrderItem {
    id: string;
    productId: ProductId;
    variantId?: VariantId | null;
    productName: string;
    variantName?: string | null;
    quantity: number;
    price: number;
    notes?: string | null;
    fulfilled: boolean;
}
export interface Order {
    id: OrderId;
    tenantId: TenantId;
    storeId: StoreId;
    tableId: TableId;
    tableName: string;
    status: OrderStatus;
    subtotal: number;
    total: number;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}
export interface OrderCreatedEvent {
    orderId: OrderId;
}
export interface OrderStatusEvent {
    orderId: OrderId;
}
export type OrderRealtimeEvent = "order.created" | "order.preparing" | "order.ready" | "order.fulfilled";
export type OrderRealtimePayload = OrderCreatedEvent | OrderStatusEvent;
