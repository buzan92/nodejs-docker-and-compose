import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: number, createWishlistDto: CreateWishlistDto) {
    const owner = await this.usersService.findOne({ id: userId });
    return await this.wishlistsRepository.save({ ...createWishlistDto, owner });
  }

  async findOne(where: FindOptionsWhere<Wishlist>) {
    const wishlist = await this.wishlistsRepository.findOne({
      where,
      relations: ['owner', 'items'],
    });
    if (!wishlist) {
      throw new NotFoundException('Список подарков не найден');
    }
    delete wishlist.owner.password;
    delete wishlist.owner.email;
    return wishlist;
  }

  async findMany(where: FindOptionsWhere<Wishlist>) {
    const wishlists = await this.wishlistsRepository.find({
      where,
      relations: ['owner', 'items'],
    });
    wishlists.forEach((wishlist) => {
      delete wishlist.owner.password;
      delete wishlist.owner.email;
    });
    return wishlists;
  }

  async update(
    userId: number,
    id: number,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishlist = await this.findOne({ id });
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Нельзя обновить чужой список подарков');
    }
    return await this.wishlistsRepository.save({
      ...wishlist,
      ...updateWishlistDto,
    });
  }

  async removeOne(id: number) {
    await this.wishlistsRepository.delete(id);
  }

  async deleteWishlist(userId, id: number) {
    const wishlist = await this.findOne({ id });
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Нельзя удалить чужой список подарков');
    }
  }
}
