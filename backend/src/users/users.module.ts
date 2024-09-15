import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { HashingService } from 'src/hashing/hashing.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, HashingService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
