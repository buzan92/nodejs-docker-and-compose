import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingService } from 'src/hashing/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const findUser = await this.usersRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (findUser) {
      throw new ConflictException(
        'Пользователь с таким email или username уже зарегистрирован',
      );
    }

    const userWithHash =
      await this.hashingService.hashUserPassword(createUserDto);
    const user = await this.usersRepository.save(userWithHash);
    delete user.password;
    return user;
  }

  async findOne(
    where: FindOptionsWhere<User>,
    withPassword = false,
    withEmail = false,
  ) {
    const user = await this.usersRepository.findOneBy(where);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!withPassword) {
      delete user.password;
    }
    if (!withEmail) {
      delete user.email;
    }
    return user;
  }

  async findMany(query: string) {
    const users = await this.usersRepository.find({
      where: [{ username: query }, { email: query }],
    });
    users.forEach((user) => {
      delete user.password;
      delete user.email;
    });
    return users;
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.username) {
      const user = await this.usersRepository.findOneBy({
        username: updateUserDto.username,
      });
      if (user && user.id !== id) {
        throw new ConflictException(
          'Пользователь с таким username уже зарегистрирован',
        );
      }
    }
    if (updateUserDto.email) {
      const user = await this.usersRepository.findOneBy({
        email: updateUserDto.email,
      });
      if (user && user.id !== id) {
        throw new ConflictException(
          'Пользователь с таким email уже зарегистрирован',
        );
      }
    }
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashingService.hashPassword(
        updateUserDto.password,
      );
    }
    await this.usersRepository.update({ id }, updateUserDto);
    return await this.findOne({ id });
  }

  async removeOne(id: number) {
    await this.usersRepository.delete(id);
  }

  async findWithWishes(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['wishes', 'wishes.owner', 'wishes.offers'],
    });
    const wishes = user.wishes;
    wishes.forEach((wish) => {
      delete wish.owner.password;
      delete wish.owner.email;
    });
    return user.wishes;
  }

  async findUserWishes(username: string) {
    const user = await this.findOne({ username });
    return await this.findWithWishes(user.id);
  }
}
