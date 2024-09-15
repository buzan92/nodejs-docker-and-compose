import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from 'src/offers/entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { WishesService } from 'src/wishes/wishes.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OffersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: number, createOfferDto: CreateOfferDto) {
    const wish = await this.wishesService.findOne({
      id: createOfferDto.itemId,
    });
    if (wish.owner.id === userId) {
      throw new BadRequestException(
        'Нельзя вносить деньги на собственные подарки',
      );
    }
    if (createOfferDto.amount > wish.price - wish.raised) {
      throw new BadRequestException(
        'Сумма собранных средств не может превышать стоимость подарка',
      );
    }
    const user = await this.usersService.findOne({ id: userId });
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.offersRepository.save({
        ...createOfferDto,
        user: user,
        item: wish,
      });

      await this.wishesService.updateRaised(
        wish.id,
        +wish.raised + +createOfferDto.amount,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return {};
  }

  async findMany() {
    const offers = await this.offersRepository.find({
      relations: ['user', 'item'],
    });
    offers.forEach((offer) => {
      delete offer.user.password;
      delete offer.user.email;
    });
    return offers;
  }

  async findOne(id: number) {
    const offer = await this.offersRepository.findOne({
      where: { id },
      relations: ['user', 'item'],
    });
    if (!offer) {
      throw new NotFoundException('Заявки не найдены');
    }
    delete offer.user.password;
    delete offer.user.email;
    return offer;
  }

  async removeOne(id: number) {
    await this.offersRepository.delete(id);
  }
}
