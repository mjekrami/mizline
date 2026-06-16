import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Server, Socket } from "socket.io";
import { getCorsOrigins } from "../common/cors";
import type { JwtPayload } from "../auth/auth.types";
import { RealtimeService } from "./realtime.service";

@WebSocketGateway({
  namespace: "/realtime",
  cors: {
    origin: getCorsOrigins(),
    credentials: true,
  },
})
export class OrdersGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly realtime: RealtimeService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.realtime.setServer(server);
  }

  handleConnection(client: Socket) {
    const storeId = client.handshake.query.storeId;
    if (typeof storeId !== "string" || storeId.length === 0) {
      client.disconnect();
      return;
    }

    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (typeof client.handshake.query.token === "string"
        ? client.handshake.query.token
        : undefined);

    if (token) {
      try {
        const payload = this.jwt.verify<JwtPayload>(token, {
          secret: this.config.getOrThrow<string>("JWT_SECRET"),
        });

        if (
          payload.role === "tenant_admin" ||
          payload.role === "super_admin" ||
          payload.storeIds?.includes(storeId)
        ) {
          void client.join(`store:${storeId}`);
          return;
        }

        client.disconnect();
        return;
      } catch {
        // Fall through to dev token check.
      }
    }

    if (process.env.NODE_ENV === "development") {
      const expected = this.config.get<string>("KITCHEN_DEV_TOKEN");
      const devToken =
        (client.handshake.auth?.devToken as string | undefined) ??
        (typeof client.handshake.query.devToken === "string"
          ? client.handshake.query.devToken
          : undefined);

      if (expected && devToken === expected) {
        void client.join(`store:${storeId}`);
        return;
      }
    }

    client.disconnect();
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
