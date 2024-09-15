import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { Offer } from './entities/offer.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { UsersService } from 'src/users/users.service';
import { HashingService } from 'src/hashing/hashing.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wish, User, Offer])],
  providers: [OffersService, WishesService, UsersService, HashingService],
  controllers: [OffersController],
})
export class OffersModule {}
