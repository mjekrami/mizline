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
import { PrismaService } from "../prisma/prisma.service";
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
    private readonly prisma: PrismaService,
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

    client.data.storeId = storeId;

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

    // Customers stay connected and receive updates only for orders they join.
  }

  @SubscribeMessage("joinOrder")
  async handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    const storeId = client.data.storeId as string | undefined;
    if (!storeId || !data?.orderId) {
      return { joined: null };
    }

    const order = await this.prisma.order.findFirst({
      where: { id: data.orderId, storeId },
      select: { id: true },
    });

    if (!order) {
      return { joined: null };
    }

    await client.join(`order:${data.orderId}`);
    return { joined: data.orderId };
  }
}
