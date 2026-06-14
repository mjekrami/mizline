"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderStatusLabels = exports.orderStatusColors = exports.mizlineColors = void 0;
exports.mizlineColors = {
    primary: "#1A1210",
    primaryHover: "#0F0A08",
    accent: "#C05621",
    secondary: "#7A6248",
    background: "#DDD4C8",
    surface: "#EDE7DE",
    text: {
        primary: "#140F0C",
        secondary: "#5C4F42",
    },
    border: "#BFB4A6",
    success: "#2D6A4F",
    warning: "#B45309",
    error: "#B91C1C",
    info: "#3D6B9E",
    orderStatus: {
        new: "#4F7FD4",
        preparing: "#D97706",
        ready: "#0D9B6E",
        fulfilled: "#78716C",
        cancelled: "#DC2626",
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