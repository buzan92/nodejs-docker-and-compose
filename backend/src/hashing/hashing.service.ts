import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class HashingService {
  async hashUserPassword(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const hash = await this.hashPassword(password);
    return { ...rest, password: hash };
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async verifyUserPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
