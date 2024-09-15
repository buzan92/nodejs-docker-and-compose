import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishesService } from './wishes.service';
import { WishesController } from './wishes.controller';
import { Wish } from './entities/wish.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { HashingService } from 'src/hashing/hashing.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wish, User])],
  providers: [WishesService, UsersService, HashingService],
  controllers: [WishesController],
  exports: [WishesService],
})
export class WishesModule {}
