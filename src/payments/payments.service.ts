import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async processPayment(orderId: string): Promise<{ status: string }> {
    const order = await this.orderRepository.findOneBy({ id: orderId });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found`);
    }

    // In a real application, you would integrate with a payment gateway like Stripe or PayPal.
    // Here, we'll just simulate a successful payment and update the order status.

    order.status = OrderStatus.COMPLETED;
    await this.orderRepository.save(order);

    return { status: 'success' };
  }
}
