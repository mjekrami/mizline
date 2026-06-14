"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderStatusLabels = exports.orderStatusColors = exports.mizlineColors = void 0;
exports.mizlineColors = {
    primary: "#3B2F2F",
    primaryHover: "#2A2020",
    accent: "#E67E22",
    secondary: "#D6B48A",
    background: "#FCFAF7",
    surface: "#FFFFFF",
    text: {
        primary: "#1A1A1A",
        secondary: "#6B7280",
    },
    border: "#E5E7EB",
    success: "#2E8B57",
    warning: "#F59E0B",
    error: "#DC2626",
    info: "#2563EB",
    orderStatus: {
        new: "#3B82F6",
        preparing: "#F59E0B",
        ready: "#10B981",
        fulfilled: "#6B7280",
        cancelled: "#EF4444",
    },
};
exports.orderStatusColors = exports.mizlineColors.orderStatus;
exports.orderStatusLabels = {
    new: "New",
    preparing: "Preparing",
    ready: "Ready",
    fulfilled: "Fulfilled",
    cancelled: "Cancelled",
};
//# sourceMappingURL=colors.js.map