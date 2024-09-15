import {
  Controller,
  Get,
  Req,
  UseGuards,
  Patch,
  Body,
  Param,
  Post,
  Delete,
  SetMetadata,
  ParseIntPipe,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@UseGuards(JwtAuthGuard)
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  async createWish(@Req() req, @Body() createWishDto: CreateWishDto) {
    return await this.wishesService.create(req.user.id, createWishDto);
  }

  @SetMetadata('isPublic', true)
  @Get('last')
  async last() {
    return await this.wishesService.findLast(40, 0);
  }

  @SetMetadata('isPublic', true)
  @Get('top')
  async top() {
    return await this.wishesService.findTop();
  }

  @Get(':id')
  async findWish(@Param('id', ParseIntPipe) id: number) {
    return await this.wishesService.findOne({ id });
  }

  @Patch(':id')
  async updateWish(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    return await this.wishesService.updateWish(req.user.id, id, updateWishDto);
  }

  @Delete(':id')
  async deleteWish(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return await this.wishesService.deleteWish(req.user.id, id);
  }

  @Post(':id/copy')
  async copyWish(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return await this.wishesService.copyWish(req.user.id, id);
  }
}
