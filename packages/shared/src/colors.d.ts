export declare const mizlineColors: {
    readonly primary: "#1A1210";
    readonly primaryHover: "#0F0A08";
    readonly accent: "#C05621";
    readonly secondary: "#7A6248";
    readonly background: "#DDD4C8";
    readonly surface: "#EDE7DE";
    readonly text: {
        readonly primary: "#140F0C";
        readonly secondary: "#5C4F42";
    };
    readonly border: "#BFB4A6";
    readonly success: "#2D6A4F";
    readonly warning: "#B45309";
    readonly error: "#B91C1C";
    readonly info: "#3D6B9E";
    readonly orderStatus: {
        readonly new: "#4F7FD4";
        readonly preparing: "#D97706";
        readonly ready: "#0D9B6E";
        readonly fulfilled: "#78716C";
        readonly cancelled: "#DC2626";
    };
};
export type OrderStatus = keyof typeof mizlineColors.orderStatus;
export declare const orderStatusColors: Record<OrderStatus, string>;
export declare const orderStatusLabels: Record<OrderStatus, string>;
