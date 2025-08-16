import {
  Injectable,
  NotFoundException,
  Inject,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UsersService } from '../users/users.service';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly usersService: UsersService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    const admin = await this.usersService.findOne(createRestaurantDto.adminId);
    if (!admin || admin.role !== 'ADMIN') {
      throw new NotFoundException(
        `Admin user with ID "${createRestaurantDto.adminId}" not found or is not an admin.`,
      );
    }
    const newRestaurant = this.restaurantRepository.create(createRestaurantDto);
    const restaurant = await this.restaurantRepository.save(newRestaurant);
    await this.usersService.update(admin.id, {
      restaurantId: restaurant.id,
    });
    return restaurant;
  }

  async findAll(): Promise<Restaurant[]> {
    const user = this.request.user;
    if (user.role === 'ADMIN' || user.role === 'STAFF') {
      return this.restaurantRepository.find({
        where: { id: user.restaurantId },
      });
    }
    if (user.role === 'CUSTOMER') {
      return [];
    }
    return this.restaurantRepository.find();
  }

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOneBy({ id });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }
    return restaurant;
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.preload({
      id,
      ...updateRestaurantDto,
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }
    return this.restaurantRepository.save(restaurant);
  }

  async remove(id: string): Promise<void> {
    const result = await this.restaurantRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }
  }
}
