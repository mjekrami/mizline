export declare const mizlineColors: {
    readonly primary: "#3B2F2F";
    readonly primaryHover: "#2A2020";
    readonly accent: "#E67E22";
    readonly secondary: "#D6B48A";
    readonly background: "#FCFAF7";
    readonly surface: "#FFFFFF";
    readonly text: {
        readonly primary: "#1A1A1A";
        readonly secondary: "#6B7280";
    };
    readonly border: "#E5E7EB";
    readonly success: "#2E8B57";
    readonly warning: "#F59E0B";
    readonly error: "#DC2626";
    readonly info: "#2563EB";
    readonly orderStatus: {
        readonly new: "#3B82F6";
        readonly preparing: "#F59E0B";
        readonly ready: "#10B981";
        readonly fulfilled: "#6B7280";
        readonly cancelled: "#EF4444";
    };
};
export type OrderStatus = keyof typeof mizlineColors.orderStatus;
export declare const orderStatusColors: Record<OrderStatus, string>;
export declare const orderStatusLabels: Record<OrderStatus, string>;
