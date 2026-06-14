import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RealtimeService } from "./realtime.service";

@WebSocketGateway({
  namespace: "/realtime",
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
  },
})
export class OrdersGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly realtime: RealtimeService) {}

  afterInit(server: Server) {
    this.realtime.setServer(server);
  }

  handleConnection(client: Socket) {
    const storeId = client.handshake.query.storeId;
    if (typeof storeId === "string" && storeId.length > 0) {
      void client.join(`store:${storeId}`);
    }
  }

  @SubscribeMessage("joinOrder")
  handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    if (data?.orderId) {
      void client.join(`order:${data.orderId}`);
    }
    return { joined: data?.orderId ?? null };
  }
}
