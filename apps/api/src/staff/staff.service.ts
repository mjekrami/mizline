import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { StaffMember } from "@mizline/shared";
import { StaffRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStaffDto, UpdateStaffDto } from "./dto/staff.dto";

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async listStoreStaff(
    tenantId: string,
    storeId: string,
  ): Promise<StaffMember[]> {
    await this.assertStoreInTenant(tenantId, storeId);

    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        storeLinks: { some: { storeId } },
      },
      include: { storeLinks: { select: { storeId: true } } },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });

    return users.map((user) => this.mapStaffMember(user));
  }

  async createStoreStaff(
    tenantId: string,
    storeId: string,
    dto: CreateStaffDto,
  ): Promise<StaffMember> {
    await this.assertStoreInTenant(tenantId, storeId);

    const existing = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new BadRequestException("Email already in use for this tenant");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email.toLowerCase(),
        name: dto.name,
        role: dto.role,
        passwordHash,
        storeLinks: { create: { storeId } },
      },
      include: { storeLinks: { select: { storeId: true } } },
    });

    return this.mapStaffMember(user);
  }

  async updateStaff(
    tenantId: string,
    userId: string,
    dto: UpdateStaffDto,
  ): Promise<StaffMember> {
    await this.findStaffUser(tenantId, userId);

    if (dto.storeIds) {
      for (const storeId of dto.storeIds) {
        await this.assertStoreInTenant(tenantId, storeId);
      }
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        role: dto.role,
        active: dto.active,
        ...(passwordHash ? { passwordHash } : {}),
      },
      include: { storeLinks: { select: { storeId: true } } },
    });

    if (dto.storeIds) {
      await this.prisma.userStore.deleteMany({ where: { userId } });
      await this.prisma.userStore.createMany({
        data: dto.storeIds.map((storeId) => ({ userId, storeId })),
      });

      const refreshed = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: { storeLinks: { select: { storeId: true } } },
      });

      return this.mapStaffMember(refreshed);
    }

    return this.mapStaffMember(updated);
  }

  async removeStoreStaff(
    tenantId: string,
    storeId: string,
    userId: string,
  ): Promise<void> {
    await this.assertStoreInTenant(tenantId, storeId);

    const user = await this.findStaffUser(tenantId, userId);

    if (!user.storeLinks.some((link) => link.storeId === storeId)) {
      throw new NotFoundException("Staff member not linked to this store");
    }

    await this.prisma.userStore.delete({
      where: { userId_storeId: { userId, storeId } },
    });

    const remainingStores = user.storeLinks.filter(
      (link) => link.storeId !== storeId,
    );
    if (remainingStores.length === 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { active: false },
      });
    }
  }

  async assignOrder(
    tenantId: string,
    orderId: string,
    assigneeId: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    const assignee = await this.prisma.user.findFirst({
      where: {
        id: assigneeId,
        tenantId,
        active: true,
        storeLinks: { some: { storeId: order.storeId } },
      },
      select: { id: true, name: true },
    });

    if (!assignee) {
      throw new BadRequestException("Assignee not found or not linked to store");
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        assignedToId: assignee.id,
        assignedAt: new Date(),
      },
      select: {
        id: true,
        storeId: true,
        assignedTo: { select: { id: true, name: true } },
      },
    });

    return updated;
  }

  private async findStaffUser(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      include: { storeLinks: { select: { storeId: true } } },
    });

    if (!user) {
      throw new NotFoundException("Staff member not found");
    }

    return user;
  }

  private async assertStoreInTenant(tenantId: string, storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, tenantId },
      select: { id: true },
    });

    if (!store) {
      throw new ForbiddenException("Store not found in tenant");
    }
  }

  private mapStaffMember(user: {
    id: string;
    email: string;
    name: string;
    role: StaffRole;
    active: boolean;
    storeLinks: { storeId: string }[];
  }): StaffMember {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as StaffMember["role"],
      active: user.active,
      storeIds: user.storeLinks.map((link) => link.storeId),
    };
  }
}
