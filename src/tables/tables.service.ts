import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { Restaurant } from '../restaurants/entities/restaurant.entity';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(createTableDto: CreateTableDto): Promise<Table> {
    const { restaurantId, ...tableData } = createTableDto;
    const restaurant = await this.restaurantRepository.findOneBy({
      id: restaurantId,
    });
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID "${restaurantId}" not found`,
      );
    }
    const newTable = this.tableRepository.create({
      ...tableData,
      restaurant,
    });
    return this.tableRepository.save(newTable);
  }

  async findAll(): Promise<Table[]> {
    return this.tableRepository.find({ relations: ['restaurant'] });
  }

  async findOne(id: string): Promise<Table> {
    const table = await this.tableRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });
    if (!table) {
      throw new NotFoundException(`Table with ID "${id}" not found`);
    }
    return table;
  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
    const table = await this.tableRepository.preload({
      id,
      ...updateTableDto,
    });
    if (!table) {
      throw new NotFoundException(`Table with ID "${id}" not found`);
    }
    return this.tableRepository.save(table);
  }

  async remove(id: string): Promise<void> {
    const result = await this.tableRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Table with ID "${id}" not found`);
    }
  }
}
