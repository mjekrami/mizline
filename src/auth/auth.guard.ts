import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';
import { OrdersService } from '../orders/orders.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { TablesService } from '../tables/tables.service';
import { UsersService } from '../users/users.service';
import { MenuItemsService } from '../menu-items/menu-items.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    const resource = this.reflector.get<string>(
      'resource',
      context.getHandler(),
    );
    if (!resource) {
      return true;
    }

    const user = await this.moduleRef
      .get(UsersService, { strict: false })
      .findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    const params = request.params;

    if (resource === 'restaurant') {
      const restaurantId = params.id;
      if (user.role === 'ADMIN' || user.role === 'STAFF') {
        if (user.restaurantId !== restaurantId) {
          throw new ForbiddenException(
            'You are not allowed to access this restaurant.',
          );
        }
      }
    }

    if (resource === 'order') {
      if (request.method === 'POST') {
        const createOrderDto = request.body;
        if (user.role === 'CUSTOMER' && createOrderDto.customerId !== user.id) {
          throw new ForbiddenException(
            'You are not allowed to create an order for another customer.',
          );
        }
        if (user.role === 'ADMIN' || user.role === 'STAFF') {
          const tablesService = this.moduleRef.get(TablesService, {
            strict: false,
          });
          const table = await tablesService.findOne(createOrderDto.tableId);
          if (table.restaurantId !== user.restaurantId) {
            throw new ForbiddenException(
              'You are not allowed to create an order for a table in another restaurant.',
            );
          }
        }
      } else {
        const orderId = params.id;
        const ordersService = this.moduleRef.get(OrdersService, {
          strict: false,
        });
        const order = await ordersService.findOne(orderId);
        if (user.role === 'CUSTOMER' && order.customerId !== user.id) {
          throw new ForbiddenException(
            'You are not allowed to access this order.',
          );
        }
        if (user.role === 'ADMIN' || user.role === 'STAFF') {
          const restaurant = await this.moduleRef
            .get(RestaurantsService, { strict: false })
            .findOne(user.restaurantId);
          const orderRestaurant = await ordersService.getRestaurantForOrder(
            orderId,
          );
          if (restaurant.id !== orderRestaurant.id) {
            throw new ForbiddenException(
              'You are not allowed to access this order.',
            );
          }
        }
      }
    }

    if (resource === 'table') {
      if (request.method === 'POST' || request.method === 'PATCH') {
        const dto = request.body;
        if (dto.restaurantId && (user.role === 'ADMIN' || user.role === 'STAFF')) {
          if (user.restaurantId !== dto.restaurantId) {
            throw new ForbiddenException(
              'You are not allowed to create or update a table for this restaurant.',
            );
          }
        }
      }
      if (params.id) {
        const tableId = params.id;
        const tablesService = this.moduleRef.get(TablesService, {
          strict: false,
        });
        const table = await tablesService.findOne(tableId);
        if (user.role === 'ADMIN' || user.role === 'STAFF') {
          if (user.restaurantId !== table.restaurantId) {
            throw new ForbiddenException(
              'You are not allowed to access this table.',
            );
          }
        }
      }
    }

    if (resource === 'user') {
      const userId = params.id;
      if (user.role === 'ADMIN' && user.id !== userId) {
        const userToAccess = await this.moduleRef
          .get(UsersService, { strict: false })
          .findOne(userId);
        if (userToAccess.restaurantId !== user.restaurantId) {
          throw new ForbiddenException(
            'You are not allowed to access this user.',
          );
        }
      }
    }

    if (resource === 'menu-item') {
      if (request.method === 'POST' || request.method === 'PATCH') {
        const dto = request.body;
        if (dto.restaurantId && (user.role === 'ADMIN' || user.role === 'STAFF')) {
          if (user.restaurantId !== dto.restaurantId) {
            throw new ForbiddenException(
              'You are not allowed to create or update a menu item for this restaurant.',
            );
          }
        }
      }
      if (params.id) {
        const menuItemId = params.id;
        const menuItemsService = this.moduleRef.get(MenuItemsService, {
          strict: false,
        });
        const menuItem = await menuItemsService.findOne(menuItemId);
        if (user.role === 'ADMIN' || user.role === 'STAFF') {
          if (user.restaurantId !== menuItem.restaurantId) {
            throw new ForbiddenException(
              'You are not allowed to access this menu item.',
            );
          }
        }
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
