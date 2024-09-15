import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}
  @Get()
  async findMany() {
    return await this.wishlistsService.findMany({});
  }

  @Post()
  async createWishlist(
    @Req() req,
    @Body() createWishlistDto: CreateWishlistDto,
  ) {
    return await this.wishlistsService.create(req.user.id, createWishlistDto);
  }

  @Get(':id')
  async findWishlist(@Param('id', ParseIntPipe) id: number) {
    return await this.wishlistsService.findOne({ id });
  }

  @Patch(':id')
  async updateWishlist(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return await this.wishlistsService.update(
      req.user.id,
      id,
      updateWishlistDto,
    );
  }

  @Delete(':id')
  async deleteWishlist(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return await this.wishlistsService.deleteWishlist(req.user.id, id);
  }
}
