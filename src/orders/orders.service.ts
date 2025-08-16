import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from '../users/entities/user.entity';
import { Table } from '../tables/entities/table.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { OrderItem } from './entities/order-item.entity';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { customerId, tableId, items } = createOrderDto;

    const customer = await this.userRepository.findOneBy({ id: customerId });
    if (!customer) {
      throw new NotFoundException(`Customer with ID "${customerId}" not found`);
    }

    const table = await this.tableRepository.findOneBy({ id: tableId });
    if (!table) {
      throw new NotFoundException(`Table with ID "${tableId}" not found`);
    }

    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const menuItem = await this.menuItemRepository.findOneBy({
        id: item.menuItemId,
      });
      if (!menuItem) {
        throw new NotFoundException(
          `Menu item with ID "${item.menuItemId}" not found`,
        );
      }
      const orderItem = this.orderItemRepository.create({
        menuItem,
        quantity: item.quantity,
        price: menuItem.price * item.quantity,
      });
      orderItems.push(orderItem);
      total += orderItem.price;
    }

    const newOrder = this.orderRepository.create({
      customer,
      table,
      orderItems,
      total,
    });

    return this.orderRepository.save(newOrder);
  }

  async findAll(): Promise<Order[]> {
    const user = this.request.user;
    if (user.role === 'CUSTOMER') {
      return this.orderRepository.find({
        where: { customerId: user.sub },
        relations: ['customer', 'table', 'orderItems', 'orderItems.menuItem'],
      });
    }
    if (user.role === 'ADMIN' || user.role === 'STAFF') {
      return this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.table', 'table')
        .where('table.restaurantId = :restaurantId', {
          restaurantId: user.restaurantId,
        })
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.orderItems', 'orderItems')
        .leftJoinAndSelect('orderItems.menuItem', 'menuItem')
        .getMany();
    }
    return this.orderRepository.find({
      relations: ['customer', 'table', 'orderItems', 'orderItems.menuItem'],
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'table', 'orderItems', 'orderItems.menuItem'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.preload({
      id,
      ...updateOrderDto,
    });
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    return this.orderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
  }

  async getRestaurantForOrder(orderId: string): Promise<any> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['table', 'table.restaurant'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found`);
    }
    return order.table.restaurant;
  }
}
