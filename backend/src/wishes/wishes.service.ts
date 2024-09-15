import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
    private readonly UsersService: UsersService,
  ) {}

  async create(id: number, createWishDto: CreateWishDto) {
    const owner = await this.UsersService.findOne({ id });
    await this.wishesRepository.insert({ ...createWishDto, owner });
    return {};
  }

  async findOne(where: FindOptionsWhere<Wish>) {
    const wish = await this.wishesRepository.findOne({
      where,
      relations: ['owner', 'offers'],
    });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    delete wish.owner.password;
    delete wish.owner.email;
    return wish;
  }

  async findMany(where: FindOptionsWhere<Wish>) {
    const wishes = await this.wishesRepository.findBy(where);
    wishes.forEach((wish) => {
      delete wish.owner.password;
      delete wish.owner.email;
    });
    return wishes;
  }

  async updateOne(id: number, updateWishDto: UpdateWishDto) {
    await this.wishesRepository.update({ id }, updateWishDto);
    return {};
  }

  async updateRaised(id: number, raised: number) {
    await this.wishesRepository.update({ id }, { raised });
    return {};
  }

  async removeOne(id: number) {
    await this.wishesRepository.delete(id);
  }

  async findLast(count: number, page: number) {
    const wishes = await this.wishesRepository.find({
      relations: ['owner', 'offers'],
      order: { createdAt: 'DESC' },
      take: count,
      skip: count * page,
    });
    wishes.forEach((wish) => {
      delete wish.owner.password;
      delete wish.owner.email;
    });
    return wishes;
  }

  async findTop() {
    const wishes = await this.wishesRepository.find({
      relations: ['owner', 'offers'],
      order: { copied: 'DESC' },
      take: 20,
    });
    wishes.forEach((wish) => {
      delete wish.owner.password;
      delete wish.owner.email;
    });
    return wishes;
  }

  async updateWish(userId: number, id: number, updateWishDto: UpdateWishDto) {
    const wish = await this.findOne({ id });
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя обновить чужой подарок');
    }
    if (wish.raised > 0 && updateWishDto.price) {
      throw new BadRequestException(
        'Нельзя изменять стоимость, если уже есть желающие скинуться',
      );
    }
    return await this.updateOne(id, updateWishDto);
  }

  async deleteWish(userId: number, id: number) {
    const wish = await this.findOne({ id });
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя удалить чужой подарок');
    }
    await this.removeOne(id);
    return wish;
  }

  async copyWish(userId: number, id: number) {
    const { name, link, image, price, description, copied } =
      await this.findOne({ id });
    const isDuplicateWish = await this.wishesRepository.findOne({
      where: { name, link, image, price, description, owner: { id: userId } },
      relations: ['owner'],
    });
    if (isDuplicateWish) {
      throw new ConflictException('Вы уже копировали себе этот подарок');
    }
    await this.wishesRepository.update(id, { copied: copied + 1 });
    await this.create(userId, { name, link, image, price, description });
    return {};
  }
}
