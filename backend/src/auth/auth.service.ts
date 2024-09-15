import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from 'src/hashing/hashing.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signin(user: User) {
    const payload = { userId: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findOne({ username }, true);
    if (!user) {
      throw new UnauthorizedException('Некорректная пара логин и пароль');
    }
    const isMatched = this.hashingService.verifyUserPassword(
      password,
      user.password,
    );
    if (!isMatched) {
      throw new UnauthorizedException('Некорректная пара логин и пароль');
    }
    return user;
  }
}
