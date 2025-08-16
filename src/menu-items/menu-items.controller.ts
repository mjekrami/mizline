import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { Resource } from '../auth/resource.decorator';

@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @Resource('menu-item')
  create(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuItemsService.create(createMenuItemDto);
  }

  @Get()
  findAll() {
    return this.menuItemsService.findAll();
  }

  @Get(':id')
  @Resource('menu-item')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuItemsService.findOne(id);
  }

  @Patch(':id')
  @Resource('menu-item')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(id, updateMenuItemDto);
  }

  @Delete(':id')
  @Resource('menu-item')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuItemsService.remove(id);
  }
}
