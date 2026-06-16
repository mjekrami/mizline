import type { OrderStatus } from "./colors";

export type TenantId = string;
export type StoreId = string;
export type TableId = string;
export type OrderId = string;
export type ProductId = string;
export type VariantId = string;
export type ModifierGroupId = string;
export type ModifierOptionId = string;
export type UserId = string;

export type StaffRole =
  | "barista"
  | "manager"
  | "tenant_admin"
  | "super_admin";

export interface AuthUser {
  id: UserId;
  tenantId: TenantId;
  email: string;
  name: string;
  role: StaffRole;
  storeIds: StoreId[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface StoreSettings {
  delayWarningMinutes: number;
  delayCriticalMinutes: number;
}

export interface DailySalesSummary {
  date: string;
  revenueCents: number;
  orderCount: number;
  averageTicketCents: number | null;
}

export interface HourlyActivityEntry {
  hour: number;
  orderCount: number;
  revenueCents: number;
}

export interface HourlyActivityReport {
  date: string;
  entries: HourlyActivityEntry[];
}

export interface StaffMember {
  id: UserId;
  email: string;
  name: string;
  role: StaffRole;
  active: boolean;
  storeIds: StoreId[];
}

export interface OrderAssignee {
  id: UserId;
  name: string;
}

export interface OrderAssignedEvent {
  orderId: OrderId;
  assignedTo: OrderAssignee;
}

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
  delayWarningMinutes?: number;
  delayCriticalMinutes?: number;
}

export interface TableInfo {
  id: TableId;
  name: string;
  active: boolean;
}

export interface MenuVariant {
  id: VariantId;
  name: string;
  priceModifier: number;
}

export interface MenuModifierOption {
  id: ModifierOptionId;
  name: string;
  priceModifier: number;
  available: boolean;
}

export interface MenuModifierGroup {
  id: ModifierGroupId;
  name: string;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  options: MenuModifierOption[];
}

export interface MenuProduct {
  id: ProductId;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  available: boolean;
  variants: MenuVariant[];
  modifierGroups: MenuModifierGroup[];
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
  modifierOptionIds?: ModifierOptionId[];
  quantity: number;
  notes?: string;
}

export interface CreateOrderRequest {
  items: CreateOrderItemRequest[];
}

export interface AddOrderItemsRequest {
  items: CreateOrderItemRequest[];
}

export interface UpdateOrderItemRequest {
  quantity?: number;
  notes?: string | null;
}

export interface OrderItemModifier {
  id: string;
  optionId?: ModifierOptionId | null;
  optionName: string;
  priceModifier: number;
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
  modifiers: OrderItemModifier[];
  fulfilled: boolean;
}

export interface KitchenMetrics {
  ordersWaiting: number;
  averagePrepTimeSeconds: number | null;
  ordersCompletedToday: number;
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
  assignedTo?: OrderAssignee | null;
  assignedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCreatedEvent {
  orderId: OrderId;
}

export interface OrderStatusEvent {
  orderId: OrderId;
}

export interface OrderUpdatedEvent {
  orderId: OrderId;
}

export interface AdminCategory {
  id: string;
  name: string;
  sortOrder: number;
  productCount: number;
}

export interface AdminProductVariant {
  id: VariantId;
  name: string;
  priceModifier: number;
}

/** @deprecated Use AdminProductVariant */
export type AdminVariant = AdminProductVariant;

export interface AdminModifierOption {
  id: ModifierOptionId;
  name: string;
  priceModifier: number;
  available: boolean;
  sortOrder: number;
}

export interface AdminModifierGroup {
  id: ModifierGroupId;
  name: string;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  options: AdminModifierOption[];
}

export interface AdminProduct {
  id: ProductId;
  categoryId: string;
  categoryName: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  available: boolean;
  variants: AdminProductVariant[];
  modifierGroupIds: ModifierGroupId[];
}

export interface AdminTable {
  id: TableId;
  name: string;
  qrCode: string;
  active: boolean;
}

export interface AdminCatalog {
  categories: AdminCategory[];
  products: AdminProduct[];
  modifierGroups: AdminModifierGroup[];
}

export type OrderRealtimeEvent =
  | "order.created"
  | "order.preparing"
  | "order.ready"
  | "order.fulfilled"
  | "order.assigned"
  | "order.updated";

export type OrderRealtimePayload =
  | OrderCreatedEvent
  | OrderStatusEvent
  | OrderAssignedEvent
  | OrderUpdatedEvent;
