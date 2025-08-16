import {
  Injectable,
  NotFoundException,
  Inject,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async create(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const { restaurantId, ...menuItemData } = createMenuItemDto;
    const restaurant = await this.restaurantRepository.findOneBy({
      id: restaurantId,
    });
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID "${restaurantId}" not found`,
      );
    }
    const newMenuItem = this.menuItemRepository.create({
      ...menuItemData,
      restaurant,
      restaurantId,
    });
    return this.menuItemRepository.save(newMenuItem);
  }

  async findAll(): Promise<MenuItem[]> {
    const user = this.request.user;
    if (user.role === 'ADMIN' || user.role === 'STAFF') {
      return this.menuItemRepository.find({
        where: { restaurantId: user.restaurantId },
        relations: ['restaurant'],
      });
    }
    // For customers, we should probably not return all menu items from all restaurants.
    // This part of the logic is not specified in the requirements.
    // For now, I will return an empty array for customers.
    if (user.role === 'CUSTOMER') {
      return [];
    }
    return this.menuItemRepository.find({ relations: ['restaurant'] });
  }

  async findOne(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }
    return menuItem;
  }

  async update(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto,
  ): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.preload({
      id,
      ...updateMenuItemDto,
    });
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }
    return this.menuItemRepository.save(menuItem);
  }

  async remove(id: string): Promise<void> {
    const result = await this.menuItemRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }
  }
}
