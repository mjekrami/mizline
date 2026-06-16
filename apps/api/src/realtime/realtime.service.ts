import { Injectable } from "@nestjs/common";
import type { OrderAssignedEvent, OrderStatusEvent, OrderCreatedEvent, OrderUpdatedEvent } from "@mizline/shared";
import { Server } from "socket.io";

@Injectable()
export class RealtimeService {
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  emitOrderCreated(storeId: string, payload: OrderCreatedEvent) {
    this.server?.to(`store:${storeId}`).emit("order.created", payload);
    this.server?.to(`order:${payload.orderId}`).emit("order.created", payload);
  }

  emitOrderPreparing(storeId: string, orderId: string, payload: OrderStatusEvent) {
    this.server?.to(`store:${storeId}`).emit("order.preparing", payload);
    this.server?.to(`order:${orderId}`).emit("order.preparing", payload);
  }

  emitOrderReady(storeId: string, orderId: string, payload: OrderStatusEvent) {
    this.server?.to(`store:${storeId}`).emit("order.ready", payload);
    this.server?.to(`order:${orderId}`).emit("order.ready", payload);
  }

  emitOrderFulfilled(storeId: string, orderId: string, payload: OrderStatusEvent) {
    this.server?.to(`store:${storeId}`).emit("order.fulfilled", payload);
    this.server?.to(`order:${orderId}`).emit("order.fulfilled", payload);
  }

  emitOrderAssigned(storeId: string, payload: OrderAssignedEvent) {
    this.server?.to(`store:${storeId}`).emit("order.assigned", payload);
    this.server?.to(`order:${payload.orderId}`).emit("order.assigned", payload);
  }

  emitOrderUpdated(storeId: string, orderId: string, payload: OrderUpdatedEvent) {
    this.server?.to(`store:${storeId}`).emit("order.updated", payload);
    this.server?.to(`order:${orderId}`).emit("order.updated", payload);
  }
}
